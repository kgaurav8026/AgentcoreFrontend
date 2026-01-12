// ============================================
// Router Configuration
// ============================================

import React, { Suspense, lazy } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { PageLoader } from '@/components/ui/Loader';
import { AuthGuard, GuestGuard } from '@/components/guards';

// Layout
const AppLayout = lazy(() => import('@/components/layout/AppLayout'));

// Auth Pages
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const SignupPage = lazy(() => import('@/features/auth/SignupPage'));

// App Pages
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const ProjectsPage = lazy(() => import('@/features/projects/ProjectsPage'));
const ProjectDetailsPage = lazy(() => import('@/features/projects/ProjectDetailsPage'));
const DataPipelinePage = lazy(() => import('@/features/data-pipeline/DataPipelinePage'));
const ExperimentsPage = lazy(() => import('@/features/experiments/ExperimentsPage'));
const RunExperimentPage = lazy(() => import('@/features/experiments/RunExperimentPage'));
const DeploymentsPage = lazy(() => import('@/features/deployments/DeploymentsPage'));
const ModelHubPage = lazy(() => import('@/features/model-hub/ModelHubPage'));
const InfrastructurePage = lazy(() => import('@/features/infrastructure/InfrastructurePage'));
const ProjectSettingsPage = lazy(() => import('@/features/settings/ProjectSettingsPage'));
const UsersPage = lazy(() => import('@/features/users/UsersPage'));
const CredentialsPage = lazy(() => import('@/features/credentials/CredentialsPage'));

// Static Pages
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Suspense Wrapper
const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

// Protected Layout Wrapper
const ProtectedLayout: React.FC = () => (
  <AuthGuard>
    <SuspenseWrapper>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </SuspenseWrapper>
  </AuthGuard>
);

// Guest Layout Wrapper
const GuestLayout: React.FC = () => (
  <GuestGuard>
    <SuspenseWrapper>
      <Outlet />
    </SuspenseWrapper>
  </GuestGuard>
);

// Public Layout Wrapper
const PublicLayout: React.FC = () => (
  <SuspenseWrapper>
    <Outlet />
  </SuspenseWrapper>
);

// Router Configuration
export const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
    ],
  },

  // Guest Routes (redirect to dashboard if already logged in)
  {
    path: '/auth',
    element: <GuestLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
    ],
  },

  // Protected App Routes
  {
    path: '/app',
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      
      // Projects
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:projectId', element: <ProjectDetailsPage /> },
      { path: 'projects/:projectId/settings', element: <ProjectSettingsPage /> },
      
      // Data Pipeline
      { path: 'data-pipeline', element: <DataPipelinePage /> },
      
      // Experiments
      { path: 'experiments', element: <ExperimentsPage /> },
      { path: 'experiments/new', element: <RunExperimentPage /> },
      
      // Deployments
      { path: 'deployments', element: <DeploymentsPage /> },
      
      // Model Hub
      { path: 'model-hub', element: <ModelHubPage /> },
      
      // Infrastructure
      { path: 'infrastructure', element: <InfrastructurePage /> },
      
      // Credentials
      { path: 'credentials', element: <CredentialsPage /> },
      
      // Users (Admin only)
      { path: 'users', element: <UsersPage /> },
    ],
  },

  // Redirect shortcuts
  { path: '/login', element: <Navigate to="/auth/login" replace /> },
  { path: '/signup', element: <Navigate to="/auth/signup" replace /> },
  { path: '/dashboard', element: <Navigate to="/app/dashboard" replace /> },

  // 404
  {
    path: '*',
    element: (
      <SuspenseWrapper>
        <NotFoundPage />
      </SuspenseWrapper>
    ),
  },
]);

// Router Provider Component
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
