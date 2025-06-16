
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Star, Users } from 'lucide-react';

interface AgencyWithSubscription {
  id: string;
  name: string;
  logoUrl?: string;
  subscription?: {
    plan?: {
      name: string;
      price: number;
    };
  };
}

interface BrowseAgencyCardProps {
  agency: AgencyWithSubscription;
}

export const BrowseAgencyCard: React.FC<BrowseAgencyCardProps> = ({ agency }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              {agency.logoUrl ? (
                <img 
                  src={agency.logoUrl} 
                  alt={agency.name}
                  className="w-8 h-8 object-cover rounded"
                />
              ) : (
                <Building2 className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{agency.name}</CardTitle>
            </div>
          </div>
          
          {agency.subscription?.plan && (
            <Badge 
              variant={agency.subscription.plan.price === 0 ? "secondary" : "default"}
              className={agency.subscription.plan.price === 0 ? "" : "bg-gradient-to-r from-purple-600 to-blue-600"}
            >
              {agency.subscription.plan.name}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span>Localisation non spécifiée</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            <span>Équipe professionnelle</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Star className="h-4 w-4 mr-2 text-yellow-500" />
            <span>Nouveau sur la plateforme</span>
          </div>
        </div>
        
        <div className="mt-4">
          <Button asChild variant="outline" className="w-full">
            <Link to={`/agencies/${agency.id}`}>
              Voir l'agence
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
