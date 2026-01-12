// ============================================
// Deployments API
// ============================================

import apiClient from '@/libs/apiClient';
import type { 
  DeploymentJob, 
  PromoteExperimentRequest,
  TestingSummary,
  PaginatedResponse 
} from '@/types';

export interface DeploymentsListParams {
  page?: number;
  page_size?: number;
  project_id?: number;
  status?: string;
}

export const deploymentsApi = {
  // List all deployment jobs
  list: (params?: DeploymentsListParams): Promise<PaginatedResponse<DeploymentJob>> => {
    return apiClient.get<PaginatedResponse<DeploymentJob>>('/deployments/', { params });
  },

  // Get deployment job by ID
  getById: (id: number): Promise<DeploymentJob> => {
    return apiClient.get<DeploymentJob>(`/deployments/${id}/`);
  },

  // Promote experiment to deployment
  promote: (data: PromoteExperimentRequest): Promise<DeploymentJob> => {
    return apiClient.post<DeploymentJob>('/promote-experiment/', data);
  },

  // Cancel deployment job
  cancel: (id: number): Promise<DeploymentJob> => {
    return apiClient.post<DeploymentJob>(`/deployments/${id}/cancel/`);
  },

  // Retry failed deployment
  retry: (id: number): Promise<DeploymentJob> => {
    return apiClient.post<DeploymentJob>(`/deployments/${id}/retry/`);
  },

  // Get deployment job status (for polling)
  getStatus: (id: number): Promise<{
    id: number;
    status: string;
    details: Array<{
      step: string;
      status: string;
      message?: string;
      timestamp: string;
    }>;
    progress?: number;
  }> => {
    return apiClient.get(`/deployments/${id}/status/`);
  },

  // Get deployment test results
  getTestResults: (id: number): Promise<TestingSummary> => {
    return apiClient.get<TestingSummary>(`/deployments/${id}/test-results/`);
  },

  // Get deployment logs
  getLogs: (id: number): Promise<{ logs: string[] }> => {
    return apiClient.get<{ logs: string[] }>(`/deployments/${id}/logs/`);
  },

  // Rollback deployment
  rollback: (id: number): Promise<DeploymentJob> => {
    return apiClient.post<DeploymentJob>(`/deployments/${id}/rollback/`);
  },

  // Get production metrics for deployment
  getProductionMetrics: (id: number): Promise<{
    latency_p50: number;
    latency_p95: number;
    latency_p99: number;
    request_count: number;
    error_rate: number;
    uptime: number;
  }> => {
    return apiClient.get(`/deployments/${id}/production-metrics/`);
  },
};

export default deploymentsApi;
