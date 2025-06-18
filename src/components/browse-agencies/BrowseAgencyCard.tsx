import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Star, Users, ArrowRight, Eye, Shield } from 'lucide-react';
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
  const [isHovered, setIsHovered] = useState(false);
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
      <Card 
        className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-gray-200 hover:border-immoo-gold/30 transition-all duration-500 hover:shadow-xl hover:shadow-immoo-gold/10 hover:-translate-y-1 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleViewAgency}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-immoo-gold/5 via-transparent to-immoo-navy/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardHeader className="relative pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo Container */}
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-immoo-gold/10 to-immoo-navy/10 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                  {agency.logoUrl ? (
                    <img 
                      src={agency.logoUrl} 
                      alt={agency.name}
                      className="w-10 h-10 object-cover rounded-lg"
                    />
                  ) : (
                    <Building2 className="h-7 w-7 text-immoo-gold" />
                  )}
                </div>
                {/* Verified Badge */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-immoo-navy transition-colors duration-300">
                  {agency.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Agence immobilière professionnelle
                </p>
              </div>
            </div>
            
            {/* Subscription Badge */}
            {agency.subscription?.plan && (
              <Badge 
                variant={agency.subscription.plan.price === 0 ? "secondary" : "default"}
                className={`${
                  agency.subscription.plan.price === 0 
                    ? "bg-gray-100 text-gray-700" 
                    : "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                } shadow-sm`}
              >
                {agency.subscription.plan.name}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="relative pt-0">
          {/* Agency Info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-3 text-immoo-gold" />
              <span>Bamako, Mali</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-3 text-immoo-gold" />
              <span>Équipe professionnelle</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Star className="h-4 w-4 mr-3 text-yellow-500 fill-current" />
              <span>Nouveau partenaire</span>
              <div className="flex ml-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className="w-3 h-3 text-yellow-400 fill-current" 
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          <Button 
            variant="outline" 
            className="w-full group/btn bg-white/50 border-gray-200 hover:bg-immoo-gold hover:border-immoo-gold hover:text-white transition-all duration-300 py-2.5"
            onClick={handleViewAgency}
            disabled={isLoading}
          >
            <div className="flex items-center justify-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="font-medium">
                {isLoading ? "Chargement..." : "Découvrir l'agence"}
              </span>
              <ArrowRight className={`h-4 w-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
            </div>
          </Button>
          
          {/* Hover Effect Indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-immoo-gold to-immoo-navy transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
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
