import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { getAllUsersWithRoles, updateUserRole } from '@/services/authService';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Crown, Building2, Shield, Eye, User, RefreshCw } from 'lucide-react';

interface UserWithRole {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

const UserRoleManagement: React.FC = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const roleConfig = {
    admin: { label: 'Administrateur', icon: Crown, color: 'bg-red-500' },
    agency: { label: 'Agence', icon: Building2, color: 'bg-blue-500' },
    owner: { label: 'Propriétaire', icon: Shield, color: 'bg-green-500' },
    public: { label: 'Visiteur', icon: Eye, color: 'bg-gray-500' }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { users: fetchedUsers, error } = await getAllUsersWithRoles();
      
      if (error) {
        toast.error(`Erreur lors du chargement des utilisateurs: ${error}`);
        return;
      }
      
      setUsers(fetchedUsers || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      setUpdating(userId);
      const { success, error } = await updateUserRole(userId, newRole);
      
      if (error) {
        toast.error(`Erreur lors de la mise à jour: ${error}`);
        return;
      }
      
      if (success) {
        toast.success('Rôle mis à jour avec succès');
        // Mettre à jour la liste locale
        setUsers(prev => prev.map(user => 
          user.user_id === userId ? { ...user, role: newRole } : user
        ));
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du rôle');
    } finally {
      setUpdating(null);
    }
  };

  const getRoleIcon = (role: string) => {
    const config = roleConfig[role as keyof typeof roleConfig];
    if (!config) return <User className="w-4 h-4" />;
    
    const IconComponent = config.icon;
    return <IconComponent className="w-4 h-4" />;
  };

  const getRoleColor = (role: string) => {
    const config = roleConfig[role as keyof typeof roleConfig];
    return config?.color || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-immoo-gold"></div>
      </div>
    );
  }

  return (
    <RoleGuard requiredRole="admin">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-immoo-navy dark:text-immoo-pearl">
              Gestion des Rôles Utilisateurs
            </h1>
            <p className="text-immoo-navy/70 dark:text-immoo-pearl/70 mt-2">
              Gérez les rôles et permissions des utilisateurs de la plateforme
            </p>
          </div>
          <Button onClick={fetchUsers} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
        </div>

        <div className="grid gap-6">
          {users.map((user) => (
            <Card key={user.id} className="border-immoo-gold/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getRoleColor(user.role)} text-white`}>
                      {getRoleIcon(user.role)}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-immoo-navy dark:text-immoo-pearl">
                        {user.first_name} {user.last_name}
                      </CardTitle>
                      <p className="text-sm text-immoo-navy/70 dark:text-immoo-pearl/70">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${getRoleColor(user.role)} text-white`}>
                    {roleConfig[user.role as keyof typeof roleConfig]?.label || user.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-immoo-navy/60 dark:text-immoo-pearl/60">
                      <strong>ID Utilisateur:</strong> {user.user_id}
                    </p>
                    <p className="text-sm text-immoo-navy/60 dark:text-immoo-pearl/60">
                      <strong>Créé le:</strong> {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-sm text-immoo-navy/60 dark:text-immoo-pearl/60">
                      <strong>Dernière mise à jour:</strong> {new Date(user.updated_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-immoo-navy/70 dark:text-immoo-pearl/70">
                      Nouveau rôle:
                    </span>
                    <Select
                      value={user.role}
                      onValueChange={(newRole) => handleRoleUpdate(user.user_id, newRole)}
                      disabled={updating === user.user_id}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roleConfig).map(([roleKey, roleInfo]) => (
                          <SelectItem key={roleKey} value={roleKey}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${roleInfo.color}`} />
                              {roleInfo.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {updating === user.user_id && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-immoo-gold"></div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-immoo-navy/60 dark:text-immoo-pearl/60">
              Aucun utilisateur trouvé
            </p>
          </div>
        )}
      </div>
    </RoleGuard>
  );
};

export default UserRoleManagement;
