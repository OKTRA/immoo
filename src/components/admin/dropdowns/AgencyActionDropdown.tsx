
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, Eye, Edit, CheckCircle, XCircle, 
  Building, Ban, RotateCcw, Trash, EyeOff, Star, Eye as EyeIcon
} from 'lucide-react';
import { Agency } from '@/hooks/useAgenciesManagement';

interface AgencyActionDropdownProps {
  agency: Agency;
  isProcessing: boolean;
  onViewDetails: () => void;
  onEdit: () => void;
  onEditRating: () => void;
  onToggleVerification: () => void;
  onToggleVisibility: () => void;
  onSuspend: () => void;
  onReactivate: () => void;
  onDelete: () => void;
}

export function AgencyActionDropdown({
  agency,
  isProcessing,
  onViewDetails,
  onEdit,
  onEditRating,
  onToggleVerification,
  onToggleVisibility,
  onSuspend,
  onReactivate,
  onDelete
}: AgencyActionDropdownProps) {
  const isSuspended = agency.status === 'suspended';
  const isVisible = agency.is_visible !== false;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isProcessing}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onViewDetails}>
          <Eye className="h-4 w-4 mr-2" />
          Voir détails
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onEditRating}>
          <Star className="h-4 w-4 mr-2" />
          Modifier évaluation
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onToggleVerification}>
          {agency.verified ? (
            <>
              <XCircle className="h-4 w-4 mr-2" />
              Retirer vérification
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Vérifier agence
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onToggleVisibility}>
          {isVisible ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Masquer agence
            </>
          ) : (
            <>
              <EyeIcon className="h-4 w-4 mr-2" />
              Afficher agence
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {!isSuspended ? (
          <DropdownMenuItem 
            onClick={onSuspend}
            className="text-orange-600"
          >
            <Ban className="h-4 w-4 mr-2" />
            Suspendre agence
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem 
            onClick={onReactivate}
            className="text-green-600"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Réactiver agence
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-red-600"
          onClick={onDelete}
        >
          <Trash className="h-4 w-4 mr-2" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
