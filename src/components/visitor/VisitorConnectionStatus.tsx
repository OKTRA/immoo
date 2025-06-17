import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Mail, Phone, Clock } from 'lucide-react';
import { useVisitorSession } from '@/hooks/useVisitorSession';
import { toast } from '@/hooks/use-toast';

interface VisitorConnectionStatusProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export default function VisitorConnectionStatus({
  className = '',
  showDetails = true,
  compact = false
}: VisitorConnectionStatusProps) {
  const { session, isConnected, logout, getContactInfo, getSessionDuration } = useVisitorSession();

  if (!isConnected || !session) {
    return null;
  }

  const contactInfo = getContactInfo();
  const duration = getSessionDuration();

  const handleLogout = () => {
    logout();
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté de votre session visiteur.",
      variant: "default"
    });
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Badge variant="secondary" className="flex items-center space-x-2 px-3 py-1">
          <User className="w-3 h-3" />
          <span className="text-xs">Connecté</span>
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="h-6 w-6 p-0"
        >
          <LogOut className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <Card className={`bg-green-50 border-green-200 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
                  Connecté
                </Badge>
                <span className="text-xs text-green-600 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {duration < 60 ? `${duration}min` : `${Math.floor(duration / 60)}h ${duration % 60}min`}
                </span>
              </div>
              
              {showDetails && contactInfo && (
                <div className="space-y-1">
                  {contactInfo.name && (
                    <p className="text-sm font-medium text-gray-900">
                      {contactInfo.name}
                    </p>
                  )}
                  
                  <div className="flex flex-col space-y-1">
                    {contactInfo.email && (
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <Mail className="w-3 h-3" />
                        <span>{contactInfo.email}</span>
                      </div>
                    )}
                    
                    {contactInfo.phone && (
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <Phone className="w-3 h-3" />
                        <span>{contactInfo.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-green-700">
                    Vous avez accès aux informations de contact des agences
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-green-700 hover:text-green-800 hover:bg-green-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 