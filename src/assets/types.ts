export interface Agency {
  id: string;
  name: string;
  logoUrl: string;
  location: string;
  properties: number;
  rating: number;
  verified: boolean;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  specialties?: string[];
  serviceAreas?: string[];
  agencyYearsActive?: number;
}

export interface Property {
  id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  address?: string; // Add address field
  area: number;
  surface?: number; // Add surface field
  bedrooms: number;
  rooms?: number; // Add rooms field
  bathrooms: number;
  features: string[];
  imageUrl: string;
  status?: string;
  description?: string;
  agencyId?: string;
  ownerId?: string;
  agencyFees?: number;
  charges?: number; // Add charges field
  kitchens?: number;
  shops?: number;
  livingRooms?: number;
  virtualTourUrl?: string;
  propertyCategory?: string;
  commissionRate?: number;
  paymentFrequency?: string;
  securityDeposit?: number;
  petsAllowed?: boolean;
  furnished?: boolean;
  yearBuilt?: string;
  createdAt?: string; // Add creation date
  updatedAt?: string; // Add update date
  // Images data
  images?: Array<{
    id: string;
    image_url: string;
    description?: string;
    is_primary: boolean;
    position?: number;
  }>;
  additionalImages?: Array<{
    url: string;
    isPrimary: boolean;
    description: string;
  }>;
  ownerInfo?: {
    ownerId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  // Additional owner information
  ownerCompanyName?: string;
  ownerTaxId?: string;
  ownerPaymentMethod?: string;
  ownerPaymentPercentage?: number;
  agencyName?: string;
  agencyLogo?: string;
  agencyPhone?: string;
  agencyEmail?: string;
  agencyWebsite?: string;
  agencyVerified?: boolean;
  agencyRating?: number;
  agencyDescription?: string;
  agencySpecialties?: string[];
  agencyServiceAreas?: string[];
  agencyPropertiesCount?: number;
  agencyYearsActive?: number;
  agencyJoinDate?: string;
}

export interface PropertyOwner {
  id: string;
  userId: string;
  name: string;
  email: string;
  properties: number;
  companyName: string | null;
  taxId?: string;
  paymentMethod?: string;
  paymentPercentage?: number;
}

export interface Feature {
  title: string;
  description: string;
  icon: string;
}

export enum UserType {
  BUYER = "BUYER",
  SELLER = "SELLER",
  AGENT = "AGENT",
  ADMIN = "ADMIN"
}

export interface UserTypeOption {
  type: string;
  label: string;
  path: string;
  description: string;
}

export interface AdminNotification {
  id: string;
  message: string;
  date: string;
  read: boolean;
  adminId?: string;
  createdAt?: string;
  isRead?: boolean;
  priority?: string;
}

export interface Apartment {
  id: string;
  name: string;
  address: string;
  units: number;
  available: number;
  imageUrl?: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  userId: string;
  date: string;
  time: string;
  status: string;
  startDate?: string;
  endDate?: string;
  totalPrice?: number;
  guests?: number;
  paymentStatus?: string;
  bookingReference?: string;
}

export interface OwnerPropertyDetail {
  id: string;
  title: string;
  status: string;
  income: number;
  ownerId?: string;
  propertyId?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  ownershipPercentage?: number;
  active?: boolean;
  agencyId?: string;
  agencyName?: string;
  agencyCommission?: number;
  paymentHistory?: PaymentHistoryItem[];
}

export interface PaymentHistoryItem {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  paymentType: 'rent' | 'deposit' | 'fee';
  paymentFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual';
}

export interface OwnerDashboardStats {
  totalProperties: number;
  occupiedUnits: number;
  vacantUnits: number;
  totalIncome: number;
  ownerId?: string;
  occupancyRate?: number;
  monthlyRevenue?: number;
  pendingMaintenance?: number;
  overduePayments?: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
  billingCycle?: string;
  isActive?: boolean;
  maxProperties?: number;
  maxUsers?: number;
  maxAgencies?: number;
  maxLeases?: number;
  hasApiAccess?: boolean;
}

export interface Tenant {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  profession?: string;
  employmentStatus?: string;
  photoUrl?: string;
  identityPhotos?: string[];
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
}

export interface ApartmentLease {
  id: string;
  propertyId: string;
  apartmentId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  paymentStartDate?: string;
  payment_frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual';
  monthly_rent: number;
  security_deposit: number;
  payment_day?: number;
  is_active?: boolean;
  signed_by_tenant?: boolean;
  signed_by_owner?: boolean;
  has_renewal_option?: boolean;
  lease_type?: string;
  special_conditions?: string;
  status: string;
}

export interface ApartmentLeasePayment {
  id: string;
  leaseId: string;
  amount: number;
  date: string;
  status: string;
}

export interface PaymentConfiguration {
  id: string;
  propertyCategory: 'residence' | 'apartment' | 'commercial' | 'land' | 'other';
  defaultPaymentFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual';
  defaultSecurityDepositMultiplier: number;
  defaultAgencyFeesPercentage: number;
  defaultCommissionRate: number;
  prorationRules?: object;
}

export interface AgencyCommission {
  id: string;
  agencyId: string;
  propertyId: string;
  rate: number;
  effectiveDate: string;
  calculationType: 'percentage' | 'fixed';
  minimumAmount?: number;
  maximumAmount?: number;
}

export interface UserSubscription {
  id: string;
  userId: string;
  agencyId?: string;
  planId: string;
  status: 'active' | 'inactive' | 'expired';
  startDate: string;
  endDate?: string;
  paymentMethod?: string;
  autoRenew: boolean;
  plan?: {
    name: string;
    price: number;
    maxProperties: number;
    maxAgencies: number;
    maxLeases: number;
    maxUsers: number;
    features: string[];
  };
}
