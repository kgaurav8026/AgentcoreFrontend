// ============================================
// useRole Hook - Role-based access control
// ============================================

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/libs/queryClient';
import { rolesApi } from '@/api';
import { getUserRole, getUserId } from '@/libs/storage';
import type { UserRole, Role } from '@/types';

export interface UseRoleReturn {
  role: UserRole | null;
  roleDetails: Role | null | undefined;
  isLoading: boolean;
  isAdmin: boolean;
  isDemo: boolean;
  isUser: boolean;
  isManager: boolean;
  hasPermission: (permission: string) => boolean;
  canPerformAction: (action: RoleAction) => boolean;
}

export type RoleAction =
  | 'create_project'
  | 'edit_project'
  | 'delete_project'
  | 'create_experiment'
  | 'run_experiment'
  | 'promote_experiment'
  | 'manage_users'
  | 'manage_credentials'
  | 'view_infrastructure'
  | 'manage_infrastructure'
  | 'upload_data'
  | 'delete_data';

// Role-based action permissions
const rolePermissions: Record<UserRole, RoleAction[]> = {
  ADMIN: [
    'create_project',
    'edit_project',
    'delete_project',
    'create_experiment',
    'run_experiment',
    'promote_experiment',
    'manage_users',
    'manage_credentials',
    'view_infrastructure',
    'manage_infrastructure',
    'upload_data',
    'delete_data',
  ],
  MANAGER: [
    'create_project',
    'edit_project',
    'create_experiment',
    'run_experiment',
    'promote_experiment',
    'manage_credentials',
    'view_infrastructure',
    'upload_data',
    'delete_data',
  ],
  USER: [
    'create_experiment',
    'run_experiment',
    'view_infrastructure',
    'upload_data',
  ],
  DEMO: [
    'view_infrastructure',
  ],
};

export function useRole(): UseRoleReturn {
  const storedRole = getUserRole();
  const userId = getUserId();

  // Optionally fetch role details for permissions
  const { data: roleDetails, isLoading } = useQuery({
    queryKey: queryKeys.roles.detail(userId ?? 0),
    queryFn: async () => {
      // This is a simplified approach - in production you might fetch from user's role_id
      const roles = await rolesApi.list();
      return roles.find((r) => r.name === storedRole) ?? null;
    },
    enabled: !!storedRole && !!userId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  const isAdmin = storedRole === 'ADMIN';
  const isDemo = storedRole === 'DEMO';
  const isUser = storedRole === 'USER';
  const isManager = storedRole === 'MANAGER';

  const hasPermission = useMemo(
    () => (permission: string): boolean => {
      if (!roleDetails?.permissions) return false;
      return roleDetails.permissions.includes(permission);
    },
    [roleDetails]
  );

  const canPerformAction = useMemo(
    () => (action: RoleAction): boolean => {
      if (!storedRole) return false;
      return rolePermissions[storedRole]?.includes(action) ?? false;
    },
    [storedRole]
  );

  return useMemo(
    () => ({
      role: storedRole,
      roleDetails,
      isLoading,
      isAdmin,
      isDemo,
      isUser,
      isManager,
      hasPermission,
      canPerformAction,
    }),
    [storedRole, roleDetails, isLoading, isAdmin, isDemo, isUser, isManager, hasPermission, canPerformAction]
  );
}

export default useRole;
