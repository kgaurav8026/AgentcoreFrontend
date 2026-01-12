// ============================================
// Deployments Feature - Deployments Page
// ============================================

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { queryKeys } from '@/libs/queryClient';
import { deploymentsApi } from '@/api';
import { useSelectedProjectId, usePaginatedTable, usePolling } from '@/hooks';
import {
  Card,
  Button,
  DataTable,
  Pagination,
  PageLoader,
  Modal,
  StatusBadge,
} from '@/components';
import type { DeploymentJob, TableColumn, TestResult } from '@/types';

export const DeploymentsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = useSelectedProjectId() ?? parseInt(searchParams.get('project') ?? '0');
  
  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentJob | null>(null);
  const [testResultsModalOpen, setTestResultsModalOpen] = useState(false);

  const { page, pageSize, setPage, setPageSize, sortBy, sortOrder, toggleSort, allParams } = 
    usePaginatedTable({ initialSortBy: 'created_at', initialSortOrder: 'desc' });

  // Fetch deployments
  const { data: deploymentsData, isLoading, refetch } = useQuery({
    queryKey: queryKeys.deployments.list(projectId),
    queryFn: () => deploymentsApi.list({ ...allParams, project_id: projectId || undefined }),
  });

  // Poll for running deployments
  const runningDeployments = deploymentsData?.results.filter(
    (d) => d.status === 'pending' || d.status === 'running'
  ) ?? [];

  usePolling({
    fetchFn: refetch,
    interval: 5000,
    enabled: runningDeployments.length > 0,
    stopCondition: () => runningDeployments.length === 0,
  });

  // Fetch test results for selected deployment
  const { data: testResults, isLoading: testResultsLoading } = useQuery({
    queryKey: [...queryKeys.deployments.detail(selectedDeployment?.id ?? 0), 'testResults'],
    queryFn: () => deploymentsApi.getTestResults(selectedDeployment!.id),
    enabled: !!selectedDeployment && testResultsModalOpen,
  });

  const handleViewTestResults = (deployment: DeploymentJob) => {
    setSelectedDeployment(deployment);
    setTestResultsModalOpen(true);
  };

  const columns: TableColumn<DeploymentJob>[] = [
    { key: 'id', header: 'ID' },
    { key: 'experiment_id', header: 'Experiment' },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value as string} />,
    },
    {
      key: 'details',
      header: 'Progress',
      render: (_, row) => {
        const completedSteps = row.details.filter((d) => d.status === 'completed').length;
        const totalSteps = row.details.length;
        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-primary-600"
                style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-500">
              {completedSteps}/{totalSteps}
            </span>
          </div>
        );
      },
    },
    {
      key: 'created_at',
      header: 'Started',
      sortable: true,
      render: (value) => new Date(value as string).toLocaleString(),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => handleViewTestResults(row)}
            disabled={row.status !== 'completed'}
          >
            Test Results
          </Button>
          <Link to={`/deployments/${row.id}`}>
            <Button size="sm" variant="ghost">
              Details
            </Button>
          </Link>
          {row.result?.endpoint_url && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open(row.result?.endpoint_url, '_blank')}
            >
              Endpoint
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deployments</h1>
          <p className="mt-1 text-gray-500">View and manage model deployments</p>
        </div>
        <Link to="/experiments">
          <Button variant="outline">
            View Experiments to Deploy
          </Button>
        </Link>
      </div>

      {/* Running Deployments Alert */}
      {runningDeployments.length > 0 && (
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="ml-3 text-sm text-blue-700">
              {runningDeployments.length} deployment(s) in progress. Status will update automatically.
            </p>
          </div>
        </div>
      )}

      {/* Deployments Table */}
      <Card padding="none">
        <DataTable
          data={deploymentsData?.results ?? []}
          columns={columns}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={toggleSort}
          emptyMessage="No deployments yet. Promote an experiment to create a deployment."
        />
        {deploymentsData && deploymentsData.count > 0 && (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={deploymentsData.count}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </Card>

      {/* Test Results Modal */}
      <Modal
        isOpen={testResultsModalOpen}
        onClose={() => {
          setTestResultsModalOpen(false);
          setSelectedDeployment(null);
        }}
        title="Test Results"
        size="lg"
      >
        {testResultsLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : testResults ? (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{testResults.total_tests}</p>
                <p className="text-sm text-gray-500">Total Tests</p>
              </div>
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{testResults.passed}</p>
                <p className="text-sm text-gray-500">Passed</p>
              </div>
              <div className="rounded-lg bg-red-50 p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{testResults.failed}</p>
                <p className="text-sm text-gray-500">Failed</p>
              </div>
            </div>

            {/* Test Results List */}
            <div className="max-h-64 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Test</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {testResults.results.map((result: TestResult, idx: number) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-sm text-gray-900">{result.test_name}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={result.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {result.duration_ms ? `${result.duration_ms}ms` : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {result.message ?? '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No test results available</p>
        )}
      </Modal>
    </div>
  );
};

export default DeploymentsPage;
