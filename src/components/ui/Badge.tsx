// ============================================
// Badge Component - Status indicators
// ============================================

import React from 'react';

export type BadgeVariant = 
  | 'default' 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-primary-100 text-primary-800',
  secondary: 'bg-gray-100 text-gray-600',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-gray-400',
  primary: 'bg-primary-500',
  secondary: 'bg-gray-400',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  dot = false,
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center font-medium
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${rounded ? 'rounded-full' : 'rounded'}
        ${className}
      `}
    >
      {dot && (
        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
};

// Status Badge - Predefined status mappings
export type StatusType = 
  | 'pending' 
  | 'running' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'active' 
  | 'inactive' 
  | 'deprecated'
  | 'stopped'
  | 'terminated'
  | 'error';

const statusVariants: Record<StatusType, BadgeVariant> = {
  pending: 'warning',
  running: 'info',
  completed: 'success',
  failed: 'danger',
  cancelled: 'secondary',
  active: 'success',
  inactive: 'secondary',
  deprecated: 'warning',
  stopped: 'secondary',
  terminated: 'danger',
  error: 'danger',
};

export interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalizedStatus = status.toLowerCase() as StatusType;
  const variant = statusVariants[normalizedStatus] || 'default';
  const displayText = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');

  return (
    <Badge variant={variant} dot rounded className={className}>
      {displayText}
    </Badge>
  );
};

// Role Badge
export interface RoleBadgeProps {
  role: string;
  className?: string;
}

const roleVariants: Record<string, BadgeVariant> = {
  ADMIN: 'danger',
  MANAGER: 'primary',
  USER: 'info',
  DEMO: 'secondary',
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className = '' }) => {
  const variant = roleVariants[role.toUpperCase()] || 'default';
  
  return (
    <Badge variant={variant} rounded className={className}>
      {role}
    </Badge>
  );
};

export default Badge;
