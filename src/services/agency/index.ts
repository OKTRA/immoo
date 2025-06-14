
import { supabase, handleSupabaseError, getMockData } from '@/lib/supabase';
import { Agency } from '@/assets/types';

/**
 * Get all agencies for public display
 */
export const getAllAgencies = async (
  limit: number = 50,
  offset: number = 0,
  sortBy: string = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc'
) => {
  try {
    console.log("Fetching all agencies...");

    let query = supabase
      .from('agencies')
      .select('*')
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (limit > 0) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching agencies:', error);
      throw error;
    }

    console.log(`Agencies fetched: ${data?.length || 0}`);

    const agencies = data?.map(agency => ({
      id: agency.id,
      name: agency.name,
      logoUrl: agency.logo_url,
      location: agency.location || '',
      properties: agency.properties_count || 0,
      rating: typeof agency.rating === 'number' ? agency.rating : 0,
      verified: agency.verified || false,
      description: agency.description,
      email: agency.email,
      phone: agency.phone,
      website: agency.website,
      specialties: agency.specialties || [],
      serviceAreas: agency.service_areas || []
    })) || [];

    return { agencies, error: null };
  } catch (error: any) {
    console.error('Error in getAllAgencies:', error);
    const mockData = getMockData('agencies', limit);
    return { agencies: mockData, error: error.message };
  }
};

/**
 * Get featured agencies for homepage
 */
export const getFeaturedAgencies = async (limit: number = 6) => {
  try {
    console.log("Fetching featured agencies...");

    const { data, error } = await supabase
      .from('agencies')
      .select('*')
      .eq('verified', true)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured agencies:', error);
      throw error;
    }

    console.log(`Featured agencies fetched: ${data?.length || 0}`);

    const agencies = data?.map(agency => ({
      id: agency.id,
      name: agency.name,
      logoUrl: agency.logo_url,
      location: agency.location || '',
      properties: agency.properties_count || 0,
      rating: typeof agency.rating === 'number' ? agency.rating : 0,
      verified: agency.verified || false,
      description: agency.description,
      email: agency.email,
      phone: agency.phone,
      website: agency.website,
      specialties: agency.specialties || [],
      serviceAreas: agency.service_areas || []
    })) || [];

    return { agencies, error: null };
  } catch (error: any) {
    console.error('Error in getFeaturedAgencies:', error);
    const mockData = getMockData('agencies', limit);
    return { agencies: mockData, error: error.message };
  }
};

/**
 * Get agency by ID
 */
export const getAgencyById = async (id: string) => {
  try {
    console.log(`Fetching agency with ID: ${id}`);

    const { data, error } = await supabase
      .from('agencies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching agency:', error);
      throw error;
    }

    if (!data) {
      return { agency: null, error: 'Agency not found' };
    }

    const agency = {
      id: data.id,
      name: data.name,
      logoUrl: data.logo_url,
      location: data.location || '',
      properties: data.properties_count || 0,
      rating: typeof data.rating === 'number' ? data.rating : 0,
      verified: data.verified || false,
      description: data.description,
      email: data.email,
      phone: data.phone,
      website: data.website,
      specialties: data.specialties || [],
      serviceAreas: data.service_areas || []
    };

    return { agency, error: null };
  } catch (error: any) {
    console.error('Error in getAgencyById:', error);
    return { agency: null, error: error.message };
  }
};
