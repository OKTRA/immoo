
import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, Eye, UserCog, Shield, ShieldOff, 
  Building, Ban, Trash, Lock
} from 'lucide-react';
import { User } from '@/hooks/useUsersManagement';
import { UserDetailsDialog } from './UserDetailsDialog';
import { UserRoleDialog } from './UserRoleDialog';
import { AdminRoleDialog } from './AdminRoleDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { toast } from 'sonner';
import { assignAdminRole, revokeAdminRole } from '@/services/adminRoleService';
import { userRoleService } from '@/services/userRoleService';
import { agencyModerationService } from '@/services/agencyModerationService';

interface UserActionsManagerProps {
  user: User;
  onUserUpdate: () => void;
  onUserDelete: (userId: string, userType: string) => void;
  onToggleStatus: (userId: string, status: string, userType: string) => void;
}

export function UserActionsManager({ 
  user, 
  onUserUpdate, 
  onUserDelete, 
  onToggleStatus 
}: UserActionsManagerProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
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
      setShowAdminDialog(false);
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
      setShowRoleDialog(false);
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du rôle');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = () => {
    onUserDelete(user.id, user.user_type);
    setShowDeleteConfirm(false);
  };

  const handleSuspend = () => {
    onToggleStatus(user.id, user.status, user.user_type);
    setShowSuspendConfirm(false);
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

  const canManageUser = user.user_type !== 'visitor';
  const isAdmin = user.isAdmin;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isProcessing}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setShowDetails(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Voir détails
          </DropdownMenuItem>
          
          {canManageUser && (
            <>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => setShowRoleDialog(true)}>
                <UserCog className="h-4 w-4 mr-2" />
                Modifier le rôle
              </DropdownMenuItem>

              {!isAdmin ? (
                <DropdownMenuItem onClick={() => setShowAdminDialog(true)}>
                  <Shield className="h-4 w-4 mr-2" />
                  Promouvoir admin
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem 
                  onClick={handleRevokeAdmin}
                  className="text-orange-600"
                >
                  <ShieldOff className="h-4 w-4 mr-2" />
                  Révoquer admin
                </DropdownMenuItem>
              )}

              {user.user_type === 'agency' && user.agency_id && (
                <DropdownMenuItem onClick={handleToggleAgencyVisibility}>
                  <Building className="h-4 w-4 mr-2" />
                  {user.status === 'suspended' ? 'Afficher agence' : 'Masquer agence'}
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => setShowSuspendConfirm(true)}
                className="text-orange-600"
              >
                <Ban className="h-4 w-4 mr-2" />
                Suspendre compte
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-600"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash className="h-4 w-4 mr-2" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      <UserDetailsDialog
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        user={user}
      />

      {showRoleDialog && (
        <UserRoleDialog
          isOpen={showRoleDialog}
          onClose={() => setShowRoleDialog(false)}
          user={user}
          onRoleUpdate={handleRoleUpdate}
        />
      )}

      {showAdminDialog && (
        <AdminRoleDialog
          isOpen={showAdminDialog}
          onClose={() => setShowAdminDialog(false)}
          user={user}
          onRoleUpdate={handlePromoteToAdmin}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer l'utilisateur"
        description={`Êtes-vous sûr de vouloir supprimer ${user.name} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="destructive"
      />

      <ConfirmDialog
        isOpen={showSuspendConfirm}
        onClose={() => setShowSuspendConfirm(false)}
        onConfirm={handleSuspend}
        title="Suspendre le compte"
        description={`Êtes-vous sûr de vouloir suspendre le compte de ${user.name} ?`}
        confirmLabel="Suspendre"
        variant="destructive"
      />
    </>
  );
}
