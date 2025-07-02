import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VisitorContact {
  id: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  last_seen_at: string;
}

// Custom event for visitor state changes
const VISITOR_STATE_CHANGE_EVENT = 'visitorStateChange';

// Helper function to trigger state change across all components
const triggerVisitorStateChange = () => {
  window.dispatchEvent(new CustomEvent(VISITOR_STATE_CHANGE_EVENT));
};

// Export helper to manually refresh visitor state from any component
export const refreshVisitorState = () => {
  triggerVisitorStateChange();
};

// Export helper to check if visitor is logged in from localStorage (synchronous)
export const isVisitorLoggedIn = (): boolean => {
  try {
    const stored = localStorage.getItem('visitor_contact');
    return !!stored;
  } catch {
    return false;
  }
};

export function useQuickVisitorAccess() {
  const [visitorContact, setVisitorContact] = useState<VisitorContact | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadVisitorContact = () => {
    try {
      const stored = localStorage.getItem('visitor_contact');
      if (stored) {
        const contact = JSON.parse(stored);
        setVisitorContact(contact);
      } else {
        setVisitorContact(null);
      }
    } catch (error) {
      console.error('Error loading visitor contact:', error);
      localStorage.removeItem('visitor_contact');
      setVisitorContact(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVisitorContact();

    // Listen for visitor state changes from other components
    const handleVisitorStateChange = () => {
      console.log('🔄 Visitor state change detected, reloading...');
      loadVisitorContact();
    };

    window.addEventListener(VISITOR_STATE_CHANGE_EVENT, handleVisitorStateChange);

    return () => {
      window.removeEventListener(VISITOR_STATE_CHANGE_EVENT, handleVisitorStateChange);
    };
  }, []);

  const login = async (contactInfo: { email?: string; phone?: string }) => {
    setIsLoading(true);
    
    try {
      let data, error;

      if (contactInfo.email) {
        // For emails, we can use upsert since email has a unique constraint
        const result = await supabase
          .from('visitor_contacts')
          .upsert({
            ...contactInfo,
            last_seen_at: new Date().toISOString()
          }, {
            onConflict: 'email'
          })
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      } else if (contactInfo.phone) {
        // For phone numbers, first try to find existing contact
        const { data: existingContact } = await supabase
          .from('visitor_contacts')
          .select()
          .eq('phone', contactInfo.phone)
          .maybeSingle();

        if (existingContact) {
          // Update existing contact
          const result = await supabase
            .from('visitor_contacts')
            .update({
              last_seen_at: new Date().toISOString()
            })
            .eq('id', existingContact.id)
            .select()
            .single();
          
          data = result.data;
          error = result.error;
        } else {
          // Create new contact
          const result = await supabase
            .from('visitor_contacts')
            .insert({
              ...contactInfo,
              last_seen_at: new Date().toISOString()
            })
            .select()
            .single();
          
          data = result.data;
          error = result.error;
        }
      } else {
        throw new Error('Either email or phone must be provided');
      }

      if (error) {
        console.error('Error creating/updating visitor contact:', error);
        return null;
      }

      localStorage.setItem('visitor_contact_id', data.id);
      localStorage.setItem('visitor_contact', JSON.stringify(data));
      
      // Update local state first
      setVisitorContact(data);
      
      // Use setTimeout to ensure state is updated before triggering event
      setTimeout(() => {
        // Trigger state change for all other components
        triggerVisitorStateChange();
        console.log('✅ Visitor login successful, state updated globally');
      }, 0);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('visitor_contact_id');
    localStorage.removeItem('visitor_contact');
    setVisitorContact(null);
    
    // Trigger state change for all other components
    triggerVisitorStateChange();
    
    console.log('✅ Visitor logout successful, state updated globally');
  };

  return {
    visitorContact,
    isLoggedIn: !!visitorContact,
    isLoading,
    login,
    logout
  };
} 