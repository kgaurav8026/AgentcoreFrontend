// ============================================
// Projects Feature - Project Details Page
// ============================================

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/libs/queryClient';
import { projectsApi, dataSourcesApi, experimentsApi } from '@/api';
import {
  Card,
  CardHeader,
  StatCard,
  PageLoader,
  StatusBadge,
  DataTable,
  Button,
} from '@/components';
import type { TableColumn, DataSource, Experiment } from '@/types';

export const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const id = parseInt(projectId!, 10);

  // Fetch project details
  const { data: project, isLoading } = useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => projectsApi.getDetails(id),
    enabled: !!id,
  });

  // Fetch data sources
  const { data: dataSources } = useQuery({
    queryKey: queryKeys.dataSources.list(id),
    queryFn: () => dataSourcesApi.list({ project_id: id }),
    enabled: !!id,
  });

  // Fetch experiments
  const { data: experiments } = useQuery({
    queryKey: queryKeys.experiments.list(id),
    queryFn: () => experimentsApi.list({ project_id: id }),
    enabled: !!id,
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (!project) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  const dataSourceColumns: TableColumn<DataSource>[] = [
    { key: 'name', header: 'Name' },
    { 
      key: 'data_source_type.name', 
      header: 'Type',
      render: (_, row) => row.data_source_type?.name ?? 'N/A',
    },
    { key: 'data_type', header: 'Data Type' },
    {
      key: 'created_at',
      header: 'Created',
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
  ];

  const experimentColumns: TableColumn<Experiment>[] = [
    { key: 'experiment_name', header: 'Name' },
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
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/projects" className="hover:text-primary-600">Projects</Link>
            <span>/</span>
            <span>{project.name}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="mt-1 text-gray-500">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link to={`/projects/${id}/settings`}>
            <Button variant="outline">Settings</Button>
          </Link>
          <Link to={`/experiments/new?project=${id}`}>
            <Button>Run Experiment</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard
          title="Data Sources"
          value={dataSources?.count ?? 0}
        />
        <StatCard
          title="Experiments"
          value={experiments?.count ?? 0}
        />
        <StatCard
          title="Data Versions"
          value={project.data_sources?.length ?? 0}
        />
      </div>

      {/* Data Sources */}
      <Card>
        <CardHeader
          title="Data Sources"
          action={
            <Link to={`/data-pipeline?project=${id}`}>
              <Button size="sm" variant="outline">Manage Data</Button>
            </Link>
          }
        />
        <DataTable
          data={dataSources?.results ?? []}
          columns={dataSourceColumns}
          emptyMessage="No data sources added yet"
        />
      </Card>

      {/* Recent Experiments */}
      <Card>
        <CardHeader
          title="Recent Experiments"
          action={
            <Link to={`/experiments?project=${id}`}>
              <Button size="sm" variant="outline">View All</Button>
            </Link>
          }
        />
        <DataTable
          data={(experiments?.results ?? []).slice(0, 5)}
          columns={experimentColumns}
          emptyMessage="No experiments run yet"
        />
      </Card>
    </div>
  );
};

export default ProjectDetailsPage;
