import React, { useState, useEffect } from 'react';
import { Property } from '@/assets/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { formatCurrency } from '@/lib/utils';
import { 
  Search, 
  MapPin, 
  Home, 
  DollarSign, 
  Bed, 
  Bath, 
  Ruler, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PropertyFilters {
  searchTerm: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  minSurface: number;
  maxSurface: number;
  minRooms: number;
  maxRooms: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  features: string[];
  sortBy: 'price_asc' | 'price_desc' | 'surface_desc' | 'surface_asc' | 'date_desc';
}

interface PropertyFiltersProps {
  properties: Property[];
  onFilterChange: (filteredProperties: Property[]) => void;
  onFiltersChange: (filters: PropertyFilters) => void;
  className?: string;
}

const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  properties,
  onFilterChange,
  onFiltersChange,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<PropertyFilters>({
    searchTerm: '',
    location: '',
    minPrice: 0,
    maxPrice: 1000000,
    minSurface: 0,
    maxSurface: 1000,
    minRooms: 0,
    maxRooms: 20,
    propertyType: '',
    bedrooms: 0,
    bathrooms: 0,
    features: [],
    sortBy: 'date_desc'
  });

  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [surfaceRange, setSurfaceRange] = useState([0, 1000]);
  const [roomsRange, setRoomsRange] = useState([0, 20]);

  // Extract unique values for filters
  const locations = [...new Set(properties.map(p => p.location).filter(Boolean))];
  const propertyTypes = [...new Set(properties.map(p => p.type).filter(Boolean))];
  const allFeatures = [...new Set(properties.flatMap(p => p.features || []))];

  const propertyTypeOptions = [
    { value: 'all', label: 'Tous types' },
    { value: 'apartment', label: 'Appartement' },
    { value: 'house', label: 'Maison' },
    { value: 'villa', label: 'Villa' },
    { value: 'studio', label: 'Studio' },
    { value: 'loft', label: 'Loft' },
    { value: 'duplex', label: 'Duplex' },
    { value: 'triplex', label: 'Triplex' },
    { value: 'penthouse', label: 'Penthouse' },
    { value: 'townhouse', label: 'Maison de ville' },
    { value: 'bungalow', label: 'Bungalow' },
    { value: 'chalet', label: 'Chalet' },
    { value: 'castle', label: 'Château' },
    { value: 'mansion', label: 'Manoir' },
    { value: 'farmhouse', label: 'Ferme' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'office', label: 'Bureau' },
    { value: 'shop', label: 'Magasin' },
    { value: 'warehouse', label: 'Entrepôt' },
    { value: 'garage', label: 'Garage' },
    { value: 'parking', label: 'Parking' },
    { value: 'land', label: 'Terrain' },
    { value: 'plot', label: 'Parcelle' },
    { value: 'building', label: 'Bâtiment' },
    { value: 'other', label: 'Autre' }
  ];

  const featureOptions = [
    { value: 'balcony', label: 'Balcon' },
    { value: 'terrace', label: 'Terrasse' },
    { value: 'garden', label: 'Jardin' },
    { value: 'parking', label: 'Parking' },
    { value: 'garage', label: 'Garage' },
    { value: 'pool', label: 'Piscine' },
    { value: 'elevator', label: 'Ascenseur' },
    { value: 'concierge', label: 'Concierge' },
    { value: 'security', label: 'Sécurité' },
    { value: 'air_conditioning', label: 'Climatisation' },
    { value: 'heating', label: 'Chauffage' },
    { value: 'fireplace', label: 'Cheminée' },
    { value: 'basement', label: 'Sous-sol' },
    { value: 'attic', label: 'Grenier' },
    { value: 'cellar', label: 'Cave' },
    { value: 'wine_cellar', label: 'Cave à vin' },
    { value: 'sauna', label: 'Sauna' },
    { value: 'jacuzzi', label: 'Jacuzzi' },
    { value: 'gym', label: 'Salle de sport' },
    { value: 'tennis', label: 'Court de tennis' },
    { value: 'view', label: 'Vue' },
    { value: 'south_facing', label: 'Exposition sud' },
    { value: 'quiet', label: 'Calme' },
    { value: 'bright', label: 'Lumineux' },
    { value: 'renovated', label: 'Rénové' },
    { value: 'new', label: 'Neuf' },
    { value: 'furnished', label: 'Meublé' },
    { value: 'unfurnished', label: 'Non meublé' },
    { value: 'equipped_kitchen', label: 'Cuisine équipée' },
    { value: 'internet', label: 'Internet' },
    { value: 'fiber', label: 'Fibre optique' },
    { value: 'double_glazing', label: 'Double vitrage' },
    { value: 'insulation', label: 'Isolation' },
    { value: 'solar_panels', label: 'Panneaux solaires' },
    { value: 'geothermal', label: 'Géothermie' },
    { value: 'heat_pump', label: 'Pompe à chaleur' }
  ];

  const applyFilters = () => {
    let filtered = properties.filter(property => {
      // Search term
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesTitle = property.title?.toLowerCase().includes(searchLower);
        const matchesDescription = property.description?.toLowerCase().includes(searchLower);
        const matchesLocation = property.location?.toLowerCase().includes(searchLower);
        const matchesAddress = property.address?.toLowerCase().includes(searchLower);
        
        if (!matchesTitle && !matchesDescription && !matchesLocation && !matchesAddress) {
          return false;
        }
      }

      // Location
      if (filters.location && property.location !== filters.location) {
        return false;
      }

      // Price range
      const price = parseFloat(property.price) || 0;
      if (price < filters.minPrice || price > filters.maxPrice) {
        return false;
      }

      // Surface range
      const surface = parseFloat(property.surface) || 0;
      if (surface < filters.minSurface || surface > filters.maxSurface) {
        return false;
      }

      // Rooms range
      const rooms = parseInt(property.rooms) || 0;
      if (rooms < filters.minRooms || rooms > filters.maxRooms) {
        return false;
      }

      // Bedrooms
      if (filters.bedrooms > 0) {
        const bedrooms = parseInt(property.bedrooms) || 0;
        if (bedrooms < filters.bedrooms) {
          return false;
        }
      }

      // Bathrooms
      if (filters.bathrooms > 0) {
        const bathrooms = parseInt(property.bathrooms) || 0;
        if (bathrooms < filters.bathrooms) {
          return false;
        }
      }

      // Property type
      if (filters.propertyType && property.type !== filters.propertyType) {
        return false;
      }

      // Features
      if (filters.features.length > 0) {
        const propertyFeatures = property.features || [];
        const hasAllFeatures = filters.features.every(feature => 
          propertyFeatures.includes(feature)
        );
        if (!hasAllFeatures) {
          return false;
        }
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_asc':
          return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
        case 'price_desc':
          return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
        case 'surface_desc':
          return (parseFloat(b.surface) || 0) - (parseFloat(a.surface) || 0);
        case 'surface_asc':
          return (parseFloat(a.surface) || 0) - (parseFloat(b.surface) || 0);
        case 'date_desc':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    onFilterChange(filtered);
    onFiltersChange(filters);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, properties]);

  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      location: '',
      minPrice: 0,
      maxPrice: 1000000,
      minSurface: 0,
      maxSurface: 1000,
      minRooms: 0,
      maxRooms: 20,
      propertyType: '',
      bedrooms: 0,
      bathrooms: 0,
      features: [],
      sortBy: 'date_desc'
    });
    setPriceRange([0, 1000000]);
    setSurfaceRange([0, 1000]);
    setRoomsRange([0, 20]);
  };

  const activeFiltersCount = [
    filters.searchTerm,
    filters.location,
    filters.propertyType,
    filters.minPrice > 0 || filters.maxPrice < 1000000,
    filters.minSurface > 0 || filters.maxSurface < 1000,
    filters.minRooms > 0 || filters.maxRooms < 20,
    filters.bedrooms > 0,
    filters.bathrooms > 0,
    filters.features.length > 0
  ].filter(Boolean).length;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className={cn(
        "space-y-4",
        !isExpanded && "hidden lg:block"
      )}>
        {/* Search */}
        <div>
          <Label htmlFor="search">Recherche</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Titre, description, adresse..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>



        {/* Price Range */}
        <div>
          <Label>Prix</Label>
          <div className="mt-1 space-y-2">
            <Slider
              min={0}
              max={1000000}
              step={10000}
              value={[filters.minPrice, filters.maxPrice]}
              onValueChange={(value) => {
                setPriceRange(value);
                handleFilterChange('minPrice', value[0]);
                handleFilterChange('maxPrice', value[1]);
              }}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatCurrency(filters.minPrice)}</span>
              <span>{formatCurrency(filters.maxPrice)}</span>
            </div>
          </div>
        </div>

        {/* Surface Range */}
        <div>
          <Label>Surface (m²)</Label>
          <div className="mt-1 space-y-2">
            <Slider
              min={0}
              max={1000}
              step={10}
              value={[filters.minSurface, filters.maxSurface]}
              onValueChange={(value) => {
                setSurfaceRange(value);
                handleFilterChange('minSurface', value[0]);
                handleFilterChange('maxSurface', value[1]);
              }}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{filters.minSurface} m²</span>
              <span>{filters.maxSurface} m²</span>
            </div>
          </div>
        </div>

        {/* Rooms */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bedrooms">Chambres</Label>
            <Select
              value={filters.bedrooms.toString()}
              onValueChange={(value) => handleFilterChange('bedrooms', parseInt(value))}
            >
              <SelectTrigger id="bedrooms" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Toutes</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}+ chambres
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bathrooms">Salles de bain</Label>
            <Select
              value={filters.bathrooms.toString()}
              onValueChange={(value) => handleFilterChange('bathrooms', parseInt(value))}
            >
              <SelectTrigger id="bathrooms" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Toutes</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}+ salles de bain
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Features */}
        <div>
          <Label>Caractéristiques</Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {featureOptions.slice(0, 6).map(feature => (
              <Button
                key={feature.value}
                variant={filters.features.includes(feature.value) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const newFeatures = filters.features.includes(feature.value)
                    ? filters.features.filter(f => f !== feature.value)
                    : [...filters.features, feature.value];
                  handleFilterChange('features', newFeatures);
                }}
                className="text-xs"
              >
                {feature.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div>
          <Label htmlFor="sortBy">Trier par</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => handleFilterChange('sortBy', value as PropertyFilters['sortBy'])}
          >
            <SelectTrigger id="sortBy" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">Plus récent</SelectItem>
              <SelectItem value="price_asc">Prix croissant</SelectItem>
              <SelectItem value="price_desc">Prix décroissant</SelectItem>
              <SelectItem value="surface_desc">Surface décroissante</SelectItem>
              <SelectItem value="surface_asc">Surface croissante</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearFilters}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Effacer
          </Button>
          <Button 
            size="sm" 
            onClick={applyFilters}
            className="flex-1"
          >
            <Filter className="h-4 w-4 mr-2" />
            Appliquer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyFilters;
