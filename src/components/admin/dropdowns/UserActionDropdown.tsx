
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
  MoreHorizontal, Eye, UserCog, Shield, ShieldOff, 
  Building, Ban, Trash
} from 'lucide-react';
import { User } from '@/hooks/useUsersManagement';

interface UserActionDropdownProps {
  user: User;
  isProcessing: boolean;
  onViewDetails: () => void;
  onModifyRole: () => void;
  onPromoteAdmin: () => void;
  onRevokeAdmin: () => void;
  onToggleAgencyVisibility: () => void;
  onSuspend: () => void;
  onDelete: () => void;
}

export function UserActionDropdown({
  user,
  isProcessing,
  onViewDetails,
  onModifyRole,
  onPromoteAdmin,
  onRevokeAdmin,
  onToggleAgencyVisibility,
  onSuspend,
  onDelete
}: UserActionDropdownProps) {
  const canManageUser = user.user_type !== 'visitor';
  const isAdmin = user.isAdmin;

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
        
        {canManageUser && (
          <>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={onModifyRole}>
              <UserCog className="h-4 w-4 mr-2" />
              Modifier le rôle
            </DropdownMenuItem>

            {!isAdmin ? (
              <DropdownMenuItem onClick={onPromoteAdmin}>
                <Shield className="h-4 w-4 mr-2" />
                Promouvoir admin
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                onClick={onRevokeAdmin}
                className="text-orange-600"
              >
                <ShieldOff className="h-4 w-4 mr-2" />
                Révoquer admin
              </DropdownMenuItem>
            )}

            {user.user_type === 'agency' && user.agency_id && (
              <DropdownMenuItem onClick={onToggleAgencyVisibility}>
                <Building className="h-4 w-4 mr-2" />
                {user.status === 'suspended' ? 'Afficher agence' : 'Masquer agence'}
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={onSuspend}
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
          onClick={onDelete}
        >
          <Trash className="h-4 w-4 mr-2" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
