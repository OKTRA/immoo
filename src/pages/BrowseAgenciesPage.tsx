
import { useQuery } from "@tanstack/react-query";
import { getAllAgencies } from "@/services/agency";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Agency } from "@/assets/types";
import AgencySearchFilters from "@/components/browse-agencies/AgencySearchFilters";
import AgenciesGrid from "@/components/browse-agencies/AgenciesGrid";
import BrowseAgenciesDebugInfo from "@/components/browse-agencies/BrowseAgenciesDebugInfo";

export default function BrowseAgenciesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const navigate = useNavigate();
  
  // getAllAgencies filtre déjà les agences bloquées et masquées
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-agencies'],
    queryFn: () => getAllAgencies(50, 0, 'rating', 'desc'),
  });

  console.log('BrowseAgenciesPage - Query result:', { data, isLoading, error });

  const rawAgencies = data?.agencies || [];
  console.log('BrowseAgenciesPage - Raw agencies:', rawAgencies);

  // Ensure all agencies have numeric ratings
  const agencies: Agency[] = rawAgencies.map(agency => ({
    ...agency,
    rating: typeof agency.rating === 'number' ? agency.rating : 
            typeof agency.rating === 'string' ? parseFloat(agency.rating) || 0 : 0
  }));

  console.log('BrowseAgenciesPage - Processed agencies:', agencies);

  // Filter agencies based on search term and location
  const filteredAgencies = agencies.filter((agency: Agency) => {
    const matchesSearch = !searchTerm || 
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agency.description && agency.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = !filterLocation || 
      (agency.location && agency.location.toLowerCase().includes(filterLocation.toLowerCase()));
    
    return matchesSearch && matchesLocation;
  });

  console.log('BrowseAgenciesPage - Filtered agencies:', filteredAgencies);

  const handleAgencyClick = (agencyId: string) => {
    console.log('BrowseAgenciesPage - Navigating to public agency:', agencyId);
    console.log('BrowseAgenciesPage - Target URL:', `/public-agency/${agencyId}`);
    navigate(`/public-agency/${agencyId}`);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="container mx-auto px-4 py-16">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Découvrez nos agences partenaires
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Trouvez l'agence immobilière parfaite pour vos projets. 
              Nos partenaires sont sélectionnés pour leur expertise et leur service client exceptionnel.
            </p>
          </div>

          {/* Search and Filters */}
          <AgencySearchFilters
            searchTerm={searchTerm}
            filterLocation={filterLocation}
            onSearchChange={setSearchTerm}
            onLocationChange={setFilterLocation}
            resultCount={filteredAgencies.length}
          />

          {/* Debug Information */}
          <BrowseAgenciesDebugInfo
            isLoading={isLoading}
            error={error}
            rawAgenciesCount={rawAgencies.length}
            filteredAgenciesCount={filteredAgencies.length}
          />

          {/* Agencies Grid */}
          <AgenciesGrid
            agencies={filteredAgencies}
            isLoading={isLoading}
            error={error}
            rawAgencies={rawAgencies}
            onAgencyClick={handleAgencyClick}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
