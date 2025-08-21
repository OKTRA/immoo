import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import UserRoleManagement from '../UserRoleManagement';
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

// Mock du service d'authentification
vi.mock('@/services/authService', () => ({
  getAllUsersWithRoles: vi.fn(),
  updateUserRole: vi.fn()
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

describe('UserRoleManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock des utilisateurs
    const { getAllUsersWithRoles } = require('@/services/authService');
    getAllUsersWithRoles.mockResolvedValue({
      users: [
        {
          id: 'user-1',
          email: 'user1@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'public',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          first_name: 'Jane',
          last_name: 'Smith',
          role: 'agency',
          created_at: '2024-01-02T00:00:00Z'
        },
        {
          id: 'user-3',
          email: 'user3@example.com',
          first_name: 'Bob',
          last_name: 'Johnson',
          role: 'owner',
          created_at: '2024-01-03T00:00:00Z'
        }
      ],
      error: null
    });
  });

  it('devrait afficher un loader pendant le chargement', () => {
    renderWithAuth(<UserRoleManagement />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('devrait afficher le titre et la description', async () => {
    renderWithAuth(<UserRoleManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Gestion des Rôles Utilisateurs')).toBeInTheDocument();
      expect(screen.getByText('Gérez les rôles et permissions des utilisateurs')).toBeInTheDocument();
    });
  });

  it('devrait afficher la liste des utilisateurs', async () => {
    renderWithAuth(<UserRoleManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(screen.getByText('user3@example.com')).toBeInTheDocument();
    });
  });

  it('devrait afficher les rôles actuels des utilisateurs', async () => {
    renderWithAuth(<UserRoleManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('public')).toBeInTheDocument();
      expect(screen.getByText('agency')).toBeInTheDocument();
      expect(screen.getByText('owner')).toBeInTheDocument();
    });
  });

  it('devrait permettre la modification des rôles', async () => {
    renderWithAuth(<UserRoleManagement />);
    
    await waitFor(() => {
      const roleSelects = screen.getAllByRole('combobox');
      expect(roleSelects).toHaveLength(3);
      
      // Vérifier que le premier utilisateur a le bon rôle sélectionné
      expect(roleSelects[0]).toHaveValue('public');
    });
  });

  it('devrait afficher les options de rôle correctes', async () => {
    renderWithAuth(<UserRoleManagement />);
    
    await waitFor(() => {
      const roleSelects = screen.getAllByRole('combobox');
      const firstSelect = roleSelects[0];
      
      fireEvent.click(firstSelect);
      
      // Vérifier que toutes les options de rôle sont disponibles
      expect(screen.getByText('public')).toBeInTheDocument();
      expect(screen.getByText('agency')).toBeInTheDocument();
      expect(screen.getByText('owner')).toBeInTheDocument();
      expect(screen.getByText('admin')).toBeInTheDocument();
    });
  });

  it('devrait permettre la sauvegarde des modifications de rôle', async () => {
    const { updateUserRole } = require('@/services/authService');
    updateUserRole.mockResolvedValue({
      success: true,
      error: null
    });

    renderWithAuth(<UserRoleManagement />);
    
    await waitFor(() => {
      const roleSelects = screen.getAllByRole('combobox');
      const firstSelect = roleSelects[0];
      
      // Changer le rôle de public à agency
      fireEvent.change(firstSelect, { target: { value: 'agency' } });
      
      // Vérifier que le bouton de sauvegarde apparaît
      expect(screen.getByText('Sauvegarder les modifications')).toBeInTheDocument();
    });
  });

  it('devrait appeler le service de mise à jour lors de la sauvegarde', async () => {
    const { updateUserRole } = require('@/services/authService');
    updateUserRole.mockResolvedValue({
      success: true,
      error: null
    });

    renderWithAuth(<UserRoleManagement />);
    
    await waitFor(() => {
      const roleSelects = screen.getAllByRole('combobox');
      const firstSelect = roleSelects[0];
      
      // Changer le rôle
      fireEvent.change(firstSelect, { target: { value: 'agency' } });
      
      // Cliquer sur sauvegarder
      const saveButton = screen.getByText('Sauvegarder les modifications');
      fireEvent.click(saveButton);
      
      // Vérifier que le service a été appelé
      expect(updateUserRole).toHaveBeenCalledWith('user-1', 'agency');
    });
  });

  it('devrait afficher un message de succès après la sauvegarde', async () => {
    const { updateUserRole } = require('@/services/authService');
    updateUserRole.mockResolvedValue({
      success: true,
      error: null
    });

    const { toast } = require('sonner');

    renderWithAuth(<UserRoleManagement />);
    
    await waitFor(() => {
      const roleSelects = screen.getAllByRole('combobox');
      const firstSelect = roleSelects[0];
      
      fireEvent.change(firstSelect, { target: { value: 'agency' } });
      
      const saveButton = screen.getByText('Sauvegarder les modifications');
      fireEvent.click(saveButton);
      
      expect(toast.success).toHaveBeenCalledWith('Rôles mis à jour avec succès');
    });
  });

  it('devrait gérer les erreurs de mise à jour', async () => {
    const { updateUserRole } = require('@/services/authService');
    updateUserRole.mockResolvedValue({
      success: false,
      error: 'Erreur de mise à jour'
    });

    const { toast } = require('sonner');

    renderWithAuth(<UserRoleManagement />);
    
    await waitFor(() => {
      const roleSelects = screen.getAllByRole('combobox');
      const firstSelect = roleSelects[0];
      
      fireEvent.change(firstSelect, { target: { value: 'agency' } });
      
      const saveButton = screen.getByText('Sauvegarder les modifications');
      fireEvent.click(saveButton);
      
      expect(toast.error).toHaveBeenCalledWith('Erreur lors de la mise à jour des rôles');
    });
  });

  it('devrait afficher les informations de l\'utilisateur connecté', async () => {
    renderWithAuth(<UserRoleManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Connecté en tant que :')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('admin')).toBeInTheDocument();
    });
  });

  it('devrait avoir le bon style et les bonnes couleurs du thème IMMOO', async () => {
    renderWithAuth(<UserRoleManagement />);
    
    await waitFor(() => {
      const title = screen.getByText('Gestion des Rôles Utilisateurs');
      expect(title).toHaveClass('text-3xl', 'font-bold', 'text-immoo-navy', 'dark:text-immoo-pearl');
      
      const description = screen.getByText('Gérez les rôles et permissions des utilisateurs');
      expect(description).toHaveClass('text-immoo-navy/70', 'dark:text-immoo-pearl/70');
    });
  });

  it('devrait gérer les erreurs de chargement des utilisateurs', async () => {
    const { getAllUsersWithRoles } = require('@/services/authService');
    getAllUsersWithRoles.mockResolvedValue({
      users: [],
      error: 'Erreur de chargement'
    });

    const { toast } = require('sonner');

    renderWithAuth(<UserRoleManagement />);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erreur lors du chargement des utilisateurs');
    });
  });

  it('devrait afficher un message si aucun utilisateur n\'est trouvé', async () => {
    const { getAllUsersWithRoles } = require('@/services/authService');
    getAllUsersWithRoles.mockResolvedValue({
      users: [],
      error: null
    });

    renderWithAuth(<UserRoleManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Aucun utilisateur trouvé')).toBeInTheDocument();
    });
  });

  it('devrait permettre l\'actualisation des données', async () => {
    renderWithAuth(<UserRoleManagement />);
    
    await waitFor(() => {
      const refreshButton = screen.getByText('Actualiser');
      expect(refreshButton).toBeInTheDocument();
      
      fireEvent.click(refreshButton);
      // Le composant devrait recharger les données
    });
  });
});
