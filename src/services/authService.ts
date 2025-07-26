import { supabase } from '@/lib/supabase';

// Get the current user
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }
    
    return { user: data.user, error: null };
  } catch (error: any) {
    console.error("Error getting current user:", error.message);
    return { user: null, error: error.message };
  }
};

// Get user profile by ID
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) {
      throw error;
    }
    
    return { profile: data, error: null };
  } catch (error: any) {
    console.error("Error getting user profile:", error.message);
    return { profile: null, error: error.message };
  }
};

// Check if user has specific role
export const checkUserRole = async (userId: string, requiredRole: string) => {
  try {
    const { profile, error } = await getUserProfile(userId);
    
    if (error) {
      throw new Error(error);
    }
    
    if (!profile) {
      return { hasRole: false, error: null };
    }
    
    return { 
      hasRole: profile.role === requiredRole,
      userRole: profile.role,
      error: null 
    };
  } catch (error: any) {
    console.error("Error checking user role:", error.message);
    return { hasRole: false, userRole: null, error: error.message };
  }
};

// Sign out the current user
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    return { error: null };
  } catch (error: any) {
    console.error("Error signing out:", error.message);
    return { error: error.message };
  }
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log('Signing in with email:', email);
    // Clear any previous sessions to avoid conflicts
    await supabase.auth.signOut();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    return { user: data.user, session: data.session, error: null };
  } catch (error: any) {
    console.error("Error signing in:", error.message);
    return { user: null, session: null, error: error.message };
  }
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, userData: any = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error) {
      throw error;
    }
    
    // If we have a user, we need to create or update their profile
    if (data.user) {
      let agencyId = null;
      
      // If the user is registering as an agency, create the agency first
      if (userData.role === 'agency') {
        try {
          const agencyName = userData.firstName && userData.lastName 
            ? `${userData.firstName} ${userData.lastName} Agency`
            : `${email.split('@')[0]} Agency`;
            
          const { data: agencyData, error: agencyError } = await supabase
            .from('agencies')
            .insert([{
              name: agencyName,
              email: email,
              description: 'Agence créée automatiquement lors de l\'inscription',
              user_id: data.user.id, // Important: lier immédiatement à l'utilisateur
              location: userData.location || '',
              phone: userData.phone || '',
              properties_count: 0,
              rating: 0.0,
              verified: false,
              status: 'active',
              is_visible: true
            }])
            .select()
            .single();
            
          if (agencyError) {
            console.error("Error creating agency:", agencyError);
          } else {
            agencyId = agencyData.id;
            console.log("Agency created successfully:", agencyData);
          }
        } catch (agencyError) {
          console.error("Error in agency creation:", agencyError);
        }
      }
      
      // Create or update the user profile with the agency link
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: email,
          first_name: userData.firstName || '',
          last_name: userData.lastName || '',
          role: userData.role || 'visiteur',
          agency_id: agencyId, // Lier le profil à l'agence créée
          phone: userData.phone || '',
          avatar_url: userData.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error("Error creating/updating profile:", profileError);
        throw profileError;
      }

      // Create a default subscription for ALL users (agency or not)
      try {
        // Use the standardized free plan ID
        const FREE_PLAN_ID = '00000000-0000-0000-0000-000000000001';
        
        // Create subscription with the standardized free plan
        await supabase
          .from('user_subscriptions')
          .insert({
            user_id: data.user.id,
            agency_id: agencyId, // Will be null for non-agency users
            plan_id: FREE_PLAN_ID,
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: null, // Free plan doesn't expire
            auto_renew: false
          });

        console.log(`Free subscription created for new user with plan ${FREE_PLAN_ID}`);
      } catch (subscriptionError) {
        console.error("Error creating subscription:", subscriptionError);
        // Don't fail the registration for subscription issues
      }

      console.log("User profile created/updated successfully");
      return { user: data.user, session: data.session };
    }
    
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error("Error in signUpWithEmail:", error);
    throw error;
  }
};

// Adding functions required by Auth.tsx
export const signIn = signInWithEmail;
export const signUp = signUpWithEmail;
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      throw error;
    }
    
    return { error: null };
  } catch (error: any) {
    console.error("Error resetting password:", error.message);
    return { error: error.message };
  }
};

// Check if email is registered
export const isEmailRegistered = async (email: string) => {
  try {
    // This is a workaround since Supabase doesn't have a direct way to check if an email exists
    // We'll try to send a password reset and check the response
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    // If there's no error, the email exists
    return { exists: !error, error: null };
  } catch (error: any) {
    console.error("Error checking email:", error.message);
    return { exists: false, error: error.message };
  }
};

// Export supabase client for direct access
export { supabase };
