import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { 
  PlusCircle, 
  Receipt, 
  Home, 
  User, 
  Calendar,
  Search,
  FileText,
  Trash2,
  Eye,
  Link
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { getLeasesByAgencyId } from "@/services/tenant/leaseService";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { cancelLease } from '@/services/tenant/lease';
import { terminateLease } from '@/services/tenant/lease';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,AlertDialogDescription,AlertDialogFooter,AlertDialogCancel,AlertDialogAction } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import LeaseDetailsDialog from './LeaseDetailsDialog';
import ContractViewDialog from '../contracts/ContractViewDialog';
import { getContractByLeaseId, getAvailableContractsForAssignment, assignContractToLease } from '@/services/contracts/contractWysiwygService';
import { useTranslation } from "@/hooks/useTranslation";

interface AgencyLeasesDisplayProps {
  agencyId: string;
}

export default function AgencyLeasesDisplay({ agencyId }: AgencyLeasesDisplayProps) {
  const { t } = useTranslation();
  const [leases, setLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [actionType, setActionType] = useState<'cancel' | 'terminate'>('cancel');
  const [depositOption, setDepositOption] = useState<'full' | 'partial' | 'none'>('full');
  const [partialAmount, setPartialAmount] = useState('');
  const [damageDesc, setDamageDesc] = useState('');
  const [selectedLease, setSelectedLease] = useState<any|null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // États pour le contrat
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [loadingContract, setLoadingContract] = useState(false);
  
  // États pour la sélection de contrat
  const [isContractSelectionOpen, setIsContractSelectionOpen] = useState(false);
  const [availableContracts, setAvailableContracts] = useState<any[]>([]);
  const [selectedContractToAssign, setSelectedContractToAssign] = useState<string>('');
  const [leaseToAssignContract, setLeaseToAssignContract] = useState<any>(null);
  const [loadingContracts, setLoadingContracts] = useState(false);

  useEffect(() => {
    const fetchLeases = async () => {
      if (!agencyId) return;
      
      try {
        setLoading(true);
        const { leases: fetchedLeases, error } = await getLeasesByAgencyId(agencyId);
        
        if (error) {
          toast({
            title: t('agencyDashboard.pages.leases.error'),
            description: `${t('agencyDashboard.pages.leases.cannotRetrieveLeases')}: ${error}`,
            variant: "destructive"
          });
          return;
        }
        
        // Après avoir obtenu les baux, déterminer ceux qui ont déjà un contrat
        let enrichedLeases = fetchedLeases ?? [];
        if (enrichedLeases.length > 0) {
          const leaseIds = enrichedLeases.map((l:any) => l.id).filter(id => id); // Filter out any undefined/null IDs
          if (leaseIds.length > 0) { // Only query if we have valid IDs
                      // Since the database doesn't have lease_id, we'll check by property_id
          // This is a workaround - in a real implementation, you'd want to add lease_id to the database
          const { data: contracts, error: contractsError } = await supabase
            .from('contracts')
            .select('id, property_id')
            .in('property_id', leaseIds);
          if (!contractsError) {
            const leasesWithContract = new Set(contracts.map(c => c.property_id));
              enrichedLeases = enrichedLeases.map((l:any) => ({ ...l, hasContract: leasesWithContract.has(l.id) }));
            }
          }
        }
        setLeases(enrichedLeases);
      } catch (err: any) {
        console.error("Erreur lors de la récupération des baux:", err);
        toast({
          title: t('agencyDashboard.pages.leases.error'),
          description: `${t('agencyDashboard.pages.leases.errorOccurred')}: ${err.message}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeases();
  }, [agencyId, toast, t]);

  const filteredLeases = leases.filter(lease => {
    const searchTerms = searchQuery.toLowerCase();
    const propertyTitle = lease.properties?.title?.toLowerCase() || '';
    const propertyLocation = lease.properties?.location?.toLowerCase() || '';
    const tenantName = `${lease.tenants?.first_name || ''} ${lease.tenants?.last_name || ''}`.toLowerCase();
    
    return propertyTitle.includes(searchTerms) || 
           propertyLocation.includes(searchTerms) || 
           tenantName.includes(searchTerms);
  });

  const handleViewProperty = (propertyId: string) => {
    navigate(`/agencies/${agencyId}/properties/${propertyId}`);
  };

  const handleViewTenant = (tenantId: string) => {
    navigate(`/agencies/${agencyId}/tenants/${tenantId}`);
  };

  const handleViewLeaseDetails = (lease:any) => {
    setSelectedLease(lease);
    setIsDetailsOpen(true);
  };

  const handleViewLeasePayments = (leaseId: string, propertyId: string) => {
    navigate(`/agencies/${agencyId}/properties/${propertyId}/leases/${leaseId}/payments`);
  };

  const handleViewContract = async (lease: any) => {
    setLoadingContract(true);
    try {
      const contract = await getContractByLeaseId(lease.id);
      if (contract) {
        setSelectedContract(contract);
        setIsContractDialogOpen(true);
      } else {
        toast({
          title: t('agencyDashboard.pages.leases.noContract'),
          description: t('agencyDashboard.pages.leases.noContractAttached'),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error getting contract:', error);
      toast({
        title: t('agencyDashboard.pages.leases.error'),
        description: t('agencyDashboard.pages.leases.errorRetrievingContract'),
        variant: "destructive"
      });
    } finally {
      setLoadingContract(false);
    }
  };

  const handleSelectContract = async (lease: any) => {
    setLeaseToAssignContract(lease);
    setLoadingContracts(true);
    try {
      const contracts = await getAvailableContractsForAssignment(agencyId);
      setAvailableContracts(contracts);
      setIsContractSelectionOpen(true);
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast({
        title: t('agencyDashboard.pages.leases.error'),
        description: t('agencyDashboard.pages.leases.errorLoadingContracts'),
        variant: "destructive"
      });
    } finally {
      setLoadingContracts(false);
    }
  };

  const handleAssignSelectedContract = async () => {
    if (!selectedContractToAssign || !leaseToAssignContract) return;
    
    try {
      const success = await assignContractToLease(selectedContractToAssign, leaseToAssignContract.id);
      if (success) {
        toast({
          title: t('agencyDashboard.pages.leases.success'),
          description: t('agencyDashboard.pages.leases.contractAssignedSuccess')
        });
        setIsContractSelectionOpen(false);
        setSelectedContractToAssign('');
        setLeaseToAssignContract(null);
        // Recharger les baux pour mettre à jour l'affichage
        window.location.reload();
      }
    } catch (error) {
      console.error('Error assigning contract:', error);
      toast({
        title: t('agencyDashboard.pages.leases.error'),
        description: t('agencyDashboard.pages.leases.errorAssigningContract'),
        variant: "destructive"
      });
    }
  };

  const handleCreateLease = () => {
    navigate(`/agencies/${agencyId}/lease/create`);
  };

  const handleCancelRequest = (lease:any) => {
    setCancelTarget(lease);
    setActionType('cancel');
    setIsCancelOpen(true);
  };

  const handleTerminateRequest = (lease:any) => {
    setCancelTarget(lease);
    setActionType('terminate');
    setDepositOption('full');
    setPartialAmount('');
    setDamageDesc('');
    setIsCancelOpen(true);
  };

  const confirmAction = async () => {
    if(!cancelTarget) return;
    let result;
    if(actionType==='cancel'){
      result = await cancelLease(cancelTarget.id);
    }else{
      const details = {
        depositReturn: depositOption,
        partialAmount: depositOption === 'partial' ? Number(partialAmount) || 0 : 0,
        damages: damageDesc
      };
      result = await terminateLease(cancelTarget.id, details);
    }
    const { success, error } = result;
    if(success){
      toast({title: t('agencyDashboard.pages.leases.success'), description: actionType === 'cancel' ? t('agencyDashboard.pages.leases.leaseCancelled') : t('agencyDashboard.pages.leases.leaseTerminated')});
      setLeases(prev => prev.map(lease => lease.id === cancelTarget.id ? {...lease, status: actionType==='cancel' ? 'cancelled' : 'terminated'} : lease));
    } else {
      toast({title: t('agencyDashboard.pages.leases.error'), description: error, variant: 'destructive'});
    }
    setIsCancelOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{t('agencyDashboard.pages.leases.leaseManagement')}</CardTitle>
            <CardDescription>
              {t('agencyDashboard.pages.leases.activeLeasesList')}
            </CardDescription>
          </div>
          <Button onClick={handleCreateLease}>
            <PlusCircle className="h-4 w-4 mr-2" />
            {t('agencyDashboard.pages.leases.createNewLease')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('agencyDashboard.pages.leases.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredLeases.length === 0 ? (
          <div className="text-center py-10">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('agencyDashboard.pages.leases.noLeasesFound')}</h3>
            {searchQuery ? (
              <p className="text-muted-foreground max-w-md mx-auto">
                {t('agencyDashboard.pages.leases.noSearchResults')}
              </p>
            ) : (
              <p className="text-muted-foreground max-w-md mx-auto">
                {t('agencyDashboard.pages.leases.createFirstLease')}
              </p>
            )}
            {!searchQuery && (
              <Button onClick={handleCreateLease} className="mt-4">
                <PlusCircle className="h-4 w-4 mr-2" />
                {t('agencyDashboard.pages.leases.createLease')}
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('agencyDashboard.pages.leases.property')}</TableHead>
                  <TableHead>{t('agencyDashboard.pages.leases.tenant')}</TableHead>
                  <TableHead>{t('agencyDashboard.pages.leases.period')}</TableHead>
                  <TableHead>{t('agencyDashboard.pages.leases.rent')}</TableHead>
                  <TableHead>{t('agencyDashboard.pages.leases.status')}</TableHead>
                  <TableHead>{t('agencyDashboard.pages.leases.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeases.map((lease) => (
                  <TableRow key={lease.id} className="group hover:bg-muted/50">
                    <TableCell>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-left"
                        onClick={() => handleViewProperty(lease.property_id)}
                      >
                        <Home className="h-4 w-4 mr-1 inline" />
                        {lease.properties?.title}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-left"
                        onClick={() => handleViewTenant(lease.tenant_id)}
                      >
                        <User className="h-4 w-4 mr-1 inline" />
                        {lease.tenants?.first_name} {lease.tenants?.last_name}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        {new Date(lease.start_date).toLocaleDateString()} {t('agencyDashboard.pages.leases.to')} {new Date(lease.end_date).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(lease.monthly_rent, 'FCFA')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        lease.status === 'active' ? 'success' : lease.status === 'terminated' || lease.status==='cancelled' ? 'destructive' : 'default'
                      }>
                        {lease.status === 'active' ? t('agencyDashboard.pages.leases.active') : lease.status === 'terminated' ? t('agencyDashboard.pages.leases.terminated') : lease.status==='cancelled' ? t('agencyDashboard.pages.leases.cancelled') : t('agencyDashboard.pages.leases.inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lease.status === 'active' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewLeasePayments(lease.id, lease.property_id)}
                          >
                            <Receipt className="h-4 w-4 mr-1" />
                            {t('agencyDashboard.pages.leases.payments')}
                          </Button>
                        </>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewContract(lease)}
                        disabled={loadingContract}
                        title={t('agencyDashboard.pages.leases.viewContract')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {loadingContract ? t('agencyDashboard.pages.leases.loading') : t('agencyDashboard.pages.leases.contract')}
                      </Button>
                      {!lease.hasContract && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSelectContract(lease)}
                          disabled={loadingContracts}
                          title={t('agencyDashboard.pages.leases.selectContract')}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          {loadingContracts ? t('agencyDashboard.pages.leases.loading') : t('agencyDashboard.pages.leases.select')}
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handleViewLeaseDetails(lease)}
                      >
                        {t('agencyDashboard.pages.leases.details')}
                      </Button>
                      {lease.status === 'active' && (() => {
                        const hasPaid = lease.payments?.some((p:any) => p.status === 'paid' && p.payment_type === 'rent');
                        if (!hasPaid) {
                          return (
                            <Button size="sm" variant="destructive" onClick={()=>handleCancelRequest(lease)}>
                              <Trash2 className="h-4 w-4 mr-1"/> {t('agencyDashboard.pages.leases.cancel')}
                            </Button>
                          );
                        } else {
                          return (
                            <Button size="sm" variant="destructive" onClick={()=>handleTerminateRequest(lease)}>
                              <Trash2 className="h-4 w-4 mr-1"/> {t('agencyDashboard.pages.leases.terminate')}
                            </Button>
                          );
                        }
                      })()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      {/* Dialog de sélection de contrat */}
      <Dialog open={isContractSelectionOpen} onOpenChange={setIsContractSelectionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('agencyDashboard.pages.leases.selectContract')}</DialogTitle>
            <DialogDescription>
              {t('agencyDashboard.pages.leases.selectContractDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {loadingContracts ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : availableContracts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {t('agencyDashboard.pages.leases.noContractsAvailable')}
                </p>
                <Button onClick={() => {
                  setIsContractSelectionOpen(false);
                  navigate(`/agencies/${agencyId}/contracts/create`);
                }}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {t('agencyDashboard.pages.leases.createContract')}
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableContracts.map((contract) => (
                  <div
                    key={contract.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedContractToAssign === contract.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedContractToAssign(contract.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{contract.title || `Contrat ${contract.contract_type}`}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t('agencyDashboard.pages.leases.type')}: {contract.contract_type} | {t('agencyDashboard.pages.leases.status')}: {contract.status}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('agencyDashboard.pages.leases.createdOn')} {new Date(contract.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {selectedContractToAssign === contract.id && (
                        <div className="text-primary">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContractSelectionOpen(false)}>
              {t('agencyDashboard.pages.leases.cancel')}
            </Button>
            <Button 
              onClick={handleAssignSelectedContract}
              disabled={!selectedContractToAssign || loadingContracts}
            >
              {t('agencyDashboard.pages.leases.assignContract')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {cancelTarget && (
      <AlertDialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'cancel' ? t('agencyDashboard.pages.leases.confirmLeaseCancellation') : t('agencyDashboard.pages.leases.confirmLeaseTermination')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'cancel' ?
                t('agencyDashboard.pages.leases.cancelLeaseDescription') :
                t('agencyDashboard.pages.leases.terminateLeaseDescription')}
            </AlertDialogDescription>
            {actionType === 'terminate' && (
              <div className="space-y-3 mt-4">
                <div>
                  <label className="font-medium mb-1 block">{t('agencyDashboard.pages.leases.depositReturn')}</label>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={depositOption}
                    onChange={e => setDepositOption(e.target.value as any)}
                  >
                    <option value="full">{t('agencyDashboard.pages.leases.full')}</option>
                    <option value="partial">{t('agencyDashboard.pages.leases.partial')}</option>
                    <option value="none">{t('agencyDashboard.pages.leases.none')}</option>
                  </select>
                </div>
                {depositOption === 'partial' && (
                  <div>
                    <label className="font-medium mb-1 block">{t('agencyDashboard.pages.leases.returnedAmount')} (FCFA)</label>
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1"
                      value={partialAmount}
                      onChange={e => setPartialAmount(e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <label className="font-medium mb-1 block">{t('agencyDashboard.pages.leases.damagesObservations')}</label>
                  <textarea
                    className="w-full border rounded px-2 py-1"
                    rows={3}
                    value={damageDesc}
                    onChange={e => setDamageDesc(e.target.value)}
                  />
                </div>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('agencyDashboard.pages.leases.back')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} disabled={actionType==='terminate' && depositOption==='partial' && !partialAmount}>
              {actionType === 'cancel' ? t('agencyDashboard.pages.leases.cancelLease') : t('agencyDashboard.pages.leases.terminateLease')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>)}
      {selectedLease && (
        <LeaseDetailsDialog
          lease={selectedLease}
          isOpen={isDetailsOpen}
          onClose={()=>setIsDetailsOpen(false)}
          onViewPayments={(id:string)=>handleViewLeasePayments(id, selectedLease.property_id)}
        />
      )}

      {/* Contract View Dialog */}
      <ContractViewDialog
        isOpen={isContractDialogOpen}
        onClose={() => setIsContractDialogOpen(false)}
        contract={selectedContract}
      />
    </Card>
  );
}
