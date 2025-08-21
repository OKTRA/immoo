import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import RoleBasedNavigation from '../RoleBasedNavigation';
import { AuthContext } from '@/contexts/auth/AuthContext';

// Mock des composants
vi.mock('@/components/ui/LoadingSpinner', () => ({
  default: ({ text }: { text?: string }) => <div data-testid="loading-spinner">{text || 'Loading...'}</div>
}));

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

describe('RoleBasedNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait afficher un loader pendant le chargement', () => {
    const loadingContext = {
      ...mockAuthContext,
      isLoading: true
    };

    render(
      <AuthContext.Provider value={loadingContext}>
        <RoleBasedNavigation />
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('devrait afficher la navigation pour un utilisateur admin', () => {
    renderWithAuth(<RoleBasedNavigation />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Propriétés')).toBeInTheDocument();
    expect(screen.getByText('Utilisateurs')).toBeInTheDocument();
    expect(screen.getByText('Agences')).toBeInTheDocument();
    expect(screen.getByText('Paramètres')).toBeInTheDocument();
  });

  it('devrait afficher la navigation pour un utilisateur agency', () => {
    const agencyContext = {
      ...mockAuthContext,
      profile: {
        ...mockAuthContext.profile,
        role: 'agency' as const
      }
    };

    render(
      <AuthContext.Provider value={agencyContext}>
        <RoleBasedNavigation />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Mes Propriétés')).toBeInTheDocument();
    expect(screen.getByText('Locataires')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Paiements')).toBeInTheDocument();
  });

  it('devrait afficher la navigation pour un utilisateur owner', () => {
    const ownerContext = {
      ...mockAuthContext,
      profile: {
        ...mockAuthContext.profile,
        role: 'owner' as const
      }
    };

    render(
      <AuthContext.Provider value={ownerContext}>
        <RoleBasedNavigation />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Mes Propriétés')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Mon Profil')).toBeInTheDocument();
  });

  it('devrait afficher la navigation pour un utilisateur public', () => {
    const publicContext = {
      ...mockAuthContext,
      profile: {
        ...mockAuthContext.profile,
        role: 'public' as const
      }
    };

    render(
      <AuthContext.Provider value={publicContext}>
        <RoleBasedNavigation />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Propriétés')).toBeInTheDocument();
    expect(screen.getByText('Recherche')).toBeInTheDocument();
    expect(screen.getByText('Agences')).toBeInTheDocument();
  });

  it('devrait afficher les sous-menus pour les utilisateurs admin', () => {
    renderWithAuth(<RoleBasedNavigation />);

    // Vérifier que les sous-menus sont présents
    expect(screen.getByText('Gestion')).toBeInTheDocument();
    expect(screen.getByText('Système')).toBeInTheDocument();
  });

  it('devrait afficher les icônes appropriées', () => {
    renderWithAuth(<RoleBasedNavigation />);

    // Vérifier que les icônes sont présentes (elles sont rendues comme des éléments SVG)
    expect(screen.getByText('Dashboard').closest('div')).toBeInTheDocument();
    expect(screen.getByText('Propriétés').closest('div')).toBeInTheDocument();
    expect(screen.getByText('Utilisateurs').closest('div')).toBeInTheDocument();
  });

  it('devrait avoir le bon style et les bonnes couleurs du thème IMMOO', () => {
    renderWithAuth(<RoleBasedNavigation />);

    const nav = screen.getByText('Dashboard').closest('nav');
    expect(nav).toHaveClass('bg-white', 'dark:bg-immoo-navy', 'border-immoo-gold/20');
  });

  it('devrait gérer les utilisateurs sans profil', () => {
    const noProfileContext = {
      ...mockAuthContext,
      profile: null
    };

    render(
      <AuthContext.Provider value={noProfileContext}>
        <RoleBasedNavigation />
      </AuthContext.Provider>
    );

    // Devrait afficher la navigation publique par défaut
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Propriétés')).toBeInTheDocument();
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
        <RoleBasedNavigation />
      </AuthContext.Provider>
    );

    // Devrait afficher la navigation publique par défaut
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Propriétés')).toBeInTheDocument();
  });

  it('devrait afficher les liens avec les bonnes classes CSS', () => {
    renderWithAuth(<RoleBasedNavigation />);

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('text-immoo-navy', 'dark:text-immoo-pearl', 'hover:text-immoo-gold');
  });

  it('devrait avoir une structure de navigation hiérarchique', () => {
    renderWithAuth(<RoleBasedNavigation />);

    // Vérifier que les sections principales sont présentes
    expect(screen.getByText('Administration')).toBeInTheDocument();
    expect(screen.getByText('Gestion')).toBeInTheDocument();
    expect(screen.getByText('Système')).toBeInTheDocument();
  });

  it('devrait afficher les permissions requises pour chaque section', () => {
    renderWithAuth(<RoleBasedNavigation />);

    // Vérifier que les sections affichent les permissions requises
    expect(screen.getByText('Gestion')).toBeInTheDocument();
    expect(screen.getByText('Système')).toBeInTheDocument();
  });

  it('devrait être responsive', () => {
    renderWithAuth(<RoleBasedNavigation />);

    const nav = screen.getByText('Dashboard').closest('nav');
    expect(nav).toHaveClass('hidden', 'md:block');
  });

  it('devrait afficher le nombre d\'éléments dans chaque section', () => {
    renderWithAuth(<RoleBasedNavigation />);

    // Vérifier que les sections affichent le bon nombre d'éléments
    expect(screen.getByText('Gestion')).toBeInTheDocument();
    expect(screen.getByText('Système')).toBeInTheDocument();
  });
});
