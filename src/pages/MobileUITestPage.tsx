import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MobileUITest from '@/components/test/MobileUITest';
import { useNavigate } from 'react-router-dom';

const MobileUITestPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* En-tête de navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-lg font-semibold">Test UI Mobile</h1>
        </div>
      </header>

      {/* Contenu principal */}
      <main>
        <MobileUITest />
      </main>
    </div>
  );
};

export default MobileUITestPage;