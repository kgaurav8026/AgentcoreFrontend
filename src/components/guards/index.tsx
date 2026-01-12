import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import type { UserRole } from "@/types";

interface GuardProps {
  children: React.ReactNode;
}

interface RoleGuardProps extends GuardProps {
  allowedRoles: UserRole[];
}

// Protects routes that require authentication
export function AuthGuard({ children }: GuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Protects routes that should only be accessible to guests (non-authenticated users)
export function GuestGuard({ children }: GuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

// Role-based access control guard
export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { role, isLoading } = useRole();

  if (isLoading) {
    return null;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// Shorthand for admin-only routes
export function AdminOnly({ children }: GuardProps) {
  return <RoleGuard allowedRoles={["admin"]}>{children}</RoleGuard>;
}

// Shorthand for manager and above routes
export function ManagerAndAbove({ children }: GuardProps) {
  return <RoleGuard allowedRoles={["admin", "manager"]}>{children}</RoleGuard>;
}
