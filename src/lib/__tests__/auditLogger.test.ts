import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createAuditLogEntry,
  createApprovalAuditEntry,
  createDeclineAuditEntry,
  createRenewalAuditEntry,
  createBulkRenewalAuditEntry,
  createScheduledRevocationAuditEntry,
  createForceRevocationAuditEntry,
  filterAuditEntries,
  sortAuditEntries,
  generateAuditSummary,
  createAuditReport,
  exportAuditReportToCSV,
  getCurrentAdministrator,
  validateAuditEntry,
  formatAuditEntryForDisplay
} from '../auditLogger'
import type { 
  AuditLogEntry, 
  PendingAccessRequest, 
  CurrentAccess,
  AuditReportFilters 
} from '@/types'

// Mock data
const mockPendingRequest: PendingAccessRequest = {
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

const mockCurrentAccess: CurrentAccess = {
  id: 'access-001',
  userId: 'user-001',
  userName: 'John Doe',
  userEmail: 'john.doe@company.com',
  productId: 'product-001',
  productName: 'Test Product',
  grantedAt: '2024-01-01T10:00:00Z',
  expiresAt: '2025-01-01T10:00:00Z',
  grantedBy: 'admin-001',
  accessLevel: 'read',
  status: 'active'
}

const mockAdmin = {
  id: 'admin-001',
  name: 'Admin User',
  email: 'admin@company.com',
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0 Test Browser'
}

describe('auditLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createAuditLogEntry', () => {
    it('should create a basic audit log entry', () => {
      const entry = createAuditLogEntry(
        'approve',
        mockAdmin.id,
        mockAdmin.name,
        mockAdmin.email,
        'user-001',
        'John Doe',
        'john.doe@company.com',
        'product-001',
        'Test Product',
        { comment: 'Approved for testing' }
      )

      expect(entry).toMatchObject({
        administratorId: mockAdmin.id,
        administratorName: mockAdmin.name,
        administratorEmail: mockAdmin.email,
        action: 'approve',
        targetUserId: 'user-001',
        targetUserName: 'John Doe',
        targetUserEmail: 'john.doe@company.com',
        productId: 'product-001',
        productName: 'Test Product',
        details: { comment: 'Approved for testing' }
      })

      expect(entry.id).toMatch(/^audit-\d+-[a-z0-9]+$/)
      expect(entry.timestamp).toBeDefined()
      expect(new Date(entry.timestamp)).toBeInstanceOf(Date)
    })

    it('should include optional fields when provided', () => {
      const entry = createAuditLogEntry(
        'approve',
        mockAdmin.id,
        mockAdmin.name,
        mockAdmin.email,
        'user-001',
        'John Doe',
        'john.doe@company.com',
        'product-001',
        'Test Product',
        { comment: 'Approved for testing' },
        {
          accessId: 'access-001',
          requestId: 'req-001',
          ipAddress: '192.168.1.100',
          userAgent: 'Test Browser'
        }
      )

      expect(entry.accessId).toBe('access-001')
      expect(entry.requestId).toBe('req-001')
      expect(entry.ipAddress).toBe('192.168.1.100')
      expect(entry.userAgent).toBe('Test Browser')
    })
  })

  describe('createApprovalAuditEntry', () => {
    it('should create an approval audit entry', () => {
      const entry = createApprovalAuditEntry(
        mockPendingRequest,
        mockAdmin.id,
        mockAdmin.name,
        mockAdmin.email,
        'Approved after review'
      )

      expect(entry.action).toBe('approve')
      expect(entry.requestId).toBe(mockPendingRequest.id)
      expect(entry.details.comment).toBe('Approved after review')
      expect(entry.details.newExpirationDate).toBeDefined()
      expect(entry.details.additionalContext).toMatchObject({
        businessJustification: mockPendingRequest.businessJustification,
        bdac: mockPendingRequest.bdac,
        priority: mockPendingRequest.priority,
        daysWaiting: mockPendingRequest.daysWaiting
      })
    })
  })

  describe('createDeclineAuditEntry', () => {
    it('should create a decline audit entry', () => {
      const entry = createDeclineAuditEntry(
        mockPendingRequest,
        mockAdmin.id,
        mockAdmin.name,
        mockAdmin.email,
        'Insufficient justification',
        'template-001'
      )

      expect(entry.action).toBe('decline')
      expect(entry.requestId).toBe(mockPendingRequest.id)
      expect(entry.details.reason).toBe('Insufficient justification')
      expect(entry.details.comment).toBe('Insufficient justification')
      expect(entry.details.templateUsed).toBe('template-001')
    })
  })

  describe('createRenewalAuditEntry', () => {
    it('should create a renewal audit entry', () => {
      const entry = createRenewalAuditEntry(
        mockCurrentAccess,
        mockAdmin.id,
        mockAdmin.name,
        mockAdmin.email
      )

      expect(entry.action).toBe('renew')
      expect(entry.accessId).toBe(mockCurrentAccess.id)
      expect(entry.details.previousExpirationDate).toBe(mockCurrentAccess.expiresAt)
      expect(entry.details.newExpirationDate).toBeDefined()
      expect(entry.details.additionalContext).toMatchObject({
        accessLevel: mockCurrentAccess.accessLevel,
        previousStatus: mockCurrentAccess.status,
        grantedBy: mockCurrentAccess.grantedBy,
        grantedAt: mockCurrentAccess.grantedAt
      })
    })
  })

  describe('createBulkRenewalAuditEntry', () => {
    it('should create multiple audit entries for bulk renewal', () => {
      const accessList = [mockCurrentAccess, { ...mockCurrentAccess, id: 'access-002' }]
      const entries = createBulkRenewalAuditEntry(
        accessList,
        mockAdmin.id,
        mockAdmin.name,
        mockAdmin.email
      )

      expect(entries).toHaveLength(2)
      entries.forEach((entry, index) => {
        expect(entry.action).toBe('bulk_renew')
        expect(entry.accessId).toBe(accessList[index].id)
        expect(entry.details.bulkOperationCount).toBe(2)
      })
    })
  })

  describe('createScheduledRevocationAuditEntry', () => {
    it('should create a scheduled revocation audit entry', () => {
      const revocationDate = '2024-03-01T10:00:00Z'
      const entry = createScheduledRevocationAuditEntry(
        mockCurrentAccess,
        mockAdmin.id,
        mockAdmin.name,
        mockAdmin.email,
        revocationDate
      )

      expect(entry.action).toBe('schedule_revocation')
      expect(entry.accessId).toBe(mockCurrentAccess.id)
      expect(entry.details.revocationScheduledDate).toBe(revocationDate)
      expect(entry.details.additionalContext?.notificationPeriod).toBe('30 days')
    })
  })

  describe('createForceRevocationAuditEntry', () => {
    it('should create a force revocation audit entry', () => {
      const entry = createForceRevocationAuditEntry(
        mockCurrentAccess,
        mockAdmin.id,
        mockAdmin.name,
        mockAdmin.email,
        'Security violation'
      )

      expect(entry.action).toBe('force_revoke')
      expect(entry.accessId).toBe(mockCurrentAccess.id)
      expect(entry.details.reason).toBe('Security violation')
      expect(entry.details.additionalContext?.immediateRevocation).toBe(true)
    })
  })

  describe('filterAuditEntries', () => {
    const mockEntries: AuditLogEntry[] = [
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

    it('should filter by administrator IDs', () => {
      const filters: AuditReportFilters = {
        administratorIds: ['admin-001']
      }
      const filtered = filterAuditEntries(mockEntries, filters)
      
      expect(filtered).toHaveLength(1)
      expect(filtered[0].administratorId).toBe('admin-001')
    })

    it('should filter by actions', () => {
      const filters: AuditReportFilters = {
        actions: ['decline']
      }
      const filtered = filterAuditEntries(mockEntries, filters)
      
      expect(filtered).toHaveLength(1)
      expect(filtered[0].action).toBe('decline')
    })

    it('should filter by date range', () => {
      const filters: AuditReportFilters = {
        dateRange: {
          from: '2024-02-01T00:00:00Z',
          to: '2024-02-01T23:59:59Z'
        }
      }
      const filtered = filterAuditEntries(mockEntries, filters)
      
      expect(filtered).toHaveLength(1)
      expect(filtered[0].timestamp).toBe('2024-02-01T10:00:00Z')
    })

    it('should return all entries when no filters are applied', () => {
      const filtered = filterAuditEntries(mockEntries, {})
      expect(filtered).toHaveLength(2)
    })
  })

  describe('sortAuditEntries', () => {
    const mockEntries: AuditLogEntry[] = [
      { timestamp: '2024-02-01T10:00:00Z' } as AuditLogEntry,
      { timestamp: '2024-02-03T10:00:00Z' } as AuditLogEntry,
      { timestamp: '2024-02-02T10:00:00Z' } as AuditLogEntry
    ]

    it('should sort entries in descending order by default', () => {
      const sorted = sortAuditEntries(mockEntries)
      
      expect(sorted[0].timestamp).toBe('2024-02-03T10:00:00Z')
      expect(sorted[1].timestamp).toBe('2024-02-02T10:00:00Z')
      expect(sorted[2].timestamp).toBe('2024-02-01T10:00:00Z')
    })

    it('should sort entries in ascending order when specified', () => {
      const sorted = sortAuditEntries(mockEntries, 'asc')
      
      expect(sorted[0].timestamp).toBe('2024-02-01T10:00:00Z')
      expect(sorted[1].timestamp).toBe('2024-02-02T10:00:00Z')
      expect(sorted[2].timestamp).toBe('2024-02-03T10:00:00Z')
    })
  })

  describe('generateAuditSummary', () => {
    const mockEntries: AuditLogEntry[] = [
      {
        action: 'approve',
        administratorName: 'Admin One',
        administratorEmail: 'admin1@company.com',
        productName: 'Product One',
        timestamp: '2024-02-01T10:00:00Z'
      } as AuditLogEntry,
      {
        action: 'approve',
        administratorName: 'Admin One',
        administratorEmail: 'admin1@company.com',
        productName: 'Product Two',
        timestamp: '2024-02-02T10:00:00Z'
      } as AuditLogEntry,
      {
        action: 'decline',
        administratorName: 'Admin Two',
        administratorEmail: 'admin2@company.com',
        productName: 'Product One',
        timestamp: '2024-02-03T10:00:00Z'
      } as AuditLogEntry
    ]

    it('should generate correct summary statistics', () => {
      const summary = generateAuditSummary(mockEntries)
      
      expect(summary.totalEntries).toBe(3)
      expect(summary.actionCounts.approve).toBe(2)
      expect(summary.actionCounts.decline).toBe(1)
      expect(summary.administratorCounts['Admin One (admin1@company.com)']).toBe(2)
      expect(summary.administratorCounts['Admin Two (admin2@company.com)']).toBe(1)
      expect(summary.productCounts['Product One']).toBe(2)
      expect(summary.productCounts['Product Two']).toBe(1)
    })
  })

  describe('createAuditReport', () => {
    const mockEntries: AuditLogEntry[] = [
      { timestamp: '2024-02-01T10:00:00Z', action: 'approve' } as AuditLogEntry,
      { timestamp: '2024-02-02T10:00:00Z', action: 'decline' } as AuditLogEntry
    ]

    it('should create a complete audit report', () => {
      const filters: AuditReportFilters = {}
      const report = createAuditReport(mockEntries, filters, 'Test Admin', 'Test Report')
      
      expect(report.title).toBe('Test Report')
      expect(report.generatedBy).toBe('Test Admin')
      expect(report.entries).toHaveLength(2)
      expect(report.summary.totalEntries).toBe(2)
      expect(report.exportFormat).toBe('json')
    })
  })

  describe('exportAuditReportToCSV', () => {
    it('should export audit report to CSV format', () => {
      const mockReport = {
        entries: [
          {
            timestamp: '2024-02-01T10:00:00Z',
            administratorName: 'Admin One',
            administratorEmail: 'admin1@company.com',
            action: 'approve',
            targetUserName: 'User One',
            targetUserEmail: 'user1@company.com',
            productName: 'Product One',
            details: { comment: 'Test comment' },
            ipAddress: '192.168.1.100',
            userAgent: 'Test Browser'
          }
        ]
      } as any

      const csv = exportAuditReportToCSV(mockReport)
      
      expect(csv).toContain('Timestamp,Administrator,Administrator Email')
      expect(csv).toContain('2024-02-01T10:00:00Z')
      expect(csv).toContain('Admin One')
      expect(csv).toContain('approve')
    })
  })

  describe('validateAuditEntry', () => {
    it('should return no errors for valid entry', () => {
      const validEntry = {
        administratorId: 'admin-001',
        administratorName: 'Admin',
        administratorEmail: 'admin@company.com',
        action: 'approve',
        targetUserId: 'user-001',
        targetUserName: 'User',
        targetUserEmail: 'user@company.com',
        productId: 'product-001',
        productName: 'Product'
      }

      const errors = validateAuditEntry(validEntry)
      expect(errors).toHaveLength(0)
    })

    it('should return errors for missing required fields', () => {
      const invalidEntry = {
        administratorId: 'admin-001'
        // Missing other required fields
      }

      const errors = validateAuditEntry(invalidEntry)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors).toContain('Administrator name is required')
      expect(errors).toContain('Administrator email is required')
    })
  })

  describe('formatAuditEntryForDisplay', () => {
    it('should format audit entry for display', () => {
      const entry: AuditLogEntry = {
        id: 'audit-001',
        timestamp: '2024-02-01T10:00:00Z',
        administratorId: 'admin-001',
        administratorName: 'Admin User',
        administratorEmail: 'admin@company.com',
        action: 'approve',
        targetUserId: 'user-001',
        targetUserName: 'John Doe',
        targetUserEmail: 'john.doe@company.com',
        productId: 'product-001',
        productName: 'Test Product',
        details: { comment: 'Approved for testing' }
      }

      const formatted = formatAuditEntryForDisplay(entry)
      
      expect(formatted.action).toBe('APPROVE')
      expect(formatted.administrator).toBe('Admin User (admin@company.com)')
      expect(formatted.target).toBe('John Doe (john.doe@company.com)')
      expect(formatted.product).toBe('Test Product')
      expect(formatted.description).toContain('Approved access request')
      expect(formatted.description).toContain('Approved for testing')
    })
  })

  describe('getCurrentAdministrator', () => {
    it('should return mock administrator data', () => {
      const admin = getCurrentAdministrator()
      
      expect(admin.id).toBeDefined()
      expect(admin.name).toBeDefined()
      expect(admin.email).toBeDefined()
      expect(admin.ipAddress).toBeDefined()
      expect(admin.userAgent).toBeDefined()
    })
  })
})