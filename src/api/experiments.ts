// ============================================
// Experiments API
// ============================================

import apiClient from '@/libs/apiClient';
import type { 
  Experiment, 
  ExperimentPayload,
  ExperimentMetrics,
  WebhookExperimentPayload,
  SubModel,
  PaginatedResponse 
} from '@/types';

export interface ExperimentsListParams {
  page?: number;
  page_size?: number;
  project_id?: number;
  status?: string;
  search?: string;
}

export const experimentsApi = {
  // List all experiments
  list: (params?: ExperimentsListParams): Promise<PaginatedResponse<Experiment>> => {
    return apiClient.get<PaginatedResponse<Experiment>>('/experiments/', { params });
  },

  // Get experiment by ID
  getById: (id: number): Promise<Experiment> => {
    return apiClient.get<Experiment>(`/experiments/${id}/`);
  },

  // Run new experiment
  run: (data: ExperimentPayload): Promise<Experiment> => {
    // Ensure hyperparameters is a proper JSON object
    const payload = {
      ...data,
      hyperparameters: typeof data.hyperparameters === 'string' 
        ? JSON.parse(data.hyperparameters) 
        : data.hyperparameters,
    };
    return apiClient.post<Experiment>('/experiments/run/', payload);
  },

  // Run experiment via webhook
  runWebhook: (data: WebhookExperimentPayload): Promise<Experiment> => {
    return apiClient.post<Experiment>('/experiments/webhook/', data);
  },

  // Cancel experiment
  cancel: (id: number): Promise<Experiment> => {
    return apiClient.post<Experiment>(`/experiments/${id}/cancel/`);
  },

  // Delete experiment
  delete: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/experiments/${id}/`);
  },

  // Get experiment metrics
  getMetrics: (id: number): Promise<ExperimentMetrics> => {
    return apiClient.get<ExperimentMetrics>(`/experiments/${id}/metrics/`);
  },

  // Get experiment logs
  getLogs: (id: number): Promise<{ logs: string[] }> => {
    return apiClient.get<{ logs: string[] }>(`/experiments/${id}/logs/`);
  },

  // Get experiment artifacts
  getArtifacts: (id: number): Promise<{
    artifacts: Array<{
      name: string;
      path: string;
      size: number;
      type: string;
    }>;
  }> => {
    return apiClient.get(`/experiments/${id}/artifacts/`);
  },

  // Compare experiments
  compare: (ids: number[]): Promise<{
    experiments: Experiment[];
    metrics_comparison: Record<string, number[]>;
  }> => {
    return apiClient.post('/experiments/compare/', { experiment_ids: ids });
  },

  // Get experiment status (for polling)
  getStatus: (id: number): Promise<{
    id: number;
    status: string;
    progress?: number;
    message?: string;
  }> => {
    return apiClient.get(`/experiments/${id}/status/`);
  },
};

export const subModelsApi = {
  // List all sub-models
  list: (projectTypeId?: number): Promise<SubModel[]> => {
    return apiClient.get<SubModel[]>('/sub-models/', { 
      params: projectTypeId ? { project_type_id: projectTypeId } : undefined 
    });
  },

  // Get sub-model by ID
  getById: (id: number): Promise<SubModel> => {
    return apiClient.get<SubModel>(`/sub-models/${id}/`);
  },

  // Get sub-model hyperparameters schema
  getHyperparametersSchema: (id: number): Promise<{
    schema: Record<string, {
      type: string;
      description?: string;
      default?: unknown;
      min?: number;
      max?: number;
      options?: unknown[];
    }>;
  }> => {
    return apiClient.get(`/sub-models/${id}/hyperparameters-schema/`);
  },
};

export default experimentsApi;
