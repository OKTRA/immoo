
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export async function assignAdminRole(userId: string, adminRole: string) {
  try {
    // Check if user already has an admin role
    const { data: existingRole, error: checkError } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    // Get current user (the one assigning the role)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (checkError && checkError.code !== 'PGRST116') {
      // Real error, not just "no rows returned"
      throw checkError;
    }
    
    let result;
    
    if (existingRole) {
      // Update existing role
      result = await supabase
        .from('admin_roles')
        .update({ 
          role_level: adminRole,
          assigned_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRole.id);
    } else {
      // Insert new role
      result = await supabase
        .from('admin_roles')
        .insert({ 
          user_id: userId,
          role_level: adminRole,
          assigned_by: user?.id
        });
    }
    
    if (result.error) {
      throw result.error;
    }
    
    // Update the user's profile role as well
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: adminRole })
      .eq('user_id', userId);
    
    if (profileError) {
      console.error('Error updating profile role:', profileError);
      // We'll continue anyway, but log the error
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error assigning admin role:', error);
    toast.error('Erreur lors de l\'attribution du rôle admin');
    return { success: false, error };
  }
}

export async function revokeAdminRole(userId: string) {
  try {
    // Delete the admin role
    const { error } = await supabase
      .from('admin_roles')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    // Set user profile back to regular user
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'public' })
      .eq('user_id', userId);
    
    if (profileError) {
      console.error('Error updating profile role:', profileError);
      // We'll continue anyway, but log the error
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error revoking admin role:', error);
    toast.error('Erreur lors de la révocation du rôle admin');
    return { success: false, error };
  }
}

export async function isUserAdmin(userId: string) {
  try {
    // Check admin roles table
    const { data, error } = await supabase
      .from('admin_roles')
      .select('role_level')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return { 
      isAdmin: !!data,
      adminRole: data?.role_level || null,
      error: null
    };
  } catch (error) {
    console.error('Error checking admin status:', error);
    return { isAdmin: false, adminRole: null, error };
  }
}
