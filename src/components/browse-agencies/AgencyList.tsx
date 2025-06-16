
import React from 'react';
import { BrowseAgencyCard } from './BrowseAgencyCard';

interface AgencyWithSubscription {
  id: string;
  name: string;
  logoUrl?: string;
  subscription?: {
    plan?: {
      name: string;
      price: number;
    };
  };
}

interface AgencyListProps {
  agencies: AgencyWithSubscription[];
}

export const AgencyList: React.FC<AgencyListProps> = ({ agencies }) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agencies.map((agency) => (
        <BrowseAgencyCard key={agency.id} agency={agency} />
      ))}
    </div>
  );
};
