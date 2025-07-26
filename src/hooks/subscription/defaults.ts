import { DefaultUserSubscription } from './types';

export const createDefaultFreeSubscription = (userId: string): DefaultUserSubscription => ({
  id: 'default-free',
  userId: userId,
  agencyId: null,
  planId: '00000000-0000-0000-0000-000000000001',
  status: 'active',
  startDate: new Date().toISOString(),
  endDate: null,
  autoRenew: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  plan: {
    name: 'Gratuit',
    price: 0,
    maxAgencies: 1,
    maxProperties: 2, // Updated to match database free plan
    maxLeases: 2,
    maxUsers: 1,
    features: ['Gestion de base', 'Support email'] // Updated to match database
  }
});
