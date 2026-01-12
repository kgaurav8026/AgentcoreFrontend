// ============================================
// Projects API
// ============================================

import apiClient from '@/libs/apiClient';
import type { 
  Project, 
  ProjectMember, 
  ProjectStat, 
  ProjectType,
  PaginatedResponse 
} from '@/types';

export interface ProjectsListParams {
  page?: number;
  page_size?: number;
  search?: string;
  project_type_id?: number;
}

export interface AddProjectMemberRequest {
  user_id: number;
  role_id: number;
}

export const projectsApi = {
  // List all projects
  list: (params?: ProjectsListParams): Promise<PaginatedResponse<Project>> => {
    return apiClient.get<PaginatedResponse<Project>>('/projects/', { params });
  },

  // Get project by ID
  getById: (id: number): Promise<Project> => {
    return apiClient.get<Project>(`/projects/${id}/`);
  },

  // Create project
  create: (data: Partial<Project>): Promise<Project> => {
    return apiClient.post<Project>('/projects/', data);
  },

  // Update project
  update: (id: number, data: Partial<Project>): Promise<Project> => {
    return apiClient.patch<Project>(`/projects/${id}/`, data);
  },

  // Delete project
  delete: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/projects/${id}/`);
  },

  // Get project details (with data sources)
  getDetails: (id: number): Promise<Project> => {
    return apiClient.get<Project>(`/projects/${id}/details/`);
  },

  // Get project members
  getMembers: (projectId: number): Promise<ProjectMember[]> => {
    return apiClient.get<ProjectMember[]>(`/projects/${projectId}/members/`);
  },

  // Add project member
  addMember: (projectId: number, data: AddProjectMemberRequest): Promise<ProjectMember> => {
    return apiClient.post<ProjectMember>(`/projects/${projectId}/members/`, data);
  },

  // Update project member role
  updateMemberRole: (projectId: number, memberId: number, roleId: number): Promise<ProjectMember> => {
    return apiClient.patch<ProjectMember>(`/projects/${projectId}/members/${memberId}/`, { role_id: roleId });
  },

  // Remove project member
  removeMember: (projectId: number, memberId: number): Promise<void> => {
    return apiClient.delete<void>(`/projects/${projectId}/members/${memberId}/`);
  },

  // Get user's project stats
  getUserProjectStats: (): Promise<ProjectStat[]> => {
    return apiClient.get<ProjectStat[]>('/user/project-stat/');
  },
};

export const projectTypesApi = {
  // List all project types
  list: (): Promise<ProjectType[]> => {
    return apiClient.get<ProjectType[]>('/project-types/');
  },

  // Get project type by ID
  getById: (id: number): Promise<ProjectType> => {
    return apiClient.get<ProjectType>(`/project-types/${id}/`);
  },
};

export default projectsApi;
