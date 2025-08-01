import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Home, 
  Plus, 
  Search,
  Building2,
  MapPin,
  DollarSign,
  Eye,
  Edit,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  TrendingUp,
  Activity,
  Download,
  Users,
  FileText,
  Settings,
  Trash2,
  Star,
  Bed,
  Bath,
  Square
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PropertyImageGallery from '@/components/properties/PropertyImageGallery';
import { useTranslation } from '@/hooks/useTranslation';

interface PropertyImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  price: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: 'available' | 'rented' | 'maintenance';
  isVisible: boolean;
  createdAt: string;
  images: PropertyImage[];
  leases?: { id: string; status: string }[];
}

export default function AgencyPropertiesPage() {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const { t } = useTranslation();

  const { data: properties = [], isLoading, error, refetch } = useQuery({
    queryKey: ['agency-properties-with-images', agencyId],
    queryFn: async () => {
      if (!agencyId) return [];

        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select(`
          *,
          images:property_images (
            id,
            image_url,
            is_primary
          )
          `)
          .eq('agency_id', agencyId)
          .order('created_at', { ascending: false });

        if (propertiesError) {
        console.error('Error fetching properties with images:', propertiesError);
        toast.error("Erreur lors de la récupération des propriétés.");
        throw new Error(propertiesError.message);
      }
      
      return propertiesData || [];
    },
    enabled: !!agencyId,
  });

  // Debug log
  console.log("Agency ID:", agencyId);
  console.log("Properties:", properties);
  console.log("Is Loading:", isLoading);
  console.log("Error:", error);

  if (!agencyId) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Identifiant d'agence manquant.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Filtrer les propriétés
  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.propertyType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || property.status === selectedStatus;
    const matchesType = selectedType === 'all' || property.propertyType === selectedType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculer les statistiques
  const totalProperties = properties.length;
  const availableProperties = properties.filter(p => p.status === 'available').length;
  const rentedProperties = properties.filter(p => p.status === 'rented').length;
  const maintenanceProperties = properties.filter(p => p.status === 'maintenance').length;
  const totalValue = properties.reduce((sum, p) => sum + (p.price || 0), 0);
  const occupancyRate = totalProperties > 0 ? (rentedProperties / totalProperties) * 100 : 0;

  const handleCreateProperty = () => {
    navigate(`/agencies/${agencyId}/properties/create`);
  };

  const handleViewProperty = (propertyId: string) => {
    navigate(`/agencies/${agencyId}/properties/${propertyId}`);
  };

  const handleEditProperty = (propertyId: string) => {
    navigate(`/agencies/${agencyId}/properties/${propertyId}/edit`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-700 border-green-200">✅ Disponible</Badge>;
      case 'rented':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">🏠 Louée</Badge>;
      case 'maintenance':
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200">🔧 Maintenance</Badge>;
      default:
        return <Badge variant="outline">Statut inconnu</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rented':
        return <Home className="h-4 w-4 text-blue-500" />;
      case 'maintenance':
        return <Settings className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'apartment': 'Appartement',
      'house': 'Maison',
      'villa': 'Villa',
      'studio': 'Studio',
      'office': 'Bureau',
      'commercial': 'Commercial',
      'land': 'Terrain'
    };
    return types[type] || type;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-immoo-gold mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des propriétés...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erreur lors du chargement des propriétés: {error.message}
            <br />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()} 
              className="mt-2"
            >
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header Premium - Mobile First */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-immoo-gold to-immoo-navy rounded-xl">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-immoo-navy to-immoo-gold bg-clip-text text-transparent">
                {t('agencyDashboard.pages.properties.title')}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t('agencyDashboard.pages.properties.description')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="h-4 w-4 mr-2" />
            {t('agencyDashboard.pages.properties.export')}
          </Button>
          <Button 
            onClick={handleCreateProperty}
            className="bg-gradient-to-r from-immoo-gold to-immoo-navy w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('agencyDashboard.pages.properties.newProperty')}
          </Button>
        </div>
      </div>

      {/* Filtres Premium - Mobile Responsive */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Boutons de filtre status - Responsive */}
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'Toutes', icon: Building2 },
                { value: 'available', label: 'Disponibles', icon: CheckCircle },
                { value: 'rented', label: 'Louées', icon: Home },
                { value: 'maintenance', label: 'Maintenance', icon: Settings }
              ].map((status) => (
                <Button
                  key={status.value}
                  variant={selectedStatus === status.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus(status.value)}
                  className={`flex-1 sm:flex-none ${selectedStatus === status.value ? 'bg-gradient-to-r from-immoo-gold to-immoo-navy' : ''}`}
                >
                  <status.icon className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{status.label}</span>
                  <span className="sm:hidden">{status.label.charAt(0)}</span>
                </Button>
              ))}
            </div>
            
            {/* Sélecteur de type et recherche */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white/80 backdrop-blur-sm w-full sm:w-auto"
              >
                <option value="all">{t('agencyDashboard.pages.properties.allTypes')}</option>
                <option value="apartment">{t('agencyDashboard.pages.properties.apartment')}</option>
                <option value="house">{t('agencyDashboard.pages.properties.house')}</option>
                <option value="villa">{t('agencyDashboard.pages.properties.villa')}</option>
                <option value="studio">{t('agencyDashboard.pages.properties.studio')}</option>
                <option value="office">{t('agencyDashboard.pages.properties.office')}</option>
                <option value="commercial">{t('agencyDashboard.pages.properties.commercial')}</option>
                <option value="land">{t('agencyDashboard.pages.properties.land')}</option>
              </select>

              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t('agencyDashboard.pages.properties.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cartes de résumé premium - Mobile Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center justify-between">
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                {t('agencyDashboard.pages.properties.totalProperties')}
              </div>
              <div className="p-1 bg-blue-100 rounded-full">
                <TrendingUp className="h-3 w-3 text-blue-600" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 mb-1">
              {totalProperties}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-600">{t('agencyDashboard.pages.properties.managedProperties')}</span>
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                {t('agencyDashboard.pages.properties.portfolio')}
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
                {t('agencyDashboard.pages.properties.available')}
              </div>
              <div className="p-1 bg-green-100 rounded-full">
                <Target className="h-3 w-3 text-green-600" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 mb-1">
              {availableProperties}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-600">{t('agencyDashboard.pages.properties.readyToRent')}</span>
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                {totalProperties > 0 ? ((availableProperties / totalProperties) * 100).toFixed(0) : 0}%
              </Badge>
            </div>
            <Progress value={totalProperties > 0 ? (availableProperties / totalProperties) * 100 : 0} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                {t('agencyDashboard.pages.properties.totalValue')}
              </div>
              <div className="p-1 bg-purple-100 rounded-full">
                <Star className="h-3 w-3 text-purple-600" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-purple-800 mb-1">
              {formatCurrency(totalValue, "FCFA")}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-purple-600">{t('agencyDashboard.pages.properties.totalAssets')}</span>
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                {t('agencyDashboard.pages.properties.estimated')}
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
                {t('agencyDashboard.pages.properties.occupancyRate')}
              </div>
              <div className="p-1 bg-orange-100 rounded-full">
                <Home className="h-3 w-3 text-orange-600" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800 mb-1">
              {occupancyRate.toFixed(0)}%
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-orange-600">{t('agencyDashboard.pages.properties.performance')}</span>
              <Badge variant="secondary" className={`text-xs ${
                occupancyRate >= 90 ? 'bg-green-100 text-green-700' :
                occupancyRate >= 70 ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                {occupancyRate >= 90 ? t('agencyDashboard.pages.properties.excellent') :
                 occupancyRate >= 70 ? t('agencyDashboard.pages.properties.good') : t('agencyDashboard.pages.properties.toImprove')}
              </Badge>
            </div>
            <Progress value={occupancyRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Grille des propriétés - Mobile Responsive */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-immoo-navy/5 to-immoo-gold/5">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-immoo-navy" />
              <span>{t('agencyDashboard.pages.properties.myProperties')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Home className="h-4 w-4" />
              <span>{filteredProperties.length} {t('agencyDashboard.pages.properties.properties')}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {filteredProperties.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Building2 className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                {searchTerm || selectedStatus !== 'all' || selectedType !== 'all'
                  ? t('agencyDashboard.pages.properties.noPropertiesFound')
                  : t('agencyDashboard.pages.properties.noPropertiesRegistered')
                }
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || selectedStatus !== 'all' || selectedType !== 'all'
                  ? t('agencyDashboard.pages.properties.tryModifyingFilters')
                  : t('agencyDashboard.pages.properties.startAddingProperties')
                }
              </p>
              {(!searchTerm && selectedStatus === 'all' && selectedType === 'all') && (
                <Button 
                  onClick={handleCreateProperty}
                  className="bg-gradient-to-r from-immoo-gold to-immoo-navy w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('agencyDashboard.pages.properties.addProperty')}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="group overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
                  <CardContent className="p-0 flex-grow flex flex-col">
                    <div className="relative mb-4">
                      <PropertyImageGallery
                        propertyId={property.id}
                        mainImageUrl={(property as any).image_url}
                        images={property.images || []}
                        height="h-48"
                        className="rounded-t-lg"
                      />
                    </div>
                    <div className="p-4 flex-grow flex flex-col">
                      <div className="flex-grow">
                      <div>
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900 group-hover:text-immoo-navy transition-colors line-clamp-2">
                          {property.title}
                        </h3>
                        <div className="text-lg sm:text-2xl font-bold text-immoo-gold">
                          {formatCurrency(property.price, "FCFA")}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getPropertyTypeLabel(property.propertyType)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{property.address}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
                        {property.bedrooms > 0 && (
                          <div className="flex items-center gap-1">
                            <Bed className="h-3 w-3" />
                            <span>{property.bedrooms}</span>
                          </div>
                        )}
                        {property.bathrooms > 0 && (
                          <div className="flex items-center gap-1">
                            <Bath className="h-3 w-3" />
                            <span>{property.bathrooms}</span>
                          </div>
                        )}
                        {property.area > 0 && (
                          <div className="flex items-center gap-1">
                            <Square className="h-3 w-3" />
                            <span>{property.area}m²</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewProperty(property.id)}
                          className="flex-1 hover:bg-immoo-navy hover:text-white text-xs sm:text-sm"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          {t('agencyDashboard.pages.properties.view')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProperty(property.id)}
                          className="flex-1 hover:bg-immoo-gold hover:text-white text-xs sm:text-sm"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          {t('agencyDashboard.pages.properties.edit')}
                        </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 