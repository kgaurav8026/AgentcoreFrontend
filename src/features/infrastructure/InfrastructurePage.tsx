// ============================================
// Infrastructure Feature - Infrastructure Page
// ============================================

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/libs/queryClient';
import { infrastructureApi, type InstanceTypeInfo } from '@/api/infrastructure';
import { useSelectedProjectId, usePaginatedTable, usePolling } from '@/hooks';
import { AdminOnly, ManagerAndAbove } from '@/components/guards';
import {
  Card,
  Button,
  Input,
  Select,
  DataTable,
  Pagination,
  PageLoader,
  Modal,
  ConfirmModal,
  StatusBadge,
} from '@/components';
import type { Instance, TableColumn, InstanceStatus } from '@/types';

interface CreateInstanceFormData {
  name: string;
  instance_type: string;
  project_id?: number;
}

export const InfrastructurePage: React.FC = () => {
  const projectId = useSelectedProjectId();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [instanceToManage, setInstanceToManage] = useState<Instance | null>(null);
  const [instanceToDelete, setInstanceToDelete] = useState<Instance | null>(null);
  const [action, setAction] = useState<'start' | 'stop' | 'restart' | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { page, pageSize, setPage, setPageSize, sortBy, sortOrder, toggleSort, allParams } = 
    usePaginatedTable({ initialSortBy: 'created_at', initialSortOrder: 'desc' });

  // Fetch instances
  const { data: instancesData, isLoading, refetch } = useQuery({
    queryKey: queryKeys.infrastructure.instances({ 
      ...allParams, 
      project_id: projectId || undefined,
      status: statusFilter as InstanceStatus || undefined,
    }),
    queryFn: () => infrastructureApi.listInstances({ 
      ...allParams, 
      project_id: projectId || undefined,
      status: statusFilter as InstanceStatus || undefined,
    }),
  });

  // Poll for pending instances
  const pendingInstances = instancesData?.results.filter(
    (i) => i.status === 'pending' || i.status === 'starting' || i.status === 'stopping'
  ) ?? [];

  usePolling({
    fetchFn: refetch,
    interval: 5000,
    enabled: pendingInstances.length > 0,
    stopCondition: () => pendingInstances.length === 0,
  });

  // Fetch instance types
  const { data: instanceTypes } = useQuery({
    queryKey: [...queryKeys.infrastructure.all, 'types'],
    queryFn: infrastructureApi.listInstanceTypes,
  });

  // Create instance mutation
  const createMutation = useMutation({
    mutationFn: infrastructureApi.createInstance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.infrastructure.instances() });
      setIsCreateModalOpen(false);
    },
  });

  // Manage instance mutation
  const manageMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'start' | 'stop' | 'restart' }) => 
      infrastructureApi.manageInstance(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.infrastructure.instances() });
      setInstanceToManage(null);
      setAction(null);
    },
  });

  // Delete instance mutation
  const deleteMutation = useMutation({
    mutationFn: infrastructureApi.deleteInstance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.infrastructure.instances() });
      setInstanceToDelete(null);
    },
  });

  const handleManageAction = (instance: Instance, actionType: 'start' | 'stop' | 'restart') => {
    setInstanceToManage(instance);
    setAction(actionType);
  };

  const confirmAction = () => {
    if (instanceToManage && action) {
      manageMutation.mutate({ id: instanceToManage.id, action });
    }
  };

  const getAvailableActions = (status: InstanceStatus) => {
    switch (status) {
      case 'running':
        return ['stop', 'restart'];
      case 'stopped':
        return ['start'];
      case 'error':
        return ['restart'];
      default:
        return [];
    }
  };

  const columns: TableColumn<Instance>[] = [
    { key: 'name', header: 'Name', sortable: true },
    {
      key: 'instance_type',
      header: 'Type',
      render: (value) => {
        const type = instanceTypes?.find((t: InstanceTypeInfo) => t.id === Number(value) || t.name === value);
        return (
          <div>
            <p className="font-medium">{type?.name ?? String(value)}</p>
            {type && (
              <p className="text-xs text-gray-500">
                {type.cpu_cores} vCPU, {type.memory_gb}GB RAM
                {type.gpu_type && `, ${type.gpu_type}`}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value as string} />,
    },
    {
      key: 'ip_address',
      header: 'IP Address',
      render: (value) => (value as string) ?? '-',
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, row) => {
        const actions = getAvailableActions(row.status);
        return (
          <div className="flex items-center gap-2">
            {actions.map((a) => (
              <Button 
                key={a}
                size="sm" 
                variant="ghost"
                onClick={() => handleManageAction(row, a as 'start' | 'stop' | 'restart')}
              >
                {a.charAt(0).toUpperCase() + a.slice(1)}
              </Button>
            ))}
            <AdminOnly>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setInstanceToDelete(row)}
                disabled={row.status === 'running'}
              >
                Delete
              </Button>
            </AdminOnly>
          </div>
        );
      },
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
          <h1 className="text-2xl font-bold text-gray-900">Infrastructure</h1>
          <p className="mt-1 text-gray-500">Manage compute instances</p>
        </div>
        <ManagerAndAbove>
          <Button onClick={() => setIsCreateModalOpen(true)}>Create Instance</Button>
        </ManagerAndAbove>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-4">
          <Select
            label="Status Filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'running', label: 'Running' },
              { value: 'stopped', label: 'Stopped' },
              { value: 'pending', label: 'Pending' },
              { value: 'error', label: 'Error' },
            ]}
          />
          <div className="flex-1" />
          {pendingInstances.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
              <span>{pendingInstances.length} instance(s) in progress</span>
            </div>
          )}
        </div>
      </Card>

      {/* Instance Types Summary */}
      {instanceTypes && instanceTypes.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {instanceTypes.slice(0, 4).map((type) => (
            <Card key={type.id} padding="sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{type.name}</p>
                  <p className="text-sm text-gray-500">
                    {type.cpu_cores} vCPU • {type.memory_gb}GB
                  </p>
                  {type.gpu_type && (
                    <p className="text-xs text-purple-600">{type.gpu_type}</p>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900">
                  ${type.price_per_hour}/hr
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Instances Table */}
      <Card padding="none">
        <DataTable
          data={instancesData?.results ?? []}
          columns={columns}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={toggleSort}
          emptyMessage="No instances found"
        />
        {instancesData && instancesData.count > 0 && (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={instancesData.count}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </Card>

      {/* Create Instance Modal */}
      <CreateInstanceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={projectId}
        instanceTypes={instanceTypes ?? []}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />

      {/* Manage Instance Confirmation */}
      <ConfirmModal
        isOpen={!!instanceToManage && !!action}
        onClose={() => {
          setInstanceToManage(null);
          setAction(null);
        }}
        onConfirm={confirmAction}
        title={`${action?.charAt(0).toUpperCase()}${action?.slice(1)} Instance`}
        message={`Are you sure you want to ${action} "${instanceToManage?.name}"?`}
        confirmText={action?.charAt(0).toUpperCase() + (action?.slice(1) ?? '')}
        variant={action === 'stop' ? 'warning' : undefined}
        isLoading={manageMutation.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!instanceToDelete}
        onClose={() => setInstanceToDelete(null)}
        onConfirm={() => instanceToDelete && deleteMutation.mutate(instanceToDelete.id)}
        title="Delete Instance"
        message={`Are you sure you want to delete "${instanceToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

// Create Instance Modal Component
interface CreateInstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number | null;
  instanceTypes: InstanceTypeInfo[];
  onSubmit: (data: CreateInstanceFormData) => void;
  isLoading: boolean;
}

const CreateInstanceModal: React.FC<CreateInstanceModalProps> = ({
  isOpen,
  onClose,
  projectId,
  instanceTypes,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CreateInstanceFormData>({
    name: '',
    instance_type: '',
    project_id: projectId ?? undefined,
  });

  React.useEffect(() => {
    if (projectId) {
      setFormData((prev: CreateInstanceFormData) => ({ ...prev, project_id: projectId }));
    }
  }, [projectId]);

  const selectedType = instanceTypes.find((t: InstanceTypeInfo) => t.name === formData.instance_type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Instance"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Instance Name"
          value={formData.name}
          onChange={(e) => setFormData((prev: CreateInstanceFormData) => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., ml-training-1"
          required
        />
        <Select
          label="Instance Type"
          value={formData.instance_type}
          onChange={(e) => setFormData((prev: CreateInstanceFormData) => ({ ...prev, instance_type: e.target.value }))}
          options={instanceTypes.map((type: InstanceTypeInfo) => ({
            value: type.name,
            label: `${type.name} - ${type.cpu_cores} vCPU, ${type.memory_gb}GB RAM ($${type.price_per_hour}/hr)`,
          }))}
          placeholder="Select instance type"
          required
        />
        {selectedType && (
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-900">{selectedType.name}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-500">
              <p>CPU: {selectedType.cpu_cores} cores</p>
              <p>Memory: {selectedType.memory_gb} GB</p>
              <p>Storage: {selectedType.storage_gb ?? 'N/A'} GB</p>
              {selectedType.gpu_type && <p>GPU: {selectedType.gpu_type}</p>}
            </div>
            <p className="mt-2 text-sm font-medium text-primary-600">
              ${selectedType.price_per_hour}/hour
            </p>
          </div>
        )}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            isLoading={isLoading}
            disabled={!formData.name || !formData.instance_type}
          >
            Create Instance
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InfrastructurePage;
