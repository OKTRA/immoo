
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
    checkAccess();
  }, [agencyId]);

  const checkAccess = async () => {
    setIsLoading(true);
    
    // Vérifier d'abord le localStorage
    const accessKey = `visitor_access_${agencyId}`;
    const storedVisitorId = localStorage.getItem(accessKey);
    
    if (storedVisitorId) {
      setIsAuthorized(true);
      setVisitorContact({ id: storedVisitorId });
    } else {
      setIsAuthorized(false);
      setVisitorContact(null);
    }
    
    setIsLoading(false);
  };

  const submitContactForm = async (formData: Omit<VisitorContactForm, 'agency_id'>) => {
    setIsLoading(true);
    
    try {
      const { visitor, error, isNewVisitor } = await createOrUpdateVisitorContact({
        ...formData,
        agency_id: agencyId
      });

      if (error) {
        throw new Error(error);
      }

      if (visitor) {
        setVisitorContact(visitor);
        grantContactAccess(visitor.id!, agencyId);
        setIsAuthorized(true);
        
        return { success: true, isNewVisitor, visitor };
      }
      
      return { success: false, isNewVisitor: false, visitor: null };
    } catch (error: any) {
      console.error('Erreur lors de la soumission du formulaire:', error);
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
