// ============================================
// Model Hub Feature - Model Hub Page
// ============================================

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/libs/queryClient';
import { modelHubApi } from '@/api';
import { useSelectedProjectId } from '@/hooks';
import {
  Card,
  Button,
  DataTable,
  PageLoader,
  StatusBadge,
  Modal,
} from '@/components';
import type { ProductionModel, GenericModel, TableColumn, OperationalMetrics } from '@/types';

type TabType = 'production' | 'generic' | 'cv' | 'forecast';

export const ModelHubPage: React.FC = () => {
  const projectId = useSelectedProjectId();
  
  const [activeTab, setActiveTab] = useState<TabType>('production');
  const [selectedModel, setSelectedModel] = useState<ProductionModel | null>(null);
  const [metricsModalOpen, setMetricsModalOpen] = useState(false);

  // Fetch production models
  const { data: productionModels, isLoading: prodLoading } = useQuery({
    queryKey: queryKeys.modelHub.production(projectId ?? 0),
    queryFn: () => modelHubApi.getProductionModels(projectId!),
    enabled: !!projectId && activeTab === 'production',
  });

  // Fetch generic models
  const { data: genericModels, isLoading: genericLoading } = useQuery({
    queryKey: queryKeys.modelHub.generic(),
    queryFn: () => modelHubApi.listGenericModels(),
    enabled: activeTab === 'generic',
  });

  // Fetch computer vision models
  const { data: cvModels, isLoading: cvLoading } = useQuery({
    queryKey: [...queryKeys.modelHub.all, 'cv', projectId],
    queryFn: () => modelHubApi.getComputerVisionModels(projectId!),
    enabled: !!projectId && activeTab === 'cv',
  });

  // Fetch sales forecast models
  const { data: forecastModels, isLoading: forecastLoading } = useQuery({
    queryKey: [...queryKeys.modelHub.all, 'forecast', projectId],
    queryFn: () => modelHubApi.getSalesForecastModels(projectId!),
    enabled: !!projectId && activeTab === 'forecast',
  });

  // Fetch operational metrics for selected model
  const { data: operationalMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: queryKeys.modelHub.metrics(selectedModel?.id ?? 0),
    queryFn: () => modelHubApi.getOperationalMetrics(selectedModel!.id),
    enabled: !!selectedModel && metricsModalOpen,
  });

  const handleViewMetrics = (model: ProductionModel) => {
    setSelectedModel(model);
    setMetricsModalOpen(true);
  };

  const tabs = [
    { id: 'production' as TabType, label: 'Production Models' },
    { id: 'generic' as TabType, label: 'Generic Models' },
    { id: 'cv' as TabType, label: 'Computer Vision' },
    { id: 'forecast' as TabType, label: 'Sales Forecast' },
  ];

  const productionColumns: TableColumn<ProductionModel>[] = [
    { key: 'model_name', header: 'Name' },
    { key: 'experiment_name', header: 'Experiment' },
    { key: 'version', header: 'Version' },
    {
      key: 'status',
      header: 'Status',
      render: (value) => <StatusBadge status={value as string} />,
    },
    {
      key: 'metrics.accuracy',
      header: 'Accuracy',
      render: (_, row) => row.metrics?.accuracy?.toFixed(4) ?? 'N/A',
    },
    {
      key: 'created_at',
      header: 'Deployed',
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleViewMetrics(row)}>
            Metrics
          </Button>
          {row.endpoint_url && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open(row.endpoint_url, '_blank')}
            >
              Endpoint
            </Button>
          )}
        </div>
      ),
    },
  ];

  const isLoading = prodLoading || genericLoading || cvLoading || forecastLoading;

  const getCurrentData = (): ProductionModel[] => {
    switch (activeTab) {
      case 'production':
        return productionModels?.results ?? [];
      case 'generic':
        // Map generic models to ProductionModel shape for display
        return (genericModels ?? []).map((m: GenericModel) => ({
          id: m.id,
          experiment_id: 0,
          experiment_name: m.category,
          model_name: m.name,
          version: m.framework ?? '1.0',
          project_id: projectId ?? 0,
          status: 'active' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
      case 'cv':
        return cvModels ?? [];
      case 'forecast':
        return forecastModels ?? [];
      default:
        return [];
    }
  };

  if (!projectId && activeTab !== 'generic') {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Please select a project first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Model Hub</h1>
        <p className="mt-1 text-gray-500">Browse and manage ML models</p>
      </div>

      {/* Tabs */}
      <Card padding="none">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {isLoading ? (
            <PageLoader />
          ) : (
            <DataTable
              data={getCurrentData()}
              columns={productionColumns}
              emptyMessage={`No ${activeTab.replace('_', ' ')} models found`}
            />
          )}
        </div>
      </Card>

      {/* Operational Metrics Modal */}
      <Modal
        isOpen={metricsModalOpen}
        onClose={() => {
          setMetricsModalOpen(false);
          setSelectedModel(null);
        }}
        title={`Operational Metrics: ${selectedModel?.model_name ?? ''}`}
        size="lg"
      >
        {metricsLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : operationalMetrics && operationalMetrics.length > 0 ? (
          <div className="space-y-4">
            {/* Latest Metrics Summary */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <MetricTile
                label="Latency (P50)"
                value={`${operationalMetrics[0].latency_p50_ms}ms`}
              />
              <MetricTile
                label="Latency (P95)"
                value={`${operationalMetrics[0].latency_p95_ms}ms`}
              />
              <MetricTile
                label="Latency (P99)"
                value={`${operationalMetrics[0].latency_p99_ms}ms`}
              />
              <MetricTile
                label="Request Count"
                value={operationalMetrics[0].request_count.toLocaleString()}
              />
              <MetricTile
                label="Error Rate"
                value={`${(operationalMetrics[0].error_rate * 100).toFixed(2)}%`}
                variant={operationalMetrics[0].error_rate > 0.01 ? 'danger' : 'success'}
              />
            </div>

            {/* Metrics History */}
            <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Timestamp</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">P50</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">P95</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Requests</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Errors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {operationalMetrics.map((metric: OperationalMetrics, idx: number) => (
                    <tr key={idx}>
                      <td className="px-4 py-2">{new Date(metric.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-2">{metric.latency_p50_ms}ms</td>
                      <td className="px-4 py-2">{metric.latency_p95_ms}ms</td>
                      <td className="px-4 py-2">{metric.request_count}</td>
                      <td className="px-4 py-2">{(metric.error_rate * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No operational metrics available</p>
        )}
      </Modal>
    </div>
  );
};

// Metric Tile Component
const MetricTile: React.FC<{
  label: string;
  value: string;
  variant?: 'default' | 'success' | 'danger';
}> = ({ label, value, variant = 'default' }) => {
  const variantClasses = {
    default: 'bg-gray-50',
    success: 'bg-green-50',
    danger: 'bg-red-50',
  };
  const textClasses = {
    default: 'text-gray-900',
    success: 'text-green-700',
    danger: 'text-red-700',
  };

  return (
    <div className={`rounded-lg p-4 ${variantClasses[variant]}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${textClasses[variant]}`}>{value}</p>
    </div>
  );
};

export default ModelHubPage;
