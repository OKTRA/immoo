import { vi, describe, it, expect, beforeEach } from 'vitest';
import PermissionService from '../permissionService';

// Mock de Supabase
const mockSupabase = {
  from: vi.fn()
};

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}));

describe('PermissionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllPermissions', () => {
    it('devrait récupérer toutes les permissions actives', async () => {
      const mockPermissions = [
        { id: '1', name: 'View Properties', key: 'view_properties', is_active: true },
        { id: '2', name: 'Create Property', key: 'create_property', is_active: true }
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockPermissions,
                error: null
              })
            })
          })
        })
      });

      const result = await PermissionService.getAllPermissions();

      expect(result.permissions).toEqual(mockPermissions);
      expect(result.error).toBeNull();
    });

    it('devrait gérer les erreurs', async () => {
      const mockError = new Error('Database error');

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              order: vi.fn().mockRejectedValue(mockError)
            })
          })
        })
      });

      const result = await PermissionService.getAllPermissions();

      expect(result.permissions).toEqual([]);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getPermissionsByCategory', () => {
    it('devrait grouper les permissions par catégorie', async () => {
      const mockPermissions = [
        { id: '1', name: 'View Properties', category: 'Properties', is_active: true },
        { id: '2', name: 'Create Property', category: 'Properties', is_active: true },
        { id: '3', name: 'Manage Users', category: 'Administration', is_active: true }
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockPermissions,
                error: null
              })
            })
          })
        })
      });

      const result = await PermissionService.getPermissionsByCategory();

      expect(result.permissions).toEqual({
        'Properties': [
          { id: '1', name: 'View Properties', category: 'Properties', is_active: true },
          { id: '2', name: 'Create Property', category: 'Properties', is_active: true }
        ],
        'Administration': [
          { id: '3', name: 'Manage Users', category: 'Administration', is_active: true }
        ]
      });
      expect(result.error).toBeNull();
    });
  });

  describe('checkUserPermission', () => {
    it('devrait vérifier si un utilisateur a une permission spécifique', async () => {
      const mockUserRole = { role_id: 'role-1' };
      const mockPermissions = [
        { id: '1', key: 'view_properties' },
        { id: '2', key: 'create_property' }
      ];

      // Mock pour getUserPermissions
      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockUserRole,
                  error: null
                })
              })
            })
          })
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                data: mockPermissions.map(p => ({ permissions: p }))
              })
            })
          })
        });

      const result = await PermissionService.checkUserPermission('user-1', 'view_properties');

      expect(result.hasPermission).toBe(true);
      expect(result.error).toBeNull();
    });

    it('devrait retourner false si l\'utilisateur n\'a pas la permission', async () => {
      const mockUserRole = { role_id: 'role-1' };
      const mockPermissions = [
        { id: '1', key: 'view_properties' }
      ];

      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockUserRole,
                  error: null
                })
              })
            })
          })
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                data: mockPermissions.map(p => ({ permissions: p }))
              })
            })
          })
        });

      const result = await PermissionService.checkUserPermission('user-1', 'create_property');

      expect(result.hasPermission).toBe(false);
      expect(result.error).toBeNull();
    });
  });

  describe('assignPermissionToRole', () => {
    it('devrait attribuer une permission à un rôle', async () => {
      mockSupabase.from.mockReturnValue({
        upsert: vi.fn().mockResolvedValue({
          error: null
        })
      });

      const result = await PermissionService.assignPermissionToRole('role-1', 'perm-1', 'admin-1');

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it('devrait gérer les erreurs lors de l\'attribution', async () => {
      const mockError = new Error('Insert failed');

      mockSupabase.from.mockReturnValue({
        upsert: vi.fn().mockRejectedValue(mockError)
      });

      const result = await PermissionService.assignPermissionToRole('role-1', 'perm-1', 'admin-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Insert failed');
    });
  });

  describe('createRole', () => {
    it('devrait créer un nouveau rôle avec ses permissions', async () => {
      const mockRole = { id: 'new-role-1' };

      mockSupabase.from
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockRole,
                error: null
              })
            })
          })
        })
        .mockReturnValue({
          insert: vi.fn().mockResolvedValue({
            error: null
          })
        });

      const result = await PermissionService.createRole({
        name: 'Moderator',
        description: 'Role with limited permissions',
        permissions: ['perm-1', 'perm-2']
      });

      expect(result.roleId).toBe('new-role-1');
      expect(result.error).toBeNull();
    });
  });

  describe('updateRole', () => {
    it('devrait mettre à jour un rôle existant', async () => {
      mockSupabase.from
        .mockReturnValueOnce({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: null
            })
          })
        })
        .mockReturnValue({
          delete: vi.fn().mockResolvedValue({
            error: null
          }),
          insert: vi.fn().mockResolvedValue({
            error: null
          })
        });

      const result = await PermissionService.updateRole('role-1', {
        name: 'Updated Role',
        permissions: ['perm-1', 'perm-3']
      });

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('deleteRole', () => {
    it('devrait supprimer un rôle non utilisé', async () => {
      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                data: []
              })
            })
          })
        })
        .mockReturnValue({
          delete: vi.fn().mockResolvedValue({
            error: null
          })
        });

      const result = await PermissionService.deleteRole('role-1');

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it('devrait empêcher la suppression d\'un rôle utilisé', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              data: [{ id: 'user-1' }]
            })
          })
        })
      });

      const result = await PermissionService.deleteRole('role-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot delete role that is currently assigned to users');
    });
  });
});
