import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAdminStore } from '../adminStore'
import type { PendingAccessRequest, CurrentAccess, AuditReportFilters } from '@/types'

// Mock the audit logger functions
vi.mock('@/lib/auditLogger', () => ({
  createApprovalAuditEntry: vi.fn(() => ({
    id: 'audit-001',
    timestamp: '2024-02-01T10:00:00Z',
    administratorId: 'admin-001',
    administratorName: 'System Administrator',
    administratorEmail: 'admin@company.com',
    action: 'approve',
    targetUserId: 'user-001',
    targetUserName: 'John Doe',
    targetUserEmail: 'john.doe@company.com',
    productId: 'product-001',
    productName: 'Test Product',
    details: { comment: 'Test approval' }
  })),
  createDeclineAuditEntry: vi.fn(() => ({
    id: 'audit-002',
    timestamp: '2024-02-01T10:00:00Z',
    administratorId: 'admin-001',
    administratorName: 'System Administrator',
    administratorEmail: 'admin@company.com',
    action: 'decline',
    targetUserId: 'user-001',
    targetUserName: 'John Doe',
    targetUserEmail: 'john.doe@company.com',
    productId: 'product-001',
    productName: 'Test Product',
    details: { reason: 'Test decline' }
  })),
  createRenewalAuditEntry: vi.fn(() => ({
    id: 'audit-003',
    timestamp: '2024-02-01T10:00:00Z',
    administratorId: 'admin-001',
    administratorName: 'System Administrator',
    administratorEmail: 'admin@company.com',
    action: 'renew',
    targetUserId: 'user-001',
    targetUserName: 'John Doe',
    targetUserEmail: 'john.doe@company.com',
    productId: 'product-001',
    productName: 'Test Product',
    details: { newExpirationDate: '2025-02-01T10:00:00Z' }
  })),
  createBulkRenewalAuditEntry: vi.fn(() => [
    {
      id: 'audit-004',
      timestamp: '2024-02-01T10:00:00Z',
      administratorId: 'admin-001',
      administratorName: 'System Administrator',
      administratorEmail: 'admin@company.com',
      action: 'bulk_renew',
      targetUserId: 'user-001',
      targetUserName: 'John Doe',
      targetUserEmail: 'john.doe@company.com',
      productId: 'product-001',
      productName: 'Test Product',
      details: { bulkOperationCount: 2 }
    }
  ]),
  createScheduledRevocationAuditEntry: vi.fn(() => ({
    id: 'audit-005',
    timestamp: '2024-02-01T10:00:00Z',
    administratorId: 'admin-001',
    administratorName: 'System Administrator',
    administratorEmail: 'admin@company.com',
    action: 'schedule_revocation',
    targetUserId: 'user-001',
    targetUserName: 'John Doe',
    targetUserEmail: 'john.doe@company.com',
    productId: 'product-001',
    productName: 'Test Product',
    details: { revocationScheduledDate: '2024-03-01T10:00:00Z' }
  })),
  createForceRevocationAuditEntry: vi.fn(() => ({
    id: 'audit-006',
    timestamp: '2024-02-01T10:00:00Z',
    administratorId: 'admin-001',
    administratorName: 'System Administrator',
    administratorEmail: 'admin@company.com',
    action: 'force_revoke',
    targetUserId: 'user-001',
    targetUserName: 'John Doe',
    targetUserEmail: 'john.doe@company.com',
    productId: 'product-001',
    productName: 'Test Product',
    details: { reason: 'Security violation' }
  })),
  filterAuditEntries: vi.fn((entries, filters) => entries),
  sortAuditEntries: vi.fn((entries) => entries),
  generateAuditSummary: vi.fn(() => ({
    totalEntries: 1,
    actionCounts: { approve: 1, decline: 0, renew: 0, revoke: 0, force_revoke: 0, schedule_revocation: 0, bulk_renew: 0 },
    administratorCounts: { 'System Administrator (admin@company.com)': 1 },
    productCounts: { 'Test Product': 1 },
    dateRange: { from: '2024-02-01T10:00:00Z', to: '2024-02-01T10:00:00Z' }
  })),
  createAuditReport: vi.fn(() => ({
    id: 'report-001',
    title: 'Test Report',
    generatedAt: '2024-02-01T10:00:00Z',
    generatedBy: 'System Administrator',
    dateRange: { from: '2024-02-01T00:00:00Z', to: '2024-02-01T23:59:59Z' },
    filters: {},
    entries: [],
    summary: {
      totalEntries: 0,
      actionCounts: { approve: 0, decline: 0, renew: 0, revoke: 0, force_revoke: 0, schedule_revocation: 0, bulk_renew: 0 },
      administratorCounts: {},
      productCounts: {},
      dateRange: { from: '2024-02-01T10:00:00Z', to: '2024-02-01T10:00:00Z' }
    },
    exportFormat: 'json' as const
  })),
  exportAuditReportToCSV: vi.fn(() => 'timestamp,action,description\n2024-02-01T10:00:00Z,approve,Test entry'),
  getCurrentAdministrator: vi.fn(() => ({
    id: 'admin-001',
    name: 'System Administrator',
    email: 'admin@company.com',
    ipAddress: '192.168.1.100',
    userAgent: 'Test Browser'
  }))
}))

// Mock notification store to avoid circular dependency
vi.mock('@/stores/notification/notificationStore', () => ({
  useNotificationStore: {
    getState: () => ({
      addNotification: vi.fn(),
      addAccessRevocationScheduledNotification: vi.fn()
    })
  }
}))

describe('AdminStore Audit Logging', () => {
  beforeEach(() => {
    // Reset store state
    useAdminStore.setState({
      pendingRequests: [],
      currentAccess: [],
      auditLog: [],
      loading: false,
      error: null
    })
    vi.clearAllMocks()
  })

  describe('approveRequest with audit logging', () => {
    it('should create audit log entry when approving request', async () => {
      const mockRequest: PendingAccessRequest = {
        id: 'req-001',
        productId: 'product-001',
        productName: 'Test Product',
        requesterId: 'user-001',
        requesterName: 'John Doe',
        requesterEmail: 'john.doe@company.com',
        bdac: 'ANALYTICS_TEAM',
        businessJustification: 'Need access for analysis',
        status: 'pending',
        createdAt: '2024-02-01T10:00:00Z',
        updatedAt: '2024-02-01T10:00:00Z',
        priority: 'medium',
        daysWaiting: 5,
        escalated: false
      }

      // Set up initial state
      useAdminStore.setState({
        pendingRequests: [mockRequest]
      })

      const store = useAdminStore.getState()
      await store.approveRequest('req-001', 'Approved for testing')

      const finalState = useAdminStore.getState()
      
      // Check that audit log entry was added
      expect(finalState.auditLog).toHaveLength(1)
      expect(finalState.auditLog[0]).toMatchObject({
        id: 'audit-001',
        action: 'approve',
        targetUserId: 'user-001',
        productId: 'product-001'
      })

      // Check that request was removed from pending
      expect(finalState.pendingRequests).toHaveLength(0)
      
      // Check that current access was added
      expect(finalState.currentAccess).toHaveLength(1)
      expect(finalState.currentAccess[0].userId).toBe('user-001')
    })
  })

  describe('declineRequest with audit logging', () => {
    it('should create audit log entry when declining request', async () => {
      const mockRequest: PendingAccessRequest = {
        id: 'req-001',
        productId: 'product-001',
        productName: 'Test Product',
        requesterId: 'user-001',
        requesterName: 'John Doe',
        requesterEmail: 'john.doe@company.com',
        bdac: 'ANALYTICS_TEAM',
        businessJustification: 'Need access for analysis',
        status: 'pending',
        createdAt: '2024-02-01T10:00:00Z',
        updatedAt: '2024-02-01T10:00:00Z',
        priority: 'medium',
        daysWaiting: 5,
        escalated: false
      }

      // Set up initial state
      useAdminStore.setState({
        pendingRequests: [mockRequest]
      })

      const store = useAdminStore.getState()
      await store.declineRequest('req-001', 'Insufficient justification')

      const finalState = useAdminStore.getState()
      
      // Check that audit log entry was added
      expect(finalState.auditLog).toHaveLength(1)
      expect(finalState.auditLog[0]).toMatchObject({
        id: 'audit-002',
        action: 'decline',
        targetUserId: 'user-001',
        productId: 'product-001'
      })

      // Check that request was removed from pending
      expect(finalState.pendingRequests).toHaveLength(0)
    })
  })

  describe('renewAccess with audit logging', () => {
    it('should create audit log entry when renewing access', async () => {
      const mockAccess: CurrentAccess = {
        id: 'access-001',
        userId: 'user-001',
        userName: 'John Doe',
        userEmail: 'john.doe@company.com',
        productId: 'product-001',
        productName: 'Test Product',
        grantedAt: '2024-01-01T10:00:00Z',
        expiresAt: '2024-12-31T10:00:00Z',
        grantedBy: 'admin-001',
        accessLevel: 'read',
        status: 'active'
      }

      // Set up initial state
      useAdminStore.setState({
        currentAccess: [mockAccess]
      })

      const store = useAdminStore.getState()
      await store.renewAccess('access-001')

      const finalState = useAdminStore.getState()
      
      // Check that audit log entry was added
      expect(finalState.auditLog).toHaveLength(1)
      expect(finalState.auditLog[0]).toMatchObject({
        id: 'audit-003',
        action: 'renew',
        targetUserId: 'user-001',
        productId: 'product-001'
      })

      // Check that access was updated
      expect(finalState.currentAccess[0].status).toBe('active')
    })
  })

  describe('bulkRenewAccess with audit logging', () => {
    it('should create audit log entries for bulk renewal', async () => {
      const mockAccess: CurrentAccess = {
        id: 'access-001',
        userId: 'user-001',
        userName: 'John Doe',
        userEmail: 'john.doe@company.com',
        productId: 'product-001',
        productName: 'Test Product',
        grantedAt: '2024-01-01T10:00:00Z',
        expiresAt: '2024-12-31T10:00:00Z',
        grantedBy: 'admin-001',
        accessLevel: 'read',
        status: 'active'
      }

      // Set up initial state
      useAdminStore.setState({
        currentAccess: [mockAccess]
      })

      const store = useAdminStore.getState()
      await store.bulkRenewAccess(['access-001'])

      const finalState = useAdminStore.getState()
      
      // Check that audit log entry was added
      expect(finalState.auditLog).toHaveLength(1)
      expect(finalState.auditLog[0]).toMatchObject({
        id: 'audit-004',
        action: 'bulk_renew',
        targetUserId: 'user-001',
        productId: 'product-001'
      })
    })
  })

  describe('scheduleRevocation with audit logging', () => {
    it('should create audit log entry when scheduling revocation', async () => {
      const mockAccess: CurrentAccess = {
        id: 'access-001',
        userId: 'user-001',
        userName: 'John Doe',
        userEmail: 'john.doe@company.com',
        productId: 'product-001',
        productName: 'Test Product',
        grantedAt: '2024-01-01T10:00:00Z',
        expiresAt: '2024-12-31T10:00:00Z',
        grantedBy: 'admin-001',
        accessLevel: 'read',
        status: 'active'
      }

      // Set up initial state
      useAdminStore.setState({
        currentAccess: [mockAccess]
      })

      const store = useAdminStore.getState()
      await store.scheduleRevocation('access-001')

      const finalState = useAdminStore.getState()
      
      // Check that audit log entry was added
      expect(finalState.auditLog).toHaveLength(1)
      expect(finalState.auditLog[0]).toMatchObject({
        id: 'audit-005',
        action: 'schedule_revocation',
        targetUserId: 'user-001',
        productId: 'product-001'
      })

      // Check that access status was updated
      expect(finalState.currentAccess[0].status).toBe('scheduled_for_revocation')
      expect(finalState.revocationNotices).toHaveLength(1)
    })
  })

  describe('forceRevocation with audit logging', () => {
    it('should create audit log entry when force revoking access', async () => {
      const mockAccess: CurrentAccess = {
        id: 'access-001',
        userId: 'user-001',
        userName: 'John Doe',
        userEmail: 'john.doe@company.com',
        productId: 'product-001',
        productName: 'Test Product',
        grantedAt: '2024-01-01T10:00:00Z',
        expiresAt: '2024-12-31T10:00:00Z',
        grantedBy: 'admin-001',
        accessLevel: 'read',
        status: 'active'
      }

      // Set up initial state
      useAdminStore.setState({
        currentAccess: [mockAccess]
      })

      const store = useAdminStore.getState()
      await store.forceRevocation('access-001')

      const finalState = useAdminStore.getState()
      
      // Check that audit log entry was added
      expect(finalState.auditLog).toHaveLength(1)
      expect(finalState.auditLog[0]).toMatchObject({
        id: 'audit-006',
        action: 'force_revoke',
        targetUserId: 'user-001',
        productId: 'product-001'
      })

      // Check that access was removed
      expect(finalState.currentAccess).toHaveLength(0)
    })
  })

  describe('audit log management actions', () => {
    beforeEach(() => {
      // Set up some mock audit entries
      useAdminStore.setState({
        auditLog: [
          {
            id: 'audit-001',
            timestamp: '2024-02-01T10:00:00Z',
            administratorId: 'admin-001',
            administratorName: 'Admin One',
            administratorEmail: 'admin1@company.com',
            action: 'approve',
            targetUserId: 'user-001',
            targetUserName: 'User One',
            targetUserEmail: 'user1@company.com',
            productId: 'product-001',
            productName: 'Product One',
            details: {}
          },
          {
            id: 'audit-002',
            timestamp: '2024-02-02T10:00:00Z',
            administratorId: 'admin-002',
            administratorName: 'Admin Two',
            administratorEmail: 'admin2@company.com',
            action: 'decline',
            targetUserId: 'user-002',
            targetUserName: 'User Two',
            targetUserEmail: 'user2@company.com',
            productId: 'product-002',
            productName: 'Product Two',
            details: {}
          }
        ]
      })
    })

    describe('getAuditLog', () => {
      it('should return sorted audit log entries', () => {
        const store = useAdminStore.getState()
        const auditLog = store.getAuditLog()
        
        expect(auditLog).toHaveLength(2)
        // sortAuditEntries is mocked to return entries as-is
        expect(auditLog[0].id).toBe('audit-001')
      })
    })

    describe('getFilteredAuditLog', () => {
      it('should return filtered audit log entries', () => {
        const store = useAdminStore.getState()
        const filters: AuditReportFilters = {
          administratorIds: ['admin-001']
        }
        const filteredLog = store.getFilteredAuditLog(filters)
        
        expect(filteredLog).toHaveLength(2) // Mock returns all entries
      })
    })

    describe('generateAuditReport', () => {
      it('should generate audit report', () => {
        const store = useAdminStore.getState()
        const filters: AuditReportFilters = {}
        const report = store.generateAuditReport(filters, 'Test Report')
        
        expect(report).toMatchObject({
          id: 'report-001',
          title: 'Test Report',
          generatedBy: 'System Administrator'
        })
      })
    })

    describe('exportAuditReportAsCSV', () => {
      it('should export audit report as CSV', () => {
        const store = useAdminStore.getState()
        const mockReport = {
          id: 'report-001',
          entries: []
        } as any
        
        const csv = store.exportAuditReportAsCSV(mockReport)
        
        expect(csv).toBe('timestamp,action,description\n2024-02-01T10:00:00Z,approve,Test entry')
      })
    })

    describe('getAuditLogSummary', () => {
      it('should return audit log summary', () => {
        const store = useAdminStore.getState()
        const summary = store.getAuditLogSummary()
        
        expect(summary).toMatchObject({
          totalEntries: 1,
          actionCounts: expect.any(Object),
          administratorCounts: expect.any(Object),
          productCounts: expect.any(Object)
        })
      })

      it('should return filtered audit log summary', () => {
        const store = useAdminStore.getState()
        const filters: AuditReportFilters = {
          actions: ['approve']
        }
        const summary = store.getAuditLogSummary(filters)
        
        expect(summary).toMatchObject({
          totalEntries: 1,
          actionCounts: expect.any(Object)
        })
      })
    })

    describe('clearAuditLog', () => {
      it('should clear audit log', () => {
        const store = useAdminStore.getState()
        
        // Verify initial state has entries
        expect(useAdminStore.getState().auditLog).toHaveLength(2)
        
        store.clearAuditLog()
        
        // Verify audit log is cleared
        expect(useAdminStore.getState().auditLog).toHaveLength(0)
      })
    })
  })

  describe('error handling in audit logging', () => {
    it('should handle errors gracefully when audit logging fails', async () => {
      // Mock audit function to throw error
      const { createApprovalAuditEntry } = await import('@/lib/auditLogger')
      vi.mocked(createApprovalAuditEntry).mockImplementationOnce(() => {
        throw new Error('Audit logging failed')
      })

      const mockRequest: PendingAccessRequest = {
        id: 'req-001',
        productId: 'product-001',
        productName: 'Test Product',
        requesterId: 'user-001',
        requesterName: 'John Doe',
        requesterEmail: 'john.doe@company.com',
        bdac: 'ANALYTICS_TEAM',
        businessJustification: 'Need access for analysis',
        status: 'pending',
        createdAt: '2024-02-01T10:00:00Z',
        updatedAt: '2024-02-01T10:00:00Z',
        priority: 'medium',
        daysWaiting: 5,
        escalated: false
      }

      useAdminStore.setState({
        pendingRequests: [mockRequest]
      })

      const store = useAdminStore.getState()
      
      // The store should handle the error gracefully and set error state
      await store.approveRequest('req-001', 'Test')
      
      // The store should be in an error state
      const finalState = useAdminStore.getState()
      expect(finalState.error).toBeTruthy()
      expect(finalState.loading).toBe(false)
    })
  })
})