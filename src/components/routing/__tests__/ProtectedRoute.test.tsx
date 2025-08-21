import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ProtectedRoute from '../ProtectedRoute';
import { AuthContext } from '@/contexts/auth/AuthContext';

// Mock des composants de navigation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to}>Navigate to {to}</div>,
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null })
  };
});

// Mock du composant RoleGuard
vi.mock('@/components/auth', () => ({
  RoleGuard: ({ children, requiredRole, requiredPermission }: any) => (
    <div data-testid="role-guard" data-role={requiredRole} data-permission={requiredPermission}>
      {children}
    </div>
  )
}));

// Mock du composant LoadingSpinner
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
  getUserRole: vi.fn(),
  hasPermission: vi.fn()
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait afficher un loader pendant l\'initialisation', () => {
    const loadingContext = {
      ...mockAuthContext,
      initialized: false,
      isLoading: true
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={loadingContext}>
          <ProtectedRoute>
            <div>Contenu protégé</div>
          </ProtectedRoute>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('devrait rediriger vers /login si pas de profil', () => {
    const noProfileContext = {
      ...mockAuthContext,
      profile: null
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={noProfileContext}>
          <ProtectedRoute>
            <div>Contenu protégé</div>
          </ProtectedRoute>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
  });

  it('devrait utiliser RoleGuard si des vérifications de rôle/permission sont requises', () => {
    renderWithRouter(
      <ProtectedRoute requiredRole="admin">
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('role-guard')).toBeInTheDocument();
    expect(screen.getByTestId('role-guard')).toHaveAttribute('data-role', 'admin');
  });

  it('devrait utiliser RoleGuard si des vérifications de permission sont requises', () => {
    renderWithRouter(
      <ProtectedRoute requiredPermission="create_property">
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('role-guard')).toBeInTheDocument();
    expect(screen.getByTestId('role-guard')).toHaveAttribute('data-permission', 'create_property');
  });

  it('devrait afficher directement le contenu si aucune vérification n\'est requise', () => {
    renderWithRouter(
      <ProtectedRoute>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
    expect(screen.queryByTestId('role-guard')).not.toBeInTheDocument();
  });

  it('devrait utiliser le fallbackPath personnalisé', () => {
    const noProfileContext = {
      ...mockAuthContext,
      profile: null
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={noProfileContext}>
          <ProtectedRoute fallbackPath="/dashboard">
            <div>Contenu protégé</div>
          </ProtectedRoute>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/dashboard');
  });

  it('devrait passer les bonnes props à RoleGuard', () => {
    renderWithRouter(
      <ProtectedRoute 
        requiredRole="agency" 
        requiredPermission="create_property"
        fallbackPath="/custom"
        showUnauthorizedMessage={true}
      >
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    const roleGuard = screen.getByTestId('role-guard');
    expect(roleGuard).toHaveAttribute('data-role', 'agency');
    expect(roleGuard).toHaveAttribute('data-permission', 'create_property');
  });
});
