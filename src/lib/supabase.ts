
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hzbogwleoszwtneveuvx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Ym9nd2xlb3N6d3RuZXZldXZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDk2NjMsImV4cCI6MjA1NjA4NTY2M30.JLSK18Kn9GXxF0hZkNqhGOMFohui10N5Mbswz0uAKWc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if Supabase is connected
export const isSupabaseConnected = async () => {
  try {
    const { data } = await supabase.from('profiles').select('id').limit(1);
    return !!data;
  } catch (error) {
    console.error('Error checking Supabase connection:', error);
    return false;
  }
};

// Generic error handler for Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  return { 
    data: null, 
    error: error?.message || 'An unexpected error occurred' 
  };
};

// Mock data generator for fallback when Supabase is not connected
export const getMockData = (type: string, limit: number = 10) => {
  switch (type) {
    case 'agencies':
      return Array(limit).fill(null).map((_, i) => ({
        id: `mock-agency-${i}`,
        name: `Mock Agency ${i}`,
        logoUrl: '',
        location: 'Mock Location',
        properties: Math.floor(Math.random() * 50),
        rating: (Math.random() * 5).toFixed(1),
        verified: Math.random() > 0.5,
        description: 'This is a mock agency description',
        email: 'mock@example.com',
        phone: '+1234567890',
        website: 'https://example.com',
        specialties: ['Residential', 'Commercial'],
        serviceAreas: ['Paris', 'Lyon']
      }));
    case 'properties':
      return Array(limit).fill(null).map((_, i) => ({
        id: `mock-property-${i}`,
        title: `Mock Property ${i}`,
        type: Math.random() > 0.5 ? 'Apartment' : 'House',
        price: Math.floor(Math.random() * 900000) + 100000,
        location: 'Mock Location',
        area: Math.floor(Math.random() * 200) + 50,
        bedrooms: Math.floor(Math.random() * 5) + 1,
        bathrooms: Math.floor(Math.random() * 3) + 1,
        features: ['Garden', 'Parking'],
        imageUrl: '',
        status: 'available'
      }));
    default:
      return [];
  }
};

// Date utility functions
export const addDatePeriod = (date: Date, amount: number, unit: 'days' | 'weeks' | 'months' | 'years'): Date => {
  const result = new Date(date);
  
  switch (unit) {
    case 'days':
      result.setDate(result.getDate() + amount);
      break;
    case 'weeks':
      result.setDate(result.getDate() + (amount * 7));
      break;
    case 'months':
      result.setMonth(result.getMonth() + amount);
      break;
    case 'years':
      result.setFullYear(result.getFullYear() + amount);
      break;
  }
  
  return result;
};

export const getDateDiff = (date1: Date, date2: Date, unit: 'days' | 'weeks' | 'months' | 'years'): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  
  switch (unit) {
    case 'days':
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    case 'weeks':
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    case 'months':
      // Approximate
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
    case 'years':
      // Approximate
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365.25));
    default:
      return diffTime;
  }
};
