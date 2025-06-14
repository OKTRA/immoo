
import React from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { 
  Search, Filter, MoreHorizontal, Building2, CheckCircle, 
  XCircle, ChevronDown, Star, Loader2, RefreshCw, Trash, Eye,
  ChevronLeft, ChevronRight, Shield, AlertTriangle
} from 'lucide-react';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAgenciesManagement } from '@/hooks/useAgenciesManagement';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
    toggleVerification, 
    deleteAgency,
    refreshAgencies 
  } = useAgenciesManagement();

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleDelete = async (agencyId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette agence ?')) {
      await deleteAgency(agencyId);
    }
  };

  const handleUpdateRating = async (agency: any, newRating: number) => {
    setActionLoading(agency.id);
    try {
      const { error } = await supabase
        .from('agencies')
        .update({ 
          rating: newRating,
          updated_at: new Date().toISOString()
        })
        .eq('id', agency.id);

      if (error) throw error;

      toast.success('Note mise à jour avec succès');
      refreshAgencies();
    } catch (error) {
      console.error('Error updating rating:', error);
      toast.error('Erreur lors de la mise à jour de la note');
    } finally {
      setActionLoading(null);
    }
  };

  const getAgencyStatusBadge = (agency: any) => {
    if (agency.verified) {
      return <Badge variant="success" className="flex items-center gap-1">
        <Shield className="h-3 w-3" />
        Vérifiée
      </Badge>;
    }
    return <Badge variant="outline" className="flex items-center gap-1">
      <AlertTriangle className="h-3 w-3" />
      En attente
    </Badge>;
  };

  const RatingEditor = ({ agency }: { agency: any }) => {
    const [editing, setEditing] = useState(false);
    const [tempRating, setTempRating] = useState(agency.rating);

    if (editing) {
      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={tempRating}
            onChange={(e) => setTempRating(parseFloat(e.target.value))}
            className="w-16 px-2 py-1 border rounded text-sm"
          />
          <Button
            size="sm"
            onClick={() => {
              handleUpdateRating(agency, tempRating);
              setEditing(false);
            }}
          >
            ✓
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setTempRating(agency.rating);
              setEditing(false);
            }}
          >
            ✗
          </Button>
        </div>
      );
    }

    return (
      <div 
        className="flex items-center cursor-pointer hover:bg-muted p-1 rounded"
        onClick={() => setEditing(true)}
      >
        <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
        <span>{agency.rating.toFixed(1)}</span>
      </div>
    );
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
                <SelectValue placeholder="Statut" />
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
                    <TableHead>Statut</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agencies.map((agency) => (
                    <TableRow key={agency.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {agency.name}
                          {agency.verified && (
                            <Badge variant="success" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Vérifié
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{agency.location}</TableCell>
                      <TableCell>{agency.properties_count}</TableCell>
                      <TableCell>
                        <RatingEditor agency={agency} />
                      </TableCell>
                      <TableCell>
                        {getAgencyStatusBadge(agency)}
                      </TableCell>
                      <TableCell>{agency.created_at}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              disabled={actionLoading === agency.id}
                            >
                              {actionLoading === agency.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem>Modifier</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              onClick={() => toggleVerification(agency.id, agency.verified)}
                              className={agency.verified ? "text-yellow-500" : "text-green-500"}
                            >
                              {agency.verified ? (
                                <>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Retirer vérification
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Vérifier
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-500"
                              onClick={() => handleDelete(agency.id)}
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
