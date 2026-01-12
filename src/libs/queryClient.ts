// ============================================
// TanStack Query Client Configuration
// ============================================

import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import type { ApiError } from '@/types';

// Default stale time: 5 minutes
const DEFAULT_STALE_TIME = 5 * 60 * 1000;

// Default cache time: 30 minutes
const DEFAULT_GC_TIME = 30 * 60 * 1000;

// Global error handler
const handleError = (error: unknown) => {
  const apiError = error as ApiError;
  console.error('API Error:', apiError.message || 'An unexpected error occurred');
  
  // You can integrate with a toast notification system here
  // toast.error(apiError.message || 'An unexpected error occurred');
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME,
      gcTime: DEFAULT_GC_TIME,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        const apiError = error as ApiError;
        if (apiError.code?.startsWith('4')) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
  queryCache: new QueryCache({
    onError: handleError,
  }),
  mutationCache: new MutationCache({
    onError: handleError,
  }),
});

// Query key factories for consistent key management
export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },
  
  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.users.details(), id] as const,
  },
  
  // Roles
  roles: {
    all: ['roles'] as const,
    lists: () => [...queryKeys.roles.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.roles.lists(), filters] as const,
    details: () => [...queryKeys.roles.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.roles.details(), id] as const,
  },
  
  // Projects
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.projects.lists(), filters] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.projects.details(), id] as const,
    stats: () => [...queryKeys.projects.all, 'stats'] as const,
    members: (projectId: number) => [...queryKeys.projects.detail(projectId), 'members'] as const,
  },
  
  // Data Sources
  dataSources: {
    all: ['dataSources'] as const,
    lists: () => [...queryKeys.dataSources.all, 'list'] as const,
    list: (projectId?: number) => [...queryKeys.dataSources.lists(), { projectId }] as const,
    details: () => [...queryKeys.dataSources.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.dataSources.details(), id] as const,
    preview: (id: number) => [...queryKeys.dataSources.detail(id), 'preview'] as const,
  },
  
  // Data Versions
  dataVersions: {
    all: ['dataVersions'] as const,
    lists: () => [...queryKeys.dataVersions.all, 'list'] as const,
    list: (params?: { projectId?: number; stage?: string }) => [...queryKeys.dataVersions.lists(), params] as const,
    details: () => [...queryKeys.dataVersions.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.dataVersions.details(), id] as const,
  },
  
  // Experiments
  experiments: {
    all: ['experiments'] as const,
    lists: () => [...queryKeys.experiments.all, 'list'] as const,
    list: (projectId?: number) => [...queryKeys.experiments.lists(), { projectId }] as const,
    details: () => [...queryKeys.experiments.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.experiments.details(), id] as const,
    metrics: (id: number) => [...queryKeys.experiments.detail(id), 'metrics'] as const,
  },
  
  // Deployments
  deployments: {
    all: ['deployments'] as const,
    lists: () => [...queryKeys.deployments.all, 'list'] as const,
    list: (projectId?: number) => [...queryKeys.deployments.lists(), { projectId }] as const,
    details: () => [...queryKeys.deployments.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.deployments.details(), id] as const,
    jobStatus: (id: number) => [...queryKeys.deployments.detail(id), 'status'] as const,
  },
  
  // Model Hub
  modelHub: {
    all: ['modelHub'] as const,
    production: (projectId: number) => [...queryKeys.modelHub.all, 'production', projectId] as const,
    generic: () => [...queryKeys.modelHub.all, 'generic'] as const,
    metrics: (modelId: number) => [...queryKeys.modelHub.all, 'metrics', modelId] as const,
  },
  
  // Infrastructure
  infrastructure: {
    all: ['infrastructure'] as const,
    instances: (params?: Record<string, unknown>) => [...queryKeys.infrastructure.all, 'instances', params] as const,
    instance: (id: number) => [...queryKeys.infrastructure.all, 'instances', id] as const,
    availability: () => [...queryKeys.infrastructure.all, 'availability'] as const,
  },
  
  // Credentials
  credentials: {
    all: ['credentials'] as const,
    lists: () => [...queryKeys.credentials.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.credentials.lists(), filters] as const,
    details: () => [...queryKeys.credentials.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.credentials.details(), id] as const,
    types: () => [...queryKeys.credentials.all, 'types'] as const,
    smtp: () => [...queryKeys.credentials.all, 'smtp'] as const,
  },
  
  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    projectStats: () => [...queryKeys.dashboard.all, 'projectStats'] as const,
    projectsAtRisk: () => [...queryKeys.dashboard.all, 'projectsAtRisk'] as const,
    userDataSources: () => [...queryKeys.dashboard.all, 'userDataSources'] as const,
  },
  
  // Observability
  observability: {
    all: ['observability'] as const,
    metrics: (modelId: number) => [...queryKeys.observability.all, 'metrics', modelId] as const,
    operational: (modelId: number) => [...queryKeys.observability.all, 'operational', modelId] as const,
  },
} as const;

export default queryClient;
