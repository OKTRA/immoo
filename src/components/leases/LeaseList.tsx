import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, FileText, ChevronRight, Trash2, Eye } from "lucide-react";
import { format } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import LeaseDetailsDialog from './LeaseDetailsDialog';
import ContractViewDialog from '../contracts/ContractViewDialog';
import { formatCurrency } from "@/lib/utils";
import { cancelLease, terminateLease } from '@/services/tenant/lease';
import { getContractByLeaseId, getAvailableContractsForAssignment, assignContractToLease } from '@/services/contracts/contractWysiwygService';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,AlertDialogDescription,AlertDialogFooter,AlertDialogCancel,AlertDialogAction } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface LeaseData {
  id: string;
  tenant_id: string;
  property_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  status: string;
  tenant?: {
    first_name: string;
    last_name: string;
  };
  property?: {
    title: string;
  };
  properties?: {
    title: string;
  };
  tenants?: {
    first_name: string;
    last_name: string;
  };
  payments?: {
    id: string;
    status: string;
    type: string;
    amount: number;
  }[];
}

interface LeaseListProps {
  leases: LeaseData[];
  loading: boolean;
  onViewLeaseDetails: (leaseId: string) => void;
  agencyId?: string; // Ajout de l'ID de l'agence pour la sélection de contrats
}

const LeaseList: React.FC<LeaseListProps> = ({ leases, loading, onViewLeaseDetails, agencyId }) => {
  const [selectedLease, setSelectedLease] = useState<LeaseData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<LeaseData|null>(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [actionType, setActionType] = useState<'cancel' | 'terminate'>('cancel');
  const [depositOption, setDepositOption] = useState<'full' | 'partial' | 'none'>('full');
  const [partialAmount, setPartialAmount] = useState('');
  const [damageDesc, setDamageDesc] = useState('');
  
  // États pour le contrat
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [loadingContract, setLoadingContract] = useState(false);
  
  // États pour la sélection de contrat
  const [isContractSelectionOpen, setIsContractSelectionOpen] = useState(false);
  const [availableContracts, setAvailableContracts] = useState<any[]>([]);
  const [selectedContractToAssign, setSelectedContractToAssign] = useState<string>('');
  const [leaseToAssignContract, setLeaseToAssignContract] = useState<LeaseData | null>(null);
  const [loadingContracts, setLoadingContracts] = useState(false);

  const handleOpenLeaseDetails = (lease: LeaseData) => {
    console.log("Opening lease details:", lease);
    setSelectedLease(lease);
    setIsDialogOpen(true);
  };

  const handleViewContract = async (lease: LeaseData) => {
    setLoadingContract(true);
    try {
      const contract = await getContractByLeaseId(lease.id);
      if (contract) {
        setSelectedContract(contract);
        setIsContractDialogOpen(true);
      } else {
        toast.error('Aucun contrat rattaché à ce bail');
      }
    } catch (error) {
      toast.error('Erreur lors de la récupération du contrat');
    } finally {
      setLoadingContract(false);
    }
  };

  const handleSelectContract = async (lease: LeaseData) => {
    if (!agencyId) {
      toast.error('ID de l\'agence manquant pour la sélection de contrats');
      return;
    }
    
    setLeaseToAssignContract(lease);
    setLoadingContracts(true);
    try {
      const contracts = await getAvailableContractsForAssignment(agencyId);
      setAvailableContracts(contracts);
      setIsContractSelectionOpen(true);
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast.error('Erreur lors du chargement des contrats');
    } finally {
      setLoadingContracts(false);
    }
  };

  const handleAssignSelectedContract = async () => {
    if (!selectedContractToAssign || !leaseToAssignContract) return;
    
    try {
      const success = await assignContractToLease(selectedContractToAssign, leaseToAssignContract.id);
      if (success) {
        toast.success('Contrat assigné au bail avec succès');
        setIsContractSelectionOpen(false);
        setSelectedContractToAssign('');
        setLeaseToAssignContract(null);
        // Recharger la page pour mettre à jour l'affichage
        window.location.reload();
      }
    } catch (error) {
      console.error('Error assigning contract:', error);
      toast.error('Erreur lors de l\'assignation du contrat');
    }
  };

  const handleCancelRequest = (lease: LeaseData) => {
    setCancelTarget(lease);
    setActionType('cancel');
    setIsCancelOpen(true);
  };

  const handleTerminateRequest = (lease: LeaseData) => {
    setCancelTarget(lease);
    setActionType('terminate');
    setDepositOption('full');
    setPartialAmount('');
    setDamageDesc('');
    setIsCancelOpen(true);
  };

  const confirmAction = async () => {
    if (!cancelTarget) return;
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
    if (success) {
      toast.success(actionType === 'cancel' ? 'Bail annulé' : 'Bail résilié');
      setIsCancelOpen(false);
      window.location.reload();
    } else {
      toast.error(error);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === 'active') return 'bg-green-100 text-green-800';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (status === 'cancelled' || status === 'terminated') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'active') return 'Actif';
    if (status === 'pending') return 'En attente';
    if (status === 'cancelled') return 'Annulé';
    if (status === 'terminated') return 'Résilié';
    if (status === 'expired') return 'Expiré';
    return status;
  };

  // Détermine le nom de la propriété en tenant compte des différentes structures de données possibles
  const getPropertyTitle = (lease: LeaseData) => {
    if (lease.property?.title) return lease.property.title;
    if (lease.properties?.title) return lease.properties.title;
    return "Propriété non spécifiée";
  };

  // Détermine le nom du locataire en tenant compte des différentes structures de données possibles
  const getTenantName = (lease: LeaseData) => {
    if (lease.tenant && lease.tenant.first_name) {
      return `${lease.tenant.first_name} ${lease.tenant.last_name}`;
    }
    if (lease.tenants && lease.tenants.first_name) {
      return `${lease.tenants.first_name} ${lease.tenants.last_name}`;
    }
    return "Non assigné";
  };

  // Formate correctement les dates ou retourne "Non défini" si la date est invalide
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Non défini";
    
    try {
      const date = new Date(dateString);
      // Vérifie si la date est valide
      if (isNaN(date.getTime())) return "Non défini";
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      console.error("Erreur de formatage de date:", error);
      return "Non défini";
    }
  };

  // Format the currency amount, defaulting to 0 if null or undefined
  const formatAmount = (amount: number | null | undefined) => {
    return formatCurrency(amount || 0);
  };

  // Vue mobile (carte par bail)
  const renderMobileView = () => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Chargement des baux...</p>
        </div>
      );
    }

    if (leases.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucun bail n'a été trouvé. Créez votre premier bail!</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {leases.map((lease) => (
          <Card key={lease.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 truncate">
                    {getPropertyTitle(lease)}
                  </h3>
                  <Badge className={getStatusBadgeClass(lease.status)}>
                    {getStatusLabel(lease.status)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {getTenantName(lease)}
                </p>
              </div>
              
              <div className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date de début:</span>
                  <span>{formatDate(lease.start_date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date de fin:</span>
                  <span>{formatDate(lease.end_date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Loyer mensuel:</span>
                  <span className="font-medium">{formatAmount(lease.monthly_rent)}</span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenLeaseDetails(lease)}>
                    <FileText className="h-4 w-4 mr-2" /> Détails
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewContract(lease)}
                    disabled={loadingContract}
                  >
                    <Eye className="h-4 w-4 mr-2" /> 
                    {loadingContract ? 'Chargement...' : 'Contrat'}
                  </Button>
                  {agencyId && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleSelectContract(lease)}
                      disabled={loadingContracts}
                    >
                      <FileText className="h-4 w-4 mr-2" /> 
                      {loadingContracts ? 'Chargement...' : 'Sélectionner'}
                    </Button>
                  )}
                  {lease.status === 'active' && (
                    <Button variant="outline" size="sm" onClick={() => onViewLeaseDetails(lease.id)}>
                      <CreditCard className="h-4 w-4 mr-2" /> Paiements
                    </Button>
                  )}
                  {lease.status === 'active' && (() => {
                    const hasPaid = (lease as any).payments?.some((p:any) => p.status === 'paid' && p.payment_type === 'rent');
                    if (!hasPaid) {
                      return (
                        <Button variant="destructive" size="sm" onClick={() => handleCancelRequest(lease)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Annuler
                        </Button>
                      );
                    }
                    return (
                      <Button variant="destructive" size="sm" onClick={() => handleTerminateRequest(lease)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Résilier
                      </Button>
                    );
                  })()}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleOpenLeaseDetails(lease)}
                  className="ml-auto"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Vue desktop (tableau)
  const renderDesktopView = () => {
    return (
      <div className="shadow rounded-lg overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Propriété
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Locataire
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date de début
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date de fin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loyer mensuel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={7}>
                  Chargement des baux...
                </td>
              </tr>
            ) : leases.length > 0 ? (
              leases.map((lease) => (
                <tr key={lease.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getPropertyTitle(lease)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getTenantName(lease)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(lease.start_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(lease.end_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatAmount(lease.monthly_rent)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusBadgeClass(lease.status)}>
                      {getStatusLabel(lease.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenLeaseDetails(lease)}>
                        <FileText className="h-4 w-4 mr-2" /> Détails
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewContract(lease)}
                        disabled={loadingContract}
                      >
                        <Eye className="h-4 w-4 mr-2" /> 
                        {loadingContract ? 'Chargement...' : 'Contrat'}
                      </Button>
                      {agencyId && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleSelectContract(lease)}
                          disabled={loadingContracts}
                        >
                          <FileText className="h-4 w-4 mr-2" /> 
                          {loadingContracts ? 'Chargement...' : 'Sélectionner'}
                        </Button>
                      )}
                      {lease.status === 'active' && (
                        <Button variant="outline" size="sm" onClick={() => onViewLeaseDetails(lease.id)}>
                          <CreditCard className="h-4 w-4 mr-2" /> Paiements
                        </Button>
                      )}
                      {lease.status === 'active' && (() => {
                        const hasPaid = (lease as any).payments?.some((p:any) => p.status === 'paid' && p.payment_type === 'rent');
                        if (!hasPaid) {
                          return (
                            <Button variant="destructive" size="sm" onClick={() => handleCancelRequest(lease)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Annuler
                            </Button>
                          );
                        }
                        return (
                          <Button variant="destructive" size="sm" onClick={() => handleTerminateRequest(lease)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Résilier
                          </Button>
                        );
                      })()}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={7}>
                  Aucun bail n'a été trouvé. Créez votre premier bail!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      {/* Vue mobile (affichée uniquement sur petits écrans) */}
      <div className="md:hidden">
        {renderMobileView()}
      </div>
      
      {/* Vue desktop (affichée uniquement sur grands écrans) */}
      <div className="hidden md:block">
        {renderDesktopView()}
      </div>

      {/* Dialog de sélection de contrat */}
      <Dialog open={isContractSelectionOpen} onOpenChange={setIsContractSelectionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sélectionner un contrat</DialogTitle>
            <DialogDescription>
              Choisissez un contrat parmi ceux disponibles pour l'assigner à ce bail.
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
                  Aucun contrat disponible. Créez d'abord un contrat.
                </p>
                <Button onClick={() => {
                  setIsContractSelectionOpen(false);
                  if (agencyId) {
                    window.location.href = `/agencies/${agencyId}/contracts/create`;
                  }
                }}>
                  Créer un contrat
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
                        <h4 className="font-medium">{contract.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Type: {contract.type} | Statut: {contract.status}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Créé le {new Date(contract.created_at).toLocaleDateString()}
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
              Annuler
            </Button>
            <Button 
              onClick={handleAssignSelectedContract}
              disabled={!selectedContractToAssign || loadingContracts}
            >
              Assigner le contrat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour afficher les détails du bail */}
      <LeaseDetailsDialog
        lease={selectedLease}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onViewPayments={onViewLeaseDetails}
      />

      {/* cancel dialog */}
      {cancelTarget && (
      <AlertDialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{actionType === 'cancel' ? "Confirmer l'annulation du bail" : "Confirmer la résiliation du bail"}</AlertDialogTitle>
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
            <AlertDialogAction onClick={confirmAction} disabled={actionType==='terminate' && depositOption==='partial' && !partialAmount}>{actionType === 'cancel' ? 'Annuler le bail' : 'Résilier le bail'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>) }

      {/* Contract View Dialog */}
      <ContractViewDialog
        isOpen={isContractDialogOpen}
        onClose={() => setIsContractDialogOpen(false)}
        contract={selectedContract}
      />
    </div>
  );
};

export default LeaseList;
