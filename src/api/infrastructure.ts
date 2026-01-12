// ============================================
// Infrastructure API
// ============================================

import apiClient from '@/libs/apiClient';
import type { 
  Instance, 
  InfraAvailability,
  PaginatedResponse 
} from '@/types';

export interface InstancesListParams {
  page?: number;
  page_size?: number;
  status?: string;
  project_id?: number;
  instance_type?: string;
}

export interface CreateInstanceRequest {
  name: string;
  instance_type: string;
  project_id?: number;
  specs?: {
    cpu_cores?: number;
    memory_gb?: number;
    storage_gb?: number;
    gpu_type?: string;
    gpu_count?: number;
  };
}

export const infrastructureApi = {
  // List all instances
  listInstances: (params?: InstancesListParams): Promise<PaginatedResponse<Instance>> => {
    return apiClient.get<PaginatedResponse<Instance>>('/instances/', { params });
  },

  // Get instance by ID
  getInstance: (id: number): Promise<Instance> => {
    return apiClient.get<Instance>(`/instances/${id}/`);
  },

  // Create instance
  createInstance: (data: CreateInstanceRequest): Promise<Instance> => {
    return apiClient.post<Instance>('/instances/', data);
  },

  // Update instance
  updateInstance: (id: number, data: Partial<Instance>): Promise<Instance> => {
    return apiClient.patch<Instance>(`/instances/${id}/`, data);
  },

  // Delete instance
  deleteInstance: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/instances/${id}/`);
  },

  // Start instance
  startInstance: (id: number): Promise<Instance> => {
    return apiClient.post<Instance>(`/instances/${id}/start/`);
  },

  // Stop instance
  stopInstance: (id: number): Promise<Instance> => {
    return apiClient.post<Instance>(`/instances/${id}/stop/`);
  },

  // Restart instance
  restartInstance: (id: number): Promise<Instance> => {
    return apiClient.post<Instance>(`/instances/${id}/restart/`);
  },

  // Get instance logs
  getInstanceLogs: (id: number, params?: { lines?: number }): Promise<{ logs: string[] }> => {
    return apiClient.get<{ logs: string[] }>(`/instances/${id}/logs/`, { params });
  },

  // Get infrastructure availability
  getAvailability: (): Promise<InfraAvailability> => {
    return apiClient.get<InfraAvailability>('/infrastructure-availability/');
  },

  // Get instance types / List instance types
  getInstanceTypes: (): Promise<InstanceTypeInfo[]> => {
    return apiClient.get('/instance-types/');
  },

  listInstanceTypes: (): Promise<InstanceTypeInfo[]> => {
    return apiClient.get('/instance-types/');
  },

  // Manage instance (start, stop, restart)
  manageInstance: (id: number, action: 'start' | 'stop' | 'restart'): Promise<Instance> => {
    return apiClient.post<Instance>(`/instances/${id}/${action}/`);
  },

  // Get instance metrics
  getInstanceMetrics: (id: number, params?: {
    start_date?: string;
    end_date?: string;
    metric_type?: 'cpu' | 'memory' | 'disk' | 'network';
  }): Promise<Array<{
    timestamp: string;
    cpu_percent?: number;
    memory_percent?: number;
    disk_percent?: number;
    network_in_bytes?: number;
    network_out_bytes?: number;
  }>> => {
    return apiClient.get(`/instances/${id}/metrics/`, { params });
  },
};

// Instance type info interface
export interface InstanceTypeInfo {
  id: number;
  name: string;
  type: string;
  description?: string;
  cpu_cores: number;
  memory_gb: number;
  storage_gb?: number;
  gpu_type?: string;
  gpu_count?: number;
  price_per_hour: number;
}

export default infrastructureApi;
