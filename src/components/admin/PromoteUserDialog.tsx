
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
      fetchProfiles();
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

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      // Récupérer tous les profils qui ne sont pas déjà admin
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, role');

      if (profilesError) throw profilesError;

      // Récupérer les utilisateurs qui ont déjà des rôles admin
      const { data: adminRoles, error: adminError } = await supabase
        .from('admin_roles')
        .select('user_id');

      if (adminError && adminError.code !== 'PGRST116') {
        throw adminError;
      }

      const adminUserIds = adminRoles?.map(role => role.user_id) || [];
      
      // Filtrer les profils pour exclure ceux qui sont déjà admin
      const nonAdminProfiles = profilesData?.filter(profile => 
        !adminUserIds.includes(profile.id)
      ) || [];

      setProfiles(nonAdminProfiles);
      setFilteredProfiles(nonAdminProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Erreur lors du chargement des profils');
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
            Sélectionnez un utilisateur existant et choisissez son niveau d'administration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Rechercher un utilisateur</Label>
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
            <Label htmlFor="user">Utilisateur</Label>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2">Chargement des profils...</span>
              </div>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  {filteredProfiles.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur disponible'}
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

          {selectedProfile && (
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Utilisateur sélectionné:</h4>
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
