// ============================================
// Users API
// ============================================

import apiClient from '@/libs/apiClient';
import type { User, Role, PaginatedResponse } from '@/types';

export interface UsersListParams {
  page?: number;
  page_size?: number;
  search?: string;
  role_id?: number;
  is_active?: boolean;
}

export const usersApi = {
  // List all users
  list: (params?: UsersListParams): Promise<PaginatedResponse<User>> => {
    return apiClient.get<PaginatedResponse<User>>('/users/', { params });
  },

  // Get user by ID
  getById: (id: number): Promise<User> => {
    return apiClient.get<User>(`/users/${id}/`);
  },

  // Create user
  create: (data: Partial<User> & { password: string }): Promise<User> => {
    return apiClient.post<User>('/users/', data);
  },

  // Update user
  update: (id: number, data: Partial<User>): Promise<User> => {
    return apiClient.patch<User>(`/users/${id}/`, data);
  },

  // Delete user
  delete: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/users/${id}/`);
  },

  // Activate user
  activate: (id: number): Promise<User> => {
    return apiClient.post<User>(`/users/${id}/activate/`);
  },

  // Deactivate user
  deactivate: (id: number): Promise<User> => {
    return apiClient.post<User>(`/users/${id}/deactivate/`);
  },
};

export const rolesApi = {
  // List all roles
  list: (): Promise<Role[]> => {
    return apiClient.get<Role[]>('/roles/');
  },

  // Get role by ID
  getById: (id: number): Promise<Role> => {
    return apiClient.get<Role>(`/roles/${id}/`);
  },

  // Create role
  create: (data: Partial<Role>): Promise<Role> => {
    return apiClient.post<Role>('/roles/', data);
  },

  // Update role
  update: (id: number, data: Partial<Role>): Promise<Role> => {
    return apiClient.patch<Role>(`/roles/${id}/`, data);
  },

  // Delete role
  delete: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/roles/${id}/`);
  },
};

export default usersApi;
