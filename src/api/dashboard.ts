// ============================================
// Dashboard API
// ============================================

import apiClient from '@/libs/apiClient';
import type { 
  DashboardStats, 
  ProjectStat,
  ProjectAtRisk,
  UserProjectDataSource,
  InfraAvailability 
} from '@/types';

export const dashboardApi = {
  // Get dashboard overview stats
  getStats: (): Promise<DashboardStats> => {
    return apiClient.get<DashboardStats>('/dashboard/stats/');
  },

  // Get user's project statistics
  getUserProjectStats: (): Promise<ProjectStat[]> => {
    return apiClient.get<ProjectStat[]>('/user/project-stat/');
  },

  // Get projects at risk
  getProjectsAtRisk: (): Promise<ProjectAtRisk[]> => {
    return apiClient.get<ProjectAtRisk[]>('/projects-at-risk/');
  },

  // Get user's project data sources
  getUserProjectDataSources: (): Promise<UserProjectDataSource[]> => {
    return apiClient.get<UserProjectDataSource[]>('/user/project-data-sources/');
  },

  // Get infrastructure availability
  getInfraAvailability: (): Promise<InfraAvailability> => {
    return apiClient.get<InfraAvailability>('/infrastructure-availability/');
  },

  // Get recent experiments
  getRecentExperiments: (limit?: number): Promise<Array<{
    id: number;
    experiment_name: string;
    project_name: string;
    status: string;
    created_at: string;
  }>> => {
    return apiClient.get('/dashboard/recent-experiments/', { 
      params: limit ? { limit } : undefined 
    });
  },

  // Get recent deployments
  getRecentDeployments: (limit?: number): Promise<Array<{
    id: number;
    experiment_name: string;
    project_name: string;
    status: string;
    created_at: string;
  }>> => {
    return apiClient.get('/dashboard/recent-deployments/', { 
      params: limit ? { limit } : undefined 
    });
  },

  // Get activity timeline
  getActivityTimeline: (params?: {
    limit?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<Array<{
    id: number;
    type: 'experiment' | 'deployment' | 'data_source' | 'project';
    action: string;
    description: string;
    user_name: string;
    project_name?: string;
    timestamp: string;
  }>> => {
    return apiClient.get('/dashboard/activity-timeline/', { params });
  },

  // Get system health
  getSystemHealth: (): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Array<{
      name: string;
      status: 'up' | 'down' | 'degraded';
      latency_ms?: number;
      message?: string;
    }>;
    last_checked: string;
  }> => {
    return apiClient.get('/dashboard/system-health/');
  },
};

export default dashboardApi;
