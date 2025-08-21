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
    // Prefer the canonical column user_id; fallback to legacy id linkage
    const { data: byUserId, error: byUserIdError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (byUserIdError && byUserIdError.code !== 'PGRST116') { // ignore not found
      throw byUserIdError;
    }

    if (byUserId) {
      return { profile: byUserId, error: null };
    }

    // Fallback: some rows may still use id = auth.user.id
    const { data: byId, error: byIdError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (byIdError) {
      throw byIdError;
    }

    return { profile: byId, error: null };
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

// Check if user has specific permission
export const checkUserPermission = async (userId: string, requiredPermission: string) => {
  try {
    const { profile, error } = await getUserProfile(userId);
    
    if (error) {
      throw new Error(error);
    }
    
    if (!profile) {
      return { hasPermission: false, error: null };
    }
    
    const permissions = {
      public: ['view_properties', 'contact_agency', 'search_properties'],
      agency: ['create_property', 'manage_tenants', 'view_analytics', 'manage_contracts', 'manage_payments'],
      admin: ['manage_users', 'manage_agencies', 'system_settings', 'view_all_data'],
      owner: ['manage_own_properties', 'view_own_analytics']
    };
    
    const userPermissions = permissions[profile.role as keyof typeof permissions] || [];
    const hasPermission = userPermissions.includes(requiredPermission);
    
    return { 
      hasPermission,
      userRole: profile.role,
      userPermissions,
      error: null 
    };
  } catch (error: any) {
    console.error("Error checking user permission:", error.message);
    return { hasPermission: false, userRole: null, userPermissions: [], error: error.message };
  }
};

// Update user role
export const updateUserRole = async (userId: string, newRole: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error updating user role:", error.message);
    return { success: false, error: error.message };
  }
};

// Get all users with their roles (admin only)
export const getAllUsersWithRoles = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        user_id,
        first_name,
        last_name,
        email,
        role,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return { users: data, error: null };
  } catch (error: any) {
    console.error("Error getting all users:", error.message);
    return { users: null, error: error.message };
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
      // Resolve a usable free plan ID
      let usedPlanId: string | null = null;
      // Normalize incoming fields to support both camelCase and snake_case payloads
      const normalizedFirstName = userData.firstName ?? userData.first_name ?? '';
      const normalizedLastName = userData.lastName ?? userData.last_name ?? '';
      const normalizedPhone = userData.phone ?? userData.phone_number ?? '';
      const normalizedAgencyName = (userData.agencyName ?? userData.agency_name) || (
        normalizedFirstName && normalizedLastName
          ? `${normalizedFirstName} ${normalizedLastName} Agency`
          : `${email.split('@')[0]} Agency`
      );
      const normalizedDescription = userData.description ?? "Agence créée automatiquement lors de l'inscription";
      const normalizedLocation = userData.location ?? '';
      
      // Resolve a usable free plan ID from DB
      try {
        // 1) Try standardized UUID first
        const { data: planById } = await supabase
          .from('subscription_plans')
          .select('id')
          .eq('id', '00000000-0000-0000-0000-000000000001')
          .maybeSingle();
        if (planById) {
          usedPlanId = planById.id as string;
        }
        // 2) Otherwise pick any active free plan
        if (!usedPlanId) {
          const { data: freePlan } = await supabase
            .from('subscription_plans')
            .select('id')
            .eq('is_active', true)
            .eq('price', 0)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (freePlan) {
            usedPlanId = freePlan.id as string;
          }
        }
      } catch (planErr) {
        console.warn('Unable to resolve free plan ID, will attempt without strict FK guarantee:', planErr);
      }

      // Ensure a default subscription exists BEFORE creating an agency
      // This satisfies subscription-related RLS/trigger checks during agency insert
      try {
        console.log("Ensuring free subscription exists before agency creation for user:", data.user.id);
        // If a free plan ID is available, insert a subscription row
        if (usedPlanId) {
          const { error: preSubscriptionError } = await supabase
            .from('user_subscriptions')
            .insert({
              user_id: data.user.id,
              agency_id: null,
              plan_id: usedPlanId,
              status: 'active',
              start_date: new Date().toISOString(),
              end_date: null,
              auto_renew: false
            });
          if (preSubscriptionError) {
            // If insert fails due to uniqueness or existing row, we ignore
            console.warn("Pre-agency subscription insert warning:", preSubscriptionError);
          } else {
            console.log(`Pre-agency free subscription created for user ${data.user.id}`);
          }
        } else {
          // If we could not resolve a plan ID, check if any active subscription already exists
          const { data: existingSubs } = await supabase
            .from('user_subscriptions')
            .select('id, plan_id, status')
            .eq('user_id', data.user.id)
            .eq('status', 'active')
            .limit(1);
          if (!existingSubs || existingSubs.length === 0) {
            console.warn('No free plan ID found and no active subscription exists; agency creation may be blocked by DB triggers.');
          }
        }
      } catch (preSubEx) {
        console.error("Unexpected error ensuring pre-agency subscription:", preSubEx);
        // Do not block signup
      }

      // If the user is registering as an agency, create the agency first
      if (userData.role === 'agency') {
        try {
          const agencyName = normalizedAgencyName;
            
          console.log("Attempting to create agency for user:", data.user.id);
          
          // Try to create agency with retry logic - AGENCY CREATION IS MANDATORY
          let agencyCreated = false;
          let retryCount = 0;
          const maxRetries = 5; // Increased retries
          
          while (!agencyCreated && retryCount < maxRetries) {
            try {
              const { data: agencyData, error: agencyError } = await supabase
                .from('agencies')
                .insert([{
                  name: agencyName,
                  email: email,
                  description: normalizedDescription,
                  user_id: data.user.id, // Important: lier immédiatement à l'utilisateur
                  owner_id: data.user.id, // Also set owner_id for backward compatibility
                  logo_url: '', // Required field, set to empty string
                  location: normalizedLocation,
                  phone: normalizedPhone,
                  properties_count: 0,
                  rating: 0.0,
                  verified: false,
                  status: 'active',
                  is_visible: true
                }])
                .select()
                .single();
                
              if (agencyError) {
                console.error(`Agency creation attempt ${retryCount + 1} failed:`, agencyError);
                console.error("Agency creation details:", {
                  user_id: data.user.id,
                  role: userData.role,
                  error: agencyError,
                  attempt: retryCount + 1
                });
                
                // If it's an RLS policy issue, wait a bit and retry
                if (agencyError.code === '42501' || agencyError.message?.includes('policy')) {
                  console.log("RLS policy issue detected, waiting before retry...");
                  await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1))); // Increased wait time
                }
                
                retryCount++;
              } else {
                agencyId = agencyData.id;
                agencyCreated = true;
                console.log("Agency created successfully:", agencyData);
              }
            } catch (retryError) {
              console.error(`Agency creation retry ${retryCount + 1} failed:`, retryError);
              retryCount++;
            }
          }
          
          // AGENCY CREATION IS MANDATORY - If it fails, we need to handle this
          if (!agencyCreated) {
            console.error("CRITICAL: Failed to create agency after all retries for user:", data.user.id);
            
            // Try alternative approach: use the force creation functions
            try {
              console.log("Attempting force agency creation method v2...");
              
              // Try the more robust v2 function first
              const { data: forceAgencyData, error: forceError } = await supabase
                .rpc('force_create_agency_for_user_v2', {
                  p_user_id: data.user.id,
                  p_agency_name: agencyName,
                  p_email: email
                });
                
              if (forceError) {
                console.error("Force agency creation v2 failed:", forceError);
                
                // Try the original force creation function as fallback
                console.log("Attempting original force creation method as fallback...");
                const { data: fallbackData, error: fallbackError } = await supabase
                  .rpc('force_create_agency_for_user', {
                    p_user_id: data.user.id,
                    p_agency_name: agencyName,
                    p_email: email
                  });
                  
                if (fallbackError) {
                  console.error("Fallback force creation also failed:", fallbackError);
                  throw new Error(`Impossible de créer l'agence pour l'utilisateur ${data.user.id}. Erreur: ${fallbackError.message}`);
                } else {
                  agencyId = fallbackData;
                  agencyCreated = true;
                  console.log("Agency created successfully with fallback method, ID:", fallbackData);
                }
              } else {
                agencyId = forceAgencyData;
                agencyCreated = true;
                console.log("Agency created successfully with force method v2, ID:", forceAgencyData);
              }
            } catch (forceError) {
              console.error("All force agency creation methods failed:", forceError);
              // This is a critical failure - the user cannot function as an agency
              throw new Error(`Échec critique de la création de l'agence. L'utilisateur ne peut pas fonctionner comme agence. Veuillez contacter le support.`);
            }
          }
          
        } catch (agencyError) {
          console.error("CRITICAL ERROR in agency creation:", agencyError);
          console.error("Agency creation failed completely for user:", data.user.id);
          // This is a critical failure - throw error to prevent incomplete signup
          throw new Error(`Impossible de créer l'agence requise pour le compte agence. Erreur: ${agencyError.message}`);
        }
      }
      
      // After agency creation, link the existing subscription to the agency if available
      // Skip linking subscription to agency to avoid DB policy recursion errors
      
      // Create or update the user profile with the agency link
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: data.user.id,
          email: email,
          first_name: normalizedFirstName,
          last_name: normalizedLastName,
          role: userData.role || 'visiteur',
          agency_id: agencyId, // Lier le profil à l'agence créée
          phone: normalizedPhone,
          avatar_url: userData.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (profileError) {
        console.error("Error creating/updating profile:", profileError);
        // Don't fail the entire signup for profile issues
        // The profile will be created automatically by the database trigger
        console.warn("Profile creation failed, but user signup continues");
      }

      // Subscription was already ensured earlier; no need to insert again here

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
