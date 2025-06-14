
import React, { useState } from 'react';
import { User } from '@/hooks/useUsersManagement';
import { useUserActionHandlers } from './hooks/useUserActionHandlers';
import { UserActionDropdown } from './dropdowns/UserActionDropdown';
import { UserActionDialogs } from './dialogs/UserActionDialogs';

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

  const {
    isProcessing,
    handlePromoteToAdmin,
    handleRevokeAdmin,
    handleRoleUpdate,
    handleDelete,
    handleSuspend,
    handleToggleAgencyVisibility
  } = useUserActionHandlers({
    user,
    onUserUpdate,
    onUserDelete,
    onToggleStatus
  });

  const handlePromoteToAdminWithClose = async (adminRole: string) => {
    await handlePromoteToAdmin(adminRole);
    setShowAdminDialog(false);
  };

  const handleRoleUpdateWithClose = async (userId: string, newRole: string) => {
    await handleRoleUpdate(userId, newRole);
    setShowRoleDialog(false);
  };

  const handleDeleteWithClose = () => {
    handleDelete();
    setShowDeleteConfirm(false);
  };

  const handleSuspendWithClose = () => {
    handleSuspend();
    setShowSuspendConfirm(false);
  };

  return (
    <>
      <UserActionDropdown
        user={user}
        isProcessing={isProcessing}
        onViewDetails={() => setShowDetails(true)}
        onModifyRole={() => setShowRoleDialog(true)}
        onPromoteAdmin={() => setShowAdminDialog(true)}
        onRevokeAdmin={handleRevokeAdmin}
        onToggleAgencyVisibility={handleToggleAgencyVisibility}
        onSuspend={() => setShowSuspendConfirm(true)}
        onDelete={() => setShowDeleteConfirm(true)}
      />

      <UserActionDialogs
        user={user}
        showDetails={showDetails}
        showRoleDialog={showRoleDialog}
        showAdminDialog={showAdminDialog}
        showDeleteConfirm={showDeleteConfirm}
        showSuspendConfirm={showSuspendConfirm}
        onCloseDetails={() => setShowDetails(false)}
        onCloseRoleDialog={() => setShowRoleDialog(false)}
        onCloseAdminDialog={() => setShowAdminDialog(false)}
        onCloseDeleteConfirm={() => setShowDeleteConfirm(false)}
        onCloseSuspendConfirm={() => setShowSuspendConfirm(false)}
        onRoleUpdate={handleRoleUpdateWithClose}
        onPromoteToAdmin={handlePromoteToAdminWithClose}
        onConfirmDelete={handleDeleteWithClose}
        onConfirmSuspend={handleSuspendWithClose}
      />
    </>
  );
}
