import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, MapPin, Star, Building2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface AgencySearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const AgencySearch: React.FC<AgencySearchProps> = ({ searchTerm, setSearchTerm }) => {
  const { t } = useTranslation();
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
            placeholder={t('browseAgencies.search.placeholder')}
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
            {t('browseAgencies.search.filters')}
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
                {t('browseAgencies.search.sortBy')}
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-white border-gray-200 rounded-lg">
                  <SelectValue placeholder={t('browseAgencies.search.sortBy')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">{t('browseAgencies.search.sortByName')}</SelectItem>
                  <SelectItem value="rating">{t('browseAgencies.search.sortByRating')}</SelectItem>
                  <SelectItem value="recent">{t('browseAgencies.search.sortByRecent')}</SelectItem>
                  <SelectItem value="properties">{t('browseAgencies.search.sortByProperties')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t('browseAgencies.search.location')}
              </label>
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger className="bg-white border-gray-200 rounded-lg">
                  <SelectValue placeholder={t('browseAgencies.search.allRegions')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('browseAgencies.search.allRegions')}</SelectItem>
                  <SelectItem value="bamako">{t('browseAgencies.search.bamako')}</SelectItem>
                  <SelectItem value="sikasso">{t('browseAgencies.search.sikasso')}</SelectItem>
                  <SelectItem value="segou">{t('browseAgencies.search.segou')}</SelectItem>
                  <SelectItem value="mopti">{t('browseAgencies.search.mopti')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Star className="h-4 w-4" />
                {t('browseAgencies.search.minRating')}
              </label>
              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="bg-white border-gray-200 rounded-lg">
                  <SelectValue placeholder={t('browseAgencies.search.allRatings')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('browseAgencies.search.allRatings')}</SelectItem>
                  <SelectItem value="4">{t('browseAgencies.search.stars4')}</SelectItem>
                  <SelectItem value="3">{t('browseAgencies.search.stars3')}</SelectItem>
                  <SelectItem value="2">{t('browseAgencies.search.stars2')}</SelectItem>
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
              {t('browseAgencies.search.resetFilters')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
