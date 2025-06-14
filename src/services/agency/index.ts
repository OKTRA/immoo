
// Export all agency service functions from different modules
export * from './agencyBasicService';
export * from './agencyManagementService';
export * from './agencyPropertiesService';

// Re-export specific functions for backward compatibility
export { getAllAgencies, getFeaturedAgencies, getAgencyById, getUserAgencies } from './agencyBasicService';
export { createAgency, updateAgency, deleteAgency } from './agencyManagementService';
export { getPropertiesByAgencyId } from './agencyPropertiesService';

// Mock function for getAgencyStatistics until it's properly implemented
export const getAgencyStatistics = async (agencyId: string) => {
  return {
    totalProperties: 0,
    activeLeases: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    error: null
  };
};
