// ============================================
// useSelectedProject Hook - Project selection state
// ============================================

import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/libs/queryClient';
import { projectsApi } from '@/api';
import {
  getSelectedProjectId,
  setSelectedProjectId,
  removeSelectedProjectId,
} from '@/libs/storage';
import type { Project } from '@/types';

export interface UseSelectedProjectReturn {
  projectId: number | null;
  selectedProjectId: number | null; // alias for compatibility
  project: Project | null | undefined;
  projects: Project[];
  isLoading: boolean;
  selectProject: (id: number | null) => void;
  clearProject: () => void;
  refetchProject: () => void;
}

export function useSelectedProject(): UseSelectedProjectReturn {
  const queryClient = useQueryClient();
  const projectId = getSelectedProjectId();

  // Fetch all projects
  const { data: projectsData } = useQuery({
    queryKey: queryKeys.projects.lists(),
    queryFn: () => projectsApi.list(),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch selected project details
  const {
    data: project,
    isLoading,
    refetch: refetchProject,
  } = useQuery({
    queryKey: queryKeys.projects.detail(projectId ?? 0),
    queryFn: () => projectsApi.getById(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const selectProject = useCallback(
    (id: number | null) => {
      if (id === null) {
        removeSelectedProjectId();
        return;
      }
      setSelectedProjectId(id);
      // Invalidate project-specific queries
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dataSources.list(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.experiments.list(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.deployments.list(id) });
      // Force re-render by refetching
      window.dispatchEvent(new CustomEvent('projectChanged', { detail: { projectId: id } }));
    },
    [queryClient]
  );

  const clearProject = useCallback(() => {
    removeSelectedProjectId();
    queryClient.removeQueries({ queryKey: queryKeys.projects.detail(projectId ?? 0) });
    window.dispatchEvent(new CustomEvent('projectChanged', { detail: { projectId: null } }));
  }, [projectId, queryClient]);

  return useMemo(
    () => ({
      projectId,
      selectedProjectId: projectId, // alias
      project,
      projects: projectsData?.results ?? [],
      isLoading,
      selectProject,
      clearProject,
      refetchProject,
    }),
    [projectId, project, projectsData, isLoading, selectProject, clearProject, refetchProject]
  );
}

// Hook to get just the project ID without loading project details
export function useSelectedProjectId(): number | null {
  return getSelectedProjectId();
}

export default useSelectedProject;
