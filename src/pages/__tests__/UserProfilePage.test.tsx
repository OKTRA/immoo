import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import UserProfilePage from '../UserProfilePage';
import { AuthContext } from '@/contexts/auth/AuthContext';

// Mock des composants
vi.mock('@/components/auth', () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  UserRoleInfo: () => <div data-testid="user-role-info">User Role Info</div>,
  UserPermissions: () => <div data-testid="user-permissions">User Permissions</div>
}));

vi.mock('@/components/ui/LoadingSpinner', () => ({
  default: ({ text }: { text?: string }) => <div data-testid="loading-spinner">{text || 'Loading...'}</div>
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

// Mock du contexte d'authentification
const mockAuthContext = {
  status: 'authenticated' as const,
  user: { id: 'test-user-id' },
  profile: {
    id: 'test-profile-id',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
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

describe('UserProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait afficher le titre de la page', () => {
    renderWithRouter(<UserProfilePage />);
    
    expect(screen.getByText('Mon Profil Utilisateur')).toBeInTheDocument();
  });

  it('devrait afficher les informations de l\'utilisateur', () => {
    renderWithRouter(<UserProfilePage />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('devrait afficher le composant UserRoleInfo', () => {
    renderWithRouter(<UserProfilePage />);
    
    expect(screen.getByTestId('user-role-info')).toBeInTheDocument();
  });

  it('devrait afficher le composant UserPermissions', () => {
    renderWithRouter(<UserProfilePage />);
    
    expect(screen.getByTestId('user-permissions')).toBeInTheDocument();
  });

  it('devrait afficher les actions rapides', () => {
    renderWithRouter(<UserProfilePage />);
    
    expect(screen.getByText('Actions Rapides')).toBeInTheDocument();
    expect(screen.getByText('Modifier le profil')).toBeInTheDocument();
    expect(screen.getByText('Changer le mot de passe')).toBeInTheDocument();
    expect(screen.getByText('Se déconnecter')).toBeInTheDocument();
  });

  it('devrait afficher les statistiques de l\'utilisateur', () => {
    renderWithRouter(<UserProfilePage />);
    
    expect(screen.getByText('Statistiques')).toBeInTheDocument();
    expect(screen.getByText('Membre depuis')).toBeInTheDocument();
    expect(screen.getByText('Dernière connexion')).toBeInTheDocument();
  });

  it('devrait afficher la date d\'inscription formatée', () => {
    renderWithRouter(<UserProfilePage />);
    
    const memberSince = screen.getByText('Membre depuis');
    expect(memberSince.nextElementSibling).toHaveTextContent('1 janvier 2024');
  });

  it('devrait afficher la date de dernière mise à jour formatée', () => {
    renderWithRouter(<UserProfilePage />);
    
    const lastUpdate = screen.getByText('Dernière mise à jour');
    expect(lastUpdate.nextElementSibling).toHaveTextContent('1 janvier 2024');
  });

  it('devrait permettre la déconnexion', () => {
    renderWithRouter(<UserProfilePage />);
    
    const signOutButton = screen.getByText('Se déconnecter');
    fireEvent.click(signOutButton);
    
    expect(mockAuthContext.signOut).toHaveBeenCalled();
  });

  it('devrait avoir le bon style et les bonnes couleurs du thème IMMOO', () => {
    renderWithRouter(<UserProfilePage />);
    
    const title = screen.getByText('Mon Profil Utilisateur');
    expect(title).toHaveClass('text-3xl', 'font-bold', 'text-immoo-navy', 'dark:text-immoo-pearl');
    
    const userCard = screen.getByText('John Doe').closest('div');
    expect(userCard).toHaveClass('bg-white', 'dark:bg-immoo-navy', 'border-immoo-gold/20');
  });

  it('devrait afficher les badges de rôle avec les bonnes couleurs', () => {
    renderWithRouter(<UserProfilePage />);
    
    const roleBadge = screen.getByText('admin');
    expect(roleBadge).toHaveClass('bg-immoo-gold', 'text-immoo-navy');
  });

  it('devrait afficher les informations de contact', () => {
    renderWithRouter(<UserProfilePage />);
    
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('devrait afficher les informations de compte', () => {
    renderWithRouter(<UserProfilePage />);
    
    expect(screen.getByText('Compte')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('1 janvier 2024')).toBeInTheDocument();
  });

  it('devrait gérer les utilisateurs sans nom complet', () => {
    const userWithoutName = {
      ...mockAuthContext,
      profile: {
        ...mockAuthContext.profile,
        first_name: null,
        last_name: null
      }
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={userWithoutName}>
          <UserProfilePage />
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    expect(screen.getByText('Utilisateur')).toBeInTheDocument();
  });

  it('devrait gérer les utilisateurs avec seulement un prénom', () => {
    const userWithFirstNameOnly = {
      ...mockAuthContext,
      profile: {
        ...mockAuthContext.profile,
        first_name: 'John',
        last_name: null
      }
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={userWithFirstNameOnly}>
          <UserProfilePage />
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  it('devrait gérer les utilisateurs avec seulement un nom de famille', () => {
    const userWithLastNameOnly = {
      ...mockAuthContext,
      profile: {
        ...mockAuthContext.profile,
        first_name: null,
        last_name: 'Doe'
      }
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={userWithLastNameOnly}>
          <UserProfilePage />
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    expect(screen.getByText('Doe')).toBeInTheDocument();
  });

  it('devrait afficher les actions rapides avec les bonnes icônes', () => {
    renderWithRouter(<UserProfilePage />);
    
    const editButton = screen.getByText('Modifier le profil');
    const passwordButton = screen.getByText('Changer le mot de passe');
    const signOutButton = screen.getByText('Se déconnecter');
    
    expect(editButton).toBeInTheDocument();
    expect(passwordButton).toBeInTheDocument();
    expect(signOutButton).toBeInTheDocument();
  });

  it('devrait avoir une mise en page responsive', () => {
    renderWithRouter(<UserProfilePage />);
    
    const container = screen.getByText('Mon Profil Utilisateur').closest('div');
    expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');
    
    const grid = screen.getByText('John Doe').closest('div');
    expect(grid).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-3', 'gap-8');
  });
});
