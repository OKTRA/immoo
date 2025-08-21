import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import AppLayout from '../AppLayout';
import { AuthContext } from '@/contexts/auth/AuthContext';

// Mock des composants
vi.mock('@/components/navigation/MainNavigation', () => ({
  default: () => <div data-testid="main-navigation">Main Navigation</div>
}));

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

describe('AppLayout', () => {
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
          <AppLayout />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Chargement de l\'application...')).toBeInTheDocument();
  });

  it('devrait afficher un loader si pas encore initialisé', () => {
    const notInitializedContext = {
      ...mockAuthContext,
      initialized: false,
      isLoading: false
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={notInitializedContext}>
          <AppLayout />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('devrait afficher la navigation et le contenu principal une fois initialisé', () => {
    renderWithRouter(<AppLayout />);

    expect(screen.getByTestId('main-navigation')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('devrait avoir la bonne structure HTML', () => {
    renderWithRouter(<AppLayout />);

    const container = screen.getByTestId('outlet').closest('div');
    expect(container).toHaveClass('min-h-screen', 'bg-gray-50', 'dark:bg-immoo-navy-dark');
    
    const main = screen.getByTestId('outlet').closest('main');
    expect(main).toHaveClass('flex-1');
  });

  it('devrait utiliser les bonnes couleurs du thème IMMOO', () => {
    renderWithRouter(<AppLayout />);

    const container = screen.getByTestId('outlet').closest('div');
    expect(container).toHaveClass('dark:bg-immoo-navy-dark');
  });
});
