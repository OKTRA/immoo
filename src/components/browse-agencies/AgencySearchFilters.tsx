
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AgencySearchFiltersProps {
  searchTerm: string;
  filterLocation: string;
  onSearchChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  resultCount: number;
}

export default function AgencySearchFilters({
  searchTerm,
  filterLocation,
  onSearchChange,
  onLocationChange,
  resultCount
}: AgencySearchFiltersProps) {
  return (
    <div className="max-w-4xl mx-auto mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Rechercher une agence..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Filtrer par localisation..."
            value={filterLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-6">
        <p className="text-gray-600 dark:text-gray-300">
          {resultCount} agence{resultCount > 1 ? 's' : ''} trouvée{resultCount > 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
