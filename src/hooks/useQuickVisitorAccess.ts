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
      const { data, error } = await supabase
        .from('visitor_contacts')
        .upsert({
          ...contactInfo,
          last_seen_at: new Date().toISOString()
        }, {
          onConflict: contactInfo.email ? 'email' : 'phone'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating/updating visitor contact:', error);
        return null;
      }

      localStorage.setItem('visitor_contact_id', data.id);
      localStorage.setItem('visitor_contact', JSON.stringify(data));
      
      setVisitorContact(data);
      
      // Trigger state change for all other components
      triggerVisitorStateChange();
      
      console.log('✅ Visitor login successful, state updated globally');
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