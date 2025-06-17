import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Building, Users, CreditCard, FileText } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'property' | 'tenant' | 'payment' | 'lease';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'warning';
}

interface ActivityFeedProps {
  activities?: ActivityItem[];
  className?: string;
}

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'property':
      return Building;
    case 'tenant':
      return Users;
    case 'payment':
      return CreditCard;
    case 'lease':
      return FileText;
    default:
      return Activity;
  }
};

const getStatusColor = (status: ActivityItem['status']) => {
  switch (status) {
    case 'success':
      return 'bg-green-500';
    case 'pending':
      return 'bg-immoo-gold';
    case 'warning':
      return 'bg-orange-500';
    default:
      return 'bg-immoo-gray';
  }
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities = [],
  className = ""
}) => {
  const defaultActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'property',
      title: 'Nouvelle propriété ajoutée',
      description: 'Appartement 3 pièces - Rue de la Paix',
      timestamp: 'Il y a 2 heures',
      status: 'success'
    },
    {
      id: '2',
      type: 'lease',
      title: 'Bail signé',
      description: 'Contrat de location pour M. Dupont',
      timestamp: 'Il y a 4 heures',
      status: 'success'
    },
    {
      id: '3',
      type: 'payment',
      title: 'Paiement reçu',
      description: 'Loyer de janvier - 850€',
      timestamp: 'Il y a 1 jour',
      status: 'success'
    }
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  return (
    <Card className={`bg-white/95 backdrop-blur-sm border-immoo-gray/30 shadow-lg ${className}`}>
      <CardHeader className="bg-gradient-to-r from-immoo-navy/5 to-immoo-gold/5">
        <CardTitle className="text-xl text-immoo-navy flex items-center">
          <Activity className="h-5 w-5 mr-2 text-immoo-gold" />
          Activité récente
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {displayActivities.map((activity) => {
            const IconComponent = getActivityIcon(activity.type);
            const statusColor = getStatusColor(activity.status);
            
            return (
              <div 
                key={activity.id}
                className="flex items-start gap-4 p-4 bg-immoo-pearl/20 rounded-xl hover:bg-immoo-pearl/30 transition-colors"
              >
                <div className="flex-shrink-0 relative">
                  <div className="bg-white p-2 rounded-lg shadow-sm border border-immoo-gray/20">
                    <IconComponent className="h-4 w-4 text-immoo-navy" />
                  </div>
                  <div className={`absolute -top-1 -right-1 w-3 h-3 ${statusColor} rounded-full border-2 border-white`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-immoo-navy">
                    {activity.title}
                  </p>
                  <p className="text-sm text-immoo-navy/70 mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-immoo-navy/50 mt-2">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;