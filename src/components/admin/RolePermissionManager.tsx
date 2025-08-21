import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { RoleGuard } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Users, 
  Key,
  RefreshCw
} from 'lucide-react';
import PermissionService, { Permission } from '@/services/permissions/permissionService';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

const RolePermissionManager: React.FC = () => {
  const { profile } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [creatingRole, setCreatingRole] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] as string[] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les permissions
      const { permissions: fetchedPermissions, error: permError } = await PermissionService.getAllPermissions();
      if (permError) {
        toast.error(`Erreur lors du chargement des permissions: ${permError}`);
        return;
      }
      setPermissions(fetchedPermissions);

      // Récupérer les rôles avec leurs permissions
      const { data: rolesData, error: rolesError } = await fetch('/api/roles').then(res => res.json());
      if (rolesError) {
        toast.error(`Erreur lors du chargement des rôles: ${rolesError}`);
        return;
      }
      setRoles(rolesData || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      if (!newRole.name.trim()) {
        toast.error('Le nom du rôle est requis');
        return;
      }

      const { roleId, error } = await PermissionService.createRole(newRole);
      
      if (error) {
        toast.error(`Erreur lors de la création: ${error}`);
        return;
      }

      toast.success('Rôle créé avec succès');
      setCreatingRole(false);
      setNewRole({ name: '', description: '', permissions: [] });
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la création du rôle');
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;

    try {
      const { success, error } = await PermissionService.updateRole(editingRole.id, {
        name: editingRole.name,
        description: editingRole.description,
        permissions: editingRole.permissions.map(p => p.id)
      });

      if (error) {
        toast.error(`Erreur lors de la mise à jour: ${error}`);
        return;
      }

      toast.success('Rôle mis à jour avec succès');
      setEditingRole(null);
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du rôle');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) return;

    try {
      const { success, error } = await PermissionService.deleteRole(roleId);
      
      if (error) {
        toast.error(`Erreur lors de la suppression: ${error}`);
        return;
      }

      toast.success('Rôle supprimé avec succès');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la suppression du rôle');
    }
  };

  const togglePermission = (permissionId: string) => {
    if (!editingRole) return;

    const currentPermissions = editingRole.permissions.map(p => p.id);
    const newPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter(id => id !== permissionId)
      : [...currentPermissions, permissionId];

    setEditingRole({
      ...editingRole,
      permissions: permissions.filter(p => newPermissions.includes(p.id))
    });
  };

  const getPermissionsByCategory = () => {
    const grouped: { [category: string]: Permission[] } = {};
    permissions.forEach(permission => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = [];
      }
      grouped[permission.category].push(permission);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-immoo-gold"></div>
      </div>
    );
  }

  return (
    <RoleGuard requiredPermission="manage_roles">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-immoo-navy dark:text-immoo-pearl">
              Gestion des Rôles et Permissions
            </h1>
            <p className="text-immoo-navy/70 dark:text-immoo-pearl/70 mt-2">
              Gérez les rôles et leurs permissions dans le système
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchData} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </Button>
            <Button onClick={() => setCreatingRole(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouveau Rôle
            </Button>
          </div>
        </div>

        {/* Création d'un nouveau rôle */}
        {creatingRole && (
          <Card className="mb-8 border-immoo-gold/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-immoo-navy dark:text-immoo-pearl">
                <Plus className="w-5 h-5" />
                Créer un Nouveau Rôle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-immoo-navy/70 dark:text-immoo-pearl/70">
                    Nom du Rôle
                  </label>
                  <Input
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    placeholder="ex: Modérateur"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-immoo-navy/70 dark:text-immoo-pearl/70">
                    Description
                  </label>
                  <Textarea
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    placeholder="Description du rôle"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-immoo-navy/70 dark:text-immoo-pearl/70 mb-3 block">
                  Permissions
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                  {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-immoo-navy dark:text-immoo-pearl text-sm">
                        {category}
                      </h4>
                      {categoryPermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={newRole.permissions.includes(permission.id)}
                            onCheckedChange={() => {
                              const newPermissions = newRole.permissions.includes(permission.id)
                                ? newRole.permissions.filter(id => id !== permission.id)
                                : [...newRole.permissions, permission.id];
                              setNewRole({ ...newRole, permissions: newPermissions });
                            }}
                          />
                          <label
                            htmlFor={permission.id}
                            className="text-sm text-immoo-navy/70 dark:text-immoo-pearl/70 cursor-pointer"
                          >
                            {permission.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleCreateRole} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Créer le Rôle
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCreatingRole(false);
                    setNewRole({ name: '', description: '', permissions: [] });
                  }}
                >
                  <X className="w-4 h-4" />
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste des rôles existants */}
        <div className="grid gap-6">
          {roles.map((role) => (
            <Card key={role.id} className="border-immoo-gold/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-immoo-gold text-immoo-navy">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-immoo-navy dark:text-immoo-pearl">
                        {editingRole?.id === role.id ? (
                          <Input
                            value={editingRole.name}
                            onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                            className="w-48"
                          />
                        ) : (
                          role.name
                        )}
                      </CardTitle>
                      <p className="text-sm text-immoo-navy/70 dark:text-immoo-pearl/70">
                        {editingRole?.id === role.id ? (
                          <Textarea
                            value={editingRole.description}
                            onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                            className="w-96 mt-2"
                          />
                        ) : (
                          role.description
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {editingRole?.id === role.id ? (
                      <>
                        <Button onClick={handleUpdateRole} size="sm" className="flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          Sauvegarder
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingRole(null)}
                        >
                          <X className="w-4 h-4" />
                          Annuler
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingRole(role)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Modifier
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-immoo-navy/70" />
                    <span className="text-sm font-medium text-immoo-navy/70 dark:text-immoo-pearl/70">
                      Permissions ({role.permissions.length})
                    </span>
                  </div>

                  {editingRole?.id === role.id ? (
                    // Mode édition - afficher les permissions avec checkboxes
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                      {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => (
                        <div key={category} className="space-y-2">
                          <h4 className="font-medium text-immoo-navy dark:text-immoo-pearl text-sm">
                            {category}
                          </h4>
                          {categoryPermissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${role.id}-${permission.id}`}
                                checked={editingRole.permissions.some(p => p.id === permission.id)}
                                onCheckedChange={() => togglePermission(permission.id)}
                              />
                              <label
                                htmlFor={`${role.id}-${permission.id}`}
                                className="text-sm text-immoo-navy/70 dark:text-immoo-pearl/70 cursor-pointer"
                              >
                                {permission.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Mode affichage - afficher les permissions comme badges
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((permission) => (
                        <Badge key={permission.id} variant="secondary" className="text-xs">
                          {permission.name}
                        </Badge>
                      ))}
                      {role.permissions.length === 0 && (
                        <span className="text-sm text-immoo-navy/50 dark:text-immoo-pearl/50">
                          Aucune permission
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {roles.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-immoo-navy/30 mx-auto mb-4" />
            <p className="text-immoo-navy/60 dark:text-immoo-pearl/60">
              Aucun rôle configuré
            </p>
            <Button 
              onClick={() => setCreatingRole(true)} 
              className="mt-4"
            >
              Créer le premier rôle
            </Button>
          </div>
        )}
      </div>
    </RoleGuard>
  );
};

export default RolePermissionManager;
