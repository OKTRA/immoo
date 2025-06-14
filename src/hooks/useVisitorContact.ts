
import { useState, useEffect } from 'react';
import { 
  checkExistingVisitor, 
  createOrUpdateVisitorContact, 
  hasContactAccess, 
  grantContactAccess,
  VisitorContact,
  VisitorContactForm 
} from '@/services/visitorContactService';

export const useVisitorContact = (agencyId: string) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [visitorContact, setVisitorContact] = useState<VisitorContact | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!agencyId) {
      setIsLoading(false);
      return;
    }
    
    console.log('useVisitorContact - Checking access for agency:', agencyId);
    checkAccess();
  }, [agencyId]);

  const checkAccess = async () => {
    setIsLoading(true);
    
    try {
      // Vérifier d'abord le localStorage
      const accessKey = `visitor_access_${agencyId}`;
      const storedVisitorId = localStorage.getItem(accessKey);
      
      console.log('useVisitorContact - Stored visitor ID:', storedVisitorId);
      
      if (storedVisitorId) {
        setIsAuthorized(true);
        setVisitorContact({ id: storedVisitorId });
        console.log('useVisitorContact - User is authorized via localStorage');
      } else {
        setIsAuthorized(false);
        setVisitorContact(null);
        console.log('useVisitorContact - User is NOT authorized');
      }
    } catch (error) {
      console.error('useVisitorContact - Error in checkAccess:', error);
      setIsAuthorized(false);
      setVisitorContact(null);
    }
    
    setIsLoading(false);
  };

  const submitContactForm = async (formData: Omit<VisitorContactForm, 'agency_id'>) => {
    setIsLoading(true);
    
    try {
      console.log('useVisitorContact - Submitting contact form:', formData);
      
      const { visitor, error, isNewVisitor } = await createOrUpdateVisitorContact({
        ...formData,
        agency_id: agencyId
      });

      if (error) {
        console.error('useVisitorContact - Error from service:', error);
        throw new Error(error);
      }

      if (visitor) {
        console.log('useVisitorContact - Contact form submitted successfully:', visitor);
        setVisitorContact(visitor);
        grantContactAccess(visitor.id!, agencyId);
        setIsAuthorized(true);
        
        return { success: true, isNewVisitor, visitor };
      }
      
      return { success: false, isNewVisitor: false, visitor: null };
    } catch (error: any) {
      console.error('useVisitorContact - Error submitting form:', error);
      return { success: false, error: error.message, isNewVisitor: false, visitor: null };
    } finally {
      setIsLoading(false);
    }
  };

  const resetAccess = () => {
    const accessKey = `visitor_access_${agencyId}`;
    localStorage.removeItem(accessKey);
    setIsAuthorized(false);
    setVisitorContact(null);
    console.log('useVisitorContact - Access reset for agency:', agencyId);
  };

  return {
    isAuthorized,
    visitorContact,
    isLoading,
    submitContactForm,
    resetAccess,
    checkAccess
  };
};
