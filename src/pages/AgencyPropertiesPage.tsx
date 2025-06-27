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
  images?: { url: string }[];
  leases?: { id: string; status: string }[];
}

export default function AgencyPropertiesPage() {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const { data: properties = [], isLoading, error, refetch } = useQuery({
    queryKey: ['agency-properties', agencyId],
    queryFn: async () => {
      if (!agencyId) return [];

      try {
        // Test simple query first
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select(`
            id,
            title,
            description,
            location,
            price,
            type,
            bedrooms,
            bathrooms,
            area,
            status,
            is_visible,
            created_at,
            property_images!inner(image_url)
          `)
          .eq('agency_id', agencyId)
          .order('created_at', { ascending: false });

        if (propertiesError) {
          console.error("Database error:", propertiesError);
          throw propertiesError;
        }

        console.log("Properties data retrieved:", propertiesData);

        // Transformer les données
        const transformedProperties: Property[] = (propertiesData || []).map(property => ({
          id: property.id,
          title: property.title || 'Propriété sans titre',
          description: property.description || '',
          address: property.location || 'Adresse non renseignée',
          price: property.price || 0,
          propertyType: property.type || 'unknown',
          bedrooms: property.bedrooms || 0,
          bathrooms: property.bathrooms || 0,
          area: property.area || 0,
          status: property.status as 'available' | 'rented' | 'maintenance',
          isVisible: property.is_visible || false,
          createdAt: property.created_at,
          images: (property.property_images || []).map((img: any) => ({ url: img.image_url })),
          leases: [] // We'll add this in a separate query if needed
        }));

        return transformedProperties;
      } catch (error: any) {
        console.error("Erreur lors de la récupération des propriétés:", error);
        throw new Error(`Impossible de récupérer les propriétés: ${error.message}`);
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
      <div className="container mx-auto p-6">
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
      <div className="container mx-auto p-6">
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
    <div className="container mx-auto p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header Premium */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-immoo-gold to-immoo-navy rounded-xl">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-immoo-navy to-immoo-gold bg-clip-text text-transparent">
                Portfolio Immobilier
              </h1>
              <p className="text-muted-foreground">
                Gestion complète de vos biens immobiliers
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
            onClick={handleCreateProperty}
            className="bg-gradient-to-r from-immoo-gold to-immoo-navy"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle propriété
          </Button>
        </div>
      </div>

      {/* Filtres Premium */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
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
                  className={selectedStatus === status.value ? 'bg-gradient-to-r from-immoo-gold to-immoo-navy' : ''}
                >
                  <status.icon className="h-4 w-4 mr-2" />
                  {status.label}
                </Button>
              ))}
            </div>
            
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-white/80 backdrop-blur-sm"
            >
              <option value="all">Tous les types</option>
              <option value="apartment">Appartements</option>
              <option value="house">Maisons</option>
              <option value="villa">Villas</option>
              <option value="studio">Studios</option>
              <option value="office">Bureaux</option>
              <option value="commercial">Commercial</option>
              <option value="land">Terrains</option>
            </select>

            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher par titre, adresse ou type..."
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
                <Building2 className="h-4 w-4 mr-2" />
                Total propriétés
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
              <span className="text-blue-600">Biens gérés</span>
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
                Disponibles
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
              <span className="text-green-600">Prêtes à louer</span>
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
                Valeur totale
              </div>
              <div className="p-1 bg-purple-100 rounded-full">
                <Star className="h-3 w-3 text-purple-600" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800 mb-1">
              {formatCurrency(totalValue, "FCFA")}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-purple-600">Patrimoine</span>
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                Estimé
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
                <Home className="h-3 w-3 text-orange-600" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800 mb-1">
              {occupancyRate.toFixed(0)}%
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-orange-600">Performance</span>
              <Badge variant="secondary" className={`text-xs ${
                occupancyRate >= 90 ? 'bg-green-100 text-green-700' :
                occupancyRate >= 70 ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                {occupancyRate >= 90 ? 'Excellent' :
                 occupancyRate >= 70 ? 'Bon' : 'À améliorer'}
              </Badge>
            </div>
            <Progress value={occupancyRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Grille des propriétés */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-immoo-navy/5 to-immoo-gold/5">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-immoo-navy" />
              Mes propriétés
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Home className="h-4 w-4" />
              {filteredProperties.length} propriétés
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                {searchTerm || selectedStatus !== 'all' || selectedType !== 'all'
                  ? 'Aucune propriété trouvée'
                  : 'Aucune propriété enregistrée'
                }
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || selectedStatus !== 'all' || selectedType !== 'all'
                  ? 'Essayez de modifier vos filtres de recherche'
                  : 'Commencez par ajouter des propriétés à votre portfolio'
                }
              </p>
              {(!searchTerm && selectedStatus === 'all' && selectedType === 'all') && (
                <Button 
                  onClick={handleCreateProperty}
                  className="bg-gradient-to-r from-immoo-gold to-immoo-navy"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une propriété
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <Card 
                  key={property.id} 
                  className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm"
                >
                  <div className="relative">
                    {/* Image de la propriété */}
                    <div className="h-48 bg-gradient-to-br from-immoo-pearl to-immoo-gold/20 rounded-t-lg flex items-center justify-center overflow-hidden">
                      {property.images && property.images.length > 0 ? (
                        <img 
                          src={property.images[0].url} 
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-center">
                          <Building2 className="h-12 w-12 text-immoo-navy/50 mx-auto mb-2" />
                          <p className="text-sm text-immoo-navy/50">Aucune image</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Badge de statut */}
                    <div className="absolute top-3 left-3">
                      {getStatusBadge(property.status)}
                    </div>
                    
                    {/* Menu actions */}
                    <div className="absolute top-3 right-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-white/90 backdrop-blur-sm hover:bg-white"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewProperty(property.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditProperty(property.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {/* Titre et prix */}
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-immoo-navy transition-colors">
                          {property.title}
                        </h3>
                        <div className="text-2xl font-bold text-immoo-gold">
                          {formatCurrency(property.price, "FCFA")}
                        </div>
                      </div>
                      
                      {/* Type et adresse */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getPropertyTypeLabel(property.propertyType)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{property.address}</span>
                        </div>
                      </div>
                      
                      {/* Caractéristiques */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {property.bedrooms > 0 && (
                          <div className="flex items-center gap-1">
                            <Bed className="h-3 w-3" />
                            <span>{property.bedrooms} ch.</span>
                          </div>
                        )}
                        {property.bathrooms > 0 && (
                          <div className="flex items-center gap-1">
                            <Bath className="h-3 w-3" />
                            <span>{property.bathrooms} sdb</span>
                          </div>
                        )}
                        {property.area > 0 && (
                          <div className="flex items-center gap-1">
                            <Square className="h-3 w-3" />
                            <span>{property.area}m²</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewProperty(property.id)}
                          className="flex-1 hover:bg-immoo-navy hover:text-white"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProperty(property.id)}
                          className="flex-1 hover:bg-immoo-gold hover:text-white"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
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