
import { useState } from 'react';
import { toast } from 'sonner';
import { User } from '@/hooks/useUsersManagement';
import { assignAdminRole, revokeAdminRole } from '@/services/adminRoleService';
import { userRoleService } from '@/services/userRoleService';
import { agencyModerationService } from '@/services/agencyModerationService';

interface UseUserActionHandlersProps {
  user: User;
  onUserUpdate: () => void;
  onUserDelete: (userId: string, userType: string) => void;
  onToggleStatus: (userId: string, status: string, userType: string) => void;
}

export function useUserActionHandlers({
  user,
  onUserUpdate,
  onUserDelete,
  onToggleStatus
}: UseUserActionHandlersProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePromoteToAdmin = async (adminRole: string) => {
    setIsProcessing(true);
    try {
      const { success, error } = await assignAdminRole(user.id, adminRole);
      
      if (!success) {
        throw new Error(error?.message || 'Erreur lors de la promotion');
      }
      
      toast.success(`${user.name} a été promu au rôle ${adminRole}`);
      onUserUpdate();
    } catch (error: any) {
      console.error('Error promoting user:', error);
      toast.error(error.message || 'Erreur lors de la promotion');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevokeAdmin = async () => {
    setIsProcessing(true);
    try {
      const { success, error } = await revokeAdminRole(user.id);
      
      if (!success) {
        throw new Error(error?.message || 'Erreur lors de la révocation');
      }
      
      toast.success(`Privilèges administrateur révoqués pour ${user.name}`);
      onUserUpdate();
    } catch (error: any) {
      console.error('Error revoking admin:', error);
      toast.error(error.message || 'Erreur lors de la révocation');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    setIsProcessing(true);
    try {
      const { success, error } = await userRoleService.assignRole(userId, newRole);
      
      if (!success) {
        throw new Error(error || 'Erreur lors de la mise à jour du rôle');
      }
      
      toast.success(`Rôle mis à jour pour ${user.name}`);
      onUserUpdate();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du rôle');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = () => {
    onUserDelete(user.id, user.user_type);
  };

  const handleSuspend = () => {
    onToggleStatus(user.id, user.status, user.user_type);
  };

  const handleToggleAgencyVisibility = async () => {
    setIsProcessing(true);
    try {
      const { success, error } = await agencyModerationService.toggleAgencyVisibility(
        user.agency_id!, 
        !user.status || user.status === 'suspended'
      );
      
      if (!success) {
        throw new Error(error || 'Erreur lors de la modification de la visibilité');
      }
      
      toast.success(`Visibilité de l'agence ${user.status === 'suspended' ? 'restaurée' : 'masquée'}`);
      onUserUpdate();
    } catch (error: any) {
      console.error('Error toggling agency visibility:', error);
      toast.error(error.message || 'Erreur lors de la modification de la visibilité');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handlePromoteToAdmin,
    handleRevokeAdmin,
    handleRoleUpdate,
    handleDelete,
    handleSuspend,
    handleToggleAgencyVisibility
  };
}
