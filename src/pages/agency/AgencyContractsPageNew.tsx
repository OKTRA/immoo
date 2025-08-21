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
  property_id?: string;
  isViewMode?: boolean;
}

export default function AgencyContractsPageNew() {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [availableLeases, setAvailableLeases] = useState<Array<{
    id: string;
    title: string;
    tenantName: string;
    propertyName: string;
  }>>([]);

  const queryParams = new URLSearchParams(location.search);
  const leaseIdFromUrl = queryParams.get('leaseId');
  const locationState = location.state as { viewContractId?: string; contractData?: Contract } | null;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      
      try {
        let query = supabase
          .from("contracts")
          .select("*")
          .eq("agency_id", agencyId)
          .order("created_at", { ascending: false });

        if (leaseIdFromUrl) {
          query = query.eq("lease_id", leaseIdFromUrl);
        }
          
        const { data: contractsData, error: contractsError } = await query;
          
        if (contractsError) throw contractsError;
        setContracts(contractsData || []);

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

  // Filter contracts based on search and status
  useEffect(() => {
    let filtered = contracts;
    
    if (searchTerm) {
      filtered = filtered.filter(contract => 
        contract.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.contract_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.jurisdiction?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(contract => contract.status === statusFilter);
    }
    
    setFilteredContracts(filtered);
  }, [contracts, searchTerm, statusFilter]);

  useEffect(() => {
    if (locationState?.viewContractId && locationState?.contractData && contracts.length > 0) {
      const contract = contracts.find(c => c.id === locationState.viewContractId);
      if (contract) {
        handleView(contract);
        navigate(location.pathname + location.search, { replace: true, state: null });
      }
    }
  }, [contracts, locationState, navigate, location.pathname, location.search]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { 
        variant: 'secondary' as const, 
        icon: AlertTriangle, 
        label: t('agencyDashboard.pages.contracts.draft'), 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
      },
      validated: { 
        variant: 'default' as const, 
        icon: CheckCircle, 
        label: t('agencyDashboard.pages.contracts.validated'), 
        className: 'bg-blue-100 text-blue-800 border-blue-200' 
      },
      closed: { 
        variant: 'default' as const, 
        icon: CheckCircle, 
        label: t('agencyDashboard.pages.contracts.closed'), 
        className: 'bg-green-100 text-green-800 border-green-200' 
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
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

  const getTypeIcon = (type: string) => {
    const typeIcons = {
      bail: FileText,
      vente: Archive,
      mandat: Settings,
      prestation: Link,
      autre: FileText
    };
    return typeIcons[type as keyof typeof typeIcons] || FileText;
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract({ ...contract, isViewMode: false });
    setShowEditor(true);
  };

  const handleView = (contract: Contract) => {
    setEditingContract(contract);
    setShowEditor(true);
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
        toast.success('Contrat signé avec succès');
      }
    } catch (error) {
      console.error('Error signing contract:', error);
      toast.error('Erreur lors de la signature');
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
        setContracts(prev => prev.map(c => 
          c.id === contractId ? { ...c, status: 'validated' as const, property_id: leaseId } : c
        ));
        
        if (editingContract && editingContract.id === contractId) {
          setEditingContract({ ...editingContract, status: 'validated' as const, property_id: leaseId });
        }
        
        toast.success(t('agencyDashboard.pages.contracts.contractAssignedSuccess'));
        
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
    const contract = contracts.find(c => c.id === contractId);
    if (contract) {
      setEditingContract({ ...contract, isViewMode: false });
      setShowEditor(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showEditor && editingContract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditor(false);
                setEditingContract(null);
              }}
              className="mb-4 hover:bg-gray-100"
            >
              ← {t('agencyDashboard.pages.contracts.backToList')}
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {editingContract.status === 'closed'
                ? t('agencyDashboard.pages.contracts.viewContract') 
                : t('agencyDashboard.pages.contracts.editContract')
              }
            </h1>
          </div>

          <ContractWysiwygEditor
                            initialContent={editingContract.terms}
            contractId={editingContract.id}
            onSave={handleSaveContract}
            onAssignToLease={handleAssignToLease}
            availableLeases={availableLeases}
            isReadOnly={editingContract.status === 'closed' || editingContract.isViewMode}
            showToolbar={editingContract.status !== 'closed' && !editingContract.isViewMode}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {leaseIdFromUrl ? t('agencyDashboard.pages.contracts.leaseContracts') : t('agencyDashboard.pages.contracts.agencyContracts')}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Gérez tous les contrats de votre agence immobilière
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => navigate(`/agencies/${agencyId}/contracts/create`)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 h-9 sm:h-auto text-sm sm:text-base"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('agencyDashboard.pages.contracts.newContract')}</span>
              <span className="sm:hidden">Nouveau</span>
            </Button>
          </div>
          
          {/* Stats */}
          <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-blue-600">Total</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-900">{contracts.length}</p>
                  </div>
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-yellow-600">Brouillons</p>
                    <p className="text-xl sm:text-2xl font-bold text-yellow-900">{contracts.filter(c => c.status === 'draft').length}</p>
                  </div>
                  <Edit3 className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-green-600">Signés</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-900">{contracts.filter(c => c.status === 'closed').length}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
            <Input
              placeholder="Rechercher un contrat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 sm:pl-10 h-9 sm:h-10 text-sm"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 h-9 sm:h-10 text-sm whitespace-nowrap">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Statut: {statusFilter === 'all' ? 'Tous' : statusFilter}</span>
                <span className="sm:hidden">{statusFilter === 'all' ? 'Tous' : statusFilter}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 sm:w-48">
              <DropdownMenuItem onClick={() => setStatusFilter('all')} className="text-xs sm:text-sm">
                Tous les statuts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('draft')} className="text-xs sm:text-sm">
                Brouillons
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('validated')} className="text-xs sm:text-sm">
                Validés
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('closed')} className="text-xs sm:text-sm">
                Signés
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {error}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {filteredContracts.length === 0 && !error && (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {contracts.length === 0 ? 'Aucun contrat trouvé' : 'Aucun résultat'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {contracts.length === 0 
                    ? 'Commencez par créer votre premier contrat'
                    : 'Essayez de modifier vos critères de recherche'
                  }
                </p>
                {contracts.length === 0 && (
                  <Button 
                    onClick={() => navigate(`/agencies/${agencyId}/contracts/create`)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un contrat
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contracts Grid */}
        {filteredContracts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {filteredContracts.map((contract) => {
              const TypeIcon = getTypeIcon(contract.contract_type);
              return (
                <Card key={contract.id} className="w-full hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3 px-4 pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="p-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex-shrink-0">
                          <TypeIcon className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                                                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{contract.title || `Contrat ${contract.contract_type}`}</h3>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">{getTypeLabel(contract.contract_type)}</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(contract.status)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 px-4 pb-4">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{contract.jurisdiction || 'Non spécifié'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{new Date(contract.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      
                      {contract.property_id && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-600">
                          <Link className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="text-xs truncate">Assigné à un bail</span>
                        </div>
                      )}
                      
                      <div className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-2 sm:p-3 rounded-lg">
                        <p className="line-clamp-2">
                          {previewContractContent(contract.terms, 100)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 sm:mt-4 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(contract)}
                        className="flex-1 hover:bg-blue-50 hover:border-blue-200 text-xs sm:text-sm h-8 sm:h-9"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Voir</span>
                        <span className="sm:hidden">👁️</span>
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="px-2 h-8 sm:h-9 w-8 sm:w-auto">
                            <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 sm:w-48">
                          {contract.status === 'draft' && (
                            <>
                              <DropdownMenuItem onClick={() => handleEdit(contract)} className="text-xs sm:text-sm">
                                <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAssignFromList(contract.id)} className="text-xs sm:text-sm">
                                <Link className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                Attribuer
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          {contract.status === 'validated' && (
                            <DropdownMenuItem onClick={() => handleSign(contract.id)} className="text-xs sm:text-sm">
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                              Signer
                            </DropdownMenuItem>
                          )}
                          
                          {contract.status !== 'closed' && (
                            <DropdownMenuItem 
                              onClick={() => {
                                setContractToDelete(contract);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer le contrat</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer le contrat "{contractToDelete?.title}" ? Cette action est irréversible.
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
    </div>
  );
}
