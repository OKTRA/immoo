import React from 'react';
import { useNavigate } from 'react-router-dom';
import ImmooLogoAdaptive from '@/components/ui/ImmooLogoAdaptive';
import QuickVisitorIndicator from '@/components/visitor/QuickVisitorIndicator';
import MobileActionButtons from './MobileActionButtons';
import { useAuth } from '@/hooks/useAuth';

export default function MobileTopBar() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-immoo-gray/20 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 h-16">
        {/* Indicateur de visiteur connecté à gauche */}
        <div className="flex items-center">
          <QuickVisitorIndicator />
        </div>

        {/* Logo centré */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <ImmooLogoAdaptive 
            onClick={() => navigate("/")}
            size="small"
            className="transition-all duration-200 hover:scale-105"
          />
        </div>

        {/* Boutons d'action (logout, account, langue) */}
        <MobileActionButtons />
      </div>
    </header>
  );
}
