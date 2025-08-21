import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import RoleGuard from '../RoleGuard';
import { AuthContext } from '@/contexts/auth/AuthContext';

// Mock des composants de navigation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to}>Navigate to {to}</div>
  };
});

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

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('RoleGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait afficher le contenu si l\'utilisateur a le rôle requis', () => {
    renderWithRouter(
      <RoleGuard requiredRole="admin">
        <div>Contenu protégé</div>
      </RoleGuard>
    );

    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('devrait rediriger si l\'utilisateur n\'a pas le rôle requis', () => {
    renderWithRouter(
      <RoleGuard requiredRole="agency">
        <div>Contenu protégé</div>
      </RoleGuard>
    );

    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/unauthorized');
  });

  it('devrait afficher le contenu si l\'utilisateur a la permission requise', () => {
    const { hasPermission } = require('@/contexts/auth/AuthContext');
    hasPermission.mockReturnValue(true);

    renderWithRouter(
      <RoleGuard requiredPermission="manage_users">
        <div>Contenu protégé</div>
      </RoleGuard>
    );

    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('devrait rediriger si l\'utilisateur n\'a pas la permission requise', () => {
    const { hasPermission } = require('@/contexts/auth/AuthContext');
    hasPermission.mockReturnValue(false);

    renderWithRouter(
      <RoleGuard requiredPermission="manage_users">
        <div>Contenu protégé</div>
      </RoleGuard>
    );

    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/unauthorized');
  });

  it('devrait utiliser le fallbackPath personnalisé', () => {
    renderWithRouter(
      <RoleGuard requiredRole="agency" fallbackPath="/dashboard">
        <div>Contenu protégé</div>
      </RoleGuard>
    );

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/dashboard');
  });

  it('devrait afficher le message d\'accès non autorisé si showUnauthorizedMessage est true', () => {
    renderWithRouter(
      <RoleGuard requiredRole="agency" showUnauthorizedMessage={true}>
        <div>Contenu protégé</div>
      </RoleGuard>
    );

    expect(screen.getByText('Accès non autorisé')).toBeInTheDocument();
    expect(screen.getByText('Vous n\'avez pas les permissions nécessaires pour accéder à cette page.')).toBeInTheDocument();
  });

  it('devrait ne pas afficher le message d\'accès non autorisé si showUnauthorizedMessage est false', () => {
    renderWithRouter(
      <RoleGuard requiredRole="agency" showUnauthorizedMessage={false}>
        <div>Contenu protégé</div>
      </RoleGuard>
    );

    expect(screen.queryByText('Accès non autorisé')).not.toBeInTheDocument();
    expect(screen.queryByText('Vous n\'avez pas les permissions nécessaires pour accéder à cette page.')).not.toBeInTheDocument();
  });

  it('devrait afficher le contenu si aucune vérification n\'est requise', () => {
    renderWithRouter(
      <RoleGuard>
        <div>Contenu protégé</div>
      </RoleGuard>
    );

    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('devrait vérifier le rôle en priorité sur la permission', () => {
    const { hasPermission } = require('@/contexts/auth/AuthContext');
    hasPermission.mockReturnValue(true);

    renderWithRouter(
      <RoleGuard requiredRole="agency" requiredPermission="manage_users">
        <div>Contenu protégé</div>
      </RoleGuard>
    );

    // Le rôle devrait avoir la priorité
    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
  });

  it('devrait gérer les utilisateurs sans profil', () => {
    const noProfileContext = {
      ...mockAuthContext,
      profile: null
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={noProfileContext}>
          <RoleGuard requiredRole="admin">
            <div>Contenu protégé</div>
          </RoleGuard>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
  });

  it('devrait gérer les utilisateurs non authentifiés', () => {
    const unauthenticatedContext = {
      ...mockAuthContext,
      status: 'unauthenticated' as const
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={unauthenticatedContext}>
          <RoleGuard requiredRole="admin">
            <div>Contenu protégé</div>
          </RoleGuard>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
  });

  it('devrait avoir le bon style pour le message d\'accès non autorisé', () => {
    renderWithRouter(
      <RoleGuard requiredRole="agency" showUnauthorizedMessage={true}>
        <div>Contenu protégé</div>
      </RoleGuard>
    );

    const message = screen.getByText('Accès non autorisé');
    expect(message).toHaveClass('text-2xl', 'font-bold', 'text-red-600', 'dark:text-red-400');

    const description = screen.getByText('Vous n\'avez pas les permissions nécessaires pour accéder à cette page.');
    expect(description).toHaveClass('text-immoo-navy/70', 'dark:text-immoo-pearl/70');
  });

  it('devrait avoir une mise en page centrée pour le message d\'accès non autorisé', () => {
    renderWithRouter(
      <RoleGuard requiredRole="agency" showUnauthorizedMessage={true}>
        <div>Contenu protégé</div>
      </RoleGuard>
    );

    const container = screen.getByText('Accès non autorisé').closest('div');
    expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'min-h-screen');
  });

  it('devrait utiliser les bonnes couleurs du thème IMMOO', () => {
    renderWithRouter(
      <RoleGuard requiredRole="agency" showUnauthorizedMessage={true}>
        <div>Contenu protégé</div>
      </RoleGuard>
    );

    const description = screen.getByText('Vous n\'avez pas les permissions nécessaires pour accéder à cette page.');
    expect(description).toHaveClass('text-immoo-navy/70', 'dark:text-immoo-pearl/70');
  });

  it('devrait permettre la personnalisation du message d\'accès non autorisé', () => {
    renderWithRouter(
      <RoleGuard 
        requiredRole="agency" 
        showUnauthorizedMessage={true}
        unauthorizedMessage="Message personnalisé"
        unauthorizedDescription="Description personnalisée"
      >
        <div>Contenu protégé</div>
      </RoleGuard>
    );

    expect(screen.getByText('Message personnalisé')).toBeInTheDocument();
    expect(screen.getByText('Description personnalisée')).toBeInTheDocument();
  });
});
