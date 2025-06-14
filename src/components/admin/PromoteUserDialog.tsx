
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { assignAdminRole } from '@/services/adminRoleService';
import { Loader2, Search } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
}

interface PromoteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUserPromoted: () => void;
}

export function PromoteUserDialog({ isOpen, onClose, onUserPromoted }: PromoteUserDialogProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [adminRole, setAdminRole] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNonAdminProfiles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = profiles.filter(profile => {
        const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
        const email = profile.email || '';
        
        return email.toLowerCase().includes(searchTerm.toLowerCase()) ||
               fullName.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredProfiles(filtered);
    } else {
      setFilteredProfiles(profiles);
    }
  }, [searchTerm, profiles]);

  const fetchNonAdminProfiles = async () => {
    setIsLoading(true);
    try {
      console.log('=== DÉBUT DE LA RÉCUPÉRATION DES PROFILS ===');
      
      // Récupérer tous les profils depuis la table profiles avec une requête simple
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('email');

      if (profilesError) {
        console.error('Erreur lors de la récupération des profils:', profilesError);
        throw profilesError;
      }

      console.log('Profils bruts récupérés:', profilesData);
      console.log('Nombre de profils trouvés:', profilesData?.length || 0);

      if (!profilesData || profilesData.length === 0) {
        console.warn('Aucun profil trouvé dans la base de données');
        setProfiles([]);
        setFilteredProfiles([]);
        return;
      }

      // Récupérer les utilisateurs qui ont déjà des rôles admin
      const { data: adminRoles, error: adminError } = await supabase
        .from('admin_roles')
        .select('user_id');

      if (adminError && adminError.code !== 'PGRST116') {
        console.error('Erreur lors de la récupération des rôles admin:', adminError);
        // On continue même en cas d'erreur pour afficher les profils
      }

      console.log('Rôles admin trouvés:', adminRoles);

      const adminUserIds = adminRoles?.map(role => role.user_id) || [];
      console.log('IDs des utilisateurs admin:', adminUserIds);
      
      // Filtrer les profils pour exclure ceux qui sont déjà admin
      const nonAdminProfiles = profilesData.filter(profile => {
        const isAdmin = adminUserIds.includes(profile.id);
        console.log(`Profil ${profile.id} (${profile.email}) - Est admin: ${isAdmin}`);
        return !isAdmin;
      });

      console.log('Profils non-admin disponibles:', nonAdminProfiles);
      console.log('Nombre final de profils disponibles pour promotion:', nonAdminProfiles.length);
      
      setProfiles(nonAdminProfiles);
      setFilteredProfiles(nonAdminProfiles);
    } catch (error) {
      console.error('Erreur générale dans fetchNonAdminProfiles:', error);
      toast.error('Erreur lors du chargement des profils utilisateurs');
      setProfiles([]);
      setFilteredProfiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!selectedUserId || !adminRole) {
      toast.error('Veuillez sélectionner un utilisateur et un rôle');
      return;
    }

    setIsPromoting(true);
    try {
      console.log('Promotion de l\'utilisateur:', selectedUserId, 'au rôle:', adminRole);
      
      const { success, error } = await assignAdminRole(selectedUserId, adminRole);
      
      if (!success) {
        throw new Error(error?.message || 'Erreur lors de la promotion');
      }
      
      const selectedProfile = profiles.find(p => p.id === selectedUserId);
      const userName = selectedProfile 
        ? `${selectedProfile.first_name || ''} ${selectedProfile.last_name || ''}`.trim() || selectedProfile.email
        : 'Utilisateur';
      
      toast.success(`${userName} a été promu au rôle ${adminRole}`);
      
      onUserPromoted();
      handleClose();
    } catch (error: any) {
      console.error('Erreur lors de la promotion:', error);
      toast.error(error.message || 'Erreur lors de la promotion');
    } finally {
      setIsPromoting(false);
    }
  };

  const handleClose = () => {
    setSelectedUserId('');
    setAdminRole('');
    setSearchTerm('');
    onClose();
  };

  const selectedProfile = profiles.find(p => p.id === selectedUserId);

  const getDisplayName = (profile: Profile) => {
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    return fullName || 'Nom non renseigné';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Promouvoir un utilisateur en Admin</DialogTitle>
          <DialogDescription>
            Sélectionnez un profil utilisateur existant et choisissez son niveau d'administration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Rechercher dans les profils</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Rechercher par email ou nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user">Profil utilisateur</Label>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2">Chargement des profils...</span>
              </div>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un profil utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  {filteredProfiles.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      {searchTerm ? 'Aucun profil trouvé pour cette recherche' : 'Aucun profil disponible pour promotion'}
                    </div>
                  ) : (
                    filteredProfiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {getDisplayName(profile)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {profile.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedProfile && (
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Profil sélectionné:</h4>
              <div className="text-sm">
                <p><strong>Nom:</strong> {getDisplayName(selectedProfile)}</p>
                <p><strong>Email:</strong> {selectedProfile.email}</p>
                <p><strong>Rôle actuel:</strong> {selectedProfile.role}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="adminRole">Niveau d'administration</Label>
            <Select value={adminRole} onValueChange={setAdminRole}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir le niveau d'admin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Administrateur</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
                <SelectItem value="moderator">Modérateur</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button 
            onClick={handlePromote} 
            disabled={!selectedUserId || !adminRole || isPromoting}
          >
            {isPromoting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Promouvoir en Admin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
