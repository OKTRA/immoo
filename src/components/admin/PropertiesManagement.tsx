
import React from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { 
  Search, Filter, MoreHorizontal, Home, MapPin,
  Eye, Edit, Trash, Loader2, RefreshCw
} from 'lucide-react';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { usePropertiesManagement } from '@/hooks/usePropertiesManagement';

export default function PropertiesManagement() {
  const { 
    properties, 
    isLoading, 
    searchTerm, 
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    updatePropertyStatus,
    deleteProperty,
    refreshProperties 
  } = usePropertiesManagement();

  const handleStatusChange = async (propertyId: string, newStatus: string) => {
    await updatePropertyStatus(propertyId, newStatus);
  };

  const handleDelete = async (propertyId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette propriété ?')) {
      await deleteProperty(propertyId);
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
        <h1 className="text-3xl font-bold">Gestion des Propriétés</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshProperties}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
          <Button>
            <Home className="h-4 w-4 mr-2" />
            Ajouter une Propriété
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher une propriété..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="rented">Loué</SelectItem>
                <SelectItem value="sold">Vendu</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={typeFilter}
              onValueChange={setTypeFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="apartment">Appartement</SelectItem>
                <SelectItem value="house">Maison</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="land">Terrain</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Propriétés ({properties.length})</CardTitle>
          <CardDescription>
            Gérez toutes les propriétés sur la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          {properties.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Agence</TableHead>
                  <TableHead>Superficie</TableHead>
                  <TableHead>Chambres</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">{property.title}</TableCell>
                    <TableCell className="capitalize">{property.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span>{property.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(property.price)}</TableCell>
                    <TableCell>
                      {property.status === 'available' && (
                        <Badge variant="default" className="bg-green-500">Disponible</Badge>
                      )}
                      {property.status === 'rented' && (
                        <Badge variant="default" className="bg-blue-500">Loué</Badge>
                      )}
                      {property.status === 'sold' && (
                        <Badge variant="default" className="bg-purple-500">Vendu</Badge>
                      )}
                      {property.status === 'pending' && (
                        <Badge variant="default" className="bg-yellow-500">En attente</Badge>
                      )}
                      {!['available', 'rented', 'sold', 'pending'].includes(property.status) && (
                        <Badge variant="outline">{property.status}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{property.agency_name}</TableCell>
                    <TableCell>{property.area} m²</TableCell>
                    <TableCell>{property.bedrooms}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {property.status === 'available' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(property.id, 'rented')}
                              className="text-blue-500"
                            >
                              Marquer comme loué
                            </DropdownMenuItem>
                          )}
                          {property.status === 'rented' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(property.id, 'available')}
                              className="text-green-500"
                            >
                              Marquer comme disponible
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(property.id, 'pending')}
                            className="text-yellow-500"
                          >
                            Mettre en attente
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-500"
                            onClick={() => handleDelete(property.id)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                ? 'Aucune propriété trouvée pour ces critères' 
                : 'Aucune propriété enregistrée'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
