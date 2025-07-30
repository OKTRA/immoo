import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  UserPlus, 
  Search,
  Building2,
  Phone,
  Mail,
  Calendar,
  Eye,
  Edit,
  FileText,
  Home,
  CheckCircle,
  AlertCircle,
  Clock,
  UserCheck,
  UserX,
  Target,
  TrendingUp,
  Activity,
  Download,
  Trash2,
  Briefcase
} from "lucide-react";
import { toast } from "sonner";
import AddTenantForm from '@/components/tenants/AddTenantForm';
import { getTenantsByPropertyId, getTenantsByAgencyId } from '@/services/tenant/tenantPropertyQueries';
import { TenantWithLease } from '@/components/tenants/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import EditTenantForm from '@/components/tenants/EditTenantForm';
import { deleteTenant } from '@/services/tenant/tenantService';
import { useTranslation } from "@/hooks/useTranslation";

interface ManageTenantsPageProps {
  leaseView?: boolean;
}

export default function ManageTenantsPage({ leaseView = false }: ManageTenantsPageProps) {
  const { agencyId, propertyId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isAddingTenant, setIsAddingTenant] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // States pour vue, édition et suppression
  const [viewTenant, setViewTenant] = useState<TenantWithLease | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editTenant, setEditTenant] = useState<TenantWithLease | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTenantTarget, setDeleteTenantTarget] = useState<TenantWithLease | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: tenants = [], isLoading, error, refetch } = useQuery({
    queryKey: ['tenants', agencyId, propertyId],
    queryFn: async () => {
      if (!agencyId) return [];
      const result = propertyId 
        ? await getTenantsByPropertyId(propertyId)
        : await getTenantsByAgencyId(agencyId);
      
      if (result.error) throw new Error(result.error);
      return result.tenants || [];
    },
    enabled: !!agencyId,
    refetchOnWindowFocus: false,
  });

  if (!agencyId) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t('agencyDashboard.pages.tenants.accessDenied')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Filtrer les locataires
  const filteredTenants = tenants.filter(tenant => {
    const fullName = `${tenant.firstName} ${tenant.lastName}`.toLowerCase();
    const email = tenant.email?.toLowerCase() || '';
    const phone = tenant.phone?.toLowerCase() || '';
    const query = searchTerm.toLowerCase();
    
    const matchesSearch = fullName.includes(query) || email.includes(query) || phone.includes(query);
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' && tenant.hasLease) ||
      (selectedStatus === 'inactive' && !tenant.hasLease);
    
    return matchesSearch && matchesStatus;
  });

  // Calculer les statistiques
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.hasLease).length;
  const inactiveTenants = totalTenants - activeTenants;
  const activePercentage = totalTenants > 0 ? (activeTenants / totalTenants) * 100 : 0;

  const handleCreateLease = (tenantId: string, propertyIdToUse?: string) => {
    const targetPropertyId = propertyIdToUse || propertyId;
    if (targetPropertyId) {
      navigate(`/agencies/${agencyId}/properties/${targetPropertyId}/lease/create?tenantId=${tenantId}`);
    } else {
      toast.info(t('agencyDashboard.pages.tenants.selectPropertyForLease'));
      navigate(`/agencies/${agencyId}`);
    }
  };

  const handleAddTenantSuccess = () => {
    setIsAddingTenant(false);
    refetch();
    toast.success(t('agencyDashboard.pages.tenants.tenantAddedSuccess'));
  };

  // Gestion vue / édition / suppression
  const handleViewTenant = (tenant: TenantWithLease) => {
    setViewTenant(tenant);
    setIsViewOpen(true);
  };

  const handleEditTenant = (tenant: TenantWithLease) => {
    setEditTenant(tenant);
    setIsEditOpen(true);
  };

  const handleDeleteTenant = (tenant: TenantWithLease) => {
    setDeleteTenantTarget(tenant);
    setIsDeleteOpen(true);
  };

  const confirmDeleteTenant = async () => {
    if (!deleteTenantTarget) return;

    if (deleteTenantTarget.hasLease) {
      toast.error(t('agencyDashboard.pages.tenants.cannotDeleteWithLease'));
      setIsDeleteOpen(false);
      return;
    }

    const { error } = await deleteTenant(deleteTenantTarget.id || '');
    if (error) {
      toast.error(`${t('agencyDashboard.pages.tenants.deleteError')}: ${error}`);
    } else {
      toast.success(t('agencyDashboard.pages.tenants.tenantDeleted'));
      refetch();
    }
    setIsDeleteOpen(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-immoo-gold mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('agencyDashboard.pages.tenants.loadingTenants')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('agencyDashboard.pages.tenants.loadError')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header Premium */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-immoo-gold to-immoo-navy rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-immoo-navy to-immoo-gold bg-clip-text text-transparent">
                {leaseView ? t('agencyDashboard.pages.tenants.leaseManagement') : t('agencyDashboard.pages.tenants.tenantManagement')}
              </h1>
              <p className="text-muted-foreground">
                {propertyId 
                  ? t('agencyDashboard.pages.tenants.propertyTenants')
                  : t('agencyDashboard.pages.tenants.allAgencyTenants')
                }
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="h-4 w-4 mr-2" />
            {t('agencyDashboard.pages.tenants.export')}
          </Button>
          <Button 
            onClick={() => setIsAddingTenant(true)}
            className="bg-gradient-to-r from-immoo-gold to-immoo-navy"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {t('agencyDashboard.pages.tenants.newTenant')}
          </Button>
        </div>
      </div>

      {/* Filtres Premium */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              {[
                { value: 'all', label: t('agencyDashboard.pages.tenants.all'), icon: Users },
                { value: 'active', label: t('agencyDashboard.pages.tenants.active'), icon: UserCheck },
                { value: 'inactive', label: t('agencyDashboard.pages.tenants.inactive'), icon: UserX }
              ].map((status) => (
                <Button
                  key={status.value}
                  variant={selectedStatus === status.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus(status.value)}
                  className={selectedStatus === status.value ? 'bg-gradient-to-r from-immoo-gold to-immoo-navy' : ''}
                >
                  <status.icon className="h-4 w-4 mr-2" />
                  {status.label}
                </Button>
              ))}
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('agencyDashboard.pages.tenants.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cartes de résumé premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                {t('agencyDashboard.pages.tenants.totalTenants')}
              </div>
              <div className="p-1 bg-blue-100 rounded-full">
                <TrendingUp className="h-3 w-3 text-blue-600" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 mb-1">
              {totalTenants}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-600">{t('agencyDashboard.pages.tenants.database')}</span>
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                {t('agencyDashboard.pages.tenants.total')}
              </Badge>
            </div>
            <Progress value={100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center justify-between">
              <div className="flex items-center">
                <UserCheck className="h-4 w-4 mr-2" />
                {t('agencyDashboard.pages.tenants.activeTenants')}
              </div>
              <div className="p-1 bg-green-100 rounded-full">
                <CheckCircle className="h-3 w-3 text-green-600" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 mb-1">
              {activeTenants}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-600">{t('agencyDashboard.pages.tenants.withActiveLease')}</span>
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                {activePercentage.toFixed(0)}%
              </Badge>
            </div>
            <Progress value={activePercentage} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center justify-between">
              <div className="flex items-center">
                <UserX className="h-4 w-4 mr-2" />
                {t('agencyDashboard.pages.tenants.withoutLease')}
              </div>
              <div className="p-1 bg-orange-100 rounded-full">
                <Clock className="h-3 w-3 text-orange-600" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800 mb-1">
              {inactiveTenants}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-orange-600">{t('agencyDashboard.pages.tenants.available')}</span>
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                {t('agencyDashboard.pages.tenants.waiting')}
              </Badge>
            </div>
            <Progress value={100 - activePercentage} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                {t('agencyDashboard.pages.tenants.occupancyRate')}
              </div>
              <div className="p-1 bg-purple-100 rounded-full">
                <Target className="h-3 w-3 text-purple-600" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800 mb-1">
              {activePercentage.toFixed(0)}%
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-purple-600">{t('agencyDashboard.pages.tenants.performance')}</span>
              <Badge variant="secondary" className={`text-xs ${
                activePercentage >= 80 ? 'bg-green-100 text-green-700' :
                activePercentage >= 60 ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                {activePercentage >= 80 ? t('agencyDashboard.pages.tenants.excellent') :
                 activePercentage >= 60 ? t('agencyDashboard.pages.tenants.good') : t('agencyDashboard.pages.tenants.needsImprovement')}
              </Badge>
            </div>
            <Progress value={activePercentage} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Liste des locataires */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-immoo-navy/5 to-immoo-gold/5">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-immoo-navy" />
              {t('agencyDashboard.pages.tenants.tenantList')}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {filteredTenants.length} {t('agencyDashboard.pages.tenants.results')}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTenants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                {searchTerm || selectedStatus !== 'all' 
                  ? t('agencyDashboard.pages.tenants.noTenantsFound')
                  : t('agencyDashboard.pages.tenants.noTenantsRegistered')
                }
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || selectedStatus !== 'all' 
                  ? t('agencyDashboard.pages.tenants.tryModifyingFilters')
                  : t('agencyDashboard.pages.tenants.startAddingTenants')
                }
              </p>
              {(!searchTerm && selectedStatus === 'all') && (
                <Button 
                  onClick={() => setIsAddingTenant(true)}
                  className="bg-gradient-to-r from-immoo-gold to-immoo-navy"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t('agencyDashboard.pages.tenants.addTenant')}
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTenants.map((tenant) => (
                <div 
                  key={tenant.id} 
                  className="p-6 hover:bg-gradient-to-r hover:from-immoo-pearl/30 hover:to-immoo-gold/10 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl shadow-sm ${
                        tenant.hasLease 
                          ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-700' 
                          : 'bg-gradient-to-br from-orange-100 to-amber-100 text-orange-700'
                      }`}>
                        {tenant.hasLease ? 
                          <UserCheck className="h-5 w-5" /> : 
                          <UserX className="h-5 w-5" />
                        }
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900 text-lg">
                            {tenant.firstName} {tenant.lastName}
                          </span>
                          <Badge 
                            variant={tenant.hasLease ? 'default' : 'secondary'} 
                            className={`text-xs ${
                              tenant.hasLease 
                                ? 'bg-green-100 text-green-700 border-green-200' 
                                : 'bg-orange-100 text-orange-700 border-orange-200'
                            }`}
                          >
                            {tenant.hasLease ? t('agencyDashboard.pages.tenants.activeTenant') : t('agencyDashboard.pages.tenants.available')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {tenant.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {tenant.email}
                            </div>
                          )}
                          {tenant.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {tenant.phone}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {t('agencyDashboard.pages.tenants.addedOn')} {new Date(tenant.createdAt || '').toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!tenant.hasLease && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCreateLease(tenant.id)}
                          className="hover:bg-immoo-gold hover:text-white"
                        >
                          <Home className="h-4 w-4 mr-1" />
                          {t('agencyDashboard.pages.tenants.createLease')}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hover:bg-immoo-navy hover:text-white"
                        onClick={() => handleViewTenant(tenant)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hover:bg-immoo-gold hover:text-white"
                        onClick={() => handleEditTenant(tenant)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hover:bg-red-600 hover:text-white"
                        onClick={() => handleDeleteTenant(tenant)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal d'ajout de locataire */}
      {isAddingTenant && (
        <AddTenantForm 
          onCancel={() => setIsAddingTenant(false)} 
          onSuccess={handleAddTenantSuccess}
          agencyId={agencyId}
        />
      )}

      {/* Dialog de visualisation du locataire */}
      {viewTenant && (
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('agencyDashboard.pages.tenants.tenantDetails')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <div className="flex flex-col items-center gap-3">
                {viewTenant.photoUrl ? (
                  <img src={viewTenant.photoUrl} alt="Photo" className="h-24 w-24 rounded-full object-cover" />
                ) : (
                  <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center">
                    <Users className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                <h2 className="text-xl font-semibold">
                  {viewTenant.firstName} {viewTenant.lastName}
                </h2>
              </div>
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> {viewTenant.email || t('agencyDashboard.pages.tenants.emailNotProvided')}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> {viewTenant.phone || t('agencyDashboard.pages.tenants.phoneNotProvided')}
                </div>
                {viewTenant.employmentStatus && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> {viewTenant.employmentStatus}
                  </div>
                )}
                {viewTenant.profession && (
                  <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4" /> {viewTenant.profession}
                  </div>
                )}
                {viewTenant.emergencyContact && (
                  <div>
                    <p className="font-medium">{t('agencyDashboard.pages.tenants.emergencyContact')} :</p>
                    <p>{viewTenant.emergencyContact.name} - {viewTenant.emergencyContact.phone} ({viewTenant.emergencyContact.relationship})</p>
                  </div>
                )}
                {viewTenant.identityPhotos && viewTenant.identityPhotos.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">{t('agencyDashboard.pages.tenants.identityPhotos')} :</p>
                    <div className="grid grid-cols-3 gap-2">
                      {viewTenant.identityPhotos.map((photo: any, idx: number) => {
                        const url = typeof photo === 'string' ? photo : (photo.url || '');
                        return (
                          <img
                            key={idx}
                            src={url}
                            alt={`ID-${idx}`}
                            className="h-24 w-24 object-cover rounded-lg shadow-sm border"
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
                {viewTenant.createdAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <Calendar className="h-3 w-3" /> {t('agencyDashboard.pages.tenants.addedOn')} {new Date(viewTenant.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog d'édition du locataire */}
      {editTenant && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl p-0">
            <EditTenantForm 
              tenant={editTenant} 
              onCancel={() => setIsEditOpen(false)} 
              onSuccess={() => { setIsEditOpen(false); refetch(); }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation suppression */}
      {deleteTenantTarget && (
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('agencyDashboard.pages.tenants.confirmDeletion')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('agencyDashboard.pages.tenants.confirmDeletionMessage', { 
                  firstName: deleteTenantTarget.firstName, 
                  lastName: deleteTenantTarget.lastName 
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('agencyDashboard.pages.tenants.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteTenant}>{t('agencyDashboard.pages.tenants.delete')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
