import { create } from 'zustand'
import type { 
  PendingAccessRequest, 
  CurrentAccess, 
  CommentTemplate, 
  AccessRevocationNotice,
  CurrentAccessStatus,
  CommentTemplateCategory,
  AuditLogEntry,
  AuditReport,
  AuditReportFilters,
  AccessHistoryEntry
} from '@/types'
import { 
  filterTemplatesByCategory, 
  searchTemplates, 
  getTemplateSuggestions 
} from '@/lib/commentTemplateUtils'
import {
  generateExpirationReminders,
  generateRevocationNotices,
  processDueNotifications,
  markNotificationsAsSent,
  cleanupOldNotifications,
  getNotificationStats,
  type ScheduledNotification,
  type NotificationSchedulerConfig,
  defaultSchedulerConfig
} from '@/lib/notificationScheduler'
import {
  createApprovalAuditEntry,
  createDeclineAuditEntry,
  createRenewalAuditEntry,
  createBulkRenewalAuditEntry,
  createScheduledRevocationAuditEntry,
  createForceRevocationAuditEntry,
  createAuditReport,
  filterAuditEntries,
  sortAuditEntries,
  generateAuditSummary,
  exportAuditReportToCSV,
  getCurrentAdministrator,

} from '@/lib/auditLogger'

interface AdminStore {
  // State
  pendingRequests: PendingAccessRequest[]
  currentAccess: CurrentAccess[]
  commentTemplates: CommentTemplate[]
  revocationNotices: AccessRevocationNotice[]
  scheduledNotifications: ScheduledNotification[]
  notificationConfig: NotificationSchedulerConfig
  auditLog: AuditLogEntry[]
  accessHistory: AccessHistoryEntry[] | null
  loading: boolean
  error: string | null
  lastRefresh: string | null
  
  // Actions
  fetchPendingRequests: () => Promise<void>
  fetchCurrentAccess: () => Promise<void>
  fetchCurrentAccessByProduct: (productId: string) => Promise<void>
  fetchAccessHistory: (productId: string) => Promise<void>
  loadCommentTemplates: () => Promise<void>
  approveRequest: (requestId: string, comment?: string) => Promise<void>
  declineRequest: (requestId: string, comment: string) => Promise<void>
  renewAccess: (accessId: string) => Promise<void>
  bulkRenewAccess: (accessIds: string[]) => Promise<void>
  scheduleRevocation: (accessId: string) => Promise<void>
  forceRevocation: (accessId: string) => Promise<void>
  clearError: () => void
  
  // Comment template management actions
  getTemplatesByCategory: (category: CommentTemplateCategory) => CommentTemplate[]
  searchCommentTemplates: (searchTerm: string) => CommentTemplate[]
  getTemplateSuggestions: (context?: {
    productName?: string
    requesterName?: string
    businessJustification?: string
  }) => CommentTemplate[]
  addCommentTemplate: (template: Omit<CommentTemplate, 'id'>) => Promise<void>
  updateCommentTemplate: (id: string, updates: Partial<CommentTemplate>) => Promise<void>
  deleteCommentTemplate: (id: string) => Promise<void>
  
  // Notification scheduling actions
  generateNotificationSchedule: () => Promise<void>
  processPendingNotifications: () => Promise<void>
  updateNotificationConfig: (config: Partial<NotificationSchedulerConfig>) => void
  getNotificationStatistics: () => ReturnType<typeof getNotificationStats>
  cleanupOldNotifications: (retentionDays?: number) => void
  scheduleExpirationReminders: (accessList?: CurrentAccess[]) => Promise<void>
  scheduleRevocationNotices: (revocationList?: AccessRevocationNotice[]) => Promise<void>
  
  // Audit logging actions
  getAuditLog: () => AuditLogEntry[]
  getFilteredAuditLog: (filters: AuditReportFilters) => AuditLogEntry[]
  generateAuditReport: (filters: AuditReportFilters, title?: string, exportFormat?: 'json' | 'csv' | 'pdf') => AuditReport
  exportAuditReportAsCSV: (report: AuditReport) => string
  clearAuditLog: () => void
  getAuditLogSummary: (filters?: AuditReportFilters) => ReturnType<typeof generateAuditSummary>
}

// Mock data for development and testing
const mockPendingRequests: PendingAccessRequest[] = [
  {
    id: 'req-001',
    productId: 'product-001',
    productName: 'Credit Card Transactions ETL',
    requesterId: 'user-001',
    requesterName: 'João Silva',
    requesterEmail: 'joao.silva@company.com',
    bdac: 'ANALYTICS_TEAM',
    businessJustification: 'Need access to credit card transaction data for monthly risk analysis and fraud detection model training.',
    status: 'pending',
    createdAt: '2024-02-08T10:30:00Z',
    updatedAt: '2024-02-08T10:30:00Z',
    priority: 'high',
    daysWaiting: 3,
    adminNotes: 'High priority due to regulatory compliance requirements',
    escalated: false
  },
  {
    id: 'req-002',
    productId: 'product-002',
    productName: 'Customer Segmentation Data',
    requesterId: 'user-002',
    requesterName: 'Maria Santos',
    requesterEmail: 'maria.santos@company.com',
    bdac: 'MARKETING_TEAM',
    businessJustification: 'Required for customer segmentation analysis and targeted marketing campaigns.',
    status: 'pending',
    createdAt: '2024-02-07T14:15:00Z',
    updatedAt: '2024-02-07T14:15:00Z',
    priority: 'medium',
    daysWaiting: 4,
    escalated: false
  },
  {
    id: 'req-003',
    productId: 'product-003',
    productName: 'Financial Risk Metrics',
    requesterId: 'user-003',
    requesterName: 'Carlos Oliveira',
    requesterEmail: 'carlos.oliveira@company.com',
    bdac: 'RISK_MANAGEMENT',
    businessJustification: 'Access needed for quarterly risk assessment and regulatory reporting.',
    status: 'pending',
    createdAt: '2024-02-06T09:00:00Z',
    updatedAt: '2024-02-06T09:00:00Z',
    priority: 'low',
    daysWaiting: 5,
    escalated: false
  }
]

const mockCurrentAccess: CurrentAccess[] = [
  {
    id: 'access-001',
    userId: 'user-004',
    userName: 'Ana Costa',
    userEmail: 'ana.costa@company.com',
    productId: 'product-001',
    productName: 'Credit Card Transactions ETL',
    grantedAt: '2024-01-15T10:00:00Z',
    expiresAt: '2025-01-15T10:00:00Z',
    grantedBy: 'admin-001',
    accessLevel: 'read',
    status: 'active'
  },
  {
    id: 'access-002',
    userId: 'user-005',
    userName: 'Pedro Almeida',
    userEmail: 'pedro.almeida@company.com',
    productId: 'product-002',
    productName: 'Customer Segmentation Data',
    grantedAt: '2024-01-20T14:30:00Z',
    expiresAt: '2024-03-20T14:30:00Z',
    grantedBy: 'admin-002',
    accessLevel: 'write',
    status: 'expiring_soon'
  },
  {
    id: 'access-003',
    userId: 'user-006',
    userName: 'Sofia Rodrigues',
    userEmail: 'sofia.rodrigues@company.com',
    productId: 'product-003',
    productName: 'Financial Risk Metrics',
    grantedAt: '2024-01-10T08:15:00Z',
    expiresAt: '2024-03-10T08:15:00Z',
    grantedBy: 'admin-001',
    accessLevel: 'read',
    status: 'scheduled_for_revocation',
    revocationScheduledAt: '2024-03-10T08:15:00Z',
    revocationNotificationSent: true
  }
]

const mockCommentTemplates: CommentTemplate[] = [
  // Security templates
  {
    id: 'template-001',
    category: 'security',
    title: 'Security Clearance Required',
    content: 'Access denied due to insufficient security clearance. The requested data contains sensitive information that requires additional security approval from the Information Security team.',
    variables: ['productName', 'requesterName']
  },
  {
    id: 'template-002',
    category: 'security',
    title: 'PII Data Access Restriction',
    content: 'Access to {productName} cannot be granted as it contains Personally Identifiable Information (PII). Please complete the PII handling training and obtain appropriate data handling certification before resubmitting your request.',
    variables: ['productName', 'requesterName']
  },
  {
    id: 'template-003',
    category: 'security',
    title: 'Regulatory Compliance Issue',
    content: 'Your request for access to {productName} has been declined due to regulatory compliance requirements. This dataset is subject to {regulationType} regulations and requires additional compliance approval.',
    variables: ['productName', 'requesterName', 'regulationType']
  },
  
  // Policy templates
  {
    id: 'template-004',
    category: 'policy',
    title: 'Data Governance Policy Violation',
    content: 'Request declined as it violates company data governance policy section {policySection}. Please review the data governance guidelines at {policyUrl} and resubmit with proper justification.',
    variables: ['productName', 'policySection', 'policyUrl']
  },
  {
    id: 'template-005',
    category: 'policy',
    title: 'Data Classification Restriction',
    content: 'Access to {productName} is restricted due to its {dataClassification} classification level. Please contact the data steward {dataStewart} for alternative access options or data anonymization services.',
    variables: ['productName', 'dataClassification', 'dataStewart']
  },
  {
    id: 'template-006',
    category: 'policy',
    title: 'Cross-Department Access Restriction',
    content: 'Access to {productName} is restricted to {authorizedDepartments} departments only. As a member of {requesterDepartment}, you do not have authorization to access this dataset. Please contact your department head for escalation if business-critical.',
    variables: ['productName', 'authorizedDepartments', 'requesterDepartment']
  },
  
  // Justification templates
  {
    id: 'template-007',
    category: 'justification',
    title: 'Insufficient Business Justification',
    content: 'The business justification provided is insufficient for granting access to {productName}. Please provide more detailed information about: 1) Specific use case and business objectives, 2) Expected outcomes and success metrics, 3) Data retention and usage timeline, 4) Alternative data sources considered.',
    variables: ['productName', 'requesterName']
  },
  {
    id: 'template-008',
    category: 'justification',
    title: 'Vague Use Case Description',
    content: 'Your request for {productName} access has been declined due to vague use case description. Please resubmit with specific details about how the data will be used, what analysis will be performed, and how it aligns with your team\'s objectives.',
    variables: ['productName', 'requesterName']
  },
  {
    id: 'template-009',
    category: 'justification',
    title: 'Alternative Data Source Available',
    content: 'Access to {productName} is declined as there are alternative data sources available that better suit your stated use case. Please consider using {alternativeDataSource} which provides similar data with appropriate access controls for your requirements.',
    variables: ['productName', 'alternativeDataSource', 'requesterName']
  },
  
  // Technical templates
  {
    id: 'template-010',
    category: 'technical',
    title: 'Technical Requirements Not Met',
    content: 'Access cannot be granted due to unmet technical requirements. Please ensure your environment meets: 1) {technicalRequirements}, 2) Network security standards, 3) Data encryption capabilities. Contact IT support for assistance with setup.',
    variables: ['productName', 'technicalRequirements']
  },
  {
    id: 'template-011',
    category: 'technical',
    title: 'Infrastructure Compatibility Issue',
    content: 'Your request for {productName} access cannot be approved due to infrastructure compatibility issues. The dataset requires {requiredInfrastructure} which is not available in your current environment. Please work with the Infrastructure team to resolve these requirements.',
    variables: ['productName', 'requiredInfrastructure', 'requesterName']
  },
  {
    id: 'template-012',
    category: 'technical',
    title: 'Data Format Incompatibility',
    content: 'Access to {productName} is declined due to data format incompatibility with your stated tools and systems. The dataset is available in {dataFormat} format, which may not be suitable for your {requesterTools}. Please consider data transformation services or alternative tools.',
    variables: ['productName', 'dataFormat', 'requesterTools']
  }
]

export const useAdminStore = create<AdminStore>((set, get) => ({
  // Initial state
  pendingRequests: [],
  currentAccess: [],
  accessHistory: null,
  commentTemplates: [],
  revocationNotices: [],
  scheduledNotifications: [],
  notificationConfig: defaultSchedulerConfig,
  auditLog: [],
  loading: false,
  error: null,
  lastRefresh: null,

  // Actions
  fetchPendingRequests: async () => {
    set({ loading: true, error: null })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      set({ 
        pendingRequests: mockPendingRequests,
        loading: false,
        lastRefresh: new Date().toISOString()
      })
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch pending requests',
        loading: false 
      })
    }
  },

  fetchCurrentAccess: async () => {
    set({ loading: true, error: null })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600))
      
      set({ 
        currentAccess: mockCurrentAccess,
        loading: false,
        lastRefresh: new Date().toISOString()
      })
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch current access',
        loading: false 
      })
    }
  },

  fetchCurrentAccessByProduct: async (productId: string) => {
    set({ loading: true, error: null })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600))
      
      // Filter mock data by product ID
      const filteredAccess = mockCurrentAccess.filter(access => access.productId === productId)
      
      set({ 
        currentAccess: filteredAccess,
        loading: false,
        lastRefresh: new Date().toISOString()
      })
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch current access by product',
        loading: false 
      })
    }
  },

  fetchAccessHistory: async (productId: string) => {
    set({ loading: true, error: null })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Generate mock access history for the selected product
      const mockAccessHistory: AccessHistoryEntry[] = [
        {
          id: 'hist-1',
          productId,
          productName: 'Customer Analytics Dataset',
          userId: 'user-1',
          userName: 'John Smith',
          userEmail: 'john.smith@company.com',
          action: 'granted' as const,
          grantedAt: '2024-01-15T10:30:00Z',
          expiresAt: '2024-04-15T10:30:00Z',
          grantedBy: 'admin@company.com',
          accessLevel: 'read' as const,
          duration: 90
        },
        {
          id: 'hist-2',
          productId,
          productName: 'Customer Analytics Dataset',
          userId: 'user-2',
          userName: 'Sarah Johnson',
          userEmail: 'sarah.johnson@company.com',
          action: 'granted' as const,
          grantedAt: '2024-01-20T14:15:00Z',
          expiresAt: '2024-03-20T14:15:00Z',
          grantedBy: 'admin@company.com',
          accessLevel: 'write' as const,
          duration: 60
        },
        {
          id: 'hist-3',
          productId,
          productName: 'Customer Analytics Dataset',
          userId: 'user-2',
          userName: 'Sarah Johnson',
          userEmail: 'sarah.johnson@company.com',
          action: 'renewed' as const,
          grantedAt: '2024-03-18T09:00:00Z',
          expiresAt: '2024-06-18T09:00:00Z',
          grantedBy: 'admin@company.com',
          accessLevel: 'write' as const,
          duration: 92
        },
        {
          id: 'hist-4',
          productId,
          productName: 'Customer Analytics Dataset',
          userId: 'user-3',
          userName: 'Mike Wilson',
          userEmail: 'mike.wilson@company.com',
          action: 'revoked' as const,
          grantedAt: '2024-02-01T11:45:00Z',
          expiresAt: '2024-03-01T11:45:00Z',
          revokedAt: '2024-02-25T16:30:00Z',
          grantedBy: 'admin@company.com',
          revokedBy: 'admin@company.com',
          accessLevel: 'read' as const,
          duration: 24,
          reason: 'Policy violation - unauthorized data sharing'
        },
        {
          id: 'hist-5',
          productId,
          productName: 'Customer Analytics Dataset',
          userId: 'user-4',
          userName: 'Emily Davis',
          userEmail: 'emily.davis@company.com',
          action: 'granted' as const,
          grantedAt: '2024-01-10T08:00:00Z',
          expiresAt: '2024-02-10T08:00:00Z',
          grantedBy: 'admin@company.com',
          accessLevel: 'admin' as const,
          duration: 31
        },
        {
          id: 'hist-6',
          productId,
          productName: 'Customer Analytics Dataset',
          userId: 'user-4',
          userName: 'Emily Davis',
          userEmail: 'emily.davis@company.com',
          action: 'expired' as const,
          grantedAt: '2024-01-10T08:00:00Z',
          expiresAt: '2024-02-10T08:00:00Z',
          grantedBy: 'admin@company.com',
          accessLevel: 'admin' as const,
          duration: 31
        }
      ].sort((a, b) => new Date(b.grantedAt).getTime() - new Date(a.grantedAt).getTime())
      
      set({ 
        accessHistory: mockAccessHistory,
        loading: false,
        lastRefresh: new Date().toISOString()
      })
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch access history',
        loading: false 
      })
    }
  },

  loadCommentTemplates: async () => {
    set({ loading: true, error: null })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      set({ 
        commentTemplates: mockCommentTemplates,
        loading: false 
      })
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load comment templates',
        loading: false 
      })
    }
  },

  approveRequest: async (requestId: string, comment?: string) => {
    set({ loading: true, error: null })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Remove from pending requests
      const pendingRequest = get().pendingRequests.find(req => req.id === requestId)
      
      if (pendingRequest) {
        // Get current administrator context
        const admin = getCurrentAdministrator()
        
        // Create audit log entry
        const auditEntry = createApprovalAuditEntry(
          pendingRequest,
          admin.id,
          admin.name,
          admin.email,
          comment,
          { ipAddress: admin.ipAddress, userAgent: admin.userAgent }
        )
        
        // Create new current access entry
        const newAccess: CurrentAccess = {
          id: `access-${Date.now()}`,
          userId: pendingRequest.requesterId,
          userName: pendingRequest.requesterName,
          userEmail: pendingRequest.requesterEmail,
          productId: pendingRequest.productId,
          productName: pendingRequest.productName,
          grantedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
          grantedBy: admin.name, // Use actual admin name
          accessLevel: 'read', // Default access level
          status: 'active'
        }
        
        set(state => ({
          pendingRequests: state.pendingRequests.filter(req => req.id !== requestId),
          currentAccess: [...state.currentAccess, newAccess],
          auditLog: [...state.auditLog, auditEntry],
          loading: false
        }))
        
        console.log('Access request approved:', requestId, comment, 'Audit entry created:', auditEntry.id)
      }
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to approve request',
        loading: false 
      })
    }
  },

  declineRequest: async (requestId: string, comment: string) => {
    set({ loading: true, error: null })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Find the pending request for audit logging
      const pendingRequest = get().pendingRequests.find(req => req.id === requestId)
      
      if (pendingRequest) {
        // Get current administrator context
        const admin = getCurrentAdministrator()
        
        // Create audit log entry
        const auditEntry = createDeclineAuditEntry(
          pendingRequest,
          admin.id,
          admin.name,
          admin.email,
          comment,
          undefined, // templateUsed - could be enhanced to track which template was used
          { ipAddress: admin.ipAddress, userAgent: admin.userAgent }
        )
        
        // Remove from pending requests and add audit entry
        set(state => ({
          pendingRequests: state.pendingRequests.filter(req => req.id !== requestId),
          auditLog: [...state.auditLog, auditEntry],
          loading: false
        }))
        
        console.log('Access request declined:', requestId, comment, 'Audit entry created:', auditEntry.id)
      } else {
        set({ loading: false })
      }
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to decline request',
        loading: false 
      })
    }
  },

  renewAccess: async (accessId: string) => {
    set({ loading: true, error: null })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600))
      
      const access = get().currentAccess.find(a => a.id === accessId)
      
      if (access) {
        // Get current administrator context
        const admin = getCurrentAdministrator()
        
        // Create audit log entry
        const auditEntry = createRenewalAuditEntry(
          access,
          admin.id,
          admin.name,
          admin.email,
          { ipAddress: admin.ipAddress, userAgent: admin.userAgent }
        )
        
        set(state => ({
          currentAccess: state.currentAccess.map(access => 
            access.id === accessId 
              ? { 
                  ...access, 
                  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Extend by 1 year
                  status: 'active' as CurrentAccessStatus,
                  revocationScheduledAt: undefined,
                  revocationNotificationSent: false
                }
              : access
          ),
          // Remove any revocation notices for this access
          revocationNotices: state.revocationNotices.filter(notice => notice.accessId !== accessId),
          auditLog: [...state.auditLog, auditEntry],
          loading: false
        }))
        
        // Add success notification
        try {
          // Import notification store dynamically to avoid circular dependency
          const { useNotificationStore } = await import('@/stores/notification/notificationStore')
          const notificationStore = useNotificationStore.getState()
          
          notificationStore.addNotification({
            type: 'access_renewed',
            title: 'Access Renewed',
            message: `Access for ${access.userName} to ${access.productName} has been renewed for one year.`,
            productId: access.productId,
            productName: access.productName,
            read: false
          })
        } catch (notificationError) {
          console.warn('Failed to send renewal notification:', notificationError)
        }
        
        console.log('Access renewed:', accessId, 'User:', access.userName, 'Product:', access.productName, 'Audit entry created:', auditEntry.id)
      }
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to renew access',
        loading: false 
      })
    }
  },

  bulkRenewAccess: async (accessIds: string[]) => {
    set({ loading: true, error: null })
    
    try {
      // Simulate API call with longer delay for bulk operation
      await new Promise(resolve => setTimeout(resolve, 1000 + (accessIds.length * 200)))
      
      const accessesToRenew = get().currentAccess.filter(access => accessIds.includes(access.id))
      const renewalDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      
      if (accessesToRenew.length > 0) {
        // Get current administrator context
        const admin = getCurrentAdministrator()
        
        // Create audit log entries for bulk renewal
        const auditEntries = createBulkRenewalAuditEntry(
          accessesToRenew,
          admin.id,
          admin.name,
          admin.email,
          { ipAddress: admin.ipAddress, userAgent: admin.userAgent }
        )
        
        set(state => ({
          currentAccess: state.currentAccess.map(access => 
            accessIds.includes(access.id)
              ? { 
                  ...access, 
                  expiresAt: renewalDate,
                  status: 'active' as CurrentAccessStatus,
                  revocationScheduledAt: undefined,
                  revocationNotificationSent: false
                }
              : access
          ),
          // Remove any revocation notices for these access permissions
          revocationNotices: state.revocationNotices.filter(notice => !accessIds.includes(notice.accessId)),
          auditLog: [...state.auditLog, ...auditEntries],
          loading: false
        }))
        
        // Add success notifications for each renewed access
        try {
          // Import notification store dynamically to avoid circular dependency
          const { useNotificationStore } = await import('@/stores/notification/notificationStore')
          const notificationStore = useNotificationStore.getState()
          
          if (accessesToRenew.length === 1) {
            const access = accessesToRenew[0]
            notificationStore.addNotification({
              type: 'access_renewed',
              title: 'Access Renewed',
              message: `Access for ${access.userName} to ${access.productName} has been renewed for one year.`,
              productId: access.productId,
              productName: access.productName,
              read: false
            })
          } else {
            notificationStore.addNotification({
              type: 'access_renewed',
              title: 'Bulk Access Renewal Complete',
              message: `Successfully renewed ${accessesToRenew.length} access permissions for one year.`,
              read: false
            })
          }
        } catch (notificationError) {
          console.warn('Failed to send bulk renewal notifications:', notificationError)
        }
        
        console.log('Bulk access renewal completed:', {
          renewedCount: accessesToRenew.length,
          accessIds,
          users: accessesToRenew.map(a => a.userName),
          products: accessesToRenew.map(a => a.productName),
          auditEntriesCreated: auditEntries.length
        })
      }
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to renew access permissions',
        loading: false 
      })
    }
  },

  scheduleRevocation: async (accessId: string) => {
    set({ loading: true, error: null })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const revocationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      
      // Create revocation notice
      const access = get().currentAccess.find(a => a.id === accessId)
      if (access) {
        // Get current administrator context
        const admin = getCurrentAdministrator()
        
        // Create audit log entry
        const auditEntry = createScheduledRevocationAuditEntry(
          access,
          admin.id,
          admin.name,
          admin.email,
          revocationDate.toISOString(),
          { ipAddress: admin.ipAddress, userAgent: admin.userAgent }
        )
        
        const revocationNotice: AccessRevocationNotice = {
          id: `notice-${Date.now()}`,
          accessId: accessId,
          userId: access.userId,
          scheduledRevocationDate: revocationDate.toISOString(),
          notificationDate: new Date().toISOString(),
          notificationSent: false,
          remindersSent: 0,
          createdAt: new Date().toISOString()
        }
        
        set(state => ({
          currentAccess: state.currentAccess.map(access => 
            access.id === accessId 
              ? { 
                  ...access, 
                  status: 'scheduled_for_revocation' as CurrentAccessStatus,
                  revocationScheduledAt: revocationDate.toISOString(),
                  revocationNotificationSent: false
                }
              : access
          ),
          revocationNotices: [...state.revocationNotices, revocationNotice],
          auditLog: [...state.auditLog, auditEntry],
          loading: false
        }))

        // Schedule automatic notifications for this revocation
        try {
          await get().scheduleRevocationNotices([revocationNotice])
        } catch (schedulingError) {
          console.warn('Failed to schedule automatic revocation notifications:', schedulingError)
        }

        // Add immediate notification to user about scheduled revocation
        try {
          const { useNotificationStore } = await import('@/stores/notification/notificationStore')
          const notificationStore = useNotificationStore.getState()
          
          notificationStore.addAccessRevocationScheduledNotification(
            access.userName,
            access.productName,
            revocationDate.toISOString(),
            access.productId
          )
        } catch (notificationError) {
          console.warn('Failed to send immediate revocation notification:', notificationError)
        }
        
        console.log('Access revocation scheduled:', accessId, 'User:', access.userName, 'Product:', access.productName, 'Audit entry created:', auditEntry.id)
      }
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to schedule revocation',
        loading: false 
      })
    }
  },

  forceRevocation: async (accessId: string) => {
    set({ loading: true, error: null })
    
    try {
      // Get access details before removing
      const access = get().currentAccess.find(a => a.id === accessId)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (access) {
        // Get current administrator context
        const admin = getCurrentAdministrator()
        
        // Create audit log entry
        const auditEntry = createForceRevocationAuditEntry(
          access,
          admin.id,
          admin.name,
          admin.email,
          'Immediate revocation requested by administrator', // Default reason
          { ipAddress: admin.ipAddress, userAgent: admin.userAgent }
        )
        
        // Remove access immediately
        set(state => ({
          currentAccess: state.currentAccess.filter(access => access.id !== accessId),
          revocationNotices: state.revocationNotices.filter(notice => notice.accessId !== accessId),
          auditLog: [...state.auditLog, auditEntry],
          loading: false
        }))

        // Add notification to user about immediate revocation
        try {
          const { useNotificationStore } = await import('@/stores/notification/notificationStore')
          const notificationStore = useNotificationStore.getState()
          
          notificationStore.addNotification({
            type: 'access_force_revoked',
            title: 'Access Immediately Revoked',
            message: `Your access to ${access.productName} has been immediately revoked by an administrator. If you believe this is an error, please contact your system administrator.`,
            productId: access.productId,
            productName: access.productName,
            read: false
          })
        } catch (notificationError) {
          console.warn('Failed to send force revocation notification:', notificationError)
        }
        
        console.log('Access forcefully revoked:', accessId, 'User:', access.userName, 'Product:', access.productName, 'Audit entry created:', auditEntry.id)
      }
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to force revocation',
        loading: false 
      })
    }
  },

  clearError: () => {
    set({ error: null })
  },

  // Comment template management actions
  getTemplatesByCategory: (category: CommentTemplateCategory) => {
    const { commentTemplates } = get()
    return filterTemplatesByCategory(commentTemplates, category)
  },

  searchCommentTemplates: (searchTerm: string) => {
    const { commentTemplates } = get()
    return searchTemplates(commentTemplates, searchTerm)
  },

  getTemplateSuggestions: (context) => {
    const { commentTemplates } = get()
    return getTemplateSuggestions(commentTemplates, context)
  },

  addCommentTemplate: async (template: Omit<CommentTemplate, 'id'>) => {
    set({ loading: true, error: null })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newTemplate: CommentTemplate = {
        ...template,
        id: `template-${Date.now()}`
      }
      
      set(state => ({
        commentTemplates: [...state.commentTemplates, newTemplate],
        loading: false
      }))
      
      console.log('Comment template added:', newTemplate.id)
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add comment template',
        loading: false 
      })
    }
  },

  updateCommentTemplate: async (id: string, updates: Partial<CommentTemplate>) => {
    set({ loading: true, error: null })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400))
      
      set(state => ({
        commentTemplates: state.commentTemplates.map(template =>
          template.id === id ? { ...template, ...updates } : template
        ),
        loading: false
      }))
      
      console.log('Comment template updated:', id)
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update comment template',
        loading: false 
      })
    }
  },

  deleteCommentTemplate: async (id: string) => {
    set({ loading: true, error: null })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      set(state => ({
        commentTemplates: state.commentTemplates.filter(template => template.id !== id),
        loading: false
      }))
      
      console.log('Comment template deleted:', id)
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete comment template',
        loading: false 
      })
    }
  },

  // Notification scheduling actions
  generateNotificationSchedule: async () => {
    set({ loading: true, error: null })
    
    try {
      const { currentAccess, revocationNotices, notificationConfig } = get()
      
      // Generate expiration reminders
      const expirationReminders = generateExpirationReminders(currentAccess, notificationConfig)
      
      // Generate revocation notices
      const revocationNotifications = generateRevocationNotices(revocationNotices, currentAccess, notificationConfig)
      
      // Combine all scheduled notifications
      const allScheduledNotifications = [...expirationReminders, ...revocationNotifications]
      
      set(state => ({
        scheduledNotifications: [
          // Keep existing notifications that haven't been sent
          ...state.scheduledNotifications.filter(n => !n.sent),
          // Add new notifications (avoiding duplicates by ID)
          ...allScheduledNotifications.filter(newNotif => 
            !state.scheduledNotifications.some(existing => existing.id === newNotif.id)
          )
        ],
        loading: false
      }))
      
      console.log(`Generated ${allScheduledNotifications.length} scheduled notifications:`, {
        expirationReminders: expirationReminders.length,
        revocationNotifications: revocationNotifications.length
      })
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to generate notification schedule',
        loading: false 
      })
    }
  },

  processPendingNotifications: async () => {
    set({ loading: true, error: null })
    
    try {
      const { scheduledNotifications, notificationConfig } = get()
      
      // Process due notifications
      const { expirationReminders, revocationNotices, processedNotificationIds } = 
        processDueNotifications(scheduledNotifications, notificationConfig)
      
      if (processedNotificationIds.length === 0) {
        set({ loading: false })
        console.log('No pending notifications to process')
        return
      }
      
      // Get notification store and send notifications
      const { useNotificationStore } = await import('@/stores/notification/notificationStore')
      const notificationStore = useNotificationStore.getState()
      
      // Process expiration reminders
      if (expirationReminders.length > 0) {
        notificationStore.processExpirationReminders(expirationReminders)
      }
      
      // Process revocation notices
      if (revocationNotices.length > 0) {
        notificationStore.scheduleRevocationNotices(revocationNotices)
      }
      
      // Mark notifications as sent
      const updatedNotifications = markNotificationsAsSent(scheduledNotifications, processedNotificationIds)
      
      set(() => ({
        scheduledNotifications: updatedNotifications,
        loading: false
      }))
      
      console.log(`Processed ${processedNotificationIds.length} pending notifications:`, {
        expirationReminders: expirationReminders.length,
        revocationNotices: revocationNotices.length,
        processedIds: processedNotificationIds
      })
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to process pending notifications',
        loading: false 
      })
    }
  },

  updateNotificationConfig: (config: Partial<NotificationSchedulerConfig>) => {
    set(state => ({
      notificationConfig: { ...state.notificationConfig, ...config }
    }))
    
    console.log('Notification configuration updated:', config)
  },

  getNotificationStatistics: () => {
    const { scheduledNotifications } = get()
    return getNotificationStats(scheduledNotifications)
  },

  cleanupOldNotifications: (retentionDays = 90) => {
    set(state => ({
      scheduledNotifications: cleanupOldNotifications(state.scheduledNotifications, retentionDays)
    }))
    
    console.log(`Cleaned up old notifications (retention: ${retentionDays} days)`)
  },

  scheduleExpirationReminders: async (accessList?: CurrentAccess[]) => {
    set({ loading: true, error: null })
    
    try {
      const { currentAccess, notificationConfig } = get()
      const targetAccessList = accessList || currentAccess
      
      // Generate expiration reminders for the specified access list
      const expirationReminders = generateExpirationReminders(targetAccessList, notificationConfig)
      
      set(state => ({
        scheduledNotifications: [
          ...state.scheduledNotifications,
          ...expirationReminders.filter(newNotif => 
            !state.scheduledNotifications.some(existing => existing.id === newNotif.id)
          )
        ],
        loading: false
      }))
      
      console.log(`Scheduled ${expirationReminders.length} expiration reminders for ${targetAccessList.length} access permissions`)
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to schedule expiration reminders',
        loading: false 
      })
    }
  },

  scheduleRevocationNotices: async (revocationList?: AccessRevocationNotice[]) => {
    set({ loading: true, error: null })
    
    try {
      const { revocationNotices, currentAccess, notificationConfig } = get()
      const targetRevocationList = revocationList || revocationNotices
      
      // Generate revocation notices for the specified revocation list
      const revocationNotifications = generateRevocationNotices(targetRevocationList, currentAccess, notificationConfig)
      
      set(state => ({
        scheduledNotifications: [
          ...state.scheduledNotifications,
          ...revocationNotifications.filter(newNotif => 
            !state.scheduledNotifications.some(existing => existing.id === newNotif.id)
          )
        ],
        loading: false
      }))
      
      console.log(`Scheduled ${revocationNotifications.length} revocation notices for ${targetRevocationList.length} revocation notices`)
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to schedule revocation notices',
        loading: false 
      })
    }
  },

  // Audit logging actions
  getAuditLog: () => {
    const { auditLog } = get()
    return sortAuditEntries(auditLog, 'desc')
  },

  getFilteredAuditLog: (filters: AuditReportFilters) => {
    const { auditLog } = get()
    const filteredEntries = filterAuditEntries(auditLog, filters)
    return sortAuditEntries(filteredEntries, 'desc')
  },

  generateAuditReport: (filters: AuditReportFilters, title?: string, exportFormat: 'json' | 'csv' | 'pdf' = 'json') => {
    const { auditLog } = get()
    const admin = getCurrentAdministrator()
    
    const report = createAuditReport(
      auditLog,
      filters,
      `${admin.name} (${admin.email})`,
      title,
      exportFormat
    )
    
    console.log('Audit report generated:', {
      reportId: report.id,
      totalEntries: report.entries.length,
      dateRange: report.dateRange,
      exportFormat: report.exportFormat
    })
    
    return report
  },

  exportAuditReportAsCSV: (report: AuditReport) => {
    const csvContent = exportAuditReportToCSV(report)
    
    console.log('Audit report exported as CSV:', {
      reportId: report.id,
      csvLength: csvContent.length
    })
    
    return csvContent
  },

  clearAuditLog: () => {
    set({ auditLog: [] })
    console.log('Audit log cleared')
  },

  getAuditLogSummary: (filters?: AuditReportFilters) => {
    const { auditLog } = get()
    const targetEntries = filters ? filterAuditEntries(auditLog, filters) : auditLog
    return generateAuditSummary(targetEntries)
  }
}))