
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mail, Phone, MapPin, Clock, Globe, Shield, User, Building
} from 'lucide-react';
import { User as UserType } from '@/hooks/useUsersManagement';

interface UserDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
}

export function UserDetailsDialog({ isOpen, onClose, user }: UserDetailsDialogProps) {
  if (!user) return null;

  const getUserTypeBadge = (userType: string) => {
    switch (userType) {
      case 'visitor':
        return <Badge variant="secondary">Visiteur</Badge>;
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'agency':
        return <Badge variant="default">Agence</Badge>;
      case 'proprietaire':
        return <Badge variant="outline">Propriétaire</Badge>;
      default:
        return <Badge variant="outline">Autre</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Détails de l'utilisateur
          </DialogTitle>
          <DialogDescription>
            Informations complètes sur {user.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">INFORMATIONS GÉNÉRALES</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Nom:</span>
                <span className="text-sm">{user.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Type:</span>
                {getUserTypeBadge(user.user_type)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rôle:</span>
                <span className="text-sm">{user.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Statut:</span>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm">Actif</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">CONTACT</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Agence (si applicable) */}
          {user.agency_name && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground">AGENCE</h3>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.agency_name}</span>
              </div>
            </div>
          )}

          {/* Admin role (si applicable) */}
          {user.isAdmin && user.adminRole && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground">ADMINISTRATION</h3>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">{user.adminRole}</span>
              </div>
            </div>
          )}

          {/* Informations techniques */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">ACTIVITÉ</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Inscrit: {user.joinDate}</span>
              </div>
              {user.last_seen_at && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Dernière visite: {user.last_seen_at}</span>
                </div>
              )}
              {user.ip_address && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">IP: {user.ip_address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
