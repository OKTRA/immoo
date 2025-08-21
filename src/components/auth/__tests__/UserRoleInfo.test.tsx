import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import UserRoleInfo from '../UserRoleInfo';
import { AuthContext } from '@/contexts/auth/AuthContext';

// Mock du contexte d'authentification
const mockAuthContext = {
  status: 'authenticated' as const,
  user: { id: 'test-user-id' },
  profile: {
    id: 'test-profile-id',
    email: 'test@example.com',
    role: 'admin' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  isLoading: false,
  error: null,
  initialized: true,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  refreshAuth: vi.fn(),
  updateProfile: vi.fn(),
  hasRole: vi.fn(),
  isAgency: vi.fn(),
  isAdmin: vi.fn(),
  isOwner: vi.fn(),
  isPublic: vi.fn(),
  getUserRole: vi.fn(() => 'admin'),
  hasPermission: vi.fn()
};

const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      {component}
    </AuthContext.Provider>
  );
};

describe('UserRoleInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait afficher les informations de rôle pour un admin', () => {
    renderWithAuth(<UserRoleInfo />);
    
    expect(screen.getByText('Administrateur')).toBeInTheDocument();
    expect(screen.getByText('Accès complet à toutes les fonctionnalités du système')).toBeInTheDocument();
  });

  it('devrait afficher les informations de rôle pour une agence', () => {
    const agencyContext = {
      ...mockAuthContext,
      profile: {
        ...mockAuthContext.profile,
        role: 'agency' as const
      }
    };

    render(
      <AuthContext.Provider value={agencyContext}>
        <UserRoleInfo />
      </AuthContext.Provider>
    );
    
    expect(screen.getByText('Agence')).toBeInTheDocument();
    expect(screen.getByText('Gestion des propriétés et des locataires')).toBeInTheDocument();
  });

  it('devrait afficher les informations de rôle pour un propriétaire', () => {
    const ownerContext = {
      ...mockAuthContext,
      profile: {
        ...mockAuthContext.profile,
        role: 'owner' as const
      }
    };

    render(
      <AuthContext.Provider value={ownerContext}>
        <UserRoleInfo />
      </AuthContext.Provider>
    );
    
    expect(screen.getByText('Propriétaire')).toBeInTheDocument();
    expect(screen.getByText('Gestion de ses propres propriétés')).toBeInTheDocument();
  });

  it('devrait afficher les informations de rôle pour un utilisateur public', () => {
    const publicContext = {
      ...mockAuthContext,
      profile: {
        ...mockAuthContext.profile,
        role: 'public' as const
      }
    };

    render(
      <AuthContext.Provider value={publicContext}>
        <UserRoleInfo />
      </AuthContext.Provider>
    );
    
    expect(screen.getByText('Visiteur')).toBeInTheDocument();
    expect(screen.getByText('Accès limité aux fonctionnalités publiques')).toBeInTheDocument();
  });

  it('devrait afficher l\'icône appropriée pour chaque rôle', () => {
    renderWithAuth(<UserRoleInfo />);
    
    // Vérifier que l'icône est présente (elle est rendue comme un élément SVG)
    expect(screen.getByText('Administrateur').closest('div')).toBeInTheDocument();
  });

  it('devrait avoir les bonnes couleurs pour chaque rôle', () => {
    renderWithAuth(<UserRoleInfo />);
    
    const roleBadge = screen.getByText('Administrateur');
    expect(roleBadge).toHaveClass('bg-red-100', 'text-red-800', 'dark:bg-red-900', 'dark:text-red-200');
  });

  it('devrait avoir les bonnes couleurs pour le rôle agency', () => {
    const agencyContext = {
      ...mockAuthContext,
      profile: {
        ...mockAuthContext.profile,
        role: 'agency' as const
      }
    };

    render(
      <AuthContext.Provider value={agencyContext}>
        <UserRoleInfo />
      </AuthContext.Provider>
    );
    
    const roleBadge = screen.getByText('Agence');
    expect(roleBadge).toHaveClass('bg-blue-100', 'text-blue-800', 'dark:bg-blue-900', 'dark:text-blue-200');
  });

  it('devrait avoir les bonnes couleurs pour le rôle owner', () => {
    const ownerContext = {
      ...mockAuthContext,
      profile: {
        ...mockAuthContext.profile,
        role: 'owner' as const
      }
    };

    render(
      <AuthContext.Provider value={ownerContext}>
        <UserRoleInfo />
      </AuthContext.Provider>
    );
    
    const roleBadge = screen.getByText('Propriétaire');
    expect(roleBadge).toHaveClass('bg-green-100', 'text-green-800', 'dark:bg-green-900', 'dark:text-green-200');
  });

  it('devrait avoir les bonnes couleurs pour le rôle public', () => {
    const publicContext = {
      ...mockAuthContext,
      profile: {
        ...mockAuthContext.profile,
        role: 'public' as const
      }
    };

    render(
      <AuthContext.Provider value={publicContext}>
        <UserRoleInfo />
      </AuthContext.Provider>
    );
    
    const roleBadge = screen.getByText('Visiteur');
    expect(roleBadge).toHaveClass('bg-gray-100', 'text-gray-800', 'dark:bg-gray-900', 'dark:text-gray-200');
  });

  it('devrait gérer les utilisateurs sans profil', () => {
    const noProfileContext = {
      ...mockAuthContext,
      profile: null
    };

    render(
      <AuthContext.Provider value={noProfileContext}>
        <UserRoleInfo />
      </AuthContext.Provider>
    );
    
    expect(screen.getByText('Visiteur')).toBeInTheDocument();
    expect(screen.getByText('Accès limité aux fonctionnalités publiques')).toBeInTheDocument();
  });

  it('devrait gérer les rôles invalides', () => {
    const invalidRoleContext = {
      ...mockAuthContext,
      profile: {
        ...mockAuthContext.profile,
        role: 'invalid_role' as any
      }
    };

    render(
      <AuthContext.Provider value={invalidRoleContext}>
        <UserRoleInfo />
      </AuthContext.Provider>
    );
    
    expect(screen.getByText('Visiteur')).toBeInTheDocument();
    expect(screen.getByText('Accès limité aux fonctionnalités publiques')).toBeInTheDocument();
  });

  it('devrait avoir le bon style et les bonnes couleurs du thème IMMOO', () => {
    renderWithAuth(<UserRoleInfo />);
    
    const container = screen.getByText('Administrateur').closest('div');
    expect(container).toHaveClass('bg-white', 'dark:bg-immoo-navy', 'border-immoo-gold/20');
  });

  it('devrait afficher la description du rôle avec le bon style', () => {
    renderWithAuth(<UserRoleInfo />);
    
    const description = screen.getByText('Accès complet à toutes les fonctionnalités du système');
    expect(description).toHaveClass('text-immoo-navy/70', 'dark:text-immoo-pearl/70');
  });

  it('devrait avoir une mise en page responsive', () => {
    renderWithAuth(<UserRoleInfo />);
    
    const container = screen.getByText('Administrateur').closest('div');
    expect(container).toHaveClass('p-6', 'rounded-lg', 'shadow-sm');
  });

  it('devrait afficher l\'icône avec la bonne taille', () => {
    renderWithAuth(<UserRoleInfo />);
    
    const iconContainer = screen.getByText('Administrateur').closest('div');
    expect(iconContainer).toHaveClass('p-3', 'rounded-lg');
  });

  it('devrait avoir une transition fluide pour les couleurs', () => {
    renderWithAuth(<UserRoleInfo />);
    
    const roleBadge = screen.getByText('Administrateur');
    expect(roleBadge).toHaveClass('transition-colors');
  });
});
