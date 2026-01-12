// ============================================
// Data Sources API
// ============================================

import apiClient from '@/libs/apiClient';
import type { 
  DataSource, 
  DataSourceType, 
  DataSourcePreview,
  PaginatedResponse 
} from '@/types';

export interface DataSourcesListParams {
  page?: number;
  page_size?: number;
  project_id?: number;
  data_source_type_id?: number;
  search?: string;
}

export interface CreateDataSourceRequest {
  name: string;
  description?: string;
  data_source_type_id: number;
  data_type: string;
  project_id: number;
  file?: File;
  connection_string?: string;
}

export const dataSourcesApi = {
  // List all data sources
  list: (params?: DataSourcesListParams): Promise<PaginatedResponse<DataSource>> => {
    return apiClient.get<PaginatedResponse<DataSource>>('/data-sources/', { params });
  },

  // Get data source by ID
  getById: (id: number): Promise<DataSource> => {
    return apiClient.get<DataSource>(`/data-sources/${id}/`);
  },

  // Create data source
  create: (data: CreateDataSourceRequest): Promise<DataSource> => {
    if (data.file) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value instanceof File ? value : String(value));
        }
      });
      return apiClient.upload<DataSource>('/data-sources/', formData);
    }
    return apiClient.post<DataSource>('/data-sources/', data);
  },

  // Update data source
  update: (id: number, data: Partial<DataSource>): Promise<DataSource> => {
    return apiClient.patch<DataSource>(`/data-sources/${id}/`, data);
  },

  // Delete data source
  delete: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/data-sources/${id}/`);
  },

  // Get data source preview
  getPreview: (id: number, params?: { limit?: number }): Promise<DataSourcePreview> => {
    return apiClient.get<DataSourcePreview>(`/data-sources/preview/${id}/`, { params });
  },

  // Get data source columns
  getColumns: (id: number): Promise<string[]> => {
    return apiClient.get<string[]>(`/data-sources/${id}/columns/`);
  },

  // Upload file to data source
  uploadFile: (id: number, file: File): Promise<DataSource> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload<DataSource>(`/data-sources/${id}/upload/`, formData);
  },
};

export const dataSourceTypesApi = {
  // List all data source types
  list: (): Promise<DataSourceType[]> => {
    return apiClient.get<DataSourceType[]>('/data-source-types/');
  },

  // Get data source type by ID
  getById: (id: number): Promise<DataSourceType> => {
    return apiClient.get<DataSourceType>(`/data-source-types/${id}/`);
  },
};

export default dataSourcesApi;
