// ============================================
// Credentials Feature - Credentials Page
// ============================================

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/libs/queryClient';
import { credentialsApi } from '@/api';
import { useSelectedProjectId, usePaginatedTable } from '@/hooks';
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
} from '@/components';
import type { Credential, CreateCredentialPayload, CredentialCreateRequest, TableColumn } from '@/types';

const CREDENTIAL_TYPES = [
  { value: 'aws', label: 'AWS' },
  { value: 'gcp', label: 'Google Cloud' },
  { value: 'azure', label: 'Azure' },
  { value: 'database', label: 'Database' },
  { value: 'api_key', label: 'API Key' },
  { value: 'other', label: 'Other' },
];

export const CredentialsPage: React.FC = () => {
  const projectId = useSelectedProjectId();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [credentialToEdit, setCredentialToEdit] = useState<Credential | null>(null);
  const [credentialToDelete, setCredentialToDelete] = useState<Credential | null>(null);
  const [credentialToReveal, setCredentialToReveal] = useState<Credential | null>(null);
  const [revealedValue, setRevealedValue] = useState<string | null>(null);

  const { page, pageSize, setPage, setPageSize, sortBy, sortOrder, toggleSort, allParams } = 
    usePaginatedTable({ initialSortBy: 'created_at', initialSortOrder: 'desc' });

  // Fetch credentials
  const { data: credentialsData, isLoading } = useQuery({
    queryKey: queryKeys.credentials.list({ ...allParams, project_id: projectId || undefined }),
    queryFn: () => credentialsApi.list({ ...allParams, project_id: projectId || undefined }),
  });

  // Create credential mutation
  const createMutation = useMutation({
    mutationFn: credentialsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.credentials.lists() });
      setIsCreateModalOpen(false);
    },
  });

  // Update credential mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateCredentialPayload> }) =>
      credentialsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.credentials.lists() });
      setCredentialToEdit(null);
    },
  });

  // Delete credential mutation
  const deleteMutation = useMutation({
    mutationFn: credentialsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.credentials.lists() });
      setCredentialToDelete(null);
    },
  });

  // Reveal credential mutation
  const revealMutation = useMutation({
    mutationFn: (id: number) => credentialsApi.reveal(id),
    onSuccess: (data) => {
      setRevealedValue(data.value);
    },
  });

  const handleReveal = (credential: Credential) => {
    setCredentialToReveal(credential);
    setRevealedValue(null);
    revealMutation.mutate(credential.id);
  };

  const columns: TableColumn<Credential>[] = [
    { key: 'name', header: 'Name', sortable: true },
    {
      key: 'credential_type_id',
      header: 'Type',
      render: (value) => {
        const type = CREDENTIAL_TYPES.find((t) => t.value === String(value));
        return type?.label ?? (value as string);
      },
    },
    {
      key: 'id',
      header: 'Value',
      render: () => '••••••••',
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      key: 'updated_at',
      header: 'Last Updated',
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <ManagerAndAbove>
            <Button size="sm" variant="ghost" onClick={() => handleReveal(row)}>
              Reveal
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setCredentialToEdit(row)}>
              Edit
            </Button>
          </ManagerAndAbove>
          <AdminOnly>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setCredentialToDelete(row)}
            >
              Delete
            </Button>
          </AdminOnly>
        </div>
      ),
    },
  ];

  if (!projectId) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Please select a project first</p>
      </div>
    );
  }

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Credentials</h1>
          <p className="mt-1 text-gray-500">Manage API keys and secrets</p>
        </div>
        <ManagerAndAbove>
          <Button onClick={() => setIsCreateModalOpen(true)}>Add Credential</Button>
        </ManagerAndAbove>
      </div>

      {/* Security Notice */}
      <div className="rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="ml-3 text-sm text-yellow-700">
            Credentials are encrypted at rest. Only authorized team members can view credential values.
          </p>
        </div>
      </div>

      {/* Credentials Table */}
      <Card padding="none">
        <DataTable
          data={credentialsData?.results ?? []}
          columns={columns}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={toggleSort}
          emptyMessage="No credentials configured"
        />
        {credentialsData && credentialsData.count > 0 && (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={credentialsData.count}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </Card>

      {/* Create Credential Modal */}
      <CreateEditCredentialModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={projectId}
        onSubmit={(data) => createMutation.mutate(data as CredentialCreateRequest)}
        isLoading={createMutation.isPending}
        mode="create"
      />

      {/* Edit Credential Modal */}
      <CreateEditCredentialModal
        isOpen={!!credentialToEdit}
        onClose={() => setCredentialToEdit(null)}
        projectId={projectId}
        credential={credentialToEdit}
        onSubmit={(data) => credentialToEdit && updateMutation.mutate({ id: credentialToEdit.id, data })}
        isLoading={updateMutation.isPending}
        mode="edit"
      />

      {/* Reveal Credential Modal */}
      <Modal
        isOpen={!!credentialToReveal}
        onClose={() => {
          setCredentialToReveal(null);
          setRevealedValue(null);
        }}
        title={`Credential: ${credentialToReveal?.name}`}
        size="sm"
      >
        <div className="space-y-4">
          {revealMutation.isPending ? (
            <div className="flex h-16 items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
            </div>
          ) : revealedValue ? (
            <div className="relative">
              <Input
                label="Value"
                value={revealedValue}
                readOnly
                className="font-mono pr-12"
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                onClick={() => navigator.clipboard.writeText(revealedValue)}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          ) : (
            <p className="text-gray-500">Unable to reveal credential value</p>
          )}
          <p className="text-sm text-yellow-600">
            ⚠️ This value is sensitive. Do not share it publicly.
          </p>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!credentialToDelete}
        onClose={() => setCredentialToDelete(null)}
        onConfirm={() => credentialToDelete && deleteMutation.mutate(credentialToDelete.id)}
        title="Delete Credential"
        message={`Are you sure you want to delete "${credentialToDelete?.name}"? This action cannot be undone and may break integrations using this credential.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

// Create/Edit Credential Modal Component
interface CreateEditCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  credential?: Credential | null;
  onSubmit: (data: CreateCredentialPayload) => void;
  isLoading: boolean;
  mode: 'create' | 'edit';
}

const CreateEditCredentialModal: React.FC<CreateEditCredentialModalProps> = ({
  isOpen,
  onClose,
  projectId,
  credential,
  onSubmit,
  isLoading,
  mode,
}) => {
  const [formData, setFormData] = useState<CreateCredentialPayload>({
    name: '',
    type: '',
    value: '',
    project_id: projectId,
  });

  React.useEffect(() => {
    if (credential && mode === 'edit') {
      setFormData({
        name: credential.name,
        type: credential.type ?? '',
        value: '',
        project_id: credential.project_id,
      });
    } else {
      setFormData({
        name: '',
        type: '',
        value: '',
        project_id: projectId,
      });
    }
  }, [credential, mode, projectId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add Credential' : 'Edit Credential'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData((prev: CreateCredentialPayload) => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., AWS Production Key"
          required
        />
        <Select
          label="Type"
          value={formData.type ?? ''}
          onChange={(e) => setFormData((prev: CreateCredentialPayload) => ({ ...prev, type: e.target.value }))}
          options={CREDENTIAL_TYPES}
          placeholder="Select credential type"
          required
        />
        <Input
          label={mode === 'create' ? 'Value' : 'New Value (leave blank to keep current)'}
          type="password"
          value={formData.value ?? ''}
          onChange={(e) => setFormData((prev: CreateCredentialPayload) => ({ ...prev, value: e.target.value }))}
          placeholder="Enter the secret value"
          required={mode === 'create'}
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {mode === 'create' ? 'Create' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CredentialsPage;
