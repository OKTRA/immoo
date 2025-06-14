
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck, X, Clock } from 'lucide-react';

interface WelcomeBackMessageProps {
  recognitionMethod: string;
  daysSinceLastVisit?: number;
  onDismiss: () => void;
}

export default function WelcomeBackMessage({ 
  recognitionMethod, 
  daysSinceLastVisit,
  onDismiss 
}: WelcomeBackMessageProps) {
  const getRecognitionMessage = () => {
    switch (recognitionMethod) {
      case 'email':
        return 'Nous vous avons reconnu grâce à votre adresse email';
      case 'phone':
        return 'Nous vous avons reconnu grâce à votre numéro de téléphone';
      case 'fingerprint':
        return 'Nous vous avons reconnu grâce à votre navigateur';
      default:
        return 'Nous vous avons reconnu automatiquement';
    }
  };

  const getLastVisitMessage = () => {
    if (!daysSinceLastVisit) return '';
    
    if (daysSinceLastVisit === 0) {
      return 'Vous êtes revenu aujourd\'hui';
    } else if (daysSinceLastVisit === 1) {
      return 'Votre dernière visite était hier';
    } else if (daysSinceLastVisit < 7) {
      return `Votre dernière visite était il y a ${daysSinceLastVisit} jours`;
    } else if (daysSinceLastVisit < 30) {
      const weeks = Math.floor(daysSinceLastVisit / 7);
      return `Votre dernière visite était il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
    } else {
      const months = Math.floor(daysSinceLastVisit / 30);
      return `Votre dernière visite était il y a ${months} mois`;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm animate-fade-in">
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
                  Bon retour parmi nous ! 👋
                </h3>
                
                <p className="text-xs text-green-700 dark:text-green-300 mb-1">
                  {getRecognitionMessage()}
                </p>
                
                {daysSinceLastVisit !== undefined && (
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <Clock className="w-3 h-3" />
                    <span>{getLastVisitMessage()}</span>
                  </div>
                )}
                
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  Vous avez maintenant accès aux informations de contact.
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 text-green-600 hover:text-green-800 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-200 dark:hover:bg-green-900/30"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
