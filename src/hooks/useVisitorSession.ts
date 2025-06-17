import { useState, useEffect } from 'react';
import { SimpleVisitorSessionService, SimpleVisitorSession } from '@/services/visitor/simpleVisitorSessionService';

/**
 * Hook pour gérer automatiquement les sessions visiteurs
 */
export function useVisitorSession() {
  const [session, setSession] = useState<SimpleVisitorSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const currentSession = await SimpleVisitorSessionService.getCurrentSession();
        setSession(currentSession);
      } catch (error) {
        console.error('Error loading visitor session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async (contactInfo: { email?: string; phone?: string; name?: string }) => {
    try {
      console.log('🔐 useVisitorSession.login called with:', contactInfo);
      setIsLoading(true);
      const newSession = await SimpleVisitorSessionService.createSession(contactInfo);
      console.log('🔐 SimpleVisitorSessionService.createSession returned:', newSession);
      if (newSession) {
        setSession(newSession);
        console.log('🔐 Session state updated');
        return newSession;
      }
      console.log('🔐 No session created');
      return null;
    } catch (error) {
      console.error('🔐 Error logging in visitor:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await SimpleVisitorSessionService.endSession();
      setSession(null);
    } catch (error) {
      console.error('Error logging out visitor:', error);
      // Force local logout even if server fails
      setSession(null);
    }
  };

  const isConnected = !!session && session.is_active;

  const getContactInfo = () => {
    if (!session) return null;
    
    return {
      email: session.email,
      phone: session.phone,
      name: session.name
    };
  };

  const getSessionDuration = () => {
    if (!session) return 0;
    
    const sessionTime = new Date(session.created_at).getTime();
    const now = Date.now();
    return Math.floor((now - sessionTime) / 1000 / 60); // minutes
  };

  return {
    session,
    isConnected,
    isLoading,
    login,
    logout,
    getContactInfo,
    getSessionDuration
  };
}
