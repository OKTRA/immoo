
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  isAdmin?: boolean;
  adminRole?: string;
  phone?: string;
  agency_id?: string;
  agency_name?: string;
  user_type: 'visitor' | 'admin' | 'agency' | 'proprietaire';
  last_seen_at?: string;
  ip_address?: string;
}

export function useUsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, userTypeFilter, currentPage]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Fetch visitor contacts
      const { data: visitors, error: visitorsError } = await supabase
        .from('visitor_contacts')
        .select(`
          id,
          email,
          phone,
          first_name,
          last_name,
          created_at,
          last_seen_at,
          ip_address,
          agency_id,
          agencies!inner(name)
        `);

      if (visitorsError && visitorsError.code !== 'PGRST116') {
        console.error('Error fetching visitors:', visitorsError);
      }

      // Fetch profiles with admin roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role,
          created_at,
          agency_id,
          agencies(name)
        `);

      if (profilesError) throw profilesError;

      // Fetch admin roles
      const { data: adminRoles, error: adminRolesError } = await supabase
        .from('admin_roles')
        .select('user_id, role_level');

      if (adminRolesError && adminRolesError.code !== 'PGRST116') {
        console.error('Error fetching admin roles:', adminRolesError);
      }

      // Transform data
      const allUsers: User[] = [];

      // Add visitors
      visitors?.forEach(visitor => {
        allUsers.push({
          id: visitor.id,
          name: `${visitor.first_name || ''} ${visitor.last_name || ''}`.trim() || 'Visiteur anonyme',
          email: visitor.email || 'N/A',
          phone: visitor.phone,
          role: 'visiteur',
          status: 'active' as const,
          joinDate: new Date(visitor.created_at).toLocaleDateString(),
          user_type: 'visitor' as const,
          last_seen_at: visitor.last_seen_at ? new Date(visitor.last_seen_at).toLocaleDateString() : undefined,
          ip_address: visitor.ip_address,
          agency_name: visitor.agencies?.name
        });
      });

      // Add profiles (admins and agencies)
      profiles?.forEach(profile => {
        const adminRole = adminRoles?.find(ar => ar.user_id === profile.id);
        const isAdmin = !!adminRole;
        
        let userType: 'admin' | 'agency' | 'proprietaire' = 'proprietaire';
        if (isAdmin) {
          userType = 'admin';
        } else if (profile.agency_id) {
          userType = 'agency';
        }

        allUsers.push({
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email?.split('@')[0] || 'Utilisateur',
          email: profile.email,
          role: profile.role || 'public',
          status: 'active' as const,
          joinDate: new Date(profile.created_at).toLocaleDateString(),
          user_type: userType,
          isAdmin,
          adminRole: adminRole?.role_level,
          agency_id: profile.agency_id,
          agency_name: profile.agencies?.name
        });
      });

      // Apply filters
      let filteredUsers = allUsers;

      if (searchTerm) {
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (roleFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
      }

      if (userTypeFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.user_type === userTypeFilter);
      }

      // Apply pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

      setUsers(paginatedUsers);
      setTotalCount(filteredUsers.length);

    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string, userType: string) => {
    try {
      if (userType === 'visitor') {
        // For visitors, we can't really "suspend" them, just mark them
        toast.info('Les visiteurs ne peuvent pas être suspendus');
        return;
      }

      // For profiles, update the status (this would require adding a status field to profiles)
      toast.info('Fonctionnalité en cours d\'implémentation');
      
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Erreur lors de la modification du statut');
    }
  };

  const deleteUser = async (userId: string, userType: string) => {
    try {
      if (userType === 'visitor') {
        const { error } = await supabase
          .from('visitor_contacts')
          .delete()
          .eq('id', userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);

        if (error) throw error;
      }

      setUsers(users.filter(user => user.id !== userId));
      setTotalCount(prev => prev - 1);
      toast.success('Utilisateur supprimé avec succès');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return {
    users,
    isLoading,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    userTypeFilter,
    setUserTypeFilter,
    currentPage,
    setCurrentPage,
    totalCount,
    totalPages,
    toggleUserStatus,
    deleteUser,
    refreshUsers: fetchUsers
  };
}
