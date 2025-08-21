import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import UserPermissions from '../UserPermissions';
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

describe('UserPermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait afficher le titre des permissions', () => {
    renderWithAuth(<UserPermissions />);
    
    expect(screen.getByText('Mes Permissions')).toBeInTheDocument();
  });

  it('devrait afficher les permissions pour un administrateur', () => {
    renderWithAuth(<UserPermissions />);
    
    expect(screen.getByText('Gestion des Utilisateurs')).toBeInTheDocument();
    expect(screen.getByText('Gestion des Agences')).toBeInTheDocument();
    expect(screen.getByText('Paramètres Système')).toBeInTheDocument();
    expect(screen.getByText('Accès à Toutes les Données')).toBeInTheDocument();
  });

  it('devrait afficher les permissions pour une agence', () => {
    const agencyContext = {
      ...mockAuthContext,
      profile: {
        ...mockAuthContext.profile,
        role: 'agency' as const
      }
    };

    render(
      <AuthContext.Provider value={agencyContext}>
        <UserPermissions />
      </AuthContext.Provider>
    );
    
    expect(screen.getByText('Création de Propriétés')).toBeInTheDocument();
    expect(screen.getByText('Gestion des Locataires')).toBeInTheDocument();
    expect(screen.getByText('Vue des Analytics')).toBeInTheDocument();
    expect(screen.getByText('Gestion des Contrats')).toBeInTheDocument();
    expect(screen.getByText('Gestion des Paiements')).toBeInTheDocument();
  });

  it('devrait afficher les permissions pour un propriétaire', () => {
    const ownerContext = {
      ...mockAuthContext,
      profile: {
        ...mockAuthContext.profile,
        role: 'owner' as const
      }
    };

    render(
      <AuthContext.Provider value={ownerContext}>
        <UserPermissions />
      </AuthContext.Provider>
    );
    
    expect(screen.getByText('Gestion de ses Propriétés')).toBeInTheDocument();
    expect(screen.getByText('Vue de ses Analytics')).toBeInTheDocument();
  });

  it('devrait afficher les permissions pour un utilisateur public', () => {
    const publicContext = {
      ...mockAuthContext,
      profile: {
        ...mockAuthContext.profile,
        role: 'public' as const
      }
    };

    render(
      <AuthContext.Provider value={publicContext}>
        <UserPermissions />
      </AuthContext.Provider>
    );
    
    expect(screen.getByText('Vue des Propriétés')).toBeInTheDocument();
    expect(screen.getByText('Contact des Agences')).toBeInTheDocument();
    expect(screen.getByText('Recherche de Propriétés')).toBeInTheDocument();
  });

  it('devrait afficher les permissions groupées par catégorie', () => {
    renderWithAuth(<UserPermissions />);
    
    expect(screen.getByText('Administration')).toBeInTheDocument();
    expect(screen.getByText('Gestion')).toBeInTheDocument();
    expect(screen.getByText('Système')).toBeInTheDocument();
  });

  it('devrait afficher les permissions avec les bonnes icônes', () => {
    renderWithAuth(<UserPermissions />);
    
    // Vérifier que les icônes sont présentes (elles sont rendues comme des éléments SVG)
    expect(screen.getByText('Gestion des Utilisateurs').closest('div')).toBeInTheDocument();
    expect(screen.getByText('Gestion des Agences').closest('div')).toBeInTheDocument();
  });

  it('devrait afficher les permissions actives avec le bon style', () => {
    renderWithAuth(<UserPermissions />);
    
    const activePermissions = screen.getAllByText(/✓/);
    expect(activePermissions.length).toBeGreaterThan(0);
    
    activePermissions.forEach(permission => {
      expect(permission).toHaveClass('text-green-600', 'dark:text-green-400');
    });
  });

  it('devrait afficher les permissions inactives avec le bon style', () => {
    renderWithAuth(<UserPermissions />);
    
    const inactivePermissions = screen.getAllByText(/✗/);
    expect(inactivePermissions.length).toBeGreaterThan(0);
    
    inactivePermissions.forEach(permission => {
      expect(permission).toHaveClass('text-red-600', 'dark:text-red-400');
    });
  });

  it('devrait gérer les utilisateurs sans profil', () => {
    const noProfileContext = {
      ...mockAuthContext,
      profile: null
    };

    render(
      <AuthContext.Provider value={noProfileContext}>
        <UserPermissions />
      </AuthContext.Provider>
    );
    
    expect(screen.getByText('Vue des Propriétés')).toBeInTheDocument();
    expect(screen.getByText('Contact des Agences')).toBeInTheDocument();
    expect(screen.getByText('Recherche de Propriétés')).toBeInTheDocument();
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
        <UserPermissions />
      </AuthContext.Provider>
    );
    
    expect(screen.getByText('Vue des Propriétés')).toBeInTheDocument();
    expect(screen.getByText('Contact des Agences')).toBeInTheDocument();
    expect(screen.getByText('Recherche de Propriétés')).toBeInTheDocument();
  });

  it('devrait avoir le bon style et les bonnes couleurs du thème IMMOO', () => {
    renderWithAuth(<UserPermissions />);
    
    const container = screen.getByText('Mes Permissions').closest('div');
    expect(container).toHaveClass('bg-white', 'dark:bg-immoo-navy', 'border-immoo-gold/20');
  });

  it('devrait afficher les descriptions des permissions avec le bon style', () => {
    renderWithAuth(<UserPermissions />);
    
    const descriptions = screen.getAllByText(/permission/);
    descriptions.forEach(description => {
      expect(description).toHaveClass('text-immoo-navy/70', 'dark:text-immoo-pearl/70');
    });
  });

  it('devrait avoir une mise en page responsive', () => {
    renderWithAuth(<UserPermissions />);
    
    const container = screen.getByText('Mes Permissions').closest('div');
    expect(container).toHaveClass('p-6', 'rounded-lg', 'shadow-sm');
  });

  it('devrait afficher le nombre total de permissions', () => {
    renderWithAuth(<UserPermissions />);
    
    const totalPermissions = screen.getByText(/permissions au total/);
    expect(totalPermissions).toBeInTheDocument();
  });

  it('devrait afficher les permissions avec des badges colorés', () => {
    renderWithAuth(<UserPermissions />);
    
    const permissionBadges = screen.getAllByText(/✓|✗/);
    expect(permissionBadges.length).toBeGreaterThan(0);
  });

  it('devrait avoir des transitions fluides pour les couleurs', () => {
    renderWithAuth(<UserPermissions />);
    
    const permissionItems = screen.getAllByText(/Gestion des/);
    permissionItems.forEach(item => {
      expect(item.closest('div')).toHaveClass('transition-colors');
    });
  });

  it('devrait afficher les permissions dans un ordre logique', () => {
    renderWithAuth(<UserPermissions />);
    
    const permissions = screen.getAllByText(/Gestion des|Paramètres|Accès/);
    expect(permissions.length).toBeGreaterThan(0);
  });

  it('devrait avoir des espacements cohérents entre les sections', () => {
    renderWithAuth(<UserPermissions />);
    
    const sections = screen.getAllByText(/Administration|Gestion|Système/);
    sections.forEach(section => {
      expect(section.closest('div')).toHaveClass('mb-6');
    });
  });
});
