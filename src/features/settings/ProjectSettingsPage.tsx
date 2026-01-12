// ============================================
// Settings Feature - Project Settings Page
// ============================================

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { queryKeys } from '@/libs/queryClient';
import { projectsApi, usersApi, rolesApi } from '@/api';
import {
  Card,
  CardHeader,
  CardFooter,
  Button,
  Input,
  Textarea,
  Select,
  DataTable,
  PageLoader,
  Modal,
  ConfirmModal,
} from '@/components';
import type { ProjectMember, User, Role, TableColumn } from '@/types';

export const ProjectSettingsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const id = parseInt(projectId!, 10);
  const queryClient = useQueryClient();

  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');

  // Fetch project
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => projectsApi.getById(id),
    enabled: !!id,
  });

  // Fetch project members
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: queryKeys.projects.members(id),
    queryFn: () => projectsApi.getMembers(id),
    enabled: !!id,
  });

  // Fetch all users for adding members
  const { data: allUsers } = useQuery({
    queryKey: queryKeys.users.lists(),
    queryFn: () => usersApi.list({ page_size: 100 }),
  });

  // Fetch all roles
  const { data: roles } = useQuery({
    queryKey: queryKeys.roles.lists(),
    queryFn: rolesApi.list,
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) => projectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
    },
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: (data: { user_id: number; role_id: number }) => projectsApi.addMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.members(id) });
      setIsAddMemberModalOpen(false);
      setSelectedUserId('');
      setSelectedRoleId('');
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (memberId: number) => projectsApi.removeMember(id, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.members(id) });
      setMemberToRemove(null);
    },
  });

  // Update member role mutation
  const updateMemberRoleMutation = useMutation({
    mutationFn: ({ memberId, roleId }: { memberId: number; roleId: number }) =>
      projectsApi.updateMemberRole(id, memberId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.members(id) });
    },
  });

  const [projectForm, setProjectForm] = useState({
    name: project?.name ?? '',
    description: project?.description ?? '',
  });

  // Update form when project loads
  React.useEffect(() => {
    if (project) {
      setProjectForm({
        name: project.name,
        description: project.description,
      });
    }
  }, [project]);

  // Filter out users already in project
  const availableUsers = (allUsers?.results ?? []).filter(
    (user: User) => !(members ?? []).some((m: ProjectMember) => m.user_id === user.id)
  );

  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault();
    updateProjectMutation.mutate(projectForm);
  };

  const handleAddMember = () => {
    if (selectedUserId && selectedRoleId) {
      addMemberMutation.mutate({
        user_id: parseInt(selectedUserId),
        role_id: parseInt(selectedRoleId),
      });
    }
  };

  const memberColumns: TableColumn<ProjectMember>[] = [
    {
      key: 'user.email',
      header: 'User',
      render: (_, row) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.user?.first_name} {row.user?.last_name}
          </p>
          <p className="text-sm text-gray-500">{row.user?.email}</p>
        </div>
      ),
    },
    {
      key: 'role.name',
      header: 'Role',
      render: (_, row) => (
        <Select
          value={String(row.role_id)}
          onChange={(e) =>
            updateMemberRoleMutation.mutate({
              memberId: row.id,
              roleId: parseInt(e.target.value),
            })
          }
          options={(roles ?? []).map((role: Role) => ({
            value: role.id,
            label: role.name,
          }))}
        />
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, row) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setMemberToRemove(row)}
        >
          Remove
        </Button>
      ),
    },
  ];

  if (projectLoading || membersLoading) {
    return <PageLoader />;
  }

  if (!project) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Project Settings</h1>
        <p className="mt-1 text-gray-500">Manage project configuration and team members</p>
      </div>

      {/* Project Details */}
      <Card>
        <CardHeader title="Project Details" />
        <form onSubmit={handleUpdateProject} className="space-y-4">
          <Input
            label="Project Name"
            value={projectForm.name}
            onChange={(e) => setProjectForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <Textarea
            label="Description"
            value={projectForm.description}
            onChange={(e) => setProjectForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
          <CardFooter>
            <Button type="submit" isLoading={updateProjectMutation.isPending}>
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader
          title="Team Members"
          subtitle="Manage who has access to this project"
          action={
            <Button onClick={() => setIsAddMemberModalOpen(true)}>
              Add Member
            </Button>
          }
        />
        <DataTable
          data={members ?? []}
          columns={memberColumns}
          emptyMessage="No team members yet"
        />
      </Card>

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => {
          setIsAddMemberModalOpen(false);
          setSelectedUserId('');
          setSelectedRoleId('');
        }}
        title="Add Team Member"
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="User"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            options={availableUsers.map((user: User) => ({
              value: user.id,
              label: `${user.first_name} ${user.last_name} (${user.email})`,
            }))}
            placeholder="Select a user"
          />
          <Select
            label="Role"
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            options={(roles ?? []).map((role: Role) => ({
              value: role.id,
              label: role.name,
            }))}
            placeholder="Select a role"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddMemberModalOpen(false);
                setSelectedUserId('');
                setSelectedRoleId('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMember}
              isLoading={addMemberMutation.isPending}
              disabled={!selectedUserId || !selectedRoleId}
            >
              Add Member
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove Member Confirmation */}
      <ConfirmModal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={() => memberToRemove && removeMemberMutation.mutate(memberToRemove.id)}
        title="Remove Team Member"
        message={`Are you sure you want to remove ${memberToRemove?.user?.first_name} ${memberToRemove?.user?.last_name} from this project?`}
        confirmText="Remove"
        variant="danger"
        isLoading={removeMemberMutation.isPending}
      />
    </div>
  );
};

export default ProjectSettingsPage;
