import React from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/routing/ProtectedRoute';
import HomePage from '@/pages/HomePage';
import UserProfilePage from '@/pages/UserProfilePage';
import MyAgenciesPage from '@/pages/MyAgenciesPage';
import AgencyRedirectTest from '@/components/test/AgencyRedirectTest';

// Configuration des routes avec protection
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <UserProfilePage />
      </ProtectedRoute>
    )
  },

  // Route de test pour la redirection des agences
  {
    path: '/test-agency-redirect',
    element: <AgencyRedirectTest />
  },

  // Routes pour les agences
  {
    path: '/agency/dashboard',
    element: (
      <ProtectedRoute requiredRole="agency">
        <Navigate to="/my-agencies" replace />
      </ProtectedRoute>
    )
  },
  {
    path: '/my-agencies',
    element: (
      <ProtectedRoute requiredRole="agency">
        <MyAgenciesPage />
      </ProtectedRoute>
    )
  },

  // Route 404
  {
    path: '*',
    element: (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-immoo-navy mb-4">404</h1>
          <p className="text-immoo-navy/70 mb-6">Page non trouvée</p>
          <a 
            href="/" 
            className="bg-immoo-gold text-immoo-navy px-6 py-2 rounded-lg font-semibold hover:bg-immoo-gold-light transition-colors"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    )
  }
];

// Configuration des menus de navigation par rôle
export const navigationConfig = {
  public: [
    { label: 'Accueil', href: '/', icon: 'home' },
    { label: 'Propriétés', href: '/properties', icon: 'building' },
    { label: 'Recherche', href: '/search', icon: 'search' },
    { label: 'Agences', href: '/agency', icon: 'users' }
  ],
  owner: [
    { label: 'Accueil', href: '/', icon: 'home' },
    { label: 'Mes Propriétés', href: '/owner/dashboard', icon: 'building' },
    { label: 'Analytics', href: '/owner/analytics', icon: 'chart' },
    { label: 'Mon Profil', href: '/profile', icon: 'user' }
  ],
  agency: [
    { label: 'Dashboard', href: '/my-agencies', icon: 'dashboard' },
    { label: 'Mon Profil', href: '/profile', icon: 'user' }
  ],
  admin: [
    { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
    { label: 'Mon Profil', href: '/profile', icon: 'user' }
  ]
};

// Configuration des permissions par route
export const routePermissions = {
  '/profile': ['public', 'owner', 'agency', 'admin'],
  '/my-agencies': ['agency'],
  '/agency/dashboard': ['agency']
};
