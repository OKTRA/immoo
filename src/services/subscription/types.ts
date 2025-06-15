
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

export interface SubscriptionLimit {
  allowed: boolean;
  currentCount: number;
  maxAllowed: number;
  planName?: string;
  percentageUsed?: number;
  error?: string;
}
