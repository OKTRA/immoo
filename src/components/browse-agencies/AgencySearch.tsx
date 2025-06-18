import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, MapPin, Star, Building2 } from 'lucide-react';

interface AgencySearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const AgencySearch: React.FC<AgencySearchProps> = ({ searchTerm, setSearchTerm }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterRating, setFilterRating] = useState('all');

  return (
    <div className="mb-8 space-y-4">
      {/* Main Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Rechercher une agence par nom, spécialité..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-4 py-3 text-base bg-white/80 backdrop-blur-sm border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 focus:ring-2 focus:ring-immoo-gold/20 focus:border-immoo-gold"
          />
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 bg-white/80 backdrop-blur-sm border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres
            {showFilters && <span className="ml-2 text-immoo-gold">•</span>}
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 p-6 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Trier par
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-white border-gray-200 rounded-lg">
                  <SelectValue placeholder="Choisir un tri" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nom (A-Z)</SelectItem>
                  <SelectItem value="rating">Note</SelectItem>
                  <SelectItem value="recent">Plus récent</SelectItem>
                  <SelectItem value="properties">Nb de propriétés</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Localisation
              </label>
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger className="bg-white border-gray-200 rounded-lg">
                  <SelectValue placeholder="Toutes les régions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les régions</SelectItem>
                  <SelectItem value="bamako">Bamako</SelectItem>
                  <SelectItem value="sikasso">Sikasso</SelectItem>
                  <SelectItem value="segou">Ségou</SelectItem>
                  <SelectItem value="mopti">Mopti</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Note minimum
              </label>
              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="bg-white border-gray-200 rounded-lg">
                  <SelectValue placeholder="Toutes les notes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les notes</SelectItem>
                  <SelectItem value="4">4+ étoiles</SelectItem>
                  <SelectItem value="3">3+ étoiles</SelectItem>
                  <SelectItem value="2">2+ étoiles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reset Filters */}
          <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => {
                setSortBy('name');
                setFilterLocation('all');
                setFilterRating('all');
                setSearchTerm('');
              }}
              className="text-gray-600 hover:text-gray-800"
            >
              Réinitialiser les filtres
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
