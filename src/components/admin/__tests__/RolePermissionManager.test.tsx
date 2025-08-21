import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import RolePermissionManager from '../RolePermissionManager';
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

// Mock du service de permissions
vi.mock('@/services/permissions/permissionService', () => ({
  default: {
    getAllPermissions: vi.fn(),
    createRole: vi.fn(),
    updateRole: vi.fn(),
    deleteRole: vi.fn()
  }
}));

// Mock de fetch
global.fetch = vi.fn();

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

describe('RolePermissionManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock des permissions
    const { default: PermissionService } = require('@/services/permissions/permissionService');
    PermissionService.getAllPermissions.mockResolvedValue({
      permissions: [
        { id: '1', name: 'View Properties', category: 'Properties', is_active: true },
        { id: '2', name: 'Create Property', category: 'Properties', is_active: true },
        { id: '3', name: 'Manage Users', category: 'Administration', is_active: true }
      ],
      error: null
    });

    // Mock de l'API des rôles
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        data: [
          {
            id: 'role-1',
            name: 'Admin',
            description: 'Full access to all features',
            permissions: [
              { id: '1', name: 'View Properties' },
              { id: '2', name: 'Create Property' },
              { id: '3', name: 'Manage Users' }
            ],
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ],
        error: null
      })
    });
  });

  it('devrait afficher un loader pendant le chargement', () => {
    renderWithAuth(<RolePermissionManager />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('devrait afficher le titre et la description', async () => {
    renderWithAuth(<RolePermissionManager />);
    
    await waitFor(() => {
      expect(screen.getByText('Gestion des Rôles et Permissions')).toBeInTheDocument();
      expect(screen.getByText('Gérez les rôles et leurs permissions dans le système')).toBeInTheDocument();
    });
  });

  it('devrait afficher le bouton pour créer un nouveau rôle', async () => {
    renderWithAuth(<RolePermissionManager />);
    
    await waitFor(() => {
      expect(screen.getByText('Nouveau Rôle')).toBeInTheDocument();
    });
  });

  it('devrait ouvrir le formulaire de création de rôle', async () => {
    renderWithAuth(<RolePermissionManager />);
    
    await waitFor(() => {
      const createButton = screen.getByText('Nouveau Rôle');
      fireEvent.click(createButton);
      
      expect(screen.getByText('Créer un Nouveau Rôle')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('ex: Modérateur')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Description du rôle')).toBeInTheDocument();
    });
  });

  it('devrait afficher les permissions groupées par catégorie dans le formulaire', async () => {
    renderWithAuth(<RolePermissionManager />);
    
    await waitFor(() => {
      const createButton = screen.getByText('Nouveau Rôle');
      fireEvent.click(createButton);
      
      expect(screen.getByText('Properties')).toBeInTheDocument();
      expect(screen.getByText('Administration')).toBeInTheDocument();
      expect(screen.getByText('View Properties')).toBeInTheDocument();
      expect(screen.getByText('Create Property')).toBeInTheDocument();
      expect(screen.getByText('Manage Users')).toBeInTheDocument();
    });
  });

  it('devrait permettre la sélection des permissions', async () => {
    renderWithAuth(<RolePermissionManager />);
    
    await waitFor(() => {
      const createButton = screen.getByText('Nouveau Rôle');
      fireEvent.click(createButton);
      
      const viewPropertiesCheckbox = screen.getByLabelText('View Properties');
      fireEvent.click(viewPropertiesCheckbox);
      
      expect(viewPropertiesCheckbox).toBeChecked();
    });
  });

  it('devrait afficher les rôles existants', async () => {
    renderWithAuth(<RolePermissionManager />);
    
    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Full access to all features')).toBeInTheDocument();
      expect(screen.getByText('View Properties')).toBeInTheDocument();
      expect(screen.getByText('Create Property')).toBeInTheDocument();
      expect(screen.getByText('Manage Users')).toBeInTheDocument();
    });
  });

  it('devrait permettre l\'édition des rôles existants', async () => {
    renderWithAuth(<RolePermissionManager />);
    
    await waitFor(() => {
      const editButton = screen.getByText('Modifier');
      fireEvent.click(editButton);
      
      // Vérifier que les champs sont en mode édition
      expect(screen.getByDisplayValue('Admin')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Full access to all features')).toBeInTheDocument();
      expect(screen.getByText('Sauvegarder')).toBeInTheDocument();
      expect(screen.getByText('Annuler')).toBeInTheDocument();
    });
  });

  it('devrait permettre la suppression des rôles', async () => {
    // Mock de confirm
    global.confirm = vi.fn(() => true);
    
    renderWithAuth(<RolePermissionManager />);
    
    await waitFor(() => {
      const deleteButton = screen.getByText('Supprimer');
      fireEvent.click(deleteButton);
      
      expect(global.confirm).toHaveBeenCalledWith('Êtes-vous sûr de vouloir supprimer ce rôle ?');
    });
  });

  it('devrait afficher le nombre de permissions par rôle', async () => {
    renderWithAuth(<RolePermissionManager />);
    
    await waitFor(() => {
      expect(screen.getByText('Permissions (3)')).toBeInTheDocument();
    });
  });

  it('devrait afficher un message si aucun rôle n\'est configuré', async () => {
    // Mock d'un tableau vide
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        data: [],
        error: null
      })
    });

    renderWithAuth(<RolePermissionManager />);
    
    await waitFor(() => {
      expect(screen.getByText('Aucun rôle configuré')).toBeInTheDocument();
      expect(screen.getByText('Créer le premier rôle')).toBeInTheDocument();
    });
  });

  it('devrait avoir le bon style et les bonnes couleurs du thème IMMOO', async () => {
    renderWithAuth(<RolePermissionManager />);
    
    await waitFor(() => {
      const title = screen.getByText('Gestion des Rôles et Permissions');
      expect(title).toHaveClass('text-3xl', 'font-bold', 'text-immoo-navy', 'dark:text-immoo-pearl');
      
      const description = screen.getByText('Gérez les rôles et leurs permissions dans le système');
      expect(description).toHaveClass('text-immoo-navy/70', 'dark:text-immoo-pearl/70');
    });
  });

  it('devrait gérer les erreurs de chargement', async () => {
    // Mock d'une erreur
    global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));

    renderWithAuth(<RolePermissionManager />);
    
    await waitFor(() => {
      // Le composant devrait gérer l'erreur gracieusement
      expect(screen.getByText('Gestion des Rôles et Permissions')).toBeInTheDocument();
    });
  });

  it('devrait permettre l\'actualisation des données', async () => {
    renderWithAuth(<RolePermissionManager />);
    
    await waitFor(() => {
      const refreshButton = screen.getByText('Actualiser');
      expect(refreshButton).toBeInTheDocument();
      
      fireEvent.click(refreshButton);
      // Le composant devrait recharger les données
    });
  });
});
