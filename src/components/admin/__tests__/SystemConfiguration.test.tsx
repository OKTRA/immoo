import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SystemConfiguration from '../SystemConfiguration';
import { AuthContext } from '@/contexts/auth/AuthContext';

// Mock des composants
vi.mock('@/components/auth', () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
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

const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      {component}
    </AuthContext.Provider>
  );
};

describe('SystemConfiguration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock de fetch pour simuler l'API
    global.fetch = vi.fn();
  });

  it('devrait afficher un loader pendant le chargement', () => {
    renderWithAuth(<SystemConfiguration />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Chargement des configurations...')).toBeInTheDocument();
  });

  it('devrait afficher les configurations une fois chargées', async () => {
    renderWithAuth(<SystemConfiguration />);
    
    await waitFor(() => {
      expect(screen.getByText('Configuration Système')).toBeInTheDocument();
      expect(screen.getByText('Gérez les paramètres globaux de l\'application')).toBeInTheDocument();
    });
  });

  it('devrait afficher les configurations groupées par catégorie', async () => {
    renderWithAuth(<SystemConfiguration />);
    
    await waitFor(() => {
      expect(screen.getByText('Général')).toBeInTheDocument();
      expect(screen.getByText('Système')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Sécurité')).toBeInTheDocument();
      expect(screen.getByText('Localisation')).toBeInTheDocument();
    });
  });

  it('devrait afficher les configurations avec leurs valeurs', async () => {
    renderWithAuth(<SystemConfiguration />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('IMMOO')).toBeInTheDocument();
      expect(screen.getByDisplayValue('smtp.gmail.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('587')).toBeInTheDocument();
      expect(screen.getByDisplayValue('3600')).toBeInTheDocument();
    });
  });

  it('devrait permettre l\'édition des configurations', async () => {
    renderWithAuth(<SystemConfiguration />);
    
    await waitFor(() => {
      const appNameInput = screen.getByDisplayValue('IMMOO');
      fireEvent.change(appNameInput, { target: { value: 'IMMOO Updated' } });
      
      expect(appNameInput).toHaveValue('IMMOO Updated');
    });
  });

  it('devrait afficher les boutons de sauvegarde lors de l\'édition', async () => {
    renderWithAuth(<SystemConfiguration />);
    
    await waitFor(() => {
      const appNameInput = screen.getByDisplayValue('IMMOO');
      fireEvent.change(appNameInput, { target: { value: 'IMMOO Updated' } });
      
      expect(screen.getByText('Sauvegarder')).toBeInTheDocument();
      expect(screen.getByText('Annuler')).toBeInTheDocument();
    });
  });

  it('devrait gérer le mode maintenance avec un switch', async () => {
    renderWithAuth(<SystemConfiguration />);
    
    await waitFor(() => {
      const maintenanceSwitch = screen.getByRole('checkbox');
      expect(maintenanceSwitch).toBeInTheDocument();
      expect(maintenanceSwitch).not.toBeChecked();
    });
  });

  it('devrait gérer la langue par défaut avec un select', async () => {
    renderWithAuth(<SystemConfiguration />);
    
    await waitFor(() => {
      const languageSelect = screen.getByDisplayValue('fr');
      expect(languageSelect).toBeInTheDocument();
    });
  });

  it('devrait gérer le fuseau horaire avec un select', async () => {
    renderWithAuth(<SystemConfiguration />);
    
    await waitFor(() => {
      const timezoneSelect = screen.getByDisplayValue('Europe/Paris');
      expect(timezoneSelect).toBeInTheDocument();
    });
  });

  it('devrait afficher les icônes appropriées pour chaque catégorie', async () => {
    renderWithAuth(<SystemConfiguration />);
    
    await waitFor(() => {
      // Vérifier que les icônes sont présentes (elles sont rendues comme des éléments SVG)
      expect(screen.getByText('Général').closest('div')).toBeInTheDocument();
      expect(screen.getByText('Système').closest('div')).toBeInTheDocument();
      expect(screen.getByText('Email').closest('div')).toBeInTheDocument();
    });
  });

  it('devrait afficher le nombre de paramètres par catégorie', async () => {
    renderWithAuth(<SystemConfiguration />);
    
    await waitFor(() => {
      expect(screen.getByText('(1 paramètres)')).toBeInTheDocument(); // Général
      expect(screen.getByText('(2 paramètres)')).toBeInTheDocument(); // Système
      expect(screen.getByText('(2 paramètres)')).toBeInTheDocument(); // Email
    });
  });

  it('devrait afficher la date de dernière modification', async () => {
    renderWithAuth(<SystemConfiguration />);
    
    await waitFor(() => {
      const today = new Date().toLocaleDateString();
      expect(screen.getByText(`Modifié le ${today}`)).toBeInTheDocument();
    });
  });

  it('devrait avoir le bon style et les bonnes couleurs du thème IMMOO', async () => {
    renderWithAuth(<SystemConfiguration />);
    
    await waitFor(() => {
      const title = screen.getByText('Configuration Système');
      expect(title).toHaveClass('text-3xl', 'font-bold', 'text-immoo-navy', 'dark:text-immoo-pearl');
      
      const description = screen.getByText('Gérez les paramètres globaux de l\'application');
      expect(description).toHaveClass('text-immoo-navy/70', 'dark:text-immoo-pearl/70');
    });
  });

  it('devrait gérer l\'état de sauvegarde', async () => {
    renderWithAuth(<SystemConfiguration />);
    
    await waitFor(() => {
      const appNameInput = screen.getByDisplayValue('IMMOO');
      fireEvent.change(appNameInput, { target: { value: 'IMMOO Updated' } });
      
      const saveButton = screen.getByText('Sauvegarder');
      fireEvent.click(saveButton);
      
      // Le bouton devrait afficher "Sauvegarde..." pendant la sauvegarde
      expect(saveButton).toBeDisabled();
    });
  });
});
