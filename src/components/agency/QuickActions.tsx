import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Users, 
  FileText, 
  BarChart3,
  Settings,
  Calendar
} from 'lucide-react';

interface QuickActionsProps {
  agencyId: string;
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  agencyId,
  className = ""
}) => {
  const actions = [
    {
      title: 'Ajouter une propriété',
      description: 'Créer une nouvelle annonce',
      icon: Plus,
      href: `/agencies/${agencyId}/properties/create`,
      color: 'from-immoo-gold to-immoo-navy'
    },
    {
      title: 'Gérer les locataires',
      description: 'Voir tous les locataires',
      icon: Users,
      href: `/agencies/${agencyId}/tenants`,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Nouveau bail',
      description: 'Créer un contrat de location',
      icon: FileText,
      href: `/agencies/${agencyId}/leases/create`,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Statistiques',
      description: 'Voir les rapports',
      icon: BarChart3,
      href: `/agencies/${agencyId}/statistics`,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Paramètres',
      description: 'Configuration de l\'agence',
      icon: Settings,
      href: `/agencies/${agencyId}/settings`,
      color: 'from-gray-500 to-gray-600'
    },
    {
      title: 'Rendez-vous',
      description: 'Planifier une visite',
      icon: Calendar,
      href: `/agencies/${agencyId}/appointments`,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-immoo-gray/30 shadow-lg ${className}`}>
      <CardHeader className="bg-gradient-to-r from-immoo-navy/5 to-immoo-gold/5">
        <CardTitle className="text-xl text-immoo-navy flex items-center">
          <Plus className="h-5 w-5 mr-2 text-immoo-gold" />
          Actions rapides
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Button
              key={action.title}
              asChild
              variant="outline"
              className="h-auto p-4 border-immoo-gray/30 hover:shadow-lg transition-all duration-300 group"
            >
              <Link to={action.href}>
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`bg-gradient-to-r ${action.color} p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-immoo-navy text-sm">
                      {action.title}
                    </p>
                    <p className="text-xs text-immoo-gray mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;