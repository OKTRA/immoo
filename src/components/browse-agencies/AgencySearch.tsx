
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface AgencySearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const AgencySearch: React.FC<AgencySearchProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="mb-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Rechercher une agence..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};
