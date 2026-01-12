// ============================================
// Dashboard Feature - Dashboard Page
// ============================================

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/libs/queryClient';
import { dashboardApi } from '@/api';
import { useSelectedProject } from '@/hooks';
import { 
  Card, 
  CardHeader, 
  StatCard, 
  PageLoader, 
  StatusBadge,
  DataTable 
} from '@/components';
import type { TableColumn } from '@/types';

// Icons
const ProjectIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const ExperimentIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const DeploymentIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const ModelIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
  </svg>
);

interface RecentExperiment {
  id: number;
  experiment_name: string;
  project_name: string;
  status: string;
  created_at: string;
}

interface RecentDeployment {
  id: number;
  experiment_name: string;
  project_name: string;
  status: string;
  created_at: string;
}

export const DashboardPage: React.FC = () => {
  const { project } = useSelectedProject();

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: dashboardApi.getStats,
  });

  // Fetch project stats
  const { data: projectStats } = useQuery({
    queryKey: queryKeys.dashboard.projectStats(),
    queryFn: dashboardApi.getUserProjectStats,
  });

  // Fetch recent experiments
  const { data: recentExperiments } = useQuery({
    queryKey: [...queryKeys.dashboard.all, 'recentExperiments'],
    queryFn: () => dashboardApi.getRecentExperiments(5),
  });

  // Fetch recent deployments
  const { data: recentDeployments } = useQuery({
    queryKey: [...queryKeys.dashboard.all, 'recentDeployments'],
    queryFn: () => dashboardApi.getRecentDeployments(5),
  });

  // Fetch infra availability
  const { data: infraAvailability } = useQuery({
    queryKey: queryKeys.infrastructure.availability(),
    queryFn: dashboardApi.getInfraAvailability,
  });

  if (statsLoading) {
    return <PageLoader />;
  }

  const experimentColumns: TableColumn<RecentExperiment>[] = [
    { key: 'experiment_name', header: 'Name' },
    { key: 'project_name', header: 'Project' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => <StatusBadge status={value as string} />,
    },
    { 
      key: 'created_at', 
      header: 'Created',
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
  ];

  const deploymentColumns: TableColumn<RecentDeployment>[] = [
    { key: 'experiment_name', header: 'Experiment' },
    { key: 'project_name', header: 'Project' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => <StatusBadge status={value as string} />,
    },
    { 
      key: 'created_at', 
      header: 'Created',
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">
          {project 
            ? `Overview for ${project.name}` 
            : 'Welcome back! Here\'s an overview of your ML platform.'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={stats?.total_projects ?? 0}
          icon={<ProjectIcon />}
        />
        <StatCard
          title="Experiments"
          value={stats?.total_experiments ?? 0}
          icon={<ExperimentIcon />}
        />
        <StatCard
          title="Deployments"
          value={stats?.total_deployments ?? 0}
          icon={<DeploymentIcon />}
        />
        <StatCard
          title="Active Models"
          value={stats?.active_models ?? 0}
          icon={<ModelIcon />}
        />
      </div>

      {/* Infrastructure Status */}
      {infraAvailability && (
        <Card>
          <CardHeader 
            title="Infrastructure Status" 
            subtitle="Current resource availability"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {infraAvailability.running_instances}/{infraAvailability.total_instances}
              </p>
              <p className="text-sm text-gray-500">Instances Running</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {infraAvailability.cpu_utilization}%
              </p>
              <p className="text-sm text-gray-500">CPU Utilization</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {infraAvailability.memory_utilization}%
              </p>
              <p className="text-sm text-gray-500">Memory Utilization</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {infraAvailability.available_instances}
              </p>
              <p className="text-sm text-gray-500">Available</p>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Experiments */}
        <Card>
          <CardHeader 
            title="Recent Experiments" 
            action={
              <a href="/experiments" className="text-sm text-primary-600 hover:text-primary-500">
                View all →
              </a>
            }
          />
          <DataTable
            data={recentExperiments ?? []}
            columns={experimentColumns}
            emptyMessage="No experiments yet"
          />
        </Card>

        {/* Recent Deployments */}
        <Card>
          <CardHeader 
            title="Recent Deployments" 
            action={
              <a href="/deployments" className="text-sm text-primary-600 hover:text-primary-500">
                View all →
              </a>
            }
          />
          <DataTable
            data={recentDeployments ?? []}
            columns={deploymentColumns}
            emptyMessage="No deployments yet"
          />
        </Card>
      </div>

      {/* Project Stats */}
      {projectStats && projectStats.length > 0 && (
        <Card>
          <CardHeader title="Your Projects" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projectStats.map((stat) => (
              <div 
                key={stat.project_id}
                className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
              >
                <h3 className="font-medium text-gray-900">{stat.project_name}</h3>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  <span>{stat.experiment_count} experiments</span>
                  <span>{stat.data_source_count} data sources</span>
                  <span>{stat.deployment_count} deployments</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
