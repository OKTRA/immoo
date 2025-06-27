import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  Plus, 
  Search,
  Calendar,
  Building2,
  Users,
  DollarSign,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  TrendingUp,
  Activity,
  Download,
  Home,
  UserCheck,
  CalendarDays,
  Percent
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface Lease {
  id: string;
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  status: 'active' | 'terminated' | 'pending';
  createdAt: string;
  property?: {
    title: string;
    address: string;
  };
  tenant?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

interface LeaseListContainerProps {
  agencyId: string;
  propertyId?: string;
}

export default function LeaseListContainer({ agencyId, propertyId }: LeaseListContainerProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const { data: leases = [], isLoading, error, refetch } = useQuery({
    queryKey: ['leases', agencyId, propertyId],
    queryFn: async () => {
      if (!agencyId) return [];

      try {
        let query = supabase
          .from('leases')
          .select(`
            id,
            property_id,
            tenant_id,
            start_date,
            end_date,
            monthly_rent,
            security_deposit,
            status,
            created_at,
            properties!inner(
              id,
              title,
              address,
              agency_id
            ),
            tenants(
              id,
              first_name,
              last_name,
              email,
              phone
            )
          `)
          .eq('properties.agency_id', agencyId)
          .order('created_at', { ascending: false });

        if (propertyId) {
          query = query.eq('property_id', propertyId);
        }

        const { data: leasesData, error: leasesError } = await query;

        if (leasesError) throw leasesError;

        // Transformer les données
        const transformedLeases: Lease[] = (leasesData || []).map(lease => ({
          id: lease.id,
          propertyId: lease.property_id,
          tenantId: lease.tenant_id,
          startDate: lease.start_date,
          endDate: lease.end_date,
          monthlyRent: lease.monthly_rent || 0,
          securityDeposit: lease.security_deposit || 0,
          status: lease.status as 'active' | 'terminated' | 'pending',
          createdAt: lease.created_at,
          property: {
            title: lease.properties?.title || 'Propriété inconnue',
            address: lease.properties?.address || 'Adresse non renseignée'
          },
          tenant: lease.tenants ? {
            firstName: lease.tenants.first_name || '',
            lastName: lease.tenants.last_name || '',
            email: lease.tenants.email || '',
            phone: lease.tenants.phone || ''
          } : undefined
        }));

        return transformedLeases;
      } catch (error: any) {
        console.error("Erreur lors de la récupération des baux:", error);
        throw new Error(`Impossible de récupérer les baux: ${error.message}`);
      }
    },
    enabled: !!agencyId,
    refetchOnWindowFocus: false,
  });

  if (!agencyId) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Identifiant d'agence manquant.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Filtrer les baux
  const filteredLeases = leases.filter(lease => {
    const propertyTitle = lease.property?.title.toLowerCase() || '';
    const tenantName = `${lease.tenant?.firstName || ''} ${lease.tenant?.lastName || ''}`.toLowerCase();
    const query = searchTerm.toLowerCase();
    
    const matchesSearch = propertyTitle.includes(query) || tenantName.includes(query);
    const matchesStatus = selectedStatus === 'all' || lease.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Calculer les statistiques
  const totalLeases = leases.length;
  const activeLeases = leases.filter(l => l.status === 'active').length;
  const pendingLeases = leases.filter(l => l.status === 'pending').length;
  const terminatedLeases = leases.filter(l => l.status === 'terminated').length;
  const totalRevenue = leases.reduce((sum, l) => sum + (l.monthlyRent || 0), 0);
  const activePercentage = totalLeases > 0 ? (activeLeases / totalLeases) * 100 : 0;

  const handleCreateLease = () => {
    if (propertyId) {
      navigate(`/agencies/${agencyId}/properties/${propertyId}/lease/create`);
    } else {
      navigate(`/agencies/${agencyId}/properties`);
      toast.info("Veuillez d'abord sélectionner une propriété pour créer un bail");
    }
  };

  const handleViewLease = (leaseId: string, propertyId: string) => {
    navigate(`/agencies/${agencyId}/properties/${propertyId}/leases/${leaseId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 border-green-200">✅ Actif</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200">⏳ En attente</Badge>;
      case 'terminated':
        return <Badge className="bg-red-100 text-red-700 border-red-200">🚫 Terminé</Badge>;
      default:
        return <Badge variant="outline">Statut inconnu</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'terminated':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-immoo-gold mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des baux...</p>
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
            Erreur lors du chargement des baux. Veuillez réessayer.
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
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-immoo-navy to-immoo-gold bg-clip-text text-transparent">
                Gestion des Baux
              </h1>
              <p className="text-muted-foreground">
                {propertyId 
                  ? "Baux de cette propriété"
                  : "Tous les baux de votre agence"
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
            onClick={handleCreateLease}
            className="bg-gradient-to-r from-immoo-gold to-immoo-navy"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau bail
        </Button>
        </div>
      </div>
      
      {/* Filtres Premium */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Tous', icon: FileText },
                { value: 'active', label: 'Actifs', icon: CheckCircle },
                { value: 'pending', label: 'En attente', icon: Clock },
                { value: 'terminated', label: 'Terminés', icon: AlertCircle }
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
                  placeholder="Rechercher par propriété ou locataire..."
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
                <FileText className="h-4 w-4 mr-2" />
                Total des baux
              </div>
              <div className="p-1 bg-blue-100 rounded-full">
                <TrendingUp className="h-3 w-3 text-blue-600" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 mb-1">
              {totalLeases}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-600">Contrats gérés</span>
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                Portfolio
              </Badge>
            </div>
            <Progress value={100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Baux actifs
              </div>
              <div className="p-1 bg-green-100 rounded-full">
                <Home className="h-3 w-3 text-green-600" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 mb-1">
              {activeLeases}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-600">En cours</span>
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                {activePercentage.toFixed(0)}%
              </Badge>
            </div>
            <Progress value={activePercentage} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Revenus mensuels
              </div>
              <div className="p-1 bg-purple-100 rounded-full">
                <Target className="h-3 w-3 text-purple-600" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800 mb-1">
              {formatCurrency(totalRevenue, "FCFA")}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-purple-600">Potentiel total</span>
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                Récurrent
              </Badge>
            </div>
            <Progress value={100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Taux d'occupation
              </div>
              <div className="p-1 bg-orange-100 rounded-full">
                <Percent className="h-3 w-3 text-orange-600" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800 mb-1">
              {activePercentage.toFixed(0)}%
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-orange-600">Performance</span>
              <Badge variant="secondary" className={`text-xs ${
                activePercentage >= 90 ? 'bg-green-100 text-green-700' :
                activePercentage >= 70 ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                {activePercentage >= 90 ? 'Excellent' :
                 activePercentage >= 70 ? 'Bon' : 'À améliorer'}
              </Badge>
            </div>
            <Progress value={activePercentage} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Liste des baux */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-immoo-navy/5 to-immoo-gold/5">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-immoo-navy" />
              Liste des baux
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              {filteredLeases.length} résultats
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredLeases.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                {searchTerm || selectedStatus !== 'all' 
                  ? 'Aucun bail trouvé'
                  : 'Aucun bail enregistré'
                }
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || selectedStatus !== 'all' 
                  ? 'Essayez de modifier vos filtres de recherche'
                  : 'Commencez par créer des baux pour vos propriétés'
                }
              </p>
              {(!searchTerm && selectedStatus === 'all') && (
                <Button 
                  onClick={handleCreateLease}
                  className="bg-gradient-to-r from-immoo-gold to-immoo-navy"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un bail
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredLeases.map((lease) => (
                <div 
                  key={lease.id} 
                  className="p-6 hover:bg-gradient-to-r hover:from-immoo-pearl/30 hover:to-immoo-gold/10 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl shadow-sm ${
                        lease.status === 'active' 
                          ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-700' 
                          : lease.status === 'pending'
                          ? 'bg-gradient-to-br from-orange-100 to-amber-100 text-orange-700'
                          : 'bg-gradient-to-br from-red-100 to-pink-100 text-red-700'
                      }`}>
                        {getStatusIcon(lease.status)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900">
                            {getStatusBadge(lease.status)}
                          </span>
                          <span className="text-lg font-medium">
                            {lease.property?.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <UserCheck className="h-3 w-3" />
                            {lease.tenant ? `${lease.tenant.firstName} ${lease.tenant.lastName}` : 'Locataire non assigné'}
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            Du {new Date(lease.startDate).toLocaleDateString('fr-FR')} au {new Date(lease.endDate).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(lease.monthlyRent, "FCFA")}/mois
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(lease.monthlyRent, "FCFA")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Caution: {formatCurrency(lease.securityDeposit, "FCFA")}
                      </div>
                      <div className="flex gap-1 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewLease(lease.id, lease.propertyId)}
                          className="hover:bg-immoo-navy hover:text-white"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
