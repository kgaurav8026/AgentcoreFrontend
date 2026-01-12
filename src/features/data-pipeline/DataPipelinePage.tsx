// ============================================
// Data Pipeline Feature - Data Pipeline Page
// ============================================

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { queryKeys } from '@/libs/queryClient';
import { dataSourcesApi, dataVersionsApi } from '@/api';
import { useSelectedProjectId, usePaginatedTable, useRole } from '@/hooks';
import {
  Card,
  CardHeader,
  Button,
  DataTable,
  Pagination,
  PageLoader,
  Modal,
  StatusBadge,
  Input,
  Select,
  Textarea,
  NotDemo,
  Badge,
} from '@/components';
import type { DataSource, DataVersion, TableColumn, DataVersionStage } from '@/types';

type TabType = 'raw' | 'preprocessed' | 'feature_engineered';

export const DataPipelinePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { isDemo } = useRole();
  
  const projectId = useSelectedProjectId() ?? parseInt(searchParams.get('project') ?? '0');
  
  const [activeTab, setActiveTab] = useState<TabType>('raw');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const [previewData, setPreviewData] = useState<{ columns: string[]; preview: Record<string, unknown>[] } | null>(null);
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    data_source_type_id: '',
    file: null as File | null,
  });

  const { page, pageSize, setPage, setPageSize } = usePaginatedTable();

  // Fetch data sources
  const { data: dataSourcesData, isLoading: sourcesLoading } = useQuery({
    queryKey: queryKeys.dataSources.list(projectId),
    queryFn: () => dataSourcesApi.list({ project_id: projectId, page, page_size: pageSize }),
    enabled: !!projectId,
  });

  // Fetch data versions by stage
  const { data: versionsData, isLoading: versionsLoading } = useQuery({
    queryKey: queryKeys.dataVersions.list({ projectId, stage: activeTab }),
    queryFn: () => dataVersionsApi.list({ project_id: projectId, stage: activeTab as DataVersionStage }),
    enabled: !!projectId,
  });

  // Fetch data source types
  const { data: dataSourceTypes } = useQuery({
    queryKey: ['dataSourceTypes'],
    queryFn: async () => {
      const { dataSourceTypesApi } = await import('@/api');
      return dataSourceTypesApi.list();
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: typeof uploadForm) => {
      if (!data.file) throw new Error('No file selected');
      return dataSourcesApi.create({
        name: data.name,
        description: data.description,
        data_source_type_id: parseInt(data.data_source_type_id),
        data_type: data.file.name.split('.').pop() ?? 'csv',
        project_id: projectId,
        file: data.file,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dataSources.lists() });
      setIsUploadModalOpen(false);
      resetUploadForm();
    },
  });

  // Preview mutation
  const loadPreview = async (dataSourceId: number) => {
    try {
      const preview = await dataSourcesApi.getPreview(dataSourceId, { limit: 100 });
      setPreviewData({ columns: preview.columns, preview: preview.preview });
      const source = dataSourcesData?.results.find((s) => s.id === dataSourceId);
      if (source) setSelectedDataSource(source);
    } catch (error) {
      console.error('Failed to load preview:', error);
    }
  };

  const resetUploadForm = () => {
    setUploadForm({ name: '', description: '', data_source_type_id: '', file: null });
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadMutation.mutate(uploadForm);
  };

  const tabs = [
    { id: 'raw' as TabType, label: 'Raw Data', count: versionsData?.count ?? 0 },
    { id: 'preprocessed' as TabType, label: 'Pre-processed', count: 0 },
    { id: 'feature_engineered' as TabType, label: 'Feature Engineered', count: 0 },
  ];

  const dataSourceColumns: TableColumn<DataSource>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { 
      key: 'data_source_type.name', 
      header: 'Type',
      render: (_, row) => <Badge>{row.data_source_type?.name ?? 'N/A'}</Badge>,
    },
    { key: 'data_type', header: 'Format' },
    {
      key: 'created_at',
      header: 'Uploaded',
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => loadPreview(row.id)}>
            Preview
          </Button>
          <NotDemo>
            <Button size="sm" variant="ghost">
              Process
            </Button>
          </NotDemo>
        </div>
      ),
    },
  ];

  const versionColumns: TableColumn<DataVersion>[] = [
    { key: 'id', header: 'Version ID' },
    { key: 'creator_name', header: 'Created By' },
    { 
      key: 'stage', 
      header: 'Stage',
      render: (value) => <StatusBadge status={value as string} />,
    },
    {
      key: 'timestamp',
      header: 'Created',
      render: (value) => new Date(value as string).toLocaleString(),
    },
    {
      key: 'id',
      header: 'Actions',
      render: () => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost">
            View
          </Button>
          <NotDemo>
            <Button size="sm" variant="ghost">
              Use
            </Button>
          </NotDemo>
        </div>
      ),
    },
  ];

  if (sourcesLoading || versionsLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Pipeline</h1>
          <p className="mt-1 text-gray-500">Manage your data sources and versions</p>
        </div>
        <NotDemo>
          <Button onClick={() => setIsUploadModalOpen(true)}>
            Upload Data
          </Button>
        </NotDemo>
      </div>

      {/* Demo Mode Warning */}
      {isDemo && (
        <div className="rounded-md bg-yellow-50 p-4">
          <p className="text-sm text-yellow-700">
            You are in demo mode. Some actions are restricted.
          </p>
        </div>
      )}

      {/* Data Sources */}
      <Card>
        <CardHeader title="Data Sources" />
        <DataTable
          data={dataSourcesData?.results ?? []}
          columns={dataSourceColumns}
          emptyMessage="No data sources uploaded yet"
        />
        {dataSourcesData && dataSourcesData.count > pageSize && (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={dataSourcesData.count}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </Card>

      {/* Data Versions Tabs */}
      <Card>
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
          <DataTable
            data={versionsData?.results ?? []}
            columns={versionColumns}
            emptyMessage={`No ${activeTab.replace('_', ' ')} data versions yet`}
          />
        </div>
      </Card>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          resetUploadForm();
        }}
        title="Upload Data Source"
        size="md"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <Input
            label="Name"
            value={uploadForm.name}
            onChange={(e) => setUploadForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="My Dataset"
            required
          />

          <Textarea
            label="Description"
            value={uploadForm.description}
            onChange={(e) => setUploadForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your data..."
            rows={2}
          />

          <Select
            label="Data Source Type"
            value={uploadForm.data_source_type_id}
            onChange={(e) => setUploadForm((prev) => ({ ...prev, data_source_type_id: e.target.value }))}
            options={(dataSourceTypes ?? []).map((type) => ({
              value: type.id,
              label: type.name,
            }))}
            placeholder="Select type"
            required
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              File <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept=".csv,.parquet,.json,.xlsx"
              onChange={(e) => setUploadForm((prev) => ({ ...prev, file: e.target.files?.[0] ?? null }))}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-700 hover:file:bg-primary-100"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Supported formats: CSV, Parquet, JSON, Excel</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsUploadModalOpen(false);
                resetUploadForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={uploadMutation.isPending}>
              Upload
            </Button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={!!previewData}
        onClose={() => {
          setPreviewData(null);
          setSelectedDataSource(null);
        }}
        title={`Preview: ${selectedDataSource?.name ?? 'Data'}`}
        size="full"
      >
        {previewData && (
          <div className="overflow-x-auto">
            <p className="mb-4 text-sm text-gray-500">
              Showing {previewData.preview.length} rows, {previewData.columns.length} columns
            </p>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {previewData.columns.map((col) => (
                    <th key={col} className="px-3 py-2 text-left font-medium text-gray-600">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {previewData.preview.slice(0, 20).map((row, idx) => (
                  <tr key={idx}>
                    {previewData.columns.map((col) => (
                      <td key={col} className="whitespace-nowrap px-3 py-2 text-gray-900">
                        {String(row[col] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DataPipelinePage;
