
import { useEffect } from 'react';
import { VisitorSessionService } from '@/services/visitor/visitorSessionService';

/**
 * Hook pour gérer automatiquement les sessions visiteurs
 */
export const useVisitorSession = () => {
  useEffect(() => {
    // Nettoyer les sessions expirées au chargement de l'application
    const cleanupSessions = async () => {
      try {
        await VisitorSessionService.cleanupExpiredSessions();
      } catch (error) {
        console.warn('Failed to cleanup expired sessions:', error);
      }
    };

    cleanupSessions();

    // Nettoyer périodiquement les sessions expirées (toutes les heures)
    const intervalId = setInterval(cleanupSessions, 60 * 60 * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return {
    clearSession: () => VisitorSessionService.clearLocalSession(),
    hasAccess: (agencyId: string) => VisitorSessionService.hasAccessToAgency(agencyId),
    getStats: (agencyId: string, days?: number) => VisitorSessionService.getRecognitionStats(agencyId, days)
  };
};
