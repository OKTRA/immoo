export interface TenantWithLease {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  employmentStatus?: string;
  profession?: string;
  photoUrl?: string;
  identityPhotos?: string[];
  createdAt?: string;
  hasLease?: boolean;
  leaseId?: string;
  leaseStatus?: string;
  propertyId?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  lease?: {
    id: string;
    tenant_id: string;
    property_id: string;
    start_date: string;
    end_date: string;
    monthly_rent: number;
    security_deposit: number;
    status: string;
    tenant?: {
      first_name: string;
      last_name: string;
    };
    property?: {
      title: string;
    };
    properties?: {
      title: string;
    };
    tenants?: {
      first_name: string;
      last_name: string;
    };
  };
}

export interface TenantListProps {
  tenants: TenantWithLease[];
  loading: boolean;
  searchQuery: string;
  agencyId?: string;
  propertyId?: string;
  handleCreateLease: (tenantId: string, propertyId?: string) => void;
  handleAssignTenant: (tenantId: string, propertyId?: string) => void;
  handleViewLeaseDetails?: (leaseId: string) => void;
}
