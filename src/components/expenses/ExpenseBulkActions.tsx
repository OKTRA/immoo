import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Trash2, 
  MoreHorizontal,
  AlertTriangle,
  X
} from 'lucide-react';
import { ExpenseBulkAction } from '@/types/expenses';
import { cn } from '@/lib/utils';

interface ExpenseBulkActionsProps {
  selectedCount: number;
  onBulkAction: (action: string, notes?: string) => void;
  onClearSelection: () => void;
  isLoading: boolean;
}

export default function ExpenseBulkActions({
  selectedCount,
  onBulkAction,
  onClearSelection,
  isLoading
}: ExpenseBulkActionsProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ action: string; label: string } | null>(null);
  const [notes, setNotes] = useState('');

  const handleActionClick = (action: string, label: string) => {
    setPendingAction({ action, label });
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = () => {
    if (pendingAction) {
      onBulkAction(pendingAction.action, notes.trim() || undefined);
      setShowConfirmDialog(false);
      setPendingAction(null);
      setNotes('');
    }
  };

  const handleCancelAction = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
    setNotes('');
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approve':
        return <CheckCircle className="h-4 w-4" />;
      case 'reject':
        return <XCircle className="h-4 w-4" />;
      case 'mark_paid':
        return <DollarSign className="h-4 w-4" />;
      case 'delete':
        return <Trash2 className="h-4 w-4" />;
      default:
        return <MoreHorizontal className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'approve':
        return 'text-green-600 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-300';
      case 'reject':
        return 'text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:text-red-300';
      case 'mark_paid':
        return 'text-blue-600 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300';
      case 'delete':
        return 'text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:text-red-300';
      default:
        return 'text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              {selectedCount} dépense(s) sélectionnée(s)
            </Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Actions disponibles
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Actions rapides */}
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950"
              onClick={() => handleActionClick('approve', 'Approuver')}
              disabled={isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approuver
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950"
              onClick={() => handleActionClick('mark_paid', 'Marquer comme payées')}
              disabled={isLoading}
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Marquer payées
            </Button>

            {/* Menu déroulant pour plus d'actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isLoading}
                >
                  <MoreHorizontal className="h-4 w-4 mr-1" />
                  Plus d'actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions en lot</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem
                  onClick={() => handleActionClick('reject', 'Rejeter')}
                  className="text-red-600 focus:text-red-600"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Rejeter
                </DropdownMenuItem>
                
                <DropdownMenuItem
                  onClick={() => handleActionClick('delete', 'Supprimer')}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog de confirmation */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {pendingAction && getActionIcon(pendingAction.action)}
              <span>Confirmer l'action</span>
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir {pendingAction?.label.toLowerCase()} {selectedCount} dépense(s) ?
              Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Avertissement pour les actions destructives */}
            {(pendingAction?.action === 'delete' || pendingAction?.action === 'reject') && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-700 dark:text-red-300">
                  Cette action est irréversible. Veuillez confirmer votre choix.
                </span>
              </div>
            )}

            {/* Notes optionnelles */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajouter des notes pour cette action..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={handleCancelAction}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleConfirmAction}
                disabled={isLoading}
                className={cn(
                  pendingAction?.action === 'delete' || pendingAction?.action === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                )}
              >
                {isLoading ? 'Traitement...' : 'Confirmer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 