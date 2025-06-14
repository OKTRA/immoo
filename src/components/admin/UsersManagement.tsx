import React, { useState } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { 
  Search, MoreHorizontal, UserPlus, Check, X, Loader2, Shield,
  Eye, Trash, Phone, Mail, MapPin, Clock, Globe,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useUsersManagement } from '@/hooks/useUsersManagement';

import { UserActionsManager } from './UserActionsManager';
import { PromoteUserDialog } from './PromoteUserDialog';

export default function UsersManagement() {
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  
  const { 
    users, 
    isLoading, 
    searchTerm, 
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    userTypeFilter,
    setUserTypeFilter,
    currentPage,
    setCurrentPage,
    totalCount,
    totalPages,
    toggleUserStatus,
    deleteUser,
    refreshUsers 
  } = useUsersManagement();

  const handleDelete = async (userId: string, userType: string) => {
    await deleteUser(userId, userType);
  };

  const handleToggleStatus = async (userId: string, currentStatus: string, userType: string) => {
    await toggleUserStatus(userId, currentStatus, userType);
  };

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshUsers}
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Actualiser
          </Button>
          <Button onClick={() => setShowPromoteDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Promouvoir en Admin
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un utilisateur..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={userTypeFilter}
              onValueChange={setUserTypeFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type d'utilisateur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="visitor">Visiteurs</SelectItem>
                <SelectItem value="admin">Administrateurs</SelectItem>
                <SelectItem value="agency">Agences</SelectItem>
                <SelectItem value="proprietaire">Propriétaires</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={roleFilter}
              onValueChange={setRoleFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="proprietaire">Propriétaire</SelectItem>
                <SelectItem value="visiteur">Visiteur</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs ({totalCount})</CardTitle>
          <CardDescription>
            Gérez tous les utilisateurs, visiteurs et administrateurs de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rôle/Agence</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Dernière activité</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{user.name}</div>
                          {user.user_type === 'visitor' && user.ip_address && (
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <Globe className="h-3 w-3 mr-1" />
                              {user.ip_address}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="h-3 w-3 mr-1" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getUserTypeBadge(user.user_type)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium">{user.role}</div>
                          {user.agency_name && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              {user.agency_name}
                            </div>
                          )}
                          {user.isAdmin && user.adminRole && (
                            <div className="flex items-center text-xs text-green-600 font-medium">
                              <Shield className="h-3 w-3 mr-1" />
                              {user.adminRole}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                          <span>Actif</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Inscrit: {user.joinDate}</div>
                          {user.last_seen_at && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              Vu: {user.last_seen_at}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <UserActionsManager
                          user={user}
                          onUserUpdate={refreshUsers}
                          onUserDelete={handleDelete}
                          onToggleStatus={handleToggleStatus}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} sur {totalPages} ({totalCount} utilisateurs)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || roleFilter !== 'all' || userTypeFilter !== 'all'
                ? 'Aucun utilisateur trouvé pour ces critères' 
                : 'Aucun utilisateur enregistré'
              }
            </div>
          )}
        </CardContent>
      </Card>

      <PromoteUserDialog
        isOpen={showPromoteDialog}
        onClose={() => setShowPromoteDialog(false)}
        onUserPromoted={refreshUsers}
      />
    </>
  );
}
