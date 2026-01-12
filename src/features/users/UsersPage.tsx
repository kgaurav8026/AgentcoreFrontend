// ============================================
// Users Feature - Users Management Page
// ============================================

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/libs/queryClient';
import { usersApi, rolesApi } from '@/api';
import { usePaginatedTable } from '@/hooks';
import { AdminOnly } from '@/components/guards';
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
  RoleBadge,
  StatusBadge,
} from '@/components';
import type { User, Role, CreateUserPayload, TableColumn } from '@/types';

export const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { page, pageSize, setPage, setPageSize, sortBy, sortOrder, toggleSort, allParams } = 
    usePaginatedTable({ initialSortBy: 'created_at', initialSortOrder: 'desc' });

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: queryKeys.users.list({ ...allParams, search: searchTerm }),
    queryFn: () => usersApi.list({ ...allParams, search: searchTerm || undefined }),
  });

  // Fetch roles
  const { data: roles } = useQuery({
    queryKey: queryKeys.roles.lists(),
    queryFn: rolesApi.list,
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      setIsCreateModalOpen(false);
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) => usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      setUserToEdit(null);
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      setUserToDelete(null);
    },
  });

  const columns: TableColumn<User>[] = [
    {
      key: 'email',
      header: 'User',
      sortable: true,
      render: (_, row) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.first_name} {row.last_name}
          </p>
          <p className="text-sm text-gray-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (value) => <RoleBadge role={value as string} />,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (value) => (
        <StatusBadge status={value ? 'active' : 'inactive'} />
      ),
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
      render: (_, row) => (
        <AdminOnly>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setUserToEdit(row)}>
              Edit
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setUserToDelete(row)}
            >
              Delete
            </Button>
          </div>
        </AdminOnly>
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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-gray-500">Manage user accounts and permissions</p>
        </div>
        <AdminOnly>
          <Button onClick={() => setIsCreateModalOpen(true)}>Add User</Button>
        </AdminOnly>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftAddon={
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card padding="none">
        <DataTable
          data={usersData?.results ?? []}
          columns={columns}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={toggleSort}
          emptyMessage="No users found"
        />
        {usersData && usersData.count > 0 && (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={usersData.count}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </Card>

      {/* Create User Modal */}
      <CreateEditUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        roles={roles ?? []}
        onSubmit={(data) => createMutation.mutate(data as Partial<User> & { password: string })}
        isLoading={createMutation.isPending}
        mode="create"
      />

      {/* Edit User Modal */}
      <CreateEditUserModal
        isOpen={!!userToEdit}
        onClose={() => setUserToEdit(null)}
        roles={roles ?? []}
        user={userToEdit}
        onSubmit={(data) => userToEdit && updateMutation.mutate({ id: userToEdit.id, data })}
        isLoading={updateMutation.isPending}
        mode="edit"
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => userToDelete && deleteMutation.mutate(userToDelete.id)}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.first_name} ${userToDelete?.last_name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

// Create/Edit User Modal Component
interface CreateEditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: Role[];
  user?: User | null;
  onSubmit: (data: CreateUserPayload | Partial<User>) => void;
  isLoading: boolean;
  mode: 'create' | 'edit';
}

const CreateEditUserModal: React.FC<CreateEditUserModalProps> = ({
  isOpen,
  onClose,
  roles,
  user,
  onSubmit,
  isLoading,
  mode,
}) => {
  const [formData, setFormData] = useState<CreateUserPayload>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role_id: 0,
  });

  React.useEffect(() => {
    if (user && mode === 'edit') {
      const role = roles.find((r) => r.id === user.role_id);
      setFormData({
        email: user.email,
        password: '',
        first_name: user.first_name,
        last_name: user.last_name,
        role_id: role?.id ?? 0,
      });
    } else {
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role_id: 0,
      });
    }
  }, [user, mode, roles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'edit') {
      const { password, ...rest } = formData;
      onSubmit(password ? formData : rest);
    } else {
      onSubmit(formData);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add User' : 'Edit User'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={formData.first_name}
            onChange={(e) => setFormData((prev: CreateUserPayload) => ({ ...prev, first_name: e.target.value }))}
            required
          />
          <Input
            label="Last Name"
            value={formData.last_name}
            onChange={(e) => setFormData((prev: CreateUserPayload) => ({ ...prev, last_name: e.target.value }))}
            required
          />
        </div>
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((prev: CreateUserPayload) => ({ ...prev, email: e.target.value }))}
          required
          disabled={mode === 'edit'}
        />
        <Input
          label={mode === 'create' ? 'Password' : 'New Password (leave blank to keep current)'}
          type="password"
          value={formData.password}
          onChange={(e) => setFormData((prev: CreateUserPayload) => ({ ...prev, password: e.target.value }))}
          required={mode === 'create'}
        />
        <Select
          label="Role"
          value={String(formData.role_id)}
          onChange={(e) => setFormData((prev: CreateUserPayload) => ({ ...prev, role_id: parseInt(e.target.value) }))}
          options={roles.map((role) => ({
            value: role.id,
            label: role.name,
          }))}
          placeholder="Select a role"
          required
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {mode === 'create' ? 'Create User' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UsersPage;
