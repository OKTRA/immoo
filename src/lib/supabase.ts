import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const handleSupabaseError = (error: any, customMessage: string = 'Supabase error') => {
  console.error(customMessage, error);
  if (error && error.message) {
    throw new Error(`${customMessage}: ${error.message}`);
  } else {
    throw new Error(customMessage);
  }
};

export const getMockData = (type: string, limit: number = 10) => {
  console.log(`Generating mock data for ${type}, limit: ${limit}`);
  
  switch (type) {
    case 'properties':
      return Array.from({ length: Math.min(limit, 6) }, (_, i) => ({
        id: `mock-property-${i + 1}`,
        title: `Propriété ${i + 1}`,
        type: i % 2 === 0 ? 'Appartement' : 'Maison',
        location: `Localisation ${i + 1}`,
        price: 500000 + (i * 50000),
        area: 80 + (i * 10),
        bedrooms: 2 + (i % 3),
        bathrooms: 1 + (i % 2),
        imageUrl: null,
        description: `Description de la propriété ${i + 1}`,
        features: ['Parking', 'Balcon'],
        status: 'available',
        agencyId: `mock-agency-${i + 1}`,
        agencyName: `Agence Mock ${i + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    
    case 'agencies':
      return Array.from({ length: Math.min(limit, 6) }, (_, i) => ({
        id: `mock-agency-${i + 1}`,
        name: `Agence Mock ${i + 1}`,
        logoUrl: null,
        location: `Ville ${i + 1}`,
        properties: 5 + i,
        rating: 4 + (i * 0.1),
        verified: i % 2 === 0,
        description: `Description de l'agence ${i + 1}`,
        email: `contact${i + 1}@agence.com`,
        phone: `+33 1 23 45 67 ${80 + i}`,
        website: `https://agence${i + 1}.com`,
        specialties: ['Vente', 'Location'],
        serviceAreas: [`Zone ${i + 1}`]
      }));
    
    default:
      return [];
  }
};
