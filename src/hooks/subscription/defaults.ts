
import { DefaultUserSubscription } from './types';

export const createDefaultFreeSubscription = (userId: string): DefaultUserSubscription => ({
  id: 'default-free',
  userId: userId,
  agencyId: null,
  planId: 'free-plan',
  status: 'active',
  startDate: new Date().toISOString(),
  endDate: null,
  autoRenew: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  plan: {
    name: 'free',
    price: 0,
    maxAgencies: 1,
    maxProperties: 1,
    maxLeases: 2,
    maxUsers: 1,
    features: []
  }
});
