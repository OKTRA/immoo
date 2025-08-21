import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import MainNavigation from '../MainNavigation';
import { AuthContext } from '@/contexts/auth/AuthContext';

// Mock des composants de navigation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
    Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a>
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

describe('MainNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait afficher le logo IMMOO', () => {
    renderWithRouter(<MainNavigation />);
    
    expect(screen.getByText('IMMOO')).toBeInTheDocument();
  });

  it('devrait afficher le badge de rôle utilisateur', () => {
    renderWithRouter(<MainNavigation />);
    
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('devrait afficher les liens de navigation pour un admin', () => {
    renderWithRouter(<MainNavigation />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Propriétés')).toBeInTheDocument();
    expect(screen.getByText('Utilisateurs')).toBeInTheDocument();
  });

  it('devrait afficher le bouton de déconnexion pour un utilisateur connecté', () => {
    renderWithRouter(<MainNavigation />);
    
    expect(screen.getByText('Déconnexion')).toBeInTheDocument();
  });

  it('devrait afficher les boutons de connexion/inscription pour un utilisateur non connecté', () => {
    const unauthenticatedContext = {
      ...mockAuthContext,
      status: 'unauthenticated' as const,
      profile: null
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={unauthenticatedContext}>
          <MainNavigation />
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(screen.getByText('Inscription')).toBeInTheDocument();
  });

  it('devrait ouvrir/fermer le menu mobile', () => {
    renderWithRouter(<MainNavigation />);
    
    const menuButton = screen.getByRole('button', { name: /menu/i });
    
    // Menu fermé par défaut
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    
    // Ouvrir le menu
    fireEvent.click(menuButton);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    
    // Fermer le menu
    fireEvent.click(menuButton);
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('devrait avoir le bon lien vers le profil', () => {
    renderWithRouter(<MainNavigation />);
    
    const profileLink = screen.getByText('Profil').closest('a');
    expect(profileLink).toHaveAttribute('href', '/profile');
  });

  it('devrait utiliser les bonnes couleurs du thème IMMOO', () => {
    renderWithRouter(<MainNavigation />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('bg-white', 'dark:bg-immoo-navy');
    
    const logo = screen.getByText('I').closest('div');
    expect(logo).toHaveClass('bg-immoo-gold');
  });
});
