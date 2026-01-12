// ============================================
// Authentication API
// ============================================

import apiClient from '@/libs/apiClient';
import type { 
  LoginRequest, 
  LoginResponse, 
  SignupRequest, 
  User, 
  TokenDetails 
} from '@/types';

export const authApi = {
  // Login user
  login: (data: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login/', data);
  },

  // Signup user
  signup: (data: SignupRequest): Promise<User> => {
    return apiClient.post<User>('/auth/signup/', data);
  },

  // Logout user
  logout: (): Promise<void> => {
    return apiClient.post<void>('/auth/logout/');
  },

  // Refresh token
  refreshToken: (refreshToken: string): Promise<TokenDetails> => {
    return apiClient.post<TokenDetails>('/auth/refresh/', { refresh: refreshToken });
  },

  // Get current user
  getCurrentUser: (): Promise<User> => {
    return apiClient.get<User>('/users/me/');
  },

  // Update current user profile
  updateProfile: (data: Partial<User>): Promise<User> => {
    return apiClient.patch<User>('/users/me/', data);
  },

  // Change password
  changePassword: (data: { old_password: string; new_password: string }): Promise<void> => {
    return apiClient.post<void>('/auth/change-password/', data);
  },

  // Request password reset
  requestPasswordReset: (email: string): Promise<void> => {
    return apiClient.post<void>('/auth/password-reset/', { email });
  },

  // Confirm password reset
  confirmPasswordReset: (data: { token: string; new_password: string }): Promise<void> => {
    return apiClient.post<void>('/auth/password-reset/confirm/', data);
  },
};

export default authApi;
