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
  Download
} from "lucide-react";
import { toast } from "sonner";
import AddTenantForm from '@/components/tenants/AddTenantForm';
import { getTenantsByPropertyId, getTenantsByAgencyId } from '@/services/tenant/tenantPropertyQueries';
import { TenantWithLease } from '@/components/tenants/types';

interface ManageTenantsPageProps {
  leaseView?: boolean;
}

export default function ManageTenantsPage({ leaseView = false }: ManageTenantsPageProps) {
  const { agencyId, propertyId } = useParams();
  const navigate = useNavigate();
  const [isAddingTenant, setIsAddingTenant] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

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
          <AlertDescription>Accès refusé. Identifiant d'agence manquant.</AlertDescription>
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
      toast.info("Veuillez sélectionner une propriété pour créer un bail");
      navigate(`/agencies/${agencyId}`);
    }
  };

  const handleAddTenantSuccess = () => {
    setIsAddingTenant(false);
    refetch();
    toast.success("Locataire ajouté avec succès!");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-immoo-gold mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des locataires...</p>
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
            Erreur lors du chargement des locataires. Veuillez réessayer.
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
        {leaseView ? "Gestion des Baux" : "Gestion des Locataires"}
      </h1>
              <p className="text-muted-foreground">
                {propertyId 
                  ? "Locataires de cette propriété"
                  : "Tous les locataires de votre agence"
                }
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button 
            onClick={() => setIsAddingTenant(true)}
            className="bg-gradient-to-r from-immoo-gold to-immoo-navy"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Nouveau locataire
          </Button>
        </div>
      </div>

      {/* Filtres Premium */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Tous', icon: Users },
                { value: 'active', label: 'Actifs', icon: UserCheck },
                { value: 'inactive', label: 'Inactifs', icon: UserX }
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
                  placeholder="Rechercher par nom, email ou téléphone..."
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
                Total locataires
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
              <span className="text-blue-600">Base de données</span>
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                Total
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
                Locataires actifs
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
              <span className="text-green-600">Avec bail actif</span>
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
                Sans bail
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
              <span className="text-orange-600">Disponibles</span>
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                En attente
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
                Taux d'occupation
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
              <span className="text-purple-600">Performance</span>
              <Badge variant="secondary" className={`text-xs ${
                activePercentage >= 80 ? 'bg-green-100 text-green-700' :
                activePercentage >= 60 ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                {activePercentage >= 80 ? 'Excellent' :
                 activePercentage >= 60 ? 'Bon' : 'À améliorer'}
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
              Liste des locataires
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {filteredTenants.length} résultats
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTenants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                {searchTerm || selectedStatus !== 'all' 
                  ? 'Aucun locataire trouvé'
                  : 'Aucun locataire enregistré'
                }
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || selectedStatus !== 'all' 
                  ? 'Essayez de modifier vos filtres de recherche'
                  : 'Commencez par ajouter des locataires à votre base de données'
                }
              </p>
              {(!searchTerm && selectedStatus === 'all') && (
                <Button 
                  onClick={() => setIsAddingTenant(true)}
                  className="bg-gradient-to-r from-immoo-gold to-immoo-navy"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter un locataire
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
                            {tenant.hasLease ? '🏠 Locataire actif' : '⏳ Disponible'}
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
                            Ajouté le {new Date(tenant.createdAt || '').toLocaleDateString('fr-FR')}
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
                          Créer bail
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hover:bg-immoo-navy hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hover:bg-immoo-gold hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
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
    </div>
  );
}
