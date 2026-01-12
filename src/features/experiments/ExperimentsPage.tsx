// ============================================
// Experiments Feature - Experiments List Page
// ============================================

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { queryKeys } from '@/libs/queryClient';
import { experimentsApi } from '@/api';
import { useSelectedProjectId, usePaginatedTable } from '@/hooks';
import {
  Card,
  Button,
  DataTable,
  Pagination,
  PageLoader,
  Modal,
  StatusBadge,
  ConfirmModal,
} from '@/components';
import type { Experiment, TableColumn } from '@/types';

export const ExperimentsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const projectId = useSelectedProjectId() ?? parseInt(searchParams.get('project') ?? '0');
  
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [metricsModalOpen, setMetricsModalOpen] = useState(false);
  const [experimentToCancel, setExperimentToCancel] = useState<Experiment | null>(null);

  const { page, pageSize, setPage, setPageSize, sortBy, sortOrder, toggleSort, allParams } = 
    usePaginatedTable({ initialSortBy: 'created_at', initialSortOrder: 'desc' });

  // Fetch experiments
  const { data: experimentsData, isLoading } = useQuery({
    queryKey: queryKeys.experiments.list(projectId),
    queryFn: () => experimentsApi.list({ ...allParams, project_id: projectId || undefined }),
  });

  // Fetch metrics for selected experiment
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: queryKeys.experiments.metrics(selectedExperiment?.id ?? 0),
    queryFn: () => experimentsApi.getMetrics(selectedExperiment!.id),
    enabled: !!selectedExperiment && metricsModalOpen,
  });

  // Cancel experiment mutation
  const cancelMutation = useMutation({
    mutationFn: (id: number) => experimentsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.experiments.lists() });
      setExperimentToCancel(null);
    },
  });

  const handleViewMetrics = (experiment: Experiment) => {
    setSelectedExperiment(experiment);
    setMetricsModalOpen(true);
  };

  const columns: TableColumn<Experiment>[] = [
    { key: 'experiment_name', header: 'Name', sortable: true },
    { key: 'description', header: 'Description' },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value as string} />,
    },
    { 
      key: 'train_test_split', 
      header: 'Train/Test Split',
      render: (value) => `${((value as number) * 100).toFixed(0)}%`,
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (value) => new Date(value as string).toLocaleString(),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleViewMetrics(row)}>
            Metrics
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => navigate(`/experiments/${row.id}`)}
          >
            Details
          </Button>
          {(row.status === 'pending' || row.status === 'running') && (
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setExperimentToCancel(row)}
            >
              Cancel
            </Button>
          )}
          {row.status === 'completed' && (
            <Link to={`/deployments/new?experiment=${row.id}`}>
              <Button size="sm" variant="outline">
                Deploy
              </Button>
            </Link>
          )}
        </div>
      ),
    },
  ];

  const renderMetricValue = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return value.toFixed(4);
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Experiments</h1>
          <p className="mt-1 text-gray-500">View and manage ML experiments</p>
        </div>
        <Link to="/experiments/new">
          <Button>Run Experiment</Button>
        </Link>
      </div>

      {/* Experiments Table */}
      <Card padding="none">
        <DataTable
          data={experimentsData?.results ?? []}
          columns={columns}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={toggleSort}
          emptyMessage="No experiments yet. Run your first experiment to get started."
        />
        {experimentsData && experimentsData.count > 0 && (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={experimentsData.count}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </Card>

      {/* Metrics Modal */}
      <Modal
        isOpen={metricsModalOpen}
        onClose={() => {
          setMetricsModalOpen(false);
          setSelectedExperiment(null);
        }}
        title={`Metrics: ${selectedExperiment?.experiment_name ?? ''}`}
        size="md"
      >
        {metricsLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : metrics ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {metrics.accuracy !== undefined && (
                <MetricCard label="Accuracy" value={renderMetricValue(metrics.accuracy)} />
              )}
              {metrics.precision !== undefined && (
                <MetricCard label="Precision" value={renderMetricValue(metrics.precision)} />
              )}
              {metrics.recall !== undefined && (
                <MetricCard label="Recall" value={renderMetricValue(metrics.recall)} />
              )}
              {metrics.f1_score !== undefined && (
                <MetricCard label="F1 Score" value={renderMetricValue(metrics.f1_score)} />
              )}
              {metrics.mse !== undefined && (
                <MetricCard label="MSE" value={renderMetricValue(metrics.mse)} />
              )}
              {metrics.rmse !== undefined && (
                <MetricCard label="RMSE" value={renderMetricValue(metrics.rmse)} />
              )}
              {metrics.mae !== undefined && (
                <MetricCard label="MAE" value={renderMetricValue(metrics.mae)} />
              )}
              {metrics.r2_score !== undefined && (
                <MetricCard label="R² Score" value={renderMetricValue(metrics.r2_score)} />
              )}
            </div>
            {selectedExperiment?.status === 'completed' && (
              <div className="pt-4 border-t border-gray-200">
                <Link to={`/deployments/new?experiment=${selectedExperiment.id}`}>
                  <Button fullWidth>Promote to Deployment</Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No metrics available</p>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={!!experimentToCancel}
        onClose={() => setExperimentToCancel(null)}
        onConfirm={() => experimentToCancel && cancelMutation.mutate(experimentToCancel.id)}
        title="Cancel Experiment"
        message={`Are you sure you want to cancel "${experimentToCancel?.experiment_name}"?`}
        confirmText="Cancel Experiment"
        variant="warning"
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-lg bg-gray-50 p-4">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
  </div>
);

export default ExperimentsPage;
