import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Building2, Users, X } from 'lucide-react';
import AgencyLoginForm from '@/components/auth/AgencyLoginForm';
import BecomeAgencyForm from '@/components/auth/BecomeAgencyForm';
import VisitorContactForm from '@/components/visitor/VisitorContactForm';
import { useAuth } from '@/hooks/useAuth';

interface AuthPopupManagerProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'agency' | 'visitor' | null;
}

export default function AuthPopupManager({ isOpen, onClose, type }: AuthPopupManagerProps) {
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'contact'>('login');
  const { user } = useAuth();

  const handleSuccess = () => {
    onClose();
    setCurrentView('login');
    // Rediriger vers le dashboard après connexion réussie
    window.location.reload(); // Pour recharger et obtenir les nouvelles données utilisateur
  };

  const renderAgencyContent = () => {
    if (user) {
      // Si l'utilisateur est connecté, rediriger vers l'espace agence
      window.location.href = '/agencies';
      return null;
    }

    return (
      <div className="space-y-6">
        {currentView === 'login' ? (
          <AgencyLoginForm 
            onSuccess={handleSuccess}
            onSwitchMode={() => setCurrentView('signup')}
          />
        ) : (
          <BecomeAgencyForm 
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setCurrentView('login')}
          />
        )}
      </div>
    );
  };

  const renderVisitorContent = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-immoo-gold/10 rounded-full flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-immoo-gold" />
          </div>
          <h2 className="text-xl font-semibold text-immoo-navy mb-2">
            IMMOO Agency
          </h2>
          <p className="text-sm text-immoo-gray">
            Rejoignez notre communauté d'agences immobilières
          </p>
        </div>

        <div className="bg-gradient-to-br from-immoo-gold/5 to-immoo-navy/5 p-6 rounded-lg">
          <h3 className="font-semibold text-immoo-navy mb-3">Services disponibles :</h3>
          <ul className="space-y-2 text-sm text-immoo-gray">
            <li>• Gestion de portefeuille immobilier</li>
            <li>• Outils de marketing digital</li>
            <li>• Support client dédié</li>
            <li>• Formation et accompagnement</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={() => setCurrentView('signup')}
            className="flex-1 bg-immoo-gold hover:bg-immoo-gold/90"
          >
            Devenir Partenaire
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            En savoir plus
          </Button>
        </div>
      </div>
    );
  };

  if (!isOpen || !type) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">
            {type === 'agency' ? 'Connexion Agence' : 'Contact Visiteur'}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-4 top-4 p-0 h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="px-6 pb-6">
          {type === 'agency' ? renderAgencyContent() : renderVisitorContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
