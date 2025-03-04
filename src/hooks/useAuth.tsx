
import { useState, useEffect } from 'react';
import { getCurrentUser, getUserProfile } from '@/services/authService';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const { user: currentUser } = await getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          
          // Fetch user profile to get role
          const { profile } = await getUserProfile(currentUser.id);
          setUserRole(profile?.role || null);
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          
          // Fetch user profile to get role
          const { profile } = await getUserProfile(session.user.id);
          setUserRole(profile?.role || null);
        } else {
          setUser(null);
          setUserRole(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { user, userRole, isLoading };
}
