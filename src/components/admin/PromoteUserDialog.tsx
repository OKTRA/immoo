
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
  first_name: string;
  last_name: string;
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
      const filtered = profiles.filter(profile => 
        profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${profile.first_name} ${profile.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProfiles(filtered);
    } else {
      setFilteredProfiles(profiles);
    }
  }, [searchTerm, profiles]);

  const fetchNonAdminProfiles = async () => {
    setIsLoading(true);
    try {
      console.log('=== DEBUT DEBUG PROMOTION ADMIN ===');
      console.log('Fetching profiles from the profiles table...');
      
      // Récupérer tous les profils depuis la table profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, role')
        .order('first_name');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('=== TOUS LES PROFILS DANS LA TABLE ===');
      console.log('Nombre total de profils:', profilesData?.length || 0);
      console.log('Détails des profils:', profilesData);
      
      // Vérifier spécifiquement les IDs mentionnés
      const mentionnedIds = [
        '774c938a-9ae2-4ab5-98a5-cc95c6fa6686',
        '776f66dd-6e28-46e9-b0f1-781a7050e1ae',
        '82765cbb-8b5d-469f-a060-0e073237a3ea'
      ];
      
      mentionnedIds.forEach(id => {
        const found = profilesData?.find(p => p.id === id);
        console.log(`Profile ${id}:`, found ? 'TROUVÉ' : 'NON TROUVÉ', found);
      });

      // Récupérer les utilisateurs qui ont déjà des rôles admin
      const { data: adminRoles, error: adminError } = await supabase
        .from('admin_roles')
        .select('user_id, role_level');

      if (adminError && adminError.code !== 'PGRST116') {
        console.error('Error fetching admin roles:', adminError);
        throw adminError;
      }

      console.log('=== ROLES ADMIN EXISTANTS ===');
      console.log('Admin roles found:', adminRoles?.length || 0);
      console.log('Détails des rôles admin:', adminRoles);

      const adminUserIds = adminRoles?.map(role => role.user_id) || [];
      console.log('IDs déjà admin:', adminUserIds);
      
      // Vérifier si les IDs mentionnés sont déjà admin
      mentionnedIds.forEach(id => {
        const isAdmin = adminUserIds.includes(id);
        console.log(`${id} est déjà admin:`, isAdmin);
      });
      
      // Filtrer les profils pour exclure ceux qui sont déjà admin
      const nonAdminProfiles = profilesData?.filter(profile => {
        const isNotAdmin = !adminUserIds.includes(profile.id);
        console.log(`Profile ${profile.id} (${profile.email}) - Peut être promu:`, isNotAdmin);
        return isNotAdmin;
      }) || [];

      console.log('=== RESULTAT FINAL ===');
      console.log('Non-admin profiles available for promotion:', nonAdminProfiles.length);
      console.log('Profils disponibles pour promotion:', nonAdminProfiles);
      console.log('=== FIN DEBUG PROMOTION ADMIN ===');
      
      setProfiles(nonAdminProfiles);
      setFilteredProfiles(nonAdminProfiles);
    } catch (error) {
      console.error('Error in fetchNonAdminProfiles:', error);
      toast.error('Erreur lors du chargement des profils utilisateurs');
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
      console.log('Promoting user:', selectedUserId, 'to role:', adminRole);
      
      const { success, error } = await assignAdminRole(selectedUserId, adminRole);
      
      if (!success) {
        throw new Error(error?.message || 'Erreur lors de la promotion');
      }
      
      const selectedProfile = profiles.find(p => p.id === selectedUserId);
      toast.success(`${selectedProfile?.first_name} ${selectedProfile?.last_name} a été promu au rôle ${adminRole}`);
      
      onUserPromoted();
      handleClose();
    } catch (error: any) {
      console.error('Error promoting user:', error);
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
                            {profile.first_name} {profile.last_name}
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

          {filteredProfiles.length === 0 && !isLoading && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Aucun profil disponible.</strong> Cela peut signifier que :
              </p>
              <ul className="text-xs text-yellow-700 mt-1 ml-4 list-disc">
                <li>Tous les utilisateurs sont déjà administrateurs</li>
                <li>Il n'y a pas d'utilisateurs dans la table profiles</li>
                <li>Vérifiez la console pour plus de détails</li>
              </ul>
            </div>
          )}

          {selectedProfile && (
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Profil sélectionné:</h4>
              <div className="text-sm">
                <p><strong>Nom:</strong> {selectedProfile.first_name} {selectedProfile.last_name}</p>
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
