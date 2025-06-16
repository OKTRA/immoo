
export interface DefaultSubscriptionPlan {
  name: string;
  price: number;
  maxAgencies: number;
  maxProperties: number;
  maxLeases: number;
  maxUsers: number;
  features: string[];
}

export interface DefaultUserSubscription {
  id: string;
  userId: string;
  agencyId: string | null;
  planId: string;
  status: 'active' | 'inactive' | 'expired';
  startDate: string;
  endDate: string | null;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
  plan: DefaultSubscriptionPlan;
}
