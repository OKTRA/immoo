import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  getContractsByAgency, 
  deleteContract, 
  signContract,
  type ContractData 
} from '@/services/contracts/contractWysiwygService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Eye, 
  Trash2, 
  CheckCircle, 
  FileText, 
  Archive,
  Download,
  Users,
  Calendar,
  Building,
  AlertTriangle,
  XCircle,
  MoreHorizontal,
  Link2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AttachLeaseDialog from '@/components/contracts/AttachLeaseDialog';

export default function ContractsListPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<ContractData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<ContractData | null>(null);
  
  // États pour le rattachement de bail
  const [showAttachDialog, setShowAttachDialog] = useState(false);
  const [contractToAttach, setContractToAttach] = useState<ContractData | null>(null);

  useEffect(() => {
    loadContracts();
  }, [profile?.agency_id]);

  useEffect(() => {
    filterContracts();
  }, [contracts, searchTerm, statusFilter, typeFilter]);

  const loadContracts = async () => {
    if (!profile?.agency_id) return;
    
    setIsLoading(true);
    try {
      const contractsData = await getContractsByAgency(profile.agency_id);
      setContracts(contractsData);
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast.error('Erreur lors du chargement des contrats');
    } finally {
      setIsLoading(false);
    }
  };

  const filterContracts = () => {
    let filtered = contracts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(contract =>
        contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contract => contract.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(contract => contract.type === typeFilter);
    }

    setFilteredContracts(filtered);
  };

  const handleDelete = async () => {
    if (!contractToDelete) return;
    
    try {
      const success = await deleteContract(contractToDelete.id!);
      if (success) {
        setContracts(prev => prev.filter(c => c.id !== contractToDelete.id));
        setShowDeleteDialog(false);
        setContractToDelete(null);
        toast.success('Contrat supprimé avec succès');
      }
    } catch (error) {
      console.error('Error deleting contract:', error);
    }
  };

  const handleSign = async (contractId: string) => {
    try {
      const success = await signContract(contractId);
      if (success) {
        setContracts(prev => prev.map(c => 
          c.id === contractId ? { ...c, status: 'signed' } : c
        ));
        toast.success('Contrat signé avec succès');
      }
    } catch (error) {
      console.error('Error signing contract:', error);
    }
  };

  const handleAttachLease = (contract: ContractData) => {
    setContractToAttach(contract);
    setShowAttachDialog(true);
  };

  const handleAttachSuccess = () => {
    loadContracts(); // Recharger la liste pour voir les changements
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, icon: AlertTriangle, label: 'Brouillon', className: '' },
      assigned: { variant: 'default' as const, icon: CheckCircle, label: 'Attribué', className: 'bg-blue-600 text-white' },
      signed: { variant: 'default' as const, icon: FileText, label: 'Signé', className: 'bg-green-600 text-white' }
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
        <div>
          <h1 className="text-3xl font-bold">Contrats</h1>
          <p className="text-gray-600">Gérez vos contrats professionnels</p>
        </div>
        
        <Button onClick={() => navigate('/contracts/new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouveau contrat
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rechercher</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un contrat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="assigned">Attribué</SelectItem>
                  <SelectItem value="signed">Signé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="bail">Bail de location</SelectItem>
                  <SelectItem value="vente">Contrat de vente</SelectItem>
                  <SelectItem value="mandat">Mandat de gestion</SelectItem>
                  <SelectItem value="prestation">Contrat de prestation</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <Button 
                variant="outline" 
                onClick={loadContracts}
                className="w-full"
              >
                Actualiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Contrats ({filteredContracts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredContracts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun contrat trouvé</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Aucun contrat ne correspond à vos critères de recherche.'
                  : 'Commencez par créer votre premier contrat.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                <Button onClick={() => navigate('/contracts/new')}>
                  Créer un contrat
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Juridiction</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Bail associé</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <div className="font-medium">{contract.title}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTypeLabel(contract.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(contract.status)}
                    </TableCell>
                    <TableCell>{contract.jurisdiction}</TableCell>
                    <TableCell>
                      {contract.created_at && format(new Date(contract.created_at), 'dd/MM/yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      {contract.related_entity ? (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Associé
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/contracts/${contract.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {contract.status !== 'signed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/contracts/${contract.id}`)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {contract.status === 'assigned' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSign(contract.id!)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {!contract.related_entity && contract.status !== 'signed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAttachLease(contract)}
                            title="Rattacher à un bail"
                          >
                            <Link2 className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setContractToDelete(contract);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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

      {/* Attach Lease Dialog */}
      <AttachLeaseDialog
        isOpen={showAttachDialog}
        onClose={() => setShowAttachDialog(false)}
        contract={contractToAttach}
        agencyId={profile?.agency_id || ''}
        onSuccess={handleAttachSuccess}
      />
    </div>
  );
} 