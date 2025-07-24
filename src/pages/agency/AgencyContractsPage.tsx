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
  Link
} from "lucide-react";
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

interface Contract {
  id: string;
  type: string;
  title: string;
  jurisdiction: string;
  status: 'draft' | 'assigned' | 'signed';
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
        setError("Erreur lors du chargement des données");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (agencyId) fetchData();
  }, [agencyId, leaseIdFromUrl]);

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
      draft: { variant: 'secondary' as const, icon: AlertTriangle, label: 'Brouillon', className: '' },
      assigned: { variant: 'default' as const, icon: CheckCircle, label: 'Attribué', className: 'bg-blue-600 text-white' },
      signed: { variant: 'default' as const, icon: CheckCircle, label: 'Signé', className: 'bg-green-600 text-white' }
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
      bail: 'Bail de location',
      vente: 'Contrat de vente',
      mandat: 'Mandat de gestion',
      prestation: 'Contrat de prestation',
      autre: 'Autre'
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
        toast.success('Contrat supprimé avec succès');
      }
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error('Erreur lors de la suppression du contrat');
    }
  };

  const handleSign = async (contractId: string) => {
    try {
      const success = await signContract(contractId);
      if (success) {
        setContracts(prev => prev.map(c => 
          c.id === contractId ? { ...c, status: 'signed' as const } : c
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
      toast.success('Contrat mis à jour avec succès');
    } catch (error) {
      console.error('Error saving contract:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleAssignToLease = async (contractId: string, leaseId: string) => {
    try {
      const success = await assignContractToLease(contractId, leaseId);
      if (success) {
        // Mettre à jour la liste des contrats
        setContracts(prev => prev.map(c => 
          c.id === contractId ? { ...c, status: 'assigned' as const, related_entity: leaseId } : c
        ));
        
        // Mettre à jour le contrat en cours d'édition
        if (editingContract && editingContract.id === contractId) {
          setEditingContract({ ...editingContract, status: 'assigned' as const, related_entity: leaseId });
        }
        
        toast.success('Contrat attribué au bail avec succès !');
        
        // Fermer l'éditeur et retourner à la liste après un délai
        setTimeout(() => {
          setShowEditor(false);
          setEditingContract(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Error assigning contract to lease:', error);
      toast.error("Erreur lors de l'attribution du contrat");
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
            ← Retour à la liste
          </Button>
          <h1 className="text-3xl font-bold">
            {editingContract.status === 'signed'
              ? 'Consulter le contrat' 
              : 'Modifier le contrat'
            }
          </h1>
        </div>

        <ContractWysiwygEditor
          initialContent={editingContract.content}
          contractId={editingContract.id}
          onSave={handleSaveContract}
          onAssignToLease={handleAssignToLease}
          availableLeases={availableLeases}
          isReadOnly={editingContract.status === 'signed' || editingContract.isViewMode}
          showToolbar={editingContract.status !== 'signed' && !editingContract.isViewMode}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" /> 
            {leaseIdFromUrl ? 'Contrats du bail' : 'Contrats de l\'agence'}
          </h1>
          <p className="text-gray-600 mt-2">
            {leaseIdFromUrl 
              ? 'Contrats associés à ce bail spécifique'
              : 'Gérez tous les contrats de votre agence immobilière'
            }
          </p>
        </div>
        
        <Button 
          onClick={() => navigate(`/agencies/${agencyId}/contracts/create`)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouveau contrat
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {contracts.length === 0 && !error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun contrat trouvé</h3>
              <p className="text-gray-600 mb-4">
                Commencez par créer votre premier contrat pour cette agence.
              </p>
              <Button onClick={() => navigate(`/agencies/${agencyId}/contracts/create`)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un contrat
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contracts Table */}
      {contracts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Contrats ({contracts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Type</th>
                    <th className="text-left p-4 font-medium">Titre</th>
                    <th className="text-left p-4 font-medium">Législation</th>
                    <th className="text-left p-4 font-medium">Statut</th>
                    <th className="text-left p-4 font-medium">Extrait</th>
                    <th className="text-left p-4 font-medium">Actions</th>
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
                            Attribué à un bail
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
                            title="Voir le contrat"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="ml-2">Voir</span>
                          </Button>
                          
                          {/* Bouton Modifier */}
                          {contract.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(contract)}
                              title="Modifier le contrat"
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
                              title="Attribuer le contrat à un bail"
                            >
                              <Link className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Bouton Signer (pour contrats attribués) */}
                          {contract.status === 'assigned' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSign(contract.id)}
                              title="Signer le contrat"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Bouton Supprimer */}
                          {contract.status !== 'signed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setContractToDelete(contract);
                                setShowDeleteDialog(true);
                              }}
                              title="Supprimer le contrat"
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
            <DialogTitle>Supprimer le contrat</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le contrat "{contractToDelete?.title}" ? 
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 