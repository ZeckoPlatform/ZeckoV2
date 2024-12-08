import { api, endpoints } from './api';

export const paymentPlans = {
  BASIC: {
    id: 'basic',
    credits: 10,
    price: 49.99,
    features: ['View leads', 'Basic profile']
  },
  PRO: {
    id: 'pro',
    credits: 25,
    price: 99.99,
    features: ['View leads', 'Priority listing', 'Advanced profile']
  },
  ENTERPRISE: {
    id: 'enterprise',
    credits: 100,
    price: 299.99,
    features: ['Unlimited leads', 'Featured listing', 'Premium support']
  }
}; 