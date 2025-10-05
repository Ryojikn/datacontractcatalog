import type { 
  AuditLogEntry, 
  AuditActionType, 
  AuditActionDetails, 
  AuditReport, 
  AuditReportFilters,
  AuditReportSummary,
  PendingAccessRequest,
  CurrentAccess
} from '@/types'

/**
 * Utility functions for audit logging and action tracking in the access management system
 */

/**
 * Creates a new audit log entry for an administrative action
 */
export function createAuditLogEntry(
  action: AuditActionType,
  administratorId: string,
  administratorName: string,
  administratorEmail: string,
  targetUserId: string,
  targetUserName: string,
  targetUserEmail: string,
  productId: string,
  productName: string,
  details: AuditActionDetails,
  options?: {
    accessId?: string;
    requestId?: string;
    ipAddress?: string;
    userAgent?: string;
  }
): AuditLogEntry {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    administratorId,
    administratorName,
    administratorEmail,
    action,
    targetUserId,
    targetUserName,
    targetUserEmail,
    productId,
    productName,
    accessId: options?.accessId,
    requestId: options?.requestId,
    details,
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent
  }
}

/**
 * Creates audit log entry for request approval
 */
export function createApprovalAuditEntry(
  request: PendingAccessRequest,
  administratorId: string,
  administratorName: string,
  administratorEmail: string,
  comment?: string,
  options?: { ipAddress?: string; userAgent?: string }
): AuditLogEntry {
  return createAuditLogEntry(
    'approve',
    administratorId,
    administratorName,
    administratorEmail,
    request.requesterId,
    request.requesterName,
    request.requesterEmail,
    request.productId,
    request.productName,
    {
      comment,
      newExpirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      additionalContext: {
        businessJustification: request.businessJustification,
        bdac: request.bdac,
        priority: request.priority,
        daysWaiting: request.daysWaiting
      }
    },
    {
      requestId: request.id,
      ...options
    }
  )
}

/**
 * Creates audit log entry for request decline
 */
export function createDeclineAuditEntry(
  request: PendingAccessRequest,
  administratorId: string,
  administratorName: string,
  administratorEmail: string,
  comment: string,
  templateUsed?: string,
  options?: { ipAddress?: string; userAgent?: string }
): AuditLogEntry {
  return createAuditLogEntry(
    'decline',
    administratorId,
    administratorName,
    administratorEmail,
    request.requesterId,
    request.requesterName,
    request.requesterEmail,
    request.productId,
    request.productName,
    {
      reason: comment,
      comment,
      templateUsed,
      additionalContext: {
        businessJustification: request.businessJustification,
        bdac: request.bdac,
        priority: request.priority,
        daysWaiting: request.daysWaiting
      }
    },
    {
      requestId: request.id,
      ...options
    }
  )
}

/**
 * Creates audit log entry for access renewal
 */
export function createRenewalAuditEntry(
  access: CurrentAccess,
  administratorId: string,
  administratorName: string,
  administratorEmail: string,
  options?: { ipAddress?: string; userAgent?: string }
): AuditLogEntry {
  const newExpirationDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  
  return createAuditLogEntry(
    'renew',
    administratorId,
    administratorName,
    administratorEmail,
    access.userId,
    access.userName,
    access.userEmail,
    access.productId,
    access.productName,
    {
      previousExpirationDate: access.expiresAt,
      newExpirationDate,
      additionalContext: {
        accessLevel: access.accessLevel,
        previousStatus: access.status,
        grantedBy: access.grantedBy,
        grantedAt: access.grantedAt
      }
    },
    {
      accessId: access.id,
      ...options
    }
  )
}

/**
 * Creates audit log entry for bulk access renewal
 */
export function createBulkRenewalAuditEntry(
  accessList: CurrentAccess[],
  administratorId: string,
  administratorName: string,
  administratorEmail: string,
  options?: { ipAddress?: string; userAgent?: string }
): AuditLogEntry[] {
  const newExpirationDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  
  return accessList.map(access => 
    createAuditLogEntry(
      'bulk_renew',
      administratorId,
      administratorName,
      administratorEmail,
      access.userId,
      access.userName,
      access.userEmail,
      access.productId,
      access.productName,
      {
        previousExpirationDate: access.expiresAt,
        newExpirationDate,
        bulkOperationCount: accessList.length,
        additionalContext: {
          accessLevel: access.accessLevel,
          previousStatus: access.status,
          grantedBy: access.grantedBy,
          grantedAt: access.grantedAt
        }
      },
      {
        accessId: access.id,
        ...options
      }
    )
  )
}

/**
 * Creates audit log entry for scheduled revocation
 */
export function createScheduledRevocationAuditEntry(
  access: CurrentAccess,
  administratorId: string,
  administratorName: string,
  administratorEmail: string,
  revocationDate: string,
  options?: { ipAddress?: string; userAgent?: string }
): AuditLogEntry {
  return createAuditLogEntry(
    'schedule_revocation',
    administratorId,
    administratorName,
    administratorEmail,
    access.userId,
    access.userName,
    access.userEmail,
    access.productId,
    access.productName,
    {
      revocationScheduledDate: revocationDate,
      previousExpirationDate: access.expiresAt,
      additionalContext: {
        accessLevel: access.accessLevel,
        previousStatus: access.status,
        grantedBy: access.grantedBy,
        grantedAt: access.grantedAt,
        notificationPeriod: '30 days'
      }
    },
    {
      accessId: access.id,
      ...options
    }
  )
}

/**
 * Creates audit log entry for force revocation
 */
export function createForceRevocationAuditEntry(
  access: CurrentAccess,
  administratorId: string,
  administratorName: string,
  administratorEmail: string,
  reason?: string,
  options?: { ipAddress?: string; userAgent?: string }
): AuditLogEntry {
  return createAuditLogEntry(
    'force_revoke',
    administratorId,
    administratorName,
    administratorEmail,
    access.userId,
    access.userName,
    access.userEmail,
    access.productId,
    access.productName,
    {
      reason,
      previousExpirationDate: access.expiresAt,
      additionalContext: {
        accessLevel: access.accessLevel,
        previousStatus: access.status,
        grantedBy: access.grantedBy,
        grantedAt: access.grantedAt,
        immediateRevocation: true
      }
    },
    {
      accessId: access.id,
      ...options
    }
  )
}

/**
 * Filters audit log entries based on provided criteria
 */
export function filterAuditEntries(
  entries: AuditLogEntry[],
  filters: AuditReportFilters
): AuditLogEntry[] {
  return entries.filter(entry => {
    // Filter by administrator IDs
    if (filters.administratorIds && filters.administratorIds.length > 0) {
      if (!filters.administratorIds.includes(entry.administratorId)) {
        return false
      }
    }

    // Filter by target user IDs
    if (filters.targetUserIds && filters.targetUserIds.length > 0) {
      if (!filters.targetUserIds.includes(entry.targetUserId)) {
        return false
      }
    }

    // Filter by product IDs
    if (filters.productIds && filters.productIds.length > 0) {
      if (!filters.productIds.includes(entry.productId)) {
        return false
      }
    }

    // Filter by actions
    if (filters.actions && filters.actions.length > 0) {
      if (!filters.actions.includes(entry.action)) {
        return false
      }
    }

    // Filter by date range
    if (filters.dateRange) {
      const entryDate = new Date(entry.timestamp)
      const fromDate = new Date(filters.dateRange.from)
      const toDate = new Date(filters.dateRange.to)
      
      if (entryDate < fromDate || entryDate > toDate) {
        return false
      }
    }

    return true
  })
}

/**
 * Sorts audit log entries by timestamp (newest first by default)
 */
export function sortAuditEntries(
  entries: AuditLogEntry[],
  sortOrder: 'asc' | 'desc' = 'desc'
): AuditLogEntry[] {
  return [...entries].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime()
    const dateB = new Date(b.timestamp).getTime()
    
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
  })
}

/**
 * Generates summary statistics for audit entries
 */
export function generateAuditSummary(entries: AuditLogEntry[]): AuditReportSummary {
  const actionCounts: Record<AuditActionType, number> = {
    approve: 0,
    decline: 0,
    renew: 0,
    revoke: 0,
    force_revoke: 0,
    schedule_revocation: 0,
    bulk_renew: 0
  }

  const administratorCounts: Record<string, number> = {}
  const productCounts: Record<string, number> = {}
  
  let earliestDate = new Date().toISOString()
  let latestDate = new Date(0).toISOString()

  entries.forEach(entry => {
    // Count actions
    actionCounts[entry.action]++

    // Count administrators
    const adminKey = `${entry.administratorName} (${entry.administratorEmail})`
    administratorCounts[adminKey] = (administratorCounts[adminKey] || 0) + 1

    // Count products
    productCounts[entry.productName] = (productCounts[entry.productName] || 0) + 1

    // Track date range
    if (entry.timestamp < earliestDate) {
      earliestDate = entry.timestamp
    }
    if (entry.timestamp > latestDate) {
      latestDate = entry.timestamp
    }
  })

  return {
    totalEntries: entries.length,
    actionCounts,
    administratorCounts,
    productCounts,
    dateRange: {
      from: entries.length > 0 ? earliestDate : new Date().toISOString(),
      to: entries.length > 0 ? latestDate : new Date().toISOString()
    }
  }
}

/**
 * Creates an audit report with filtered and summarized data
 */
export function createAuditReport(
  entries: AuditLogEntry[],
  filters: AuditReportFilters,
  generatedBy: string,
  title?: string,
  exportFormat: 'json' | 'csv' | 'pdf' = 'json'
): AuditReport {
  const filteredEntries = filterAuditEntries(entries, filters)
  const sortedEntries = sortAuditEntries(filteredEntries)
  const summary = generateAuditSummary(sortedEntries)

  return {
    id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: title || `Audit Report - ${new Date().toLocaleDateString()}`,
    generatedAt: new Date().toISOString(),
    generatedBy,
    dateRange: filters.dateRange || {
      from: summary.dateRange.from,
      to: summary.dateRange.to
    },
    filters,
    entries: sortedEntries,
    summary,
    exportFormat
  }
}

/**
 * Converts audit report to CSV format
 */
export function exportAuditReportToCSV(report: AuditReport): string {
  const headers = [
    'Timestamp',
    'Administrator',
    'Administrator Email',
    'Action',
    'Target User',
    'Target User Email',
    'Product Name',
    'Details',
    'IP Address',
    'User Agent'
  ]

  const rows = report.entries.map(entry => [
    entry.timestamp,
    entry.administratorName,
    entry.administratorEmail,
    entry.action,
    entry.targetUserName,
    entry.targetUserEmail,
    entry.productName,
    JSON.stringify(entry.details),
    entry.ipAddress || '',
    entry.userAgent || ''
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return csvContent
}

/**
 * Gets current administrator context (mock implementation)
 * In a real application, this would get data from authentication context
 */
export function getCurrentAdministrator(): {
  id: string;
  name: string;
  email: string;
  ipAddress?: string;
  userAgent?: string;
} {
  // Mock implementation - in real app, get from auth context
  return {
    id: 'admin-001',
    name: 'System Administrator',
    email: 'admin@company.com',
    ipAddress: '192.168.1.100',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Test Environment'
  }
}

/**
 * Validates audit log entry data
 */
export function validateAuditEntry(entry: Partial<AuditLogEntry>): string[] {
  const errors: string[] = []

  if (!entry.administratorId) errors.push('Administrator ID is required')
  if (!entry.administratorName) errors.push('Administrator name is required')
  if (!entry.administratorEmail) errors.push('Administrator email is required')
  if (!entry.action) errors.push('Action is required')
  if (!entry.targetUserId) errors.push('Target user ID is required')
  if (!entry.targetUserName) errors.push('Target user name is required')
  if (!entry.targetUserEmail) errors.push('Target user email is required')
  if (!entry.productId) errors.push('Product ID is required')
  if (!entry.productName) errors.push('Product name is required')

  return errors
}

/**
 * Formats audit entry for display
 */
export function formatAuditEntryForDisplay(entry: AuditLogEntry): {
  timestamp: string;
  action: string;
  description: string;
  administrator: string;
  target: string;
  product: string;
} {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getActionDescription = (entry: AuditLogEntry): string => {
    switch (entry.action) {
      case 'approve':
        return `Approved access request${entry.details.comment ? ` with comment: "${entry.details.comment}"` : ''}`
      case 'decline':
        return `Declined access request: ${entry.details.reason || 'No reason provided'}`
      case 'renew':
        return `Renewed access until ${entry.details.newExpirationDate ? formatDate(entry.details.newExpirationDate) : 'unknown date'}`
      case 'bulk_renew':
        return `Bulk renewed access (${entry.details.bulkOperationCount || 1} items) until ${entry.details.newExpirationDate ? formatDate(entry.details.newExpirationDate) : 'unknown date'}`
      case 'schedule_revocation':
        return `Scheduled access revocation for ${entry.details.revocationScheduledDate ? formatDate(entry.details.revocationScheduledDate) : 'unknown date'}`
      case 'force_revoke':
        return `Immediately revoked access${entry.details.reason ? ` - Reason: ${entry.details.reason}` : ''}`
      default:
        return `Performed ${entry.action} action`
    }
  }

  return {
    timestamp: formatDate(entry.timestamp),
    action: entry.action.replace('_', ' ').toUpperCase(),
    description: getActionDescription(entry),
    administrator: `${entry.administratorName} (${entry.administratorEmail})`,
    target: `${entry.targetUserName} (${entry.targetUserEmail})`,
    product: entry.productName
  }
}