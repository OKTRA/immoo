// Composants d'authentification et de gestion des rôles
export { default as RoleGuard } from './RoleGuard';
export { default as UserRoleInfo } from './UserRoleInfo';
export { default as UserPermissions } from './UserPermissions';

// Types et interfaces
export type { AuthContextType } from '@/types/auth';
export type { Permission, RolePermissions } from '@/hooks/usePermissions';

// Hooks
export { usePermissions } from '@/hooks/usePermissions';
export { useAuth } from '@/contexts/auth/AuthContext';
