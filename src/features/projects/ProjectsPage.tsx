// ============================================
// Projects Feature - Projects List Page
// ============================================

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { queryKeys } from '@/libs/queryClient';
import { projectsApi } from '@/api';
import { useSelectedProject, usePaginatedTable } from '@/hooks';
import {
  Card,
  Button,
  DataTable,
  Pagination,
  PageLoader,
  Modal,
  ConfirmModal,
  Input,
  Textarea,
  Select,
  ManagerAndAbove,
} from '@/components';
import type { Project, TableColumn, ProjectType } from '@/types';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectProject } = useSelectedProject();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project_type_id: '',
  });

  const { page, pageSize, setPage, setPageSize, allParams } = usePaginatedTable({
    initialPageSize: 10,
  });

  // Fetch projects
  const { data: projectsData, isLoading } = useQuery({
    queryKey: queryKeys.projects.list(allParams),
    queryFn: () => projectsApi.list(allParams),
  });

  // Fetch project types for the form
  const { data: projectTypes } = useQuery({
    queryKey: ['projectTypes'],
    queryFn: async () => {
      const { projectTypesApi } = await import('@/api');
      return projectTypesApi.list();
    },
  });

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      setIsCreateModalOpen(false);
      resetForm();
    },
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      setProjectToDelete(null);
    },
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', project_type_id: '' });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: formData.name,
      description: formData.description,
      project_type_id: parseInt(formData.project_type_id),
    });
  };

  const handleSelectProject = (project: Project) => {
    selectProject(project.id);
    navigate(`/projects/${project.id}`);
  };

  const columns: TableColumn<Project>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'description', header: 'Description' },
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
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectProject(row);
            }}
          >
            Open
          </Button>
          <ManagerAndAbove>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/projects/${row.id}/settings`);
              }}
            >
              Settings
            </Button>
          </ManagerAndAbove>
          <ManagerAndAbove>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setProjectToDelete(row);
              }}
            >
              Delete
            </Button>
          </ManagerAndAbove>
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
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-gray-500">Manage your ML projects</p>
        </div>
        <ManagerAndAbove>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Create Project
          </Button>
        </ManagerAndAbove>
      </div>

      {/* Projects Table */}
      <Card padding="none">
        <DataTable
          data={projectsData?.results ?? []}
          columns={columns}
          onRowClick={handleSelectProject}
          emptyMessage="No projects found. Create your first project to get started."
        />
        {projectsData && projectsData.count > 0 && (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={projectsData.count}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </Card>

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Create New Project"
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Project Name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="My ML Project"
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your project..."
            rows={3}
          />

          <Select
            label="Project Type"
            value={formData.project_type_id}
            onChange={(e) => setFormData((prev) => ({ ...prev, project_type_id: e.target.value }))}
            options={(projectTypes ?? []).map((type: ProjectType) => ({
              value: type.id,
              label: type.name,
            }))}
            placeholder="Select a project type"
            required
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={() => projectToDelete && deleteMutation.mutate(projectToDelete.id)}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default ProjectsPage;
