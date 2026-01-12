// ============================================
// useAuth Hook - Authentication state management
// ============================================

import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/libs/queryClient';
import { authApi } from '@/api';
import {
  getAccessToken,
  setTokenDetails,
  setUserRole,
  setUserId,
  clearAuthData,
  isAuthenticated as checkAuth,
} from '@/libs/storage';
import type { LoginRequest, SignupRequest, User, UserRole } from '@/types';

export interface UseAuthReturn {
  user: User | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refetchUser: () => void;
}

export function useAuth(): UseAuthReturn {
  const queryClient = useQueryClient();
  const isAuthenticated = checkAuth();

  // Fetch current user
  const {
    data: user,
    isLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: authApi.getCurrentUser,
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (response) => {
      setTokenDetails(response.token);
      setUserId(response.user.id);
      // Fetch role and set it
      if (response.user.role_id) {
        try {
          const { rolesApi } = await import('@/api');
          const role = await rolesApi.getById(response.user.role_id);
          setUserRole(role.name as UserRole);
        } catch {
          // Fallback to USER role
          setUserRole('USER');
        }
      }
      queryClient.setQueryData(queryKeys.auth.me(), response.user);
    },
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: authApi.signup,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearAuthData();
      queryClient.clear();
      window.location.href = '/login';
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.auth.me(), updatedUser);
    },
  });

  const login = useCallback(
    async (data: LoginRequest) => {
      await loginMutation.mutateAsync(data);
    },
    [loginMutation]
  );

  const signup = useCallback(
    async (data: SignupRequest) => {
      await signupMutation.mutateAsync(data);
    },
    [signupMutation]
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      await updateProfileMutation.mutateAsync(data);
    },
    [updateProfileMutation]
  );

  return useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: isAuthenticated && !!getAccessToken(),
      login,
      signup,
      logout,
      updateProfile,
      refetchUser,
    }),
    [user, isLoading, isAuthenticated, login, signup, logout, updateProfile, refetchUser]
  );
}

export default useAuth;
