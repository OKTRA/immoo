import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus, 
  List, 
  Edit3, 
  Eye, 
  Download, 
  Archive,
  Users,
  Calendar,
  Building,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

interface ContractNavigationProps {
  currentContractId?: string;
  contractStatus?: string;
  onNewContract?: () => void;
  onViewList?: () => void;
  onEdit?: () => void;
  onExport?: () => void;
  onArchive?: () => void;
}

export default function ContractNavigation({
  currentContractId,
  contractStatus,
  onNewContract,
  onViewList,
  onEdit,
  onExport,
  onArchive
}: ContractNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isInEditor = location.pathname.includes('/contracts/') && currentContractId;
  const isInList = location.pathname === '/contracts';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <AlertTriangle className="h-4 w-4" />;
      case 'validated':
        return <CheckCircle className="h-4 w-4" />;
      case 'signed':
        return <CheckCircle className="h-4 w-4" />;
      case 'archived':
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Brouillon';
      case 'validated':
        return 'Validé';
      case 'signed':
        return 'Signé';
      case 'archived':
        return 'Archivé';
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary' as const;
      case 'validated':
        return 'default' as const;
      case 'signed':
        return 'default' as const;
      case 'archived':
        return 'outline' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <div className="space-y-4">
      {/* Navigation principale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gestion des contrats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={isInList ? 'default' : 'outline'}
              onClick={() => navigate('/contracts')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              Liste des contrats
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/contracts/new')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouveau contrat
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions contextuelles */}
      {isInEditor && contractStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Actions du contrat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Statut actuel */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Statut:</span>
                <Badge variant={getStatusVariant(contractStatus)} className="flex items-center gap-1">
                  {getStatusIcon(contractStatus)}
                  {getStatusLabel(contractStatus)}
                </Badge>
              </div>

              {/* Actions disponibles */}
              <div className="flex flex-wrap gap-2">
                {contractStatus !== 'signed' && contractStatus !== 'archived' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Modifier
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExport}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exporter
                </Button>
                
                {contractStatus !== 'archived' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onArchive}
                    className="flex items-center gap-2"
                  >
                    <Archive className="h-4 w-4" />
                    Archiver
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Vue d'ensemble
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-600">Contrats actifs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-gray-600">Signés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">3</div>
              <div className="text-sm text-gray-600">En attente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">1</div>
              <div className="text-sm text-gray-600">Archivés</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liens rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Accès rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/contracts?status=draft')}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Contrats en brouillon
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/contracts?status=validated')}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Contrats validés
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/contracts?status=signed')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Contrats signés
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/contracts?status=archived')}
            >
              <Archive className="h-4 w-4 mr-2" />
              Contrats archivés
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 