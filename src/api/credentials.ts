// ============================================
// Credentials API
// ============================================

import apiClient from '@/libs/apiClient';
import type { 
  Credential, 
  CredentialType,
  CredentialCreateRequest,
  SMTPConfig,
  PaginatedResponse 
} from '@/types';

export interface CredentialsListParams {
  page?: number;
  page_size?: number;
  project_id?: number;
  credential_type_id?: number;
  is_cloud?: boolean;
}

export const credentialsApi = {
  // List all credentials
  list: (params?: CredentialsListParams): Promise<PaginatedResponse<Credential>> => {
    return apiClient.get<PaginatedResponse<Credential>>('/credentials/', { params });
  },

  // Get credential by ID
  getById: (id: number): Promise<Credential> => {
    return apiClient.get<Credential>(`/credentials/${id}/`);
  },

  // Create credential
  create: (data: CredentialCreateRequest): Promise<Credential> => {
    return apiClient.post<Credential>('/credentials/', data);
  },

  // Update credential
  update: (id: number, data: Partial<CredentialCreateRequest>): Promise<Credential> => {
    return apiClient.patch<Credential>(`/credentials/${id}/`, data);
  },

  // Delete credential
  delete: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/credentials/${id}/`);
  },

  // Get user credentials
  getUserCredentials: (): Promise<Credential[]> => {
    return apiClient.get<Credential[]>('/credentials/user/');
  },

  // Get project credentials
  getProjectCredentials: (projectId: number): Promise<Credential[]> => {
    return apiClient.get<Credential[]>(`/credentials/project/${projectId}/`);
  },

  // Get cloud credentials
  getCloudCredentials: (): Promise<Credential[]> => {
    return apiClient.get<Credential[]>('/credentials/cloud/');
  },

  // Get on-premises credentials
  getOnPremCredentials: (): Promise<Credential[]> => {
    return apiClient.get<Credential[]>('/credentials/on-prem/');
  },

  // Reveal credential value
  reveal: (id: number): Promise<{ value: string }> => {
    return apiClient.get<{ value: string }>(`/credentials/${id}/reveal/`);
  },

  // Test credential connection
  testConnection: (id: number): Promise<{
    success: boolean;
    message: string;
  }> => {
    return apiClient.post(`/credentials/${id}/test/`);
  },
};

export const credentialTypesApi = {
  // List all credential types
  list: (): Promise<CredentialType[]> => {
    return apiClient.get<CredentialType[]>('/credential-types/');
  },

  // Get credential type by ID
  getById: (id: number): Promise<CredentialType> => {
    return apiClient.get<CredentialType>(`/credential-types/${id}/`);
  },
};

export const smtpApi = {
  // Get SMTP configuration
  getConfig: (): Promise<SMTPConfig> => {
    return apiClient.get<SMTPConfig>('/smtp-config/');
  },

  // Update SMTP configuration
  updateConfig: (data: Partial<SMTPConfig> & { password?: string }): Promise<SMTPConfig> => {
    return apiClient.put<SMTPConfig>('/smtp-config/', data);
  },

  // Test SMTP configuration
  testConfig: (email: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    return apiClient.post('/smtp-config/test/', { email });
  },
};

export default credentialsApi;
