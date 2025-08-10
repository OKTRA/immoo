import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Archive,
  MoreHorizontal,
  Settings,
  Link,
  Calendar,
  MapPin,
  Clock,
  Filter,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  deleteContract, 
  signContract
} from "@/services/contracts/contractWysiwygService";
import ContractWysiwygEditor from "@/components/contracts/ContractWysiwygEditor";
import { 
  updateContract as updateContractContent,
  getAvailableLeasesForAssignment,
  assignContractToLease
} from "@/services/contracts/contractWysiwygService";
import { formatContractText, previewContractContent } from "@/utils/contractFormatting";
import { useTranslation } from "@/hooks/useTranslation";

interface Contract {
  id: string;
  type: string;
  title: string;
  jurisdiction: string;
  status: 'draft' | 'validated' | 'closed';
  content: string;
  details: any;
  parties: any;
  created_at: string;
  updated_at: string;
  related_entity?: string; // Changé de lease_id à related_entity
  isViewMode?: boolean; // Added for view mode
}

export default function AgencyContractsPage() {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [availableLeases, setAvailableLeases] = useState<Array<{
    id: string;
    title: string;
    tenantName: string;
    propertyName: string;
  }>>([]);

  // Récupérer le leaseId depuis les paramètres URL
  const queryParams = new URLSearchParams(location.search);
  const leaseIdFromUrl = queryParams.get('leaseId');
  
  // Vérifier s'il y a un contrat à ouvrir automatiquement depuis les baux
  const locationState = location.state as { viewContractId?: string; contractData?: Contract } | null;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      
      try {
        // Charger les contrats
        let query = supabase
          .from("contracts")
          .select("id, type, title, jurisdiction, status, content, details, parties, created_at, updated_at, lease_id")
          .eq("agency_id", agencyId)
          .order("created_at", { ascending: false });

        // Filtrer par lease_id si fourni dans l'URL
        if (leaseIdFromUrl) {
          query = query.eq("lease_id", leaseIdFromUrl);
        }
          
        const { data: contractsData, error: contractsError } = await query;
          
        if (contractsError) throw contractsError;
        setContracts(contractsData || []);

        // Charger les baux disponibles
        if (agencyId) {
          const leases = await getAvailableLeasesForAssignment(agencyId);
          setAvailableLeases(leases);
        }
      } catch (err: any) {
        setError(t('agencyDashboard.pages.contracts.loadError'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (agencyId) fetchData();
  }, [agencyId, leaseIdFromUrl, t]);

  // Effet pour ouvrir automatiquement un contrat spécifique en mode lecture
  useEffect(() => {
    if (locationState?.viewContractId && locationState?.contractData && contracts.length > 0) {
      const contract = contracts.find(c => c.id === locationState.viewContractId);
      if (contract) {
        handleView(contract);
        // Nettoyer l'état de navigation pour éviter les réouvertures
        navigate(location.pathname + location.search, { replace: true, state: null });
      }
    }
  }, [contracts, locationState, navigate, location.pathname, location.search]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, icon: AlertTriangle, label: t('agencyDashboard.pages.contracts.draft'), className: '' },
      validated: { variant: 'default' as const, icon: CheckCircle, label: t('agencyDashboard.pages.contracts.validated'), className: 'bg-blue-600 text-white' },
      closed: { variant: 'default' as const, icon: CheckCircle, label: t('agencyDashboard.pages.contracts.closed'), className: 'bg-green-600 text-white' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className || ''}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    const typeLabels = {
      bail: t('agencyDashboard.pages.contracts.leaseContract'),
      vente: t('agencyDashboard.pages.contracts.saleContract'),
      mandat: t('agencyDashboard.pages.contracts.managementMandate'),
      prestation: t('agencyDashboard.pages.contracts.serviceContract'),
      autre: t('agencyDashboard.pages.contracts.other')
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract({ ...contract, isViewMode: false });
    setShowEditor(true);
  };

  const handleView = (contract: Contract) => {
    setEditingContract(contract);
    setShowEditor(true);
    // Forcer le mode lecture pour le bouton "Voir"
    contract.isViewMode = true;
  };

  const handleDelete = async () => {
    if (!contractToDelete) return;
    
    try {
      const success = await deleteContract(contractToDelete.id);
      if (success) {
        setContracts(prev => prev.filter(c => c.id !== contractToDelete.id));
        setShowDeleteDialog(false);
        setContractToDelete(null);
        toast.success(t('agencyDashboard.pages.contracts.contractDeletedSuccess'));
      }
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error(t('agencyDashboard.pages.contracts.deleteError'));
    }
  };

  const handleSign = async (contractId: string) => {
    try {
      const success = await signContract(contractId);
      if (success) {
        setContracts(prev => prev.map(c => 
          c.id === contractId ? { ...c, status: 'closed' as const } : c
        ));
      }
    } catch (error) {
      console.error('Error signing contract:', error);
    }
  };

  const handleSaveContract = async (content: string, metadata: any) => {
    if (!editingContract) return;
    
    try {
      const updatedContract = await updateContractContent(editingContract.id, {
        ...metadata,
        content
      });
      
      setContracts(prev => prev.map(c => 
        c.id === editingContract.id ? { ...c, ...updatedContract } : c
      ));
      
      setShowEditor(false);
      setEditingContract(null);
      toast.success(t('agencyDashboard.pages.contracts.contractUpdatedSuccess'));
    } catch (error) {
      console.error('Error saving contract:', error);
      toast.error(t('agencyDashboard.pages.contracts.saveError'));
    }
  };

  const handleAssignToLease = async (contractId: string, leaseId: string) => {
    try {
      const success = await assignContractToLease(contractId, leaseId);
      if (success) {
        // Mettre à jour la liste des contrats
        setContracts(prev => prev.map(c => 
          c.id === contractId ? { ...c, status: 'validated' as const, related_entity: leaseId } : c
        ));
        
        // Mettre à jour le contrat en cours d'édition
        if (editingContract && editingContract.id === contractId) {
          setEditingContract({ ...editingContract, status: 'validated' as const, related_entity: leaseId });
        }
        
        toast.success(t('agencyDashboard.pages.contracts.contractAssignedSuccess'));
        
        // Fermer l'éditeur et retourner à la liste après un délai
        setTimeout(() => {
          setShowEditor(false);
          setEditingContract(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Error assigning contract to lease:', error);
      toast.error(t('agencyDashboard.pages.contracts.assignError'));
    }
  };

  const handleAssignFromList = async (contractId: string) => {
    // Ouvrir l'éditeur en mode attribution
    const contract = contracts.find(c => c.id === contractId);
    if (contract) {
      setEditingContract({ ...contract, isViewMode: false });
      setShowEditor(true);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (showEditor && editingContract) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => {
              setShowEditor(false);
              setEditingContract(null);
            }}
            className="mb-4"
          >
            ← {t('agencyDashboard.pages.contracts.backToList')}
          </Button>
          <h1 className="text-3xl font-bold">
            {editingContract.status === 'closed'
              ? t('agencyDashboard.pages.contracts.viewContract') 
              : t('agencyDashboard.pages.contracts.editContract')
            }
          </h1>
        </div>

        <ContractWysiwygEditor
          initialContent={editingContract.content}
          contractId={editingContract.id}
          onSave={handleSaveContract}
          onAssignToLease={handleAssignToLease}
          availableLeases={availableLeases}
          isReadOnly={editingContract.status === 'closed' || editingContract.isViewMode}
          showToolbar={editingContract.status !== 'closed' && !editingContract.isViewMode}
        />
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Empty State */}
      {contracts.length === 0 && !error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('agencyDashboard.pages.contracts.noContractsFound')}</h3>
              <p className="text-gray-600 mb-4">
                {t('agencyDashboard.pages.contracts.startCreatingContracts')}
              </p>
              <Button onClick={() => navigate(`/agencies/${agencyId}/contracts/create`)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('agencyDashboard.pages.contracts.createContract')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contracts Table */}
      {contracts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('agencyDashboard.pages.contracts.contracts')} ({contracts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">{t('agencyDashboard.pages.contracts.type')}</th>
                    <th className="text-left p-4 font-medium">{t('agencyDashboard.pages.contracts.title')}</th>
                    <th className="text-left p-4 font-medium">{t('agencyDashboard.pages.contracts.jurisdiction')}</th>
                    <th className="text-left p-4 font-medium">{t('agencyDashboard.pages.contracts.status')}</th>
                    <th className="text-left p-4 font-medium">{t('agencyDashboard.pages.contracts.preview')}</th>
                    <th className="text-left p-4 font-medium">{t('agencyDashboard.pages.contracts.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract) => (
                    <tr key={contract.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <Badge variant="outline">
                          {getTypeLabel(contract.type)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{contract.title}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(contract.created_at).toLocaleDateString('fr-FR')}
                        </div>
                        {contract.related_entity && (
                          <div className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                            <Link className="h-3 w-3" />
                            {t('agencyDashboard.pages.contracts.assignedToLease')}
                          </div>
                        )}
                      </td>
                      <td className="p-4">{contract.jurisdiction}</td>
                      <td className="p-4">
                        {getStatusBadge(contract.status)}
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="truncate text-sm text-gray-600">
                          {previewContractContent(contract.content, 100)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {/* Bouton Consulter/Voir Contrat */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(contract)}
                            title={t('agencyDashboard.pages.contracts.viewContract')}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="ml-2">{t('agencyDashboard.pages.contracts.view')}</span>
                          </Button>
                          
                          {/* Bouton Modifier */}
                          {contract.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(contract)}
                              title={t('agencyDashboard.pages.contracts.editContract')}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Bouton Attribuer (pour contrats brouillon) */}
                          {contract.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAssignFromList(contract.id)}
                              title={t('agencyDashboard.pages.contracts.assignContractToLease')}
                            >
                              <Link className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Bouton Signer (pour contrats attribués) */}
                          {contract.status === 'validated' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSign(contract.id)}
                              title={t('agencyDashboard.pages.contracts.signContract')}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Bouton Supprimer */}
                          {contract.status !== 'closed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setContractToDelete(contract);
                                setShowDeleteDialog(true);
                              }}
                              title={t('agencyDashboard.pages.contracts.deleteContract')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('agencyDashboard.pages.contracts.deleteContract')}</DialogTitle>
            <DialogDescription>
              {t('agencyDashboard.pages.contracts.confirmDeleteMessage', { title: contractToDelete?.title })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {t('agencyDashboard.pages.contracts.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t('agencyDashboard.pages.contracts.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 