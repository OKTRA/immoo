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
  Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { getLeasesByAgencyId } from "@/services/tenant/leaseService";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { cancelLease } from '@/services/tenant/lease';
import { terminateLease } from '@/services/tenant/lease';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,AlertDialogDescription,AlertDialogFooter,AlertDialogCancel,AlertDialogAction } from '@/components/ui/alert-dialog';
import LeaseDetailsDialog from './LeaseDetailsDialog';

interface AgencyLeasesDisplayProps {
  agencyId: string;
}

export default function AgencyLeasesDisplay({ agencyId }: AgencyLeasesDisplayProps) {
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

  useEffect(() => {
    const fetchLeases = async () => {
      if (!agencyId) return;
      
      try {
        setLoading(true);
        const { leases: agencyLeases, error } = await getLeasesByAgencyId(agencyId);
        
        if (error) {
          toast({
            title: "Erreur",
            description: `Impossible de récupérer les baux: ${error}`,
            variant: "destructive"
          });
          return;
        }
        
        setLeases(agencyLeases || []);
      } catch (err: any) {
        console.error("Erreur lors de la récupération des baux:", err);
        toast({
          title: "Erreur",
          description: `Une erreur est survenue: ${err.message}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeases();
  }, [agencyId, toast]);

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
      toast({title:'Succès',description: actionType === 'cancel' ? 'Bail annulé' : 'Bail résilié'});
      setLeases(prev => prev.map(lease => lease.id === cancelTarget.id ? {...lease, status: actionType==='cancel' ? 'cancelled' : 'terminated'} : lease));
    } else {
      toast({title:'Erreur',description:error,variant:'destructive'});
    }
    setIsCancelOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Gestion des Baux</CardTitle>
            <CardDescription>
              Liste des baux actifs dans votre agence
            </CardDescription>
          </div>
          <Button onClick={handleCreateLease}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Créer un nouveau bail
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par propriété ou locataire..."
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
            <h3 className="text-lg font-medium mb-2">Aucun bail trouvé</h3>
            {searchQuery ? (
              <p className="text-muted-foreground max-w-md mx-auto">
                Aucun résultat ne correspond à votre recherche. Essayez avec d'autres termes.
              </p>
            ) : (
              <p className="text-muted-foreground max-w-md mx-auto">
                Créez votre premier bail pour commencer à gérer vos locataires et vos propriétés.
              </p>
            )}
            {!searchQuery && (
              <Button onClick={handleCreateLease} className="mt-4">
                <PlusCircle className="h-4 w-4 mr-2" />
                Créer un bail
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Propriété</TableHead>
                  <TableHead>Locataire</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Loyer</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
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
                        {new Date(lease.start_date).toLocaleDateString()} au {new Date(lease.end_date).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(lease.monthly_rent, 'FCFA')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        lease.status === 'active' ? 'success' : lease.status === 'terminated' || lease.status==='cancelled' ? 'destructive' : 'default'
                      }>
                        {lease.status === 'active' ? 'Actif' : lease.status === 'terminated' ? 'Résilié' : lease.status==='cancelled' ? 'Annulé' : 'Inactif'}
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
                            Paiements
                          </Button>
                        </>
                      )}
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handleViewLeaseDetails(lease)}
                      >
                        Détails
                      </Button>
                      {lease.status === 'active' && (() => {
                        const hasPaid = lease.payments?.some((p:any) => p.status === 'paid' && p.payment_type === 'rent');
                        if (!hasPaid) {
                          return (
                            <Button size="sm" variant="destructive" onClick={()=>handleCancelRequest(lease)}>
                              <Trash2 className="h-4 w-4 mr-1"/> Annuler
                            </Button>
                          );
                        } else {
                          return (
                            <Button size="sm" variant="destructive" onClick={()=>handleTerminateRequest(lease)}>
                              <Trash2 className="h-4 w-4 mr-1"/> Résilier
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
      {cancelTarget && (
      <AlertDialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'cancel' ? "Confirmer l'annulation du bail" : "Confirmer la résiliation du bail"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'cancel' ?
                "Cette action supprimera également les paiements générés automatiquement." :
                "Veuillez remplir l'état des lieux et préciser le traitement de la caution."}
            </AlertDialogDescription>
            {actionType === 'terminate' && (
              <div className="space-y-3 mt-4">
                <div>
                  <label className="font-medium mb-1 block">Restitution de la caution</label>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={depositOption}
                    onChange={e => setDepositOption(e.target.value as any)}
                  >
                    <option value="full">Totale</option>
                    <option value="partial">Partielle</option>
                    <option value="none">Aucune</option>
                  </select>
                </div>
                {depositOption === 'partial' && (
                  <div>
                    <label className="font-medium mb-1 block">Montant restitué (FCFA)</label>
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1"
                      value={partialAmount}
                      onChange={e => setPartialAmount(e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <label className="font-medium mb-1 block">Dégâts / Observations</label>
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
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} disabled={actionType==='terminate' && depositOption==='partial' && !partialAmount}>
              {actionType === 'cancel' ? 'Annuler le bail' : 'Résilier le bail'}
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
    </Card>
  );
}
