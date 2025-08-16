import React from 'react';
import MobileAuthTest from '@/components/test/MobileAuthTest';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MobileAuthTestPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec navigation */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Test d'Authentification Mobile</h1>
              <p className="text-sm text-muted-foreground">
                Validation de la synchronisation d'authentification entre web et mobile
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="py-6">
        <MobileAuthTest />
      </div>
    </div>
  );
};

export default MobileAuthTestPage;