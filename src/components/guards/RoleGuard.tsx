// ============================================
// RoleGuard Component - Role-based access control
// ============================================

import React from 'react';
import { useRole } from '@/hooks';
import type { RoleAction } from '@/hooks/useRole';
import type { UserRole } from '@/types';

export interface RoleGuardProps {
  children: React.ReactNode;
  // Allow access for specific roles
  allowedRoles?: UserRole[];
  // Deny access for specific roles
  deniedRoles?: UserRole[];
  // Allow access if user can perform specific action
  requiredAction?: RoleAction;
  // Component to show when access is denied
  fallback?: React.ReactNode;
  // Whether to hide content entirely when denied (vs showing fallback)
  hideOnDeny?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  deniedRoles,
  requiredAction,
  fallback = null,
  hideOnDeny = true,
}) => {
  const { role, canPerformAction } = useRole();

  // Check if access should be denied
  const isDenied = (): boolean => {
    // No role = no access
    if (!role) return true;

    // Check denied roles first
    if (deniedRoles && deniedRoles.includes(role)) {
      return true;
    }

    // Check allowed roles
    if (allowedRoles && !allowedRoles.includes(role)) {
      return true;
    }

    // Check required action
    if (requiredAction && !canPerformAction(requiredAction)) {
      return true;
    }

    return false;
  };

  if (isDenied()) {
    return hideOnDeny ? null : <>{fallback}</>;
  }

  return <>{children}</>;
};

// Convenience components for common role patterns
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <RoleGuard allowedRoles={['ADMIN']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const ManagerAndAbove: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <RoleGuard allowedRoles={['ADMIN', 'MANAGER']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const NotDemo: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <RoleGuard deniedRoles={['DEMO']} fallback={fallback}>
    {children}
  </RoleGuard>
);

// Hook to check role access in component logic
export const useRoleAccess = (options: Omit<RoleGuardProps, 'children' | 'fallback' | 'hideOnDeny'>) => {
  const { role, canPerformAction } = useRole();
  const { allowedRoles, deniedRoles, requiredAction } = options;

  const hasAccess = (): boolean => {
    if (!role) return false;

    if (deniedRoles && deniedRoles.includes(role)) {
      return false;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
      return false;
    }

    if (requiredAction && !canPerformAction(requiredAction)) {
      return false;
    }

    return true;
  };

  return hasAccess();
};

export default RoleGuard;
