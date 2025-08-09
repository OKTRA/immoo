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
import { Badge } from '@/components/ui/badge';
import { 
  Search, Filter, Building2, CheckCircle, 
  XCircle, ChevronDown, Star, Loader2, RefreshCw,
  ChevronLeft, ChevronRight, Eye, EyeOff
} from 'lucide-react';
import { useAgenciesManagement } from '@/hooks/useAgenciesManagement';
import { AgencyActionsManager } from './AgencyActionsManager';

export default function AgenciesManagement() {
  const { 
    agencies, 
    isLoading, 
    searchTerm, 
    setSearchTerm,
    verificationFilter,
    setVerificationFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    totalCount,
    totalPages,
    deleteAgency,
    refreshAgencies 
  } = useAgenciesManagement();

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
        <h1 className="text-3xl font-bold">Gestion des Agences</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAgencies}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
          <Button>
            <Building2 className="h-4 w-4 mr-2" />
            Nouvelle Agence
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher une agence..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={verificationFilter}
              onValueChange={setVerificationFilter}
            >
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Vérification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="verified">Vérifiées</SelectItem>
                <SelectItem value="unverified">Non vérifiées</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={setSortBy}
            >
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date de création</SelectItem>
                <SelectItem value="name">Nom</SelectItem>
                <SelectItem value="properties_count">Nb propriétés</SelectItem>
                <SelectItem value="rating">Note</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Agences ({totalCount})</CardTitle>
          <CardDescription>
            Gérez toutes les agences immobilières sur la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agencies.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Propriétés</TableHead>
                    <TableHead>Évaluation</TableHead>
                    <TableHead>Vérification</TableHead>
                    <TableHead>Visibilité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agencies.map((agency) => (
                    <TableRow key={agency.id}>
                      <TableCell className="font-medium">{agency.name}</TableCell>
                      <TableCell>{agency.location}</TableCell>
                      <TableCell>{agency.properties_count}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                          <span>{Number(agency.rating ?? 0).toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {agency.verified ? (
                          <div className="flex items-center text-green-500">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span>Vérifiée</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-500">
                            <XCircle className="h-4 w-4 mr-1" />
                            <span>Non vérifiée</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {agency.is_visible !== false ? (
                          <div className="flex items-center text-green-500">
                            <Eye className="h-4 w-4 mr-1" />
                            <span>Visible</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-orange-500">
                            <EyeOff className="h-4 w-4 mr-1" />
                            <span>Masquée</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {agency.status === 'suspended' ? (
                          <Badge variant="destructive">Suspendue</Badge>
                        ) : (
                          <Badge variant="default">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>{agency.created_at}</TableCell>
                      <TableCell className="text-right">
                        <AgencyActionsManager
                          agency={agency}
                          onAgencyUpdate={refreshAgencies}
                          onAgencyDelete={deleteAgency}
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
                    Page {currentPage} sur {totalPages} ({totalCount} agences)
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
              {searchTerm || verificationFilter !== 'all' 
                ? 'Aucune agence trouvée pour ces critères' 
                : 'Aucune agence enregistrée'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
