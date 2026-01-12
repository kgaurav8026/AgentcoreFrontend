// ============================================
// Data Versions API
// ============================================

import apiClient from '@/libs/apiClient';
import type { 
  DataVersion, 
  DataVersionStage,
  DataVersionCreateRequest,
  PaginatedResponse 
} from '@/types';

export interface DataVersionsListParams {
  page?: number;
  page_size?: number;
  project_id?: number;
  data_source_id?: number;
  stage?: DataVersionStage;
}

export interface PreprocessDataRequest {
  data_version_id: number;
  operations: PreprocessOperation[];
}

export interface PreprocessOperation {
  type: 'drop_columns' | 'fill_na' | 'normalize' | 'encode' | 'filter' | 'transform';
  params: Record<string, unknown>;
}

export interface FeatureEngineeringRequest {
  data_version_id: number;
  features: FeatureDefinition[];
}

export interface FeatureDefinition {
  name: string;
  type: 'aggregation' | 'transformation' | 'interaction' | 'time_based';
  source_columns: string[];
  params: Record<string, unknown>;
}

export const dataVersionsApi = {
  // List all data versions
  list: (params?: DataVersionsListParams): Promise<PaginatedResponse<DataVersion>> => {
    return apiClient.get<PaginatedResponse<DataVersion>>('/data-versions/', { params });
  },

  // Get data version by ID
  getById: (id: number): Promise<DataVersion> => {
    return apiClient.get<DataVersion>(`/data-versions/${id}/`);
  },

  // Create data version
  create: (data: DataVersionCreateRequest): Promise<DataVersion> => {
    return apiClient.post<DataVersion>('/data-versions/', data);
  },

  // Delete data version
  delete: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/data-versions/${id}/`);
  },

  // Get data version preview
  getPreview: (id: number, params?: { limit?: number }): Promise<{
    columns: string[];
    preview: Record<string, unknown>[];
    total_rows: number;
  }> => {
    return apiClient.get(`/data-versions/${id}/preview/`, { params });
  },

  // Get data version columns
  getColumns: (id: number): Promise<string[]> => {
    return apiClient.get<string[]>(`/data-versions/${id}/columns/`);
  },

  // Preprocess data (creates new version with stage: preprocessed)
  preprocess: (data: PreprocessDataRequest): Promise<DataVersion> => {
    return apiClient.post<DataVersion>('/data-versions/preprocess/', data);
  },

  // Apply feature engineering (creates new version with stage: feature_engineered)
  featureEngineer: (data: FeatureEngineeringRequest): Promise<DataVersion> => {
    return apiClient.post<DataVersion>('/data-versions/feature-engineer/', data);
  },

  // Get data version statistics
  getStatistics: (id: number): Promise<{
    row_count: number;
    column_count: number;
    missing_values: Record<string, number>;
    column_types: Record<string, string>;
    summary_statistics: Record<string, {
      mean?: number;
      std?: number;
      min?: number;
      max?: number;
      unique_count?: number;
    }>;
  }> => {
    return apiClient.get(`/data-versions/${id}/statistics/`);
  },

  // Download data version as file
  download: (id: number, format: 'csv' | 'parquet' | 'json' = 'csv'): Promise<Blob> => {
    return apiClient.get(`/data-versions/${id}/download/`, { 
      params: { format },
      headers: { Accept: 'application/octet-stream' }
    }) as Promise<Blob>;
  },
};

export default dataVersionsApi;
