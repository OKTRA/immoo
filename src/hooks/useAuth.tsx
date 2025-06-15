
import { useState, useEffect } from 'react';
import { getCurrentUser, getUserProfile } from '@/services/authService';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        if (!mounted) return;
        
        setIsLoading(true);
        console.log('useAuth: Fetching current user...');
        
        // D'abord vérifier la session existante
        const { data: sessionData } = await supabase.auth.getSession();
        const currentUser = sessionData.session?.user;
        
        if (currentUser && mounted) {
          console.log('useAuth: User found in session:', currentUser.id);
          setUser(currentUser);
          
          // Fetch user profile to get role
          try {
            const { profile } = await getUserProfile(currentUser.id);
            if (mounted) {
              setUserRole(profile?.role || null);
              console.log('useAuth: User role set:', profile?.role);
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            if (mounted) setUserRole(null);
          }
        } else {
          console.log('useAuth: No user found in session');
          if (mounted) {
            setUser(null);
            setUserRole(null);
          }
        }
      } catch (error) {
        console.error('Error in useAuth fetchUser:', error);
        if (mounted) {
          setUser(null);
          setUserRole(null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    // Fetch user immediately
    fetchUser();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log(`useAuth: Auth state changed: ${event}`, session?.user?.id);
        
        if (session?.user) {
          setUser(session.user);
          
          // Fetch user profile to get role avec un délai pour éviter les conflits
          setTimeout(async () => {
            if (!mounted) return;
            try {
              const { profile } = await getUserProfile(session.user.id);
              if (mounted) {
                setUserRole(profile?.role || null);
                console.log('useAuth: Role updated after auth change:', profile?.role);
              }
            } catch (error) {
              console.error('Error fetching user profile after auth change:', error);
              if (mounted) setUserRole(null);
            }
          }, 100);
        } else {
          setUser(null);
          setUserRole(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { user, userRole, isLoading };
}
