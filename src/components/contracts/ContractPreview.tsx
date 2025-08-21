import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  Calendar, 
  Building, 
  MapPin, 
  Download,
  Eye,
  Edit3,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Archive,
  Trash2,
  Link as LinkIcon
} from 'lucide-react';

interface ContractPreviewProps {
  contract: {
    id: string;
    contract_type: string; // Changed from 'type'
    status: string;
    terms: string; // Changed from 'content'
    created_at: string;
    updated_at: string;
    property_id?: string;
    client_id?: string; // Changed from 'tenant_id'
    start_date?: string;
    end_date?: string;
    value?: number;
    // Optional fields that might not exist in the DB
    title?: string;
    jurisdiction?: string;
    parties?: Record<string, any>;
    details?: Record<string, any>;
    lease?: {
      start_date: string;
      end_date: string;
      monthly_rent: number;
      tenants?: {
        first_name: string;
        last_name: string;
      };
      properties?: {
        title: string;
        location: string;
      };
    };
  };
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onExport?: () => void;
  onAssignToLease?: () => void;
  showActions?: boolean;
}

export default function ContractPreview({
  contract,
  onEdit,
  onView,
  onDelete,
  onArchive,
  onExport,
  onAssignToLease,
  showActions = true
}: ContractPreviewProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, icon: AlertTriangle, label: 'Brouillon' },
      validated: { variant: 'default' as const, icon: CheckCircle, label: 'Validé' },
      closed: { variant: 'default' as const, icon: CheckCircle, label: 'Fermé' },
      archived: { variant: 'outline' as const, icon: Archive, label: 'Archivé' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    const typeLabels = {
      bail: 'Bail de location',
      vente: 'Contrat de vente',
      mandat: 'Mandat de gestion',
      prestation: 'Contrat de prestation',
      autre: 'Autre'
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
                         <CardTitle className="flex items-center gap-2 mb-2">
               <FileText className="h-5 w-5 text-blue-600" />
               {contract.title || `Contrat ${contract.contract_type}`}
             </CardTitle>
             <div className="flex items-center gap-2 mb-2">
               {getStatusBadge(contract.status)}
               <Badge variant="outline">
                 {getTypeLabel(contract.contract_type)}
               </Badge>
             </div>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-1">
              {contract.status !== 'closed' && contract.status !== 'archived' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={onView}
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informations de base */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="flex items-center gap-2">
             <MapPin className="h-4 w-4 text-gray-500" />
             <span className="text-sm text-gray-600">{contract.jurisdiction || 'Non spécifié'}</span>
           </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Créé le {formatDate(contract.created_at)}
            </span>
          </div>
        </div>

        {/* Bail associé */}
        {contract.lease && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Bail associé</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Locataire:</span>
                <span className="ml-1 font-medium">
                  {contract.lease.tenants?.first_name} {contract.lease.tenants?.last_name}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Propriété:</span>
                <span className="ml-1 font-medium">{contract.lease.properties?.title}</span>
              </div>
              <div>
                <span className="text-gray-600">Loyer:</span>
                <span className="ml-1 font-medium">
                  {contract.lease.monthly_rent?.toLocaleString('fr-FR')} FCFA/mois
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Aperçu du contenu */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Aperçu du contenu</h4>
                     <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
             {truncateContent(stripHtmlTags(contract.terms))}
           </div>
        </div>

        {/* Parties impliquées */}
        {contract.parties && Object.keys(contract.parties).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Parties impliquées</h4>
            <div className="flex flex-wrap gap-2">
              {Object.keys(contract.parties).map((party) => (
                <Badge key={party} variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {party}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions secondaires */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
                             {!contract.property_id && onAssignToLease && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAssignToLease}
                  className="flex items-center gap-1"
                >
                  <LinkIcon className="h-3 w-3" />
                  Attribuer à un bail
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {contract.status !== 'archived' && onArchive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onArchive}
                  className="flex items-center gap-1"
                >
                  <Archive className="h-3 w-3" />
                  Archiver
                </Button>
              )}
              
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                  Supprimer
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 