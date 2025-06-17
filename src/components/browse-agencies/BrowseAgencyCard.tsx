import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Star, Users } from 'lucide-react';
import QuickVisitorLogin from '@/components/visitor/QuickVisitorLogin';
import { useQuickVisitorAccess } from '@/hooks/useQuickVisitorAccess';

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
  const navigate = useNavigate();
  const [showMiniLogin, setShowMiniLogin] = useState(false);
  const { isLoggedIn, isLoading } = useQuickVisitorAccess();

  const handleViewAgency = (e: React.MouseEvent) => {
    e.preventDefault();
    
    console.log('🏢 handleViewAgency called:', { 
      agencyName: agency.name,
      isLoggedIn, 
      isLoading 
    });
    
    // If visitor is not logged in, show mini login
    if (!isLoggedIn) {
      console.log('🏢 Opening mini login for agency access');
      setShowMiniLogin(true);
    } else {
      console.log('🏢 Navigating to public agency page directly');
      // Navigate to public agency page, not the private management page
      navigate(`/public-agency/${agency.id}`);
    }
  };

  const handleMiniLoginSuccess = (visitorData: any) => {
    // After successful login, navigate to public agency page
    console.log('✅ Quick login successful, navigating to public agency page:', visitorData);
    setShowMiniLogin(false);
    navigate(`/public-agency/${agency.id}`);
  };

  const handleCloseLogin = () => {
    setShowMiniLogin(false);
  };

  return (
    <>
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
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleViewAgency}
              disabled={isLoading}
            >
              {isLoading ? "Chargement..." : "Voir l'agence"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Visitor Login */}
      {showMiniLogin && (
        <QuickVisitorLogin
          isOpen={showMiniLogin}
          onClose={handleCloseLogin}
          onSuccess={handleMiniLoginSuccess}
        />
      )}
    </>
  );
};
