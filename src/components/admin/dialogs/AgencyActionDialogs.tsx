
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Agency } from '@/hooks/useAgenciesManagement';
import { useState, useEffect } from 'react';

interface AgencyActionDialogsProps {
  agency: Agency;
  showDetails: boolean;
  showEditDialog: boolean;
  showDeleteConfirm: boolean;
  showSuspendConfirm: boolean;
  onCloseDetails: () => void;
  onCloseEditDialog: () => void;
  onCloseDeleteConfirm: () => void;
  onCloseSuspendConfirm: () => void;
  onEdit: (updates: Partial<Agency>) => void;
  onConfirmDelete: () => void;
  onConfirmSuspend: () => void;
}

export function AgencyActionDialogs({
  agency,
  showDetails,
  showEditDialog,
  showDeleteConfirm,
  showSuspendConfirm,
  onCloseDetails,
  onCloseEditDialog,
  onCloseDeleteConfirm,
  onCloseSuspendConfirm,
  onEdit,
  onConfirmDelete,
  onConfirmSuspend
}: AgencyActionDialogsProps) {
  const [editForm, setEditForm] = useState({
    name: '',
    location: '',
    email: '',
    phone: '',
    website: '',
    description: ''
  });

  useEffect(() => {
    if (showEditDialog) {
      setEditForm({
        name: agency.name || '',
        location: agency.location || '',
        email: agency.email || '',
        phone: agency.phone || '',
        website: agency.website || '',
        description: agency.description || ''
      });
    }
  }, [showEditDialog, agency]);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEdit(editForm);
  };

  return (
    <>
      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={onCloseDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'agence</DialogTitle>
            <DialogDescription>
              Informations complètes sur {agency.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold">Nom</Label>
                <p>{agency.name}</p>
              </div>
              <div>
                <Label className="font-semibold">Localisation</Label>
                <p>{agency.location || 'Non spécifié'}</p>
              </div>
              <div>
                <Label className="font-semibold">Email</Label>
                <p>{agency.email || 'Non spécifié'}</p>
              </div>
              <div>
                <Label className="font-semibold">Téléphone</Label>
                <p>{agency.phone || 'Non spécifié'}</p>
              </div>
              <div>
                <Label className="font-semibold">Site web</Label>
                <p>{agency.website || 'Non spécifié'}</p>
              </div>
              <div>
                <Label className="font-semibold">Nombre de propriétés</Label>
                <p>{agency.properties_count}</p>
              </div>
              <div>
                <Label className="font-semibold">Note</Label>
                <p>{agency.rating.toFixed(1)}/5</p>
              </div>
              <div>
                <Label className="font-semibold">Statut</Label>
                <p>{agency.verified ? 'Vérifiée' : 'Non vérifiée'}</p>
              </div>
            </div>
            
            {agency.description && (
              <div>
                <Label className="font-semibold">Description</Label>
                <p className="mt-1 text-sm text-gray-600">{agency.description}</p>
              </div>
            )}
            
            <div>
              <Label className="font-semibold">Date de création</Label>
              <p>{agency.created_at}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={onCloseEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l'agence</DialogTitle>
            <DialogDescription>
              Mettre à jour les informations de {agency.name}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Localisation</Label>
                <Input
                  id="location"
                  value={editForm.location}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  type="url"
                  value={editForm.website}
                  onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCloseEditDialog}>
                Annuler
              </Button>
              <Button type="submit">
                Sauvegarder
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={onCloseDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'agence</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'agence "{agency.name}" ?
              Cette action est irréversible et supprimera toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend Confirmation */}
      <AlertDialog open={showSuspendConfirm} onOpenChange={onCloseSuspendConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspendre l'agence</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir suspendre l'agence "{agency.name}" ?
              Cela masquera l'agence et rendra ses propriétés indisponibles.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onConfirmSuspend}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Suspendre
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
