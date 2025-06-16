
import React from 'react';
import { User } from '@/hooks/useUsersManagement';
import { UserDetailsDialog } from '../UserDetailsDialog';
import { UserRoleDialog } from '../UserRoleDialog';
import { AdminRoleDialog } from '../AdminRoleDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface UserActionDialogsProps {
  user: User;
  showDetails: boolean;
  showRoleDialog: boolean;
  showAdminDialog: boolean;
  showDeleteConfirm: boolean;
  showSuspendConfirm: boolean;
  onCloseDetails: () => void;
  onCloseRoleDialog: () => void;
  onCloseAdminDialog: () => void;
  onCloseDeleteConfirm: () => void;
  onCloseSuspendConfirm: () => void;
  onRoleUpdate: (userId: string, newRole: string) => void;
  onPromoteToAdmin: (adminRole: string) => void;
  onConfirmDelete: () => void;
  onConfirmSuspend: () => void;
}

export function UserActionDialogs({
  user,
  showDetails,
  showRoleDialog,
  showAdminDialog,
  showDeleteConfirm,
  showSuspendConfirm,
  onCloseDetails,
  onCloseRoleDialog,
  onCloseAdminDialog,
  onCloseDeleteConfirm,
  onCloseSuspendConfirm,
  onRoleUpdate,
  onPromoteToAdmin,
  onConfirmDelete,
  onConfirmSuspend
}: UserActionDialogsProps) {
  return (
    <>
      <UserDetailsDialog
        isOpen={showDetails}
        onClose={onCloseDetails}
        user={user}
      />

      {showRoleDialog && (
        <UserRoleDialog
          isOpen={showRoleDialog}
          onClose={onCloseRoleDialog}
          user={user}
          onRoleUpdate={onRoleUpdate}
        />
      )}

      {showAdminDialog && (
        <AdminRoleDialog
          isOpen={showAdminDialog}
          onClose={onCloseAdminDialog}
          user={user}
          onRoleUpdate={onPromoteToAdmin}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={onCloseDeleteConfirm}
        onConfirm={onConfirmDelete}
        title="Supprimer l'utilisateur"
        description={`Êtes-vous sûr de vouloir supprimer ${user.name} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="destructive"
      />

      <ConfirmDialog
        isOpen={showSuspendConfirm}
        onClose={onCloseSuspendConfirm}
        onConfirm={onConfirmSuspend}
        title="Suspendre le compte"
        description={`Êtes-vous sûr de vouloir suspendre le compte de ${user.name} ?`}
        confirmLabel="Suspendre"
        variant="destructive"
      />
    </>
  );
}
