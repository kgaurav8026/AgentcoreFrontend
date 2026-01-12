// ============================================
// API Index - Export all API modules
// ============================================

export { authApi } from './auth';
export { usersApi, rolesApi } from './users';
export { projectsApi, projectTypesApi } from './projects';
export { dataSourcesApi, dataSourceTypesApi } from './dataSources';
export { dataVersionsApi } from './dataVersions';
export { experimentsApi, subModelsApi } from './experiments';
export { deploymentsApi } from './deployments';
export { modelHubApi } from './modelHub';
export { infrastructureApi } from './infrastructure';
export { credentialsApi, credentialTypesApi, smtpApi } from './credentials';
export { dashboardApi } from './dashboard';

// Re-export types for convenience
export type { UsersListParams } from './users';
export type { ProjectsListParams, AddProjectMemberRequest } from './projects';
export type { DataSourcesListParams, CreateDataSourceRequest } from './dataSources';
export type { DataVersionsListParams, PreprocessDataRequest, FeatureEngineeringRequest } from './dataVersions';
export type { ExperimentsListParams } from './experiments';
export type { DeploymentsListParams } from './deployments';
export type { ProductionModelsListParams } from './modelHub';
export type { InstancesListParams, CreateInstanceRequest } from './infrastructure';
export type { CredentialsListParams } from './credentials';
