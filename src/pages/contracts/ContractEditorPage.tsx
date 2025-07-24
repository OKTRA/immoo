import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ContractWysiwygEditor from '@/components/contracts/ContractWysiwygEditor';
import { 
  createContract, 
  updateContract, 
  getContractById, 
  assignContractToLease,
  getAvailableLeasesForAssignment,
  signContract,
  deleteContract,
  type ContractData 
} from '@/services/contracts/contractWysiwygService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  FileText, 
  Users,
  Calendar,
  Building,
  Download,
  Archive,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function ContractEditorPage() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [contract, setContract] = useState<ContractData | null>(null);
  const [availableLeases, setAvailableLeases] = useState<Array<{
    id: string;
    title: string;
    tenantName: string;
    propertyName: string;
    startDate: string;
    endDate: string;
    monthlyRent: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isNewContract = !contractId || contractId === 'new';

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (!isNewContract) {
          const contractData = await getContractById(contractId);
          setContract(contractData);
          setIsReadOnly(contractData?.status === 'closed');
        }

        // Charger les baux disponibles si l'utilisateur est connecté
        if (user?.agency_id) {
          const leases = await getAvailableLeasesForAssignment(user.agency_id);
          setAvailableLeases(leases);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [contractId, user?.agency_id, isNewContract]);

  const handleSave = async (content: string, metadata: any) => {
    try {
      if (isNewContract) {
        const newContract = await createContract({
          ...metadata,
          content,
          agency_id: user?.agency_id
        });
        setContract(newContract);
        navigate(`/contracts/${newContract.id}`);
        toast.success('Contrat créé avec succès');
      } else {
        const updatedContract = await updateContract(contractId!, {
          ...metadata,
          content
        });
        setContract(updatedContract);
        toast.success('Contrat mis à jour avec succès');
      }
    } catch (error) {
      console.error('Error saving contract:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleAssignToLease = async (contractId: string, leaseId: string) => {
    try {
      const success = await assignContractToLease(contractId, leaseId);
      if (success && contract) {
        setContract({ ...contract, related_entity: leaseId });
      }
    } catch (error) {
      console.error('Error assigning contract to lease:', error);
    }
  };

  const handleSign = async () => {
    if (!contractId) return;
    
    try {
      const success = await signContract(contractId);
      if (success && contract) {
        setContract({ ...contract, status: 'closed' });
        setIsReadOnly(true);
      }
    } catch (error) {
      console.error('Error signing contract:', error);
    }
  };

  const handleDelete = async () => {
    if (!contractId) return;
    
    try {
      const success = await deleteContract(contractId);
      if (success) {
        navigate('/contracts');
        toast.success('Contrat supprimé avec succès');
      }
    } catch (error) {
      console.error('Error deleting contract:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, icon: AlertTriangle, label: 'Brouillon', className: '' },
          validated: { variant: 'default' as const, icon: CheckCircle, label: 'Validé', className: 'bg-blue-600 text-white' },
    closed: { variant: 'default' as const, icon: FileText, label: 'Fermé', className: 'bg-green-600 text-white' }
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/contracts')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold">
              {isNewContract ? 'Nouveau contrat' : contract?.title || 'Éditer le contrat'}
            </h1>
            <p className="text-gray-600">
              {isNewContract ? 'Créez un nouveau contrat professionnel' : 'Modifiez les détails du contrat'}
            </p>
          </div>
        </div>

        {contract && (
          <div className="flex items-center gap-2">
            {getStatusBadge(contract.status)}
          </div>
        )}
      </div>

      {/* Contract Info Card */}
      {contract && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informations du contrat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Type: {contract.type}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Créé le: {new Date(contract.created_at || '').toLocaleDateString()}
                </span>
              </div>
              
              {contract.related_entity && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Attribué à un bail</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {contract && !isNewContract && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {contract.status === 'validated' && (
                <Button onClick={handleSign} className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Signer
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => window.print()}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Imprimer
              </Button>
              
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Read-only Warning */}
      {isReadOnly && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Ce contrat est en lecture seule car il est signé ou archivé. 
            Vous ne pouvez plus le modifier.
          </AlertDescription>
        </Alert>
      )}

      {/* Editor */}
      <ContractWysiwygEditor
        initialContent={contract?.content || ''}
        contractId={contract?.id}
        onSave={handleSave}
        onAssignToLease={handleAssignToLease}
        availableLeases={availableLeases}
        isReadOnly={isReadOnly}
        showToolbar={!isReadOnly}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le contrat</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce contrat ? Cette action est irréversible.
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