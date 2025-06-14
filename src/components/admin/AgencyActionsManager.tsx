
import React, { useState } from 'react';
import { Agency } from '@/hooks/useAgenciesManagement';
import { AgencyActionDropdown } from './dropdowns/AgencyActionDropdown';
import { AgencyActionDialogs } from './dialogs/AgencyActionDialogs';
import { useAgencyActionHandlers } from './hooks/useAgencyActionHandlers';

interface AgencyActionsManagerProps {
  agency: Agency;
  onAgencyUpdate: () => void;
  onAgencyDelete: (agencyId: string) => void;
  onToggleVerification: (agencyId: string, currentVerified: boolean) => void;
}

export function AgencyActionsManager({ 
  agency, 
  onAgencyUpdate, 
  onAgencyDelete, 
  onToggleVerification 
}: AgencyActionsManagerProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);

  const {
    isProcessing,
    handleSuspendAgency,
    handleReactivateAgency,
    handleToggleVisibility,
    handleDelete,
    handleEdit
  } = useAgencyActionHandlers({
    agency,
    onAgencyUpdate,
    onAgencyDelete
  });

  const handleSuspendWithClose = async () => {
    await handleSuspendAgency();
    setShowSuspendConfirm(false);
  };

  const handleDeleteWithClose = () => {
    handleDelete();
    setShowDeleteConfirm(false);
  };

  const handleEditWithClose = async (updates: Partial<Agency>) => {
    await handleEdit(updates);
    setShowEditDialog(false);
  };

  return (
    <>
      <AgencyActionDropdown
        agency={agency}
        isProcessing={isProcessing}
        onViewDetails={() => setShowDetails(true)}
        onEdit={() => setShowEditDialog(true)}
        onToggleVerification={() => onToggleVerification(agency.id, agency.verified)}
        onToggleVisibility={handleToggleVisibility}
        onSuspend={() => setShowSuspendConfirm(true)}
        onReactivate={handleReactivateAgency}
        onDelete={() => setShowDeleteConfirm(true)}
      />

      <AgencyActionDialogs
        agency={agency}
        showDetails={showDetails}
        showEditDialog={showEditDialog}
        showDeleteConfirm={showDeleteConfirm}
        showSuspendConfirm={showSuspendConfirm}
        onCloseDetails={() => setShowDetails(false)}
        onCloseEditDialog={() => setShowEditDialog(false)}
        onCloseDeleteConfirm={() => setShowDeleteConfirm(false)}
        onCloseSuspendConfirm={() => setShowSuspendConfirm(false)}
        onEdit={handleEditWithClose}
        onConfirmDelete={handleDeleteWithClose}
        onConfirmSuspend={handleSuspendWithClose}
      />
    </>
  );
}
