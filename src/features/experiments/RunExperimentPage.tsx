// ============================================
// Experiments Feature - Run Experiment Page
// ============================================

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { queryKeys } from '@/libs/queryClient';
import { experimentsApi, dataVersionsApi, subModelsApi, projectTypesApi } from '@/api';
import { infrastructureApi } from '@/api';
import { useSelectedProjectId } from '@/hooks';
import {
  Card,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
} from '@/components';
import type { ExperimentPayload, SubModel } from '@/types';

export const RunExperimentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const projectId = useSelectedProjectId() ?? parseInt(searchParams.get('project') ?? '0');
  
  const [formData, setFormData] = useState<ExperimentPayload>({
    experiment_name: '',
    description: '',
    instance_id: 0,
    data_version_id: 0,
    project_type_id: 0,
    sub_model_id: 0,
    target_column: '',
    feature_columns: [],
    date_column: '',
    train_test_split: 0.8,
    hyperparameters: {},
  });
  
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [hyperparamsJson, setHyperparamsJson] = useState('{}');

  // Fetch project types
  const { data: projectTypes } = useQuery({
    queryKey: ['projectTypes'],
    queryFn: projectTypesApi.list,
  });

  // Fetch sub-models based on project type
  const { data: subModels } = useQuery({
    queryKey: ['subModels', formData.project_type_id],
    queryFn: () => subModelsApi.list(formData.project_type_id),
    enabled: !!formData.project_type_id,
  });

  // Fetch data versions
  const { data: dataVersions } = useQuery({
    queryKey: queryKeys.dataVersions.list({ projectId, stage: 'feature_engineered' }),
    queryFn: () => dataVersionsApi.list({ project_id: projectId, stage: 'feature_engineered' }),
    enabled: !!projectId,
  });

  // Fetch instances
  const { data: instances } = useQuery({
    queryKey: queryKeys.infrastructure.instances(),
    queryFn: () => infrastructureApi.listInstances({ status: 'running' }),
  });

  // Fetch columns when data version is selected
  const { data: columns } = useQuery({
    queryKey: ['dataVersionColumns', formData.data_version_id],
    queryFn: () => dataVersionsApi.getColumns(formData.data_version_id),
    enabled: !!formData.data_version_id,
  });

  // Update available columns when data version changes
  useEffect(() => {
    if (columns) {
      setAvailableColumns(columns);
      setSelectedColumns([]);
      setFormData((prev) => ({ ...prev, target_column: '', feature_columns: [] }));
    }
  }, [columns]);

  // Run experiment mutation
  const runMutation = useMutation({
    mutationFn: experimentsApi.run,
    onSuccess: (experiment) => {
      navigate(`/experiments/${experiment.id}`);
    },
  });

  const handleColumnToggle = (column: string) => {
    setSelectedColumns((prev) => {
      if (prev.includes(column)) {
        return prev.filter((c) => c !== column);
      }
      return [...prev, column];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse hyperparameters
    let hyperparameters = {};
    try {
      hyperparameters = JSON.parse(hyperparamsJson);
    } catch {
      alert('Invalid hyperparameters JSON');
      return;
    }

    // Filter out target column from feature columns
    const featureColumns = selectedColumns.filter((c) => c !== formData.target_column);

    runMutation.mutate({
      ...formData,
      feature_columns: featureColumns,
      hyperparameters,
    });
  };

  if (!projectId) {
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
        <h1 className="text-2xl font-bold text-gray-900">Run Experiment</h1>
        <p className="mt-1 text-gray-500">Configure and run a new ML experiment</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader title="Basic Information" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Experiment Name"
              value={formData.experiment_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, experiment_name: e.target.value }))}
              placeholder="My Experiment"
              required
            />
            <Select
              label="Project Type"
              value={String(formData.project_type_id)}
              onChange={(e) => setFormData((prev) => ({ 
                ...prev, 
                project_type_id: parseInt(e.target.value),
                sub_model_id: 0,
              }))}
              options={(projectTypes ?? []).map((type) => ({
                value: type.id,
                label: type.name,
              }))}
              placeholder="Select project type"
              required
            />
            <div className="sm:col-span-2">
              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your experiment..."
                rows={2}
                required
              />
            </div>
          </div>
        </Card>

        {/* Model Selection */}
        <Card>
          <CardHeader title="Model Configuration" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Model Type"
              value={String(formData.sub_model_id)}
              onChange={(e) => setFormData((prev) => ({ ...prev, sub_model_id: parseInt(e.target.value) }))}
              options={(subModels ?? []).map((model: SubModel) => ({
                value: model.id,
                label: model.name,
              }))}
              placeholder="Select model"
              required
              disabled={!formData.project_type_id}
            />
            <Select
              label="Compute Instance"
              value={String(formData.instance_id)}
              onChange={(e) => setFormData((prev) => ({ ...prev, instance_id: parseInt(e.target.value) }))}
              options={(instances?.results ?? []).map((instance) => ({
                value: instance.id,
                label: `${instance.name} (${instance.instance_type})`,
              }))}
              placeholder="Select instance"
              required
            />
          </div>
        </Card>

        {/* Data Selection */}
        <Card>
          <CardHeader title="Data Configuration" />
          <div className="space-y-4">
            <Select
              label="Data Version"
              value={String(formData.data_version_id)}
              onChange={(e) => setFormData((prev) => ({ ...prev, data_version_id: parseInt(e.target.value) }))}
              options={(dataVersions?.results ?? []).map((version) => ({
                value: version.id,
                label: `Version ${version.id} - ${version.stage} (${new Date(version.timestamp).toLocaleDateString()})`,
              }))}
              placeholder="Select data version"
              required
            />

            {availableColumns.length > 0 && (
              <>
                <Select
                  label="Target Column"
                  value={formData.target_column}
                  onChange={(e) => setFormData((prev) => ({ ...prev, target_column: e.target.value }))}
                  options={availableColumns.map((col) => ({
                    value: col,
                    label: col,
                  }))}
                  placeholder="Select target column"
                  required
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Feature Columns <span className="text-red-500">*</span>
                  </label>
                  <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200 p-3">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                      {availableColumns
                        .filter((col) => col !== formData.target_column)
                        .map((col) => (
                          <Checkbox
                            key={col}
                            label={col}
                            checked={selectedColumns.includes(col)}
                            onChange={() => handleColumnToggle(col)}
                          />
                        ))}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedColumns.filter((c) => c !== formData.target_column).length} columns selected
                  </p>
                </div>

                <Select
                  label="Date Column (Optional)"
                  value={formData.date_column ?? ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date_column: e.target.value }))}
                  options={[
                    { value: '', label: 'None' },
                    ...availableColumns.map((col) => ({
                      value: col,
                      label: col,
                    })),
                  ]}
                />
              </>
            )}

            <Input
              label="Train/Test Split"
              type="number"
              min={0.1}
              max={0.9}
              step={0.1}
              value={formData.train_test_split}
              onChange={(e) => setFormData((prev) => ({ ...prev, train_test_split: parseFloat(e.target.value) }))}
              helperText="Percentage of data used for training (0.1 - 0.9)"
              required
            />
          </div>
        </Card>

        {/* Hyperparameters */}
        <Card>
          <CardHeader 
            title="Hyperparameters" 
            subtitle="Enter hyperparameters as a JSON object"
          />
          <Textarea
            value={hyperparamsJson}
            onChange={(e) => setHyperparamsJson(e.target.value)}
            placeholder='{"learning_rate": 0.01, "max_depth": 10}'
            rows={4}
            className="font-mono text-sm"
          />
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            isLoading={runMutation.isPending}
            disabled={
              !formData.experiment_name ||
              !formData.sub_model_id ||
              !formData.instance_id ||
              !formData.data_version_id ||
              !formData.target_column ||
              selectedColumns.filter((c) => c !== formData.target_column).length === 0
            }
          >
            Run Experiment
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RunExperimentPage;
