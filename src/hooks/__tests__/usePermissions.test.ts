import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { usePermissions } from '../usePermissions';
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

const renderHookWithAuth = () => {
  return renderHook(() => usePermissions(), {
    wrapper: ({ children }) => (
      <AuthContext.Provider value={mockAuthContext}>
        {children}
      </AuthContext.Provider>
    )
  });
};

describe('usePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait retourner les permissions pour un administrateur', () => {
    const { result } = renderHookWithAuth();

    expect(result.current.hasPermission('manage_users')).toBe(true);
    expect(result.current.hasPermission('manage_agencies')).toBe(true);
    expect(result.current.hasPermission('system_settings')).toBe(true);
    expect(result.current.hasPermission('view_all_data')).toBe(true);
  });

  it('devrait retourner les permissions pour une agence', () => {
    const agencyContext = {
      ...mockAuthContext,
      profile: {
        ...mockAuthContext.profile,
        role: 'agency' as const
      }
    };

    const { result } = renderHook(() => usePermissions(), {
      wrapper: ({ children }) => (
        <AuthContext.Provider value={agencyContext}>
          {children}
        </AuthContext.Provider>
      )
    });

    expect(result.current.hasPermission('create_property')).toBe(true);
    expect(result.current.hasPermission('manage_tenants')).toBe(true);
    expect(result.current.hasPermission('view_analytics')).toBe(true);
    expect(result.current.hasPermission('manage_contracts')).toBe(true);
    expect(result.current.hasPermission('manage_payments')).toBe(true);
  });

  it('devrait retourner les permissions pour un propriétaire', () => {
    const ownerContext = {
      ...mockAuthContext,
      profile: {
        ...mockAuthContext.profile,
        role: 'owner' as const
      }
    };

    const { result } = renderHook(() => usePermissions(), {
      wrapper: ({ children }) => (
        <AuthContext.Provider value={ownerContext}>
          {children}
        </AuthContext.Provider>
      )
    });

    expect(result.current.hasPermission('manage_own_properties')).toBe(true);
    expect(result.current.hasPermission('view_own_analytics')).toBe(true);
  });

  it('devrait retourner les permissions pour un utilisateur public', () => {
    const publicContext = {
      ...mockAuthContext,
      profile: {
        ...mockAuthContext.profile,
        role: 'public' as const
      }
    };

    const { result } = renderHook(() => usePermissions(), {
      wrapper: ({ children }) => (
        <AuthContext.Provider value={publicContext}>
          {children}
        </AuthContext.Provider>
      )
    });

    expect(result.current.hasPermission('view_properties')).toBe(true);
    expect(result.current.hasPermission('contact_agency')).toBe(true);
    expect(result.current.hasPermission('search_properties')).toBe(true);
  });

  it('devrait retourner false pour les permissions non accordées', () => {
    const { result } = renderHookWithAuth();

    expect(result.current.hasPermission('invalid_permission')).toBe(false);
  });

  it('devrait vérifier plusieurs permissions', () => {
    const { result } = renderHookWithAuth();

    expect(result.current.hasAllPermissions(['manage_users', 'manage_agencies'])).toBe(true);
    expect(result.current.hasAllPermissions(['manage_users', 'invalid_permission'])).toBe(false);
  });

  it('devrait vérifier au moins une permission', () => {
    const { result } = renderHookWithAuth();

    expect(result.current.hasAnyPermission(['manage_users', 'invalid_permission'])).toBe(true);
    expect(result.current.hasAnyPermission(['invalid_permission1', 'invalid_permission2'])).toBe(false);
  });

  it('devrait retourner les permissions par catégorie', () => {
    const { result } = renderHookWithAuth();

    const categorizedPermissions = result.current.getCategorizedPermissions();
    
    expect(categorizedPermissions).toHaveProperty('Administration');
    expect(categorizedPermissions).toHaveProperty('Gestion');
    expect(categorizedPermissions).toHaveProperty('Système');
    
    expect(categorizedPermissions.Administration).toContain('manage_users');
    expect(categorizedPermissions.Gestion).toContain('manage_agencies');
    expect(categorizedPermissions.Système).toContain('system_settings');
  });

  it('devrait retourner toutes les permissions disponibles', () => {
    const { result } = renderHookWithAuth();

    const allPermissions = result.current.getAllPermissions();
    
    expect(allPermissions).toContain('manage_users');
    expect(allPermissions).toContain('manage_agencies');
    expect(allPermissions).toContain('system_settings');
    expect(allPermissions).toContain('view_all_data');
    expect(allPermissions).toContain('create_property');
    expect(allPermissions).toContain('manage_tenants');
    expect(allPermissions).toContain('view_analytics');
    expect(allPermissions).toContain('manage_contracts');
    expect(allPermissions).toContain('manage_payments');
    expect(allPermissions).toContain('manage_own_properties');
    expect(allPermissions).toContain('view_own_analytics');
    expect(allPermissions).toContain('view_properties');
    expect(allPermissions).toContain('contact_agency');
    expect(allPermissions).toContain('search_properties');
  });

  it('devrait retourner les permissions pour un rôle spécifique', () => {
    const { result } = renderHookWithAuth();

    const adminPermissions = result.current.getPermissionsForRole('admin');
    const agencyPermissions = result.current.getPermissionsForRole('agency');
    const ownerPermissions = result.current.getPermissionsForRole('owner');
    const publicPermissions = result.current.getPermissionsForRole('public');

    expect(adminPermissions).toContain('manage_users');
    expect(adminPermissions).toContain('manage_agencies');
    expect(adminPermissions).toContain('system_settings');
    expect(adminPermissions).toContain('view_all_data');

    expect(agencyPermissions).toContain('create_property');
    expect(agencyPermissions).toContain('manage_tenants');
    expect(agencyPermissions).toContain('view_analytics');

    expect(ownerPermissions).toContain('manage_own_properties');
    expect(ownerPermissions).toContain('view_own_analytics');

    expect(publicPermissions).toContain('view_properties');
    expect(publicPermissions).toContain('contact_agency');
    expect(publicPermissions).toContain('search_properties');
  });

  it('devrait gérer les utilisateurs sans profil', () => {
    const noProfileContext = {
      ...mockAuthContext,
      profile: null
    };

    const { result } = renderHook(() => usePermissions(), {
      wrapper: ({ children }) => (
        <AuthContext.Provider value={noProfileContext}>
          {children}
        </AuthContext.Provider>
      )
    });

    expect(result.current.hasPermission('view_properties')).toBe(true);
    expect(result.current.hasPermission('manage_users')).toBe(false);
  });

  it('devrait gérer les rôles invalides', () => {
    const invalidRoleContext = {
      ...mockAuthContext,
      profile: {
        ...mockAuthContext.profile,
        role: 'invalid_role' as any
      }
    };

    const { result } = renderHook(() => usePermissions(), {
      wrapper: ({ children }) => (
        <AuthContext.Provider value={invalidRoleContext}>
          {children}
        </AuthContext.Provider>
      )
    });

    expect(result.current.hasPermission('view_properties')).toBe(true);
    expect(result.current.hasPermission('manage_users')).toBe(false);
  });

  it('devrait retourner le rôle actuel de l\'utilisateur', () => {
    const { result } = renderHookWithAuth();

    expect(result.current.getCurrentRole()).toBe('admin');
  });

  it('devrait retourner les permissions du rôle actuel', () => {
    const { result } = renderHookWithAuth();

    const currentPermissions = result.current.getCurrentRolePermissions();
    
    expect(currentPermissions).toContain('manage_users');
    expect(currentPermissions).toContain('manage_agencies');
    expect(currentPermissions).toContain('system_settings');
    expect(currentPermissions).toContain('view_all_data');
  });

  it('devrait vérifier si l\'utilisateur a un rôle spécifique', () => {
    const { result } = renderHookWithAuth();

    expect(result.current.hasRole('admin')).toBe(true);
    expect(result.current.hasRole('agency')).toBe(false);
    expect(result.current.hasRole('owner')).toBe(false);
    expect(result.current.hasRole('public')).toBe(false);
  });

  it('devrait retourner les informations sur les permissions', () => {
    const { result } = renderHookWithAuth();

    const permissionInfo = result.current.getPermissionInfo('manage_users');
    
    expect(permissionInfo).toHaveProperty('name');
    expect(permissionInfo).toHaveProperty('description');
    expect(permissionInfo).toHaveProperty('category');
    expect(permissionInfo).toHaveProperty('isActive');
  });

  it('devrait retourner le nombre total de permissions', () => {
    const { result } = renderHookWithAuth();

    const totalPermissions = result.current.getTotalPermissionsCount();
    
    expect(totalPermissions).toBeGreaterThan(0);
    expect(typeof totalPermissions).toBe('number');
  });

  it('devrait retourner le nombre de permissions actives pour le rôle actuel', () => {
    const { result } = renderHookWithAuth();

    const activePermissionsCount = result.current.getActivePermissionsCount();
    
    expect(activePermissionsCount).toBeGreaterThan(0);
    expect(typeof activePermissionsCount).toBe('number');
  });

  it('devrait retourner les permissions inactives pour le rôle actuel', () => {
    const { result } = renderHookWithAuth();

    const inactivePermissions = result.current.getInactivePermissions();
    
    expect(Array.isArray(inactivePermissions)).toBe(true);
  });

  it('devrait retourner les permissions par niveau d\'accès', () => {
    const { result } = renderHookWithAuth();

    const permissionsByLevel = result.current.getPermissionsByAccessLevel();
    
    expect(permissionsByLevel).toHaveProperty('read');
    expect(permissionsByLevel).toHaveProperty('write');
    expect(permissionsByLevel).toHaveProperty('admin');
  });
});
