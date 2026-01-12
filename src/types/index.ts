// ============================================
// Authentication & User Types
// ============================================

export interface TokenDetails {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  role_id: number;
  role?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: string[];
}

export type UserRole = 'ADMIN' | 'DEMO' | 'USER' | 'MANAGER';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: TokenDetails;
  user: User;
}

export interface SignupRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

// ============================================
// Project Types
// ============================================

export interface Project {
  id: number;
  name: string;
  description: string;
  project_type_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  data_sources?: DataSource[];
  members?: ProjectMember[];
}

export interface ProjectMember {
  id: number;
  user_id: number;
  project_id: number;
  role_id: number;
  user?: User;
  role?: Role;
}

export interface ProjectStat {
  project_id: number;
  project_name: string;
  experiment_count: number;
  data_source_count: number;
  deployment_count: number;
}

export interface ProjectType {
  id: number;
  name: string;
  description?: string;
}

// ============================================
// Data Source & Version Types
// ============================================

export interface DataSourceType {
  id: number;
  name: string;
  description?: string;
}

export interface DataSource {
  id: number;
  name: string;
  description?: string;
  data_source_type: DataSourceType;
  data_type: string;
  project_id: number;
  project_name?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  file_path?: string;
  connection_string?: string;
}

export interface DataSourcePreview {
  id: number;
  columns: string[];
  preview: Record<string, unknown>[];
  total_rows: number;
}

export interface DataVersion {
  id: number;
  data_source_id: number;
  version_number: number;
  stage: DataVersionStage;
  created_by: number;
  creator_name?: string;
  timestamp: string;
  description?: string;
  file_path?: string;
  row_count?: number;
  column_count?: number;
}

export type DataVersionStage = 'raw' | 'preprocessed' | 'feature_engineered';

export interface DataVersionCreateRequest {
  data_source_id: number;
  stage: DataVersionStage;
  description?: string;
}

// ============================================
// Experiment Types
// ============================================

export interface Experiment {
  id: number;
  experiment_name: string;
  description: string;
  instance_id: number;
  data_version_id: number;
  project_type_id: number;
  sub_model_id: number;
  target_column: string;
  feature_columns: string[];
  date_column?: string;
  source?: string;
  train_test_split: number;
  hyperparameters: Record<string, unknown>;
  status: ExperimentStatus;
  created_by: number;
  created_at: string;
  updated_at: string;
  metrics?: ExperimentMetrics;
}

export interface ExperimentPayload {
  experiment_name: string;
  description: string;
  instance_id: number;
  data_version_id: number;
  project_type_id: number;
  sub_model_id: number;
  target_column: string;
  feature_columns: string[];
  date_column?: string;
  source?: string;
  train_test_split: number;
  hyperparameters: Record<string, unknown>;
}

export interface WebhookExperimentPayload {
  remote_dir: string;
  instance_id: number;
}

export type ExperimentStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ExperimentMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  mse?: number;
  rmse?: number;
  mae?: number;
  r2_score?: number;
  [key: string]: number | undefined;
}

export interface SubModel {
  id: number;
  name: string;
  description?: string;
  project_type_id: number;
}

// ============================================
// Deployment Types
// ============================================

export interface DeploymentJob {
  id: number;
  experiment_id: number;
  status: DeploymentStatus;
  details: DeploymentDetail[];
  result?: DeploymentResult;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface DeploymentDetail {
  step: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  message?: string;
  timestamp: string;
}

export interface DeploymentResult {
  model_path?: string;
  endpoint_url?: string;
  testing_summary?: TestingSummary;
}

export interface TestingSummary {
  total_tests: number;
  passed: number;
  failed: number;
  results: TestResult[];
}

export interface TestResult {
  test_name: string;
  status: 'passed' | 'failed';
  message?: string;
  duration_ms?: number;
}

export type DeploymentStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface PromoteExperimentRequest {
  experiment_id: number;
  target_environment: 'staging' | 'production';
}

// ============================================
// Model Hub Types
// ============================================

export interface ProductionModel {
  id: number;
  experiment_id: number;
  experiment_name: string;
  model_name: string;
  version: string;
  project_id: number;
  endpoint_url?: string;
  status: 'active' | 'inactive' | 'deprecated';
  metrics?: ExperimentMetrics;
  created_at: string;
  updated_at: string;
}

export interface GenericModel {
  id: number;
  name: string;
  description?: string;
  category: string;
  framework?: string;
}

// ============================================
// Infrastructure Types
// ============================================

export interface Instance {
  id: number;
  name: string;
  instance_type: string;
  status: InstanceStatus;
  ip_address?: string;
  specs?: InstanceSpecs;
  project_id?: number;
  created_at: string;
  updated_at: string;
}

export interface InstanceSpecs {
  cpu_cores?: number;
  memory_gb?: number;
  storage_gb?: number;
  gpu_type?: string;
  gpu_count?: number;
}

export type InstanceStatus = 'running' | 'stopped' | 'pending' | 'terminated' | 'error' | 'starting' | 'stopping';

export interface InfraAvailability {
  total_instances: number;
  running_instances: number;
  available_instances: number;
  cpu_utilization: number;
  memory_utilization: number;
  gpu_utilization?: number;
}

// ============================================
// Credentials Types
// ============================================

export interface CredentialType {
  id: number;
  name: string;
  description?: string;
  fields: CredentialField[];
}

export interface CredentialField {
  name: string;
  type: 'text' | 'password' | 'select';
  required: boolean;
  options?: string[];
}

export interface Credential {
  id: number;
  name: string;
  type?: string;
  credential_type_id: number;
  credential_type?: CredentialType;
  user_id?: number;
  project_id?: number;
  is_cloud: boolean;
  created_at: string;
  updated_at: string;
}

export interface CredentialCreateRequest {
  name: string;
  credential_type_id: number;
  project_id?: number;
  is_cloud: boolean;
  values: Record<string, string>;
}

export interface SMTPConfig {
  id: number;
  host: string;
  port: number;
  username: string;
  use_tls: boolean;
  use_ssl: boolean;
  from_email: string;
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardStats {
  total_projects: number;
  total_experiments: number;
  total_deployments: number;
  active_models: number;
}

export interface ProjectAtRisk {
  project_id: number;
  project_name: string;
  risk_level: 'low' | 'medium' | 'high';
  risk_reason: string;
}

export interface UserProjectDataSource {
  id: number;
  data_source_type: string;
  description?: string;
  data_type: string;
  project_name: string;
}

// ============================================
// Observability Types
// ============================================

export interface ObservabilityMetric {
  name: string;
  value: number;
  timestamp: string;
  labels?: Record<string, string>;
}

export interface OperationalMetrics {
  model_id: number;
  latency_p50_ms: number;
  latency_p95_ms: number;
  latency_p99_ms: number;
  request_count: number;
  error_rate: number;
  timestamp: string;
}

// ============================================
// Common/Utility Types
// ============================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface PaginationParams {
  page: number;
  page_size: number;
}

export interface SortParams {
  sort_by: string;
  sort_order: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: string | number | boolean | undefined;
}

// Additional Type Exports
export interface CreateUserPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role_id: number;
}

export interface CreateCredentialPayload {
  name: string;
  type?: string;
  value?: string;
  credential_type_id?: number;
  project_id?: number;
  is_cloud?: boolean;
  values?: Record<string, string>;
}

export interface CreateInstancePayload {
  name: string;
  instance_type: string;
  project_id?: number;
  specs?: Partial<InstanceSpecs>;
}

export type InstanceType = 'cpu' | 'gpu' | 'high-memory' | 'standard';
