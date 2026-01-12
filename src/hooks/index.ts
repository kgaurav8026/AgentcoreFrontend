// ============================================
// Hooks Index - Export all custom hooks
// ============================================

export { useAuth } from './useAuth';
export type { UseAuthReturn } from './useAuth';

export { useRole } from './useRole';
export type { UseRoleReturn, RoleAction } from './useRole';

export { useSelectedProject, useSelectedProjectId } from './useSelectedProject';
export type { UseSelectedProjectReturn } from './useSelectedProject';

export { usePaginatedTable } from './usePaginatedTable';
export type { UsePaginatedTableOptions, UsePaginatedTableReturn } from './usePaginatedTable';

export { useToast } from './useToast';
export type { UseToastReturn, Toast, ToastType } from './useToast';

export { usePolling } from './usePolling';
export type { UsePollingOptions, UsePollingReturn } from './usePolling';
