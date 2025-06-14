
import { useState, useEffect } from 'react';
import { 
  createOrUpdateVisitorContact, 
  VisitorContact,
  VisitorContactForm 
} from '@/services/visitorContactService';
import { VisitorSessionService, VisitorRecognition } from '@/services/visitor/visitorSessionService';

export const useAdvancedVisitorContact = (agencyId: string) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [visitorContact, setVisitorContact] = useState<VisitorContact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recognition, setRecognition] = useState<VisitorRecognition | null>(null);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  useEffect(() => {
    if (!agencyId) {
      setIsLoading(false);
      return;
    }
    
    console.log('useAdvancedVisitorContact - Checking access for agency:', agencyId);
    checkAccess();
  }, [agencyId]);

  const checkAccess = async () => {
    setIsLoading(true);
    
    try {
      // Tenter de reconnaître le visiteur automatiquement
      const recognitionResult = await VisitorSessionService.recognizeVisitor(
        undefined, // email
        undefined, // phone
        agencyId
      );
      
      setRecognition(recognitionResult);
      console.log('Recognition result:', recognitionResult);
      
      if (recognitionResult.visitor_contact_id && recognitionResult.recognition_method !== 'none') {
        // Visiteur reconnu !
        setVisitorContact({ id: recognitionResult.visitor_contact_id });
        setIsAuthorized(true);
        
        // Afficher un message de bienvenue si c'est une reconnaissance automatique
        if (recognitionResult.recognition_method !== 'token') {
          setShowWelcomeBack(true);
          // Masquer le message après 5 secondes
          setTimeout(() => setShowWelcomeBack(false), 5000);
        }
        
        console.log(`Visitor automatically recognized via ${recognitionResult.recognition_method}`);
      } else {
        // Aucune reconnaissance automatique
        setIsAuthorized(false);
        setVisitorContact(null);
        console.log('No automatic recognition, user needs to provide contact info');
      }
    } catch (error) {
      console.error('useAdvancedVisitorContact - Error in checkAccess:', error);
      setIsAuthorized(false);
      setVisitorContact(null);
    }
    
    setIsLoading(false);
  };

  const submitContactForm = async (formData: Omit<VisitorContactForm, 'agency_id'>) => {
    setIsLoading(true);
    
    try {
      console.log('useAdvancedVisitorContact - Submitting contact form:', formData);
      
      // D'abord, vérifier si on peut reconnaître le visiteur avec ces nouvelles infos
      const recognitionResult = await VisitorSessionService.recognizeVisitor(
        formData.email,
        formData.phone,
        agencyId
      );
      
      let visitor: VisitorContact | null = null;
      let isNewVisitor = true;
      
      if (recognitionResult.visitor_contact_id && recognitionResult.recognition_method !== 'none') {
        // Visiteur reconnu, on peut éviter de créer un doublon
        console.log('Visitor recognized during form submission, updating existing record');
        visitor = { id: recognitionResult.visitor_contact_id };
        isNewVisitor = false;
        
        // Créer une nouvelle session si nécessaire
        if (!recognitionResult.session_valid) {
          await VisitorSessionService.createSession(
            recognitionResult.visitor_contact_id,
            agencyId,
            'form_update'
          );
        }
      } else {
        // Nouveau visiteur, créer l'enregistrement
        const { visitor: newVisitor, error, isNewVisitor: isNew } = await createOrUpdateVisitorContact({
          ...formData,
          agency_id: agencyId
        });

        if (error) {
          console.error('useAdvancedVisitorContact - Error from service:', error);
          throw new Error(error);
        }

        visitor = newVisitor;
        isNewVisitor = isNew ?? true;
      }

      if (visitor?.id) {
        console.log('useAdvancedVisitorContact - Contact form processed successfully:', visitor);
        setVisitorContact(visitor);
        setIsAuthorized(true);
        
        // Créer une session pour ce visiteur
        await VisitorSessionService.createSession(
          visitor.id,
          agencyId,
          'manual'
        );
        
        return { success: true, isNewVisitor, visitor };
      }
      
      return { success: false, isNewVisitor: false, visitor: null };
    } catch (error: any) {
      console.error('useAdvancedVisitorContact - Error submitting form:', error);
      return { success: false, error: error.message, isNewVisitor: false, visitor: null };
    } finally {
      setIsLoading(false);
    }
  };

  const resetAccess = () => {
    VisitorSessionService.clearLocalSession();
    setIsAuthorized(false);
    setVisitorContact(null);
    setRecognition(null);
    setShowWelcomeBack(false);
    console.log('useAdvancedVisitorContact - Access reset for agency:', agencyId);
  };

  const dismissWelcomeBack = () => {
    setShowWelcomeBack(false);
  };

  return {
    isAuthorized,
    visitorContact,
    isLoading,
    recognition,
    showWelcomeBack,
    submitContactForm,
    resetAccess,
    checkAccess,
    dismissWelcomeBack
  };
};
