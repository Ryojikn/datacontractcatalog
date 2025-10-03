// Constants for tag values
export const LAYER_VALUES = ['Bronze', 'Silver', 'Gold', 'Model'] as const;
export const STATUS_VALUES = ['published', 'draft', 'archived'] as const;
export const EXECUTION_STATUS_VALUES = ['success', 'failure', 'running'] as const;
export const QUALITY_SEVERITY_VALUES = ['low', 'medium', 'high', 'critical'] as const;
export const ACCESS_REQUEST_STATUS_VALUES = ['pending', 'approved_by_access_group', 'approved_by_product_owner', 'approved', 'rejected'] as const;

// Type definitions from constants
export type Layer = typeof LAYER_VALUES[number];
export type Status = typeof STATUS_VALUES[number];
export type ExecutionStatus = typeof EXECUTION_STATUS_VALUES[number];
export type QualitySeverity = typeof QUALITY_SEVERITY_VALUES[number];
export type AccessRequestStatus = typeof ACCESS_REQUEST_STATUS_VALUES[number];

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

// Access request types
export interface AccessRequest {
  id: string;
  productId: string;
  productName: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  bdac: string;
  businessJustification: string;
  status: AccessRequestStatus;
  createdAt: string;
  updatedAt: string;
  accessGroupOwnerApproval?: ApprovalInfo;
  productOwnerApproval?: ApprovalInfo;
  rejectionReason?: string;
}

export interface ApprovalInfo {
  approvedBy: string;
  approvedAt: string;
  comments?: string;
}

export interface AccessRequestNotification {
  id: string;
  accessRequestId: string;
  recipientId: string;
  recipientEmail: string;
  type: 'access_group_owner' | 'product_owner' | 'requester';
  message: string;
  read: boolean;
  createdAt: string;
}

// Cart types
export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  dataContractId: string;
  technology?: string;
  description?: string;
  addedAt: string;
  selected: boolean;
}

export interface BulkAccessRequest {
  cartItems: CartItem[];
  bdac: string;
  businessJustification: string;
  selectedProductIds: string[];
}

// Notification types
export interface Notification {
  id: string;
  type: 'access_approved' | 'access_rejected' | 'access_pending' | 'system';
  title: string;
  message: string;
  productId?: string;
  productName?: string;
  read: boolean;
  createdAt: string;
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
  environment?: 'dev' | 'pre' | 'pro' | 'undefined';
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

// Search and AI-related types
export interface SearchQuery {
  id: string;
  query: string;
  mode: 'traditional' | 'ai';
  filters?: SearchFilters;
  timestamp: string;
  resultCount?: number;
}

export interface SearchFilters {
  domains?: string[];
  technologies?: string[];
  dataTypes?: string[];
  layers?: Layer[];
  statuses?: Status[];
  qualityScore?: {
    min: number;
    max: number;
  };
  lastUpdated?: {
    from?: string;
    to?: string;
  };
}

export interface SearchResult {
  id: string;
  type: 'domain' | 'contract' | 'product';
  title: string;
  description: string;
  relevanceScore: number;
  metadata: SearchResultMetadata;
  highlightedFields?: Record<string, string>;
  actions: SearchResultAction[];
}

export interface SearchResultMetadata {
  domain?: string;
  collection?: string;
  technology?: string;
  layer?: Layer;
  status?: Status;
  lastUpdated?: string;
  qualityScore?: number;
  owner?: string;
  tags?: string[];
}

export interface SearchResultAction {
  id: string;
  label: string;
  type: 'navigate' | 'cart' | 'access' | 'preview' | 'compare' | 'bookmark';
  icon?: string;
  primary?: boolean;
}

export interface AIResponse {
  id: string;
  query: string;
  type: 'discovery' | 'explanation' | 'recommendation' | 'comparison';
  message: string;
  cards: SearchResult[];
  actions: AIResponseAction[];
  followUpQuestions: string[];
  relatedSearches: string[];
  timestamp: string;
  confidence?: number;
}

export interface AIResponseAction {
  id: string;
  label: string;
  type: 'search' | 'navigate' | 'filter' | 'export';
  payload?: Record<string, unknown>;
}

export interface SearchConversation {
  id: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
  title?: string;
}

export interface ConversationMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  query?: SearchQuery;
  response?: AIResponse;
}

export interface SearchAnalytics {
  queryId: string;
  query: string;
  mode: 'traditional' | 'ai';
  resultCount: number;
  clickedResults: string[];
  timeSpent: number;
  refinements: number;
  successful: boolean;
  timestamp: string;
  userId?: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  mode: 'traditional' | 'ai';
  createdAt: string;
  lastUsed: string;
  useCount: number;
  alertEnabled: boolean;
  alertFrequency?: 'daily' | 'weekly' | 'monthly';
  tags: string[];
}

export interface SearchAlert {
  id: string;
  savedSearchId: string;
  name: string;
  query: string;
  filters: SearchFilters;
  frequency: 'daily' | 'weekly' | 'monthly';
  lastTriggered?: string;
  nextTrigger: string;
  enabled: boolean;
  resultThreshold: number;
  notificationMethod: 'email' | 'in-app' | 'both';
  createdAt: string;
}

export interface UserSearchPreferences {
  userId: string;
  defaultMode: 'traditional' | 'ai';
  defaultFilters: SearchFilters;
  favoriteCategories: string[];
  recentDomains: string[];
  searchHistory: SearchQuery[];
  savedSearches: SavedSearch[];
  searchAlerts: SearchAlert[];
  personalizedSuggestions: boolean;
  analyticsEnabled: boolean;
  lastUpdated: string;
}

export interface SearchBookmark {
  id: string;
  resultId: string;
  resultType: 'domain' | 'contract' | 'product';
  title: string;
  description: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  lastAccessed: string;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'autocomplete' | 'related';
  category?: string;
  frequency?: number;
}

export interface SearchIndex {
  domains: SearchIndexDomain[];
  contracts: SearchIndexContract[];
  products: SearchIndexProduct[];
  lastUpdated: string;
}

export interface SearchIndexDomain {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  collections: string[];
  contractCount: number;
  productCount: number;
}

export interface SearchIndexContract {
  id: string;
  name: string;
  description: string;
  domain: string;
  collection: string;
  schema: SchemaField[];
  qualityRules: string[];
  tags: string[];
  layer: Layer;
  status: Status;
  owner: string;
  keywords: string[];
}

export interface SearchIndexProduct {
  id: string;
  name: string;
  description: string;
  technology: string;
  contractId: string;
  contractName: string;
  domain: string;
  purpose: string;
  keywords: string[];
  qualityScore?: number;
  lastExecution?: string;
}

export interface SchemaField {
  name: string;
  type: string;
  description?: string;
  nullable: boolean;
  primaryKey?: boolean;
}

// Export all types for easy importing
// All interfaces and types are already exported above