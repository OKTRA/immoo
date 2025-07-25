import React, { useState, useEffect } from 'react';
import { Agency } from '@/assets/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  MapPin, 
  Building, 
  Star, 
  Users, 
  Home, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AgencyFilters {
  searchTerm: string;
  location: string;
  specialties: string[];
  minRating: number;
  maxRating: number;
  minExperience: number;
  maxExperience: number;
  minProperties: number;
  maxProperties: number;
  sortBy: 'name_asc' | 'name_desc' | 'rating_desc' | 'rating_asc' | 'experience_desc' | 'properties_desc' | 'date_desc';
}

interface AgencyFiltersProps {
  agencies: Agency[];
  onFilterChange: (filteredAgencies: Agency[]) => void;
  onFiltersChange: (filters: AgencyFilters) => void;
  className?: string;
}

const AgencyFilters: React.FC<AgencyFiltersProps> = ({
  agencies,
  onFilterChange,
  onFiltersChange,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<AgencyFilters>({
    searchTerm: '',
    location: '',
    specialties: [],
    minRating: 0,
    maxRating: 5,
    minExperience: 0,
    maxExperience: 50,
    minProperties: 0,
    maxProperties: 1000,
    sortBy: 'rating_desc'
  });

  // Extract unique values for filters
  const locations = [...new Set(agencies.map(a => a.location).filter(Boolean))];
  const allSpecialties = [...new Set(agencies.flatMap(a => a.specialties || []))];

  const specialtyOptions = [
    { value: 'residential', label: 'Résidentiel' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'luxury', label: 'Luxe' },
    { value: 'rentals', label: 'Location' },
    { value: 'sales', label: 'Vente' },
    { value: 'new_development', label: 'Neuf' },
    { value: 'investment', label: 'Investissement' },
    { value: 'vacation', label: 'Vacances' },
    { value: 'student', label: 'Étudiant' },
    { value: 'senior', label: 'Senior' },
    { value: 'first_time_buyer', label: 'Premier achat' },
    { value: 'relocation', label: 'Déménagement' },
    { value: 'property_management', label: 'Gestion locative' },
    { value: 'valuation', label: 'Estimation' },
    { value: 'consulting', label: 'Conseil' },
    { value: 'marketing', label: 'Marketing' }
  ];

  const applyFilters = () => {
    let filtered = agencies.filter(agency => {
      // Search term
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesName = agency.name?.toLowerCase().includes(searchLower);
        const matchesDescription = agency.description?.toLowerCase().includes(searchLower);
        const matchesLocation = agency.location?.toLowerCase().includes(searchLower);
        
        if (!matchesName && !matchesDescription && !matchesLocation) {
          return false;
        }
      }

      // Location
      if (filters.location && agency.location !== filters.location) {
        return false;
      }

      // Rating range
      const rating = parseFloat(agency.rating) || 0;
      if (rating < filters.minRating || rating > filters.maxRating) {
        return false;
      }

      // Experience range
      const experience = parseInt(agency.yearsOfExperience) || 0;
      if (experience < filters.minExperience || experience > filters.maxExperience) {
        return false;
      }

      // Properties count range
      const propertiesCount = parseInt(agency.propertiesCount) || 0;
      if (propertiesCount < filters.minProperties || propertiesCount > filters.maxProperties) {
        return false;
      }

      // Specialties
      if (filters.specialties.length > 0) {
        const agencySpecialties = agency.specialties || [];
        const hasAllSpecialties = filters.specialties.every(specialty => 
          agencySpecialties.includes(specialty)
        );
        if (!hasAllSpecialties) {
          return false;
        }
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name_asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name_desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'rating_desc':
          return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
        case 'rating_asc':
          return (parseFloat(a.rating) || 0) - (parseFloat(b.rating) || 0);
        case 'experience_desc':
          return (parseInt(b.yearsOfExperience) || 0) - (parseInt(a.yearsOfExperience) || 0);
        case 'properties_desc':
          return (parseInt(b.propertiesCount) || 0) - (parseInt(a.propertiesCount) || 0);
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
  }, [filters, agencies]);

  const handleFilterChange = (key: keyof AgencyFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      location: '',
      specialties: [],
      minRating: 0,
      maxRating: 5,
      minExperience: 0,
      maxExperience: 50,
      minProperties: 0,
      maxProperties: 1000,
      sortBy: 'rating_desc'
    });
  };

  const activeFiltersCount = [
    filters.searchTerm,
    filters.location,
    filters.minRating > 0 || filters.maxRating < 5,
    filters.minExperience > 0 || filters.maxExperience < 50,
    filters.minProperties > 0 || filters.maxProperties < 1000,
    filters.specialties.length > 0
  ].filter(Boolean).length;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres Agences
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
              placeholder="Nom, description, localisation..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="location">Localisation</Label>
          <Select
            value={filters.location}
            onValueChange={(value) => handleFilterChange('location', value)}
          >
            <SelectTrigger id="location" className="mt-1">
              <SelectValue placeholder="Toutes les localisations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les localisations</SelectItem>
              {locations.map(location => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rating Range */}
        <div>
          <Label>Note minimale</Label>
          <Select
            value={filters.minRating.toString()}
            onValueChange={(value) => handleFilterChange('minRating', parseInt(value))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Toutes notes</SelectItem>
              {[1, 2, 3, 4, 5].map(num => (
                <SelectItem key={num} value={num.toString()}>
                  {num}+ étoiles
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Experience Range */}
        <div>
          <Label>Années d'expérience</Label>
          <Select
            value={filters.minExperience.toString()}
            onValueChange={(value) => handleFilterChange('minExperience', parseInt(value))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Toutes expériences</SelectItem>
              {[1, 3, 5, 10, 15, 20, 25, 30].map(num => (
                <SelectItem key={num} value={num.toString()}>
                  {num}+ ans
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Properties Range */}
        <div>
          <Label>Nombre de propriétés</Label>
          <Select
            value={filters.minProperties.toString()}
            onValueChange={(value) => handleFilterChange('minProperties', parseInt(value))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Tous volumes</SelectItem>
              {[1, 5, 10, 25, 50, 100, 250, 500].map(num => (
                <SelectItem key={num} value={num.toString()}>
                  {num}+ propriétés
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Specialties */}
        <div>
          <Label>Spécialités</Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {specialtyOptions.slice(0, 6).map(specialty => (
              <Button
                key={specialty.value}
                variant={filters.specialties.includes(specialty.value) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const newSpecialties = filters.specialties.includes(specialty.value)
                    ? filters.specialties.filter(s => s !== specialty.value)
                    : [...filters.specialties, specialty.value];
                  handleFilterChange('specialties', newSpecialties);
                }}
                className="text-xs"
              >
                {specialty.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div>
          <Label htmlFor="sortBy">Trier par</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => handleFilterChange('sortBy', value as AgencyFilters['sortBy'])}
          >
            <SelectTrigger id="sortBy" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating_desc">Note décroissante</SelectItem>
              <SelectItem value="rating_asc">Note croissante</SelectItem>
              <SelectItem value="name_asc">Nom A-Z</SelectItem>
              <SelectItem value="name_desc">Nom Z-A</SelectItem>
              <SelectItem value="experience_desc">Expérience décroissante</SelectItem>
              <SelectItem value="properties_desc">Propriétés décroissant</SelectItem>
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

export default AgencyFilters;
