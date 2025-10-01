// Constants for tag values
export const LAYER_VALUES = ['Bronze', 'Silver', 'Gold', 'Model'] as const;
export const STATUS_VALUES = ['published', 'draft', 'archived'] as const;
export const EXECUTION_STATUS_VALUES = ['success', 'failure', 'running'] as const;
export const QUALITY_SEVERITY_VALUES = ['low', 'medium', 'high', 'critical'] as const;

// Type definitions from constants
export type Layer = typeof LAYER_VALUES[number];
export type Status = typeof STATUS_VALUES[number];
export type ExecutionStatus = typeof EXECUTION_STATUS_VALUES[number];
export type QualitySeverity = typeof QUALITY_SEVERITY_VALUES[number];

// Core domain interfaces
export interface Domain {
  id: string;
  name: string;
  description: string;
  collections: Collection[];
}

export interface Collection {
  id: string;
  name: string;
  domainId: string;
  contracts: DataContract[];
}

// Schema-related types
export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey?: boolean;
  foreignKey?: string;
  description?: string;
  constraints?: string[];
}

export interface TableSchema {
  tableName: string;
  columns: Column[];
  dictionary: Record<string, string>;
  primaryKeys?: string[];
  foreignKeys?: ForeignKeyConstraint[];
}

export interface ForeignKeyConstraint {
  columnName: string;
  referencedTable: string;
  referencedColumn: string;
}

export interface QualityRule {
  id: string;
  name: string;
  description: string;
  type: string;
  severity: QualitySeverity;
  rule: string;
  enabled: boolean;
  lastExecuted?: string;
}

export interface ExecutionInfo {
  id: string;
  date: string;
  status: ExecutionStatus;
  duration?: number;
  technology: string;
  logs?: string;
  errorMessage?: string;
}

// Main data contract interface
export interface DataContract {
  id: string;
  fundamentals: {
    name: string;
    version: string;
    owner: string;
    domain: string;
    collection: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  schema: TableSchema;
  qualityRules: QualityRule[];
  tags: {
    layer: Layer;
    status: Status;
    [key: string]: string;
  };
  terms?: Record<string, string>;
}

// GitHub-related types
export interface GitHubInfo {
  repoName: string;
  repoUrl: string;
  pagesUrl: string;
  branch?: string;
  lastCommit?: {
    sha: string;
    message: string;
    date: string;
    author: string;
  };
}

export interface DeploymentInfo {
  id: string;
  date: string;
  status: ExecutionStatus;
  environment: string;
  version?: string;
  deployedBy?: string;
  githubRunId?: string;
}

export interface QualityAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: QualitySeverity;
  message: string;
  date: string;
  resolved: boolean;
  productId: string;
}

// Main data product interface
export interface DataProduct {
  id: string;
  name: string;
  dataContractId: string;
  configJson: Record<string, unknown>;
  github: GitHubInfo;
  lastExecution?: ExecutionInfo;
  technology?: string;
  deployments?: DeploymentInfo[];
  qualityAlerts?: QualityAlert[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Utility types for API responses
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

// Loading and error state types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
}

// Component prop utility types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface CardComponentProps extends BaseComponentProps {
  onClick?: () => void;
  disabled?: boolean;
}

export interface ListComponentProps<T> extends BaseComponentProps {
  items: T[];
  onItemClick?: (item: T) => void;
  loading?: boolean;
  error?: string | null;
}

export interface ModuleComponentProps extends BaseComponentProps {
  title: string;
  loading?: boolean;
  error?: string | null;
}

// Navigation and routing types
export interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
}

export interface RouteParams {
  domainId?: string;
  collectionId?: string;
  contractId?: string;
  productId?: string;
}

// Theme and UI types
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

// Store state types
export interface StoreState<T> {
  items: T[];
  selectedItem: T | null;
  loading: boolean;
  error: string | null;
}

// Filter and search types
export interface FilterOptions {
  layer?: Layer[];
  status?: Status[];
  technology?: string[];
  owner?: string[];
}

export interface SearchOptions {
  query: string;
  filters?: FilterOptions;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Form and validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isValid: boolean;
  isDirty: boolean;
}

// Export all types for easy importing
// All interfaces and types are already exported above