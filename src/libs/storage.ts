// ============================================
// Local Storage Utilities
// ============================================

import type { TokenDetails, UserRole } from '@/types';

const STORAGE_KEYS = {
  TOKEN_DETAILS: 'tokenDetails',
  SELECTED_PROJECT_ID: 'selectedProjectId',
  USER_ROLE: 'userRole',
  USER_ID: 'userId',
} as const;

// Token management
export const getTokenDetails = (): TokenDetails | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TOKEN_DETAILS);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const setTokenDetails = (token: TokenDetails): void => {
  localStorage.setItem(STORAGE_KEYS.TOKEN_DETAILS, JSON.stringify(token));
};

export const removeTokenDetails = (): void => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN_DETAILS);
};

export const getAccessToken = (): string | null => {
  const tokenDetails = getTokenDetails();
  return tokenDetails?.access ?? null;
};

export const getRefreshToken = (): string | null => {
  const tokenDetails = getTokenDetails();
  return tokenDetails?.refresh ?? null;
};

// Project selection
export const getSelectedProjectId = (): number | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_PROJECT_ID);
  return stored ? parseInt(stored, 10) : null;
};

export const setSelectedProjectId = (projectId: number): void => {
  localStorage.setItem(STORAGE_KEYS.SELECTED_PROJECT_ID, String(projectId));
};

export const removeSelectedProjectId = (): void => {
  localStorage.removeItem(STORAGE_KEYS.SELECTED_PROJECT_ID);
};

// User role
export const getUserRole = (): UserRole | null => {
  return localStorage.getItem(STORAGE_KEYS.USER_ROLE) as UserRole | null;
};

export const setUserRole = (role: UserRole): void => {
  localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
};

export const removeUserRole = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
};

// User ID
export const getUserId = (): number | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER_ID);
  return stored ? parseInt(stored, 10) : null;
};

export const setUserId = (userId: number): void => {
  localStorage.setItem(STORAGE_KEYS.USER_ID, String(userId));
};

export const removeUserId = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER_ID);
};

// Clear all auth data
export const clearAuthData = (): void => {
  removeTokenDetails();
  removeUserRole();
  removeUserId();
  removeSelectedProjectId();
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};
