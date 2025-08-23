import React, { memo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationInfo, PaginationContainer } from '@/components/ui/pagination';
import { useAdminUsers } from '@/hooks/usePaginatedQuery';
import { Search, Loader2, MoreHorizontal, UserCheck, UserX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

const OptimizedUserManagement = memo(function OptimizedUserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);

  const {
    data: users,
    total,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    goToPage,
    nextPage,
    previousPage
  } = useAdminUsers({ pageSize });

  // Filtrer les utilisateurs côté client pour la recherche rapide
  const filteredUsers = users?.filter(user => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  }) || [];

  if (isLoading && !users) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des utilisateurs</CardTitle>
        <CardDescription>
          Gérez les comptes utilisateurs et leurs permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Barre de recherche et contrôles */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des utilisateurs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value={10}>10 par page</option>
              <option value={25}>25 par page</option>
              <option value={50}>50 par page</option>
            </select>
          </div>
        </div>

        <PaginationContainer
          pagination={
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          }
          info={
            <PaginationInfo
              currentPage={currentPage}
              pageSize={pageSize}
              total={total}
            />
          }
        >
          {/* Tableau des utilisateurs */}
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))}
              </TableBody>
            </Table>

            {filteredUsers.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
              </div>
            )}
          </div>
        </PaginationContainer>
      </CardContent>
    </Card>
  );
});

// Composant mémorisé pour une ligne d'utilisateur
const UserRow = memo(function UserRow({ user }: { user: User }) {
  const displayName = user.first_name && user.last_name 
    ? `${user.first_name} ${user.last_name}` 
    : user.email;

  const roleColor = {
    admin: 'destructive',
    agency: 'default',
    user: 'secondary',
    visitor: 'outline'
  }[user.role] || 'secondary';

  return (
    <TableRow>
      <TableCell className="font-medium">{displayName}</TableCell>
      <TableCell className="text-muted-foreground">{user.email}</TableCell>
      <TableCell>
        <Badge variant={roleColor as any}>
          {user.role}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDistanceToNow(new Date(user.created_at), { 
          addSuffix: true, 
          locale: fr 
        })}
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm">
            <UserCheck className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <UserX className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

export default OptimizedUserManagement;
