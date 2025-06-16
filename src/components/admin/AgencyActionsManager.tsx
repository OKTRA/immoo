import React, { useState } from 'react';
import { Agency } from '@/hooks/useAgenciesManagement';
import { AgencyActionDropdown } from './dropdowns/AgencyActionDropdown';
import { AgencyActionDialogs } from './dialogs/AgencyActionDialogs';
import { useAgencyActionHandlers } from './hooks/useAgencyActionHandlers';

interface AgencyActionsManagerProps {
  agency: Agency;
  onAgencyUpdate: () => void;
  onAgencyDelete: (agencyId: string) => void;
}

export function AgencyActionsManager({ 
  agency, 
  onAgencyUpdate, 
  onAgencyDelete,
}: AgencyActionsManagerProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);

  const {
    isProcessing,
    handleSuspendAgency,
    handleReactivateAgency,
    handleToggleVisibility,
    handleToggleVerification,
    handleUpdateRating,
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

  const handleRatingWithClose = async (rating: number) => {
    await handleUpdateRating(rating);
    setShowRatingDialog(false);
  };

  return (
    <>
      <AgencyActionDropdown
        agency={agency}
        isProcessing={isProcessing}
        onViewDetails={() => setShowDetails(true)}
        onEdit={() => setShowEditDialog(true)}
        onEditRating={() => setShowRatingDialog(true)}
        onToggleVerification={handleToggleVerification}
        onToggleVisibility={handleToggleVisibility}
        onSuspend={() => setShowSuspendConfirm(true)}
        onReactivate={handleReactivateAgency}
        onDelete={() => setShowDeleteConfirm(true)}
      />

      <AgencyActionDialogs
        agency={agency}
        showDetails={showDetails}
        showEditDialog={showEditDialog}
        showRatingDialog={showRatingDialog}
        showDeleteConfirm={showDeleteConfirm}
        showSuspendConfirm={showSuspendConfirm}
        onCloseDetails={() => setShowDetails(false)}
        onCloseEditDialog={() => setShowEditDialog(false)}
        onCloseRatingDialog={() => setShowRatingDialog(false)}
        onCloseDeleteConfirm={() => setShowDeleteConfirm(false)}
        onCloseSuspendConfirm={() => setShowSuspendConfirm(false)}
        onEdit={handleEditWithClose}
        onUpdateRating={handleRatingWithClose}
        onConfirmDelete={handleDeleteWithClose}
        onConfirmSuspend={handleSuspendWithClose}
      />
    </>
  );
}
