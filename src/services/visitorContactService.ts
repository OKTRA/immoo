
import { supabase } from '@/lib/supabase';

export interface VisitorContact {
  id?: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  purpose?: string;
  agency_id?: string;
  property_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
  last_seen_at?: string;
  is_verified?: boolean;
  verification_token?: string;
}

export interface VisitorContactForm {
  email?: string;
  phone?: string;
  first_name: string;
  last_name: string;
  purpose: string;
  agency_id: string;
  property_id?: string;
}

// Vérifier si un visiteur existe déjà
export const checkExistingVisitor = async (email?: string, phone?: string) => {
  try {
    let query = supabase.from('visitor_contacts').select('*');
    
    if (email) {
      query = query.eq('email', email);
    } else if (phone) {
      query = query.eq('phone', phone);
    } else {
      return { visitor: null, error: 'Email ou téléphone requis' };
    }

    const { data, error } = await query.single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }
    
    return { visitor: data, error: null };
  } catch (error: any) {
    console.error('Erreur lors de la vérification du visiteur:', error);
    return { visitor: null, error: error.message };
  }
};

// Créer ou mettre à jour un contact visiteur
export const createOrUpdateVisitorContact = async (contactData: VisitorContactForm) => {
  try {
    // Obtenir l'IP et user agent du visiteur
    const ip_address = await fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => data.ip)
      .catch(() => 'unknown');
    
    const user_agent = navigator.userAgent;

    // Vérifier si le visiteur existe déjà
    const { visitor: existingVisitor } = await checkExistingVisitor(contactData.email, contactData.phone);
    
    if (existingVisitor) {
      // Mettre à jour le visiteur existant
      const { data, error } = await supabase
        .from('visitor_contacts')
        .update({
          first_name: contactData.first_name,
          last_name: contactData.last_name,
          last_seen_at: new Date().toISOString(),
          agency_id: contactData.agency_id,
          property_id: contactData.property_id,
          purpose: contactData.purpose
        })
        .eq('id', existingVisitor.id)
        .select()
        .single();

      if (error) throw error;
      return { visitor: data, error: null, isNewVisitor: false };
    } else {
      // Créer un nouveau visiteur
      const { data, error } = await supabase
        .from('visitor_contacts')
        .insert({
          email: contactData.email,
          phone: contactData.phone,
          first_name: contactData.first_name,
          last_name: contactData.last_name,
          purpose: contactData.purpose,
          agency_id: contactData.agency_id,
          property_id: contactData.property_id,
          ip_address,
          user_agent,
          is_verified: false
        })
        .select()
        .single();

      if (error) throw error;
      return { visitor: data, error: null, isNewVisitor: true };
    }
  } catch (error: any) {
    console.error('Erreur lors de la création/mise à jour du contact visiteur:', error);
    return { visitor: null, error: error.message, isNewVisitor: false };
  }
};

// Enregistrer l'accès aux informations de contact
export const logContactAccess = async (visitorContactId: string, agencyId: string, accessType: string = 'contact_view') => {
  try {
    const { data, error } = await supabase
      .from('agency_contact_access_logs')
      .insert({
        visitor_contact_id: visitorContactId,
        agency_id: agencyId,
        access_type: accessType
      })
      .select()
      .single();

    if (error) throw error;
    return { log: data, error: null };
  } catch (error: any) {
    console.error('Erreur lors de l\'enregistrement de l\'accès:', error);
    return { log: null, error: error.message };
  }
};

// Vérifier si un visiteur a accès aux informations de contact d'une agence
export const hasContactAccess = (visitorId?: string, agencyId?: string): boolean => {
  if (!visitorId || !agencyId) return false;
  
  // Vérifier dans le localStorage si le visiteur a déjà fourni ses informations
  const accessKey = `visitor_access_${agencyId}`;
  const storedAccess = localStorage.getItem(accessKey);
  
  return storedAccess === visitorId;
};

// Accorder l'accès aux informations de contact
export const grantContactAccess = (visitorId: string, agencyId: string) => {
  const accessKey = `visitor_access_${agencyId}`;
  localStorage.setItem(accessKey, visitorId);
  
  // Enregistrer dans les logs
  logContactAccess(visitorId, agencyId);
};
