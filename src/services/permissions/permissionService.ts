import { supabase } from '@/lib/supabase';

// Types pour les permissions
export interface Permission {
  id: string;
  name: string;
  key: string;
  description: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  granted: boolean;
  granted_by?: string;
  granted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_by?: string;
  assigned_at: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Service de gestion des permissions
export class PermissionService {
  // Récupérer toutes les permissions
  static async getAllPermissions(): Promise<{ permissions: Permission[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      return { permissions: data || [], error: null };
    } catch (error: any) {
      console.error('Error fetching permissions:', error);
      return { permissions: [], error: error.message };
    }
  }

  // Récupérer les permissions par catégorie
  static async getPermissionsByCategory(): Promise<{ [category: string]: Permission[]; error: string | null }> {
    try {
      const { permissions, error } = await this.getAllPermissions();
      
      if (error) return { permissions: {}, error };

      const grouped: { [category: string]: Permission[] } = {};
      permissions.forEach(permission => {
        if (!grouped[permission.category]) {
          grouped[permission.category] = [];
        }
        grouped[permission.category].push(permission);
      });

      return { permissions: grouped, error: null };
    } catch (error: any) {
      console.error('Error grouping permissions:', error);
      return { permissions: {}, error: error.message };
    }
  }

  // Récupérer les permissions d'un rôle
  static async getRolePermissions(roleId: string): Promise<{ permissions: Permission[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          permission_id,
          granted,
          permissions (*)
        `)
        .eq('role_id', roleId)
        .eq('granted', true);

      if (error) throw error;

      const permissions = data
        ?.map(item => item.permissions as Permission)
        .filter(Boolean) || [];

      return { permissions, error: null };
    } catch (error: any) {
      console.error('Error fetching role permissions:', error);
      return { permissions: [], error: error.message };
    }
  }

  // Récupérer les permissions d'un utilisateur
  static async getUserPermissions(userId: string): Promise<{ permissions: Permission[]; error: string | null }> {
    try {
      // Récupérer le rôle de l'utilisateur
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (roleError) throw roleError;

      if (!userRole) {
        return { permissions: [], error: null };
      }

      // Récupérer les permissions du rôle
      return await this.getRolePermissions(userRole.role_id);
    } catch (error: any) {
      console.error('Error fetching user permissions:', error);
      return { permissions: [], error: error.message };
    }
  }

  // Vérifier si un utilisateur a une permission spécifique
  static async checkUserPermission(userId: string, permissionKey: string): Promise<{ hasPermission: boolean; error: string | null }> {
    try {
      const { permissions, error } = await this.getUserPermissions(userId);
      
      if (error) return { hasPermission: false, error };

      const hasPermission = permissions.some(p => p.key === permissionKey);
      return { hasPermission, error: null };
    } catch (error: any) {
      console.error('Error checking user permission:', error);
      return { hasPermission: false, error: error.message };
    }
  }

  // Vérifier si un utilisateur a plusieurs permissions
  static async checkUserPermissions(userId: string, permissionKeys: string[]): Promise<{ hasAllPermissions: boolean; missingPermissions: string[]; error: string | null }> {
    try {
      const { permissions, error } = await this.getUserPermissions(userId);
      
      if (error) return { hasAllPermissions: false, missingPermissions: [], error };

      const userPermissionKeys = permissions.map(p => p.key);
      const missingPermissions = permissionKeys.filter(key => !userPermissionKeys.includes(key));
      const hasAllPermissions = missingPermissions.length === 0;

      return { hasAllPermissions, missingPermissions, error: null };
    } catch (error: any) {
      console.error('Error checking user permissions:', error);
      return { hasAllPermissions: false, missingPermissions: [], error: error.message };
    }
  }

  // Attribuer une permission à un rôle
  static async assignPermissionToRole(roleId: string, permissionId: string, grantedBy: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('role_permissions')
        .upsert({
          role_id: roleId,
          permission_id: permissionId,
          granted: true,
          granted_by: grantedBy,
          granted_at: new Date().toISOString()
        });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error assigning permission to role:', error);
      return { success: false, error: error.message };
    }
  }

  // Révoquer une permission d'un rôle
  static async revokePermissionFromRole(roleId: string, permissionId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('role_permissions')
        .update({
          granted: false,
          updated_at: new Date().toISOString()
        })
        .eq('role_id', roleId)
        .eq('permission_id', permissionId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error revoking permission from role:', error);
      return { success: false, error: error.message };
    }
  }

  // Attribuer un rôle à un utilisateur
  static async assignRoleToUser(userId: string, roleId: string, assignedBy: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role_id: roleId,
          assigned_by: assignedBy,
          assigned_at: new Date().toISOString(),
          is_active: true
        });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error assigning role to user:', error);
      return { success: false, error: error.message };
    }
  }

  // Révoquer un rôle d'un utilisateur
  static async revokeRoleFromUser(userId: string, roleId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('role_id', roleId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error revoking role from user:', error);
      return { success: false, error: error.message };
    }
  }

  // Récupérer l'historique des changements de rôles
  static async getRoleChangeHistory(userId: string): Promise<{ history: any[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          roles (name),
          assigned_by_user:profiles!assigned_by (first_name, last_name, email)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { history: data || [], error: null };
    } catch (error: any) {
      console.error('Error fetching role change history:', error);
      return { history: [], error: error.message };
    }
  }

  // Créer un nouveau rôle
  static async createRole(roleData: { name: string; description: string; permissions: string[] }): Promise<{ roleId: string | null; error: string | null }> {
    try {
      // Créer le rôle
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .insert({
          name: roleData.name,
          description: roleData.description
        })
        .select()
        .single();

      if (roleError) throw roleError;

      // Attribuer les permissions au rôle
      for (const permissionId of roleData.permissions) {
        const { error: permError } = await supabase
          .from('role_permissions')
          .insert({
            role_id: role.id,
            permission_id: permissionId,
            granted: true
          });

        if (permError) {
          console.error('Error assigning permission:', permError);
        }
      }

      return { roleId: role.id, error: null };
    } catch (error: any) {
      console.error('Error creating role:', error);
      return { roleId: null, error: error.message };
    }
  }

  // Mettre à jour un rôle
  static async updateRole(roleId: string, updates: { name?: string; description?: string; permissions?: string[] }): Promise<{ success: boolean; error: string | null }> {
    try {
      // Mettre à jour les informations du rôle
      if (updates.name || updates.description) {
        const { error: roleError } = await supabase
          .from('roles')
          .update({
            name: updates.name,
            description: updates.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', roleId);

        if (roleError) throw roleError;
      }

      // Mettre à jour les permissions si fournies
      if (updates.permissions) {
        // Supprimer toutes les permissions actuelles
        const { error: deleteError } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', roleId);

        if (deleteError) throw deleteError;

        // Ajouter les nouvelles permissions
        for (const permissionId of updates.permissions) {
          const { error: permError } = await supabase
            .from('role_permissions')
            .insert({
              role_id: roleId,
              permission_id: permissionId,
              granted: true
            });

          if (permError) {
            console.error('Error assigning permission:', permError);
          }
        }
      }

      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error updating role:', error);
      return { success: false, error: error.message };
    }
  }

  // Supprimer un rôle
  static async deleteRole(roleId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // Vérifier si le rôle est utilisé
      const { data: usersWithRole, error: checkError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role_id', roleId)
        .eq('is_active', true);

      if (checkError) throw checkError;

      if (usersWithRole && usersWithRole.length > 0) {
        return { success: false, error: 'Cannot delete role that is currently assigned to users' };
      }

      // Supprimer les permissions du rôle
      const { error: permError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId);

      if (permError) throw permError;

      // Supprimer le rôle
      const { error: roleError } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (roleError) throw roleError;

      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error deleting role:', error);
      return { success: false, error: error.message };
    }
  }
}

export default PermissionService;
