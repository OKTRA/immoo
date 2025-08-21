import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import MainNavigation from '@/components/navigation/MainNavigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const AppLayout: React.FC = () => {
  const { initialized, isLoading } = useAuth();

  // Afficher un loader pendant l'initialisation
  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Chargement de l'application..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-immoo-navy-dark">
      <MainNavigation />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
