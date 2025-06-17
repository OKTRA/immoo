import { useEffect } from 'react';
import { useVisitorSession } from './useVisitorSession';
import { SimpleVisitorSessionService } from '@/services/visitor/simpleVisitorSessionService';

/**
 * Hook pour initialiser automatiquement la session visiteur au démarrage
 * et nettoyer périodiquement les sessions inactives
 */
export function useAutoVisitorSession() {
  const { session, isLoading } = useVisitorSession();

  useEffect(() => {
    // Nettoyage périodique des sessions inactives (toutes les heures)
    const cleanupInterval = setInterval(() => {
      SimpleVisitorSessionService.cleanupInactiveSessions();
    }, 60 * 60 * 1000); // 1 heure

    // Nettoyage initial
    SimpleVisitorSessionService.cleanupInactiveSessions();

    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  // Log de debug pour voir l'état de la session
  useEffect(() => {
    if (!isLoading) {
      if (session) {
        console.log('🟢 Session visiteur active:', {
          id: session.session_id,
          email: session.email,
          phone: session.phone,
          name: session.name,
          persistante: session.expires_at === null
        });
      } else {
        console.log('🔴 Aucune session visiteur active');
      }
    }
  }, [session, isLoading]);

  return {
    hasActiveSession: !!session,
    sessionInfo: session ? {
      email: session.email,
      phone: session.phone,
      name: session.name,
      isPersistent: session.expires_at === null
    } : null
  };
} 