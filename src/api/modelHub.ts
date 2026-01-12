// ============================================
// Model Hub API
// ============================================

import apiClient from '@/libs/apiClient';
import type { 
  ProductionModel, 
  GenericModel,
  OperationalMetrics,
  PaginatedResponse 
} from '@/types';

export interface ProductionModelsListParams {
  page?: number;
  page_size?: number;
  status?: 'active' | 'inactive' | 'deprecated';
}

export const modelHubApi = {
  // Get production models for a project
  getProductionModels: (projectId: number, params?: ProductionModelsListParams): Promise<PaginatedResponse<ProductionModel>> => {
    return apiClient.get<PaginatedResponse<ProductionModel>>(`/models-hub-prod/${projectId}/`, { params });
  },

  // Get production model by ID
  getProductionModel: (id: number): Promise<ProductionModel> => {
    return apiClient.get<ProductionModel>(`/production-models/${id}/`);
  },

  // Update production model status
  updateModelStatus: (id: number, status: 'active' | 'inactive' | 'deprecated'): Promise<ProductionModel> => {
    return apiClient.patch<ProductionModel>(`/production-models/${id}/`, { status });
  },

  // Get model operational metrics
  getOperationalMetrics: (modelId: number, params?: {
    start_date?: string;
    end_date?: string;
    interval?: 'hour' | 'day' | 'week';
  }): Promise<OperationalMetrics[]> => {
    return apiClient.get<OperationalMetrics[]>(`/production-models/${modelId}/operational-metrics/`, { params });
  },

  // List generic models
  listGenericModels: (params?: {
    category?: string;
    framework?: string;
    search?: string;
  }): Promise<GenericModel[]> => {
    return apiClient.get<GenericModel[]>('/generic-models/', { params });
  },

  // Get generic model by ID
  getGenericModel: (id: number): Promise<GenericModel> => {
    return apiClient.get<GenericModel>(`/generic-models/${id}/`);
  },

  // Get model categories
  getCategories: (): Promise<string[]> => {
    return apiClient.get<string[]>('/model-categories/');
  },

  // Get computer vision models
  getComputerVisionModels: (projectId: number): Promise<ProductionModel[]> => {
    return apiClient.get<ProductionModel[]>(`/models-hub-cv/${projectId}/`);
  },

  // Get sales forecast models
  getSalesForecastModels: (projectId: number): Promise<ProductionModel[]> => {
    return apiClient.get<ProductionModel[]>(`/models-hub-forecast/${projectId}/`);
  },

  // Test model endpoint
  testEndpoint: (modelId: number, testData: Record<string, unknown>): Promise<{
    prediction: unknown;
    latency_ms: number;
    success: boolean;
  }> => {
    return apiClient.post(`/production-models/${modelId}/test/`, { data: testData });
  },
};

export default modelHubApi;
