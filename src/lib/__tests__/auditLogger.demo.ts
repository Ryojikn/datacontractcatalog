/**
 * Demo file showing audit logging functionality
 * This file demonstrates how to use the audit logging system for access management
 */

import {
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
  formatAuditEntryForDisplay,
  getCurrentAdministrator
} from '../auditLogger'
import type { PendingAccessRequest, CurrentAccess, AuditReportFilters } from '@/types'

// Demo data
const mockPendingRequest: PendingAccessRequest = {
  id: 'req-001',
  productId: 'product-001',
  productName: 'Customer Analytics Dataset',
  requesterId: 'user-001',
  requesterName: 'Alice Johnson',
  requesterEmail: 'alice.johnson@company.com',
  bdac: 'ANALYTICS_TEAM',
  businessJustification: 'Need access to customer data for quarterly business review and trend analysis',
  status: 'pending',
  createdAt: '2024-02-01T10:00:00Z',
  updatedAt: '2024-02-01T10:00:00Z',
  priority: 'high',
  daysWaiting: 3,
  escalated: false
}

const mockCurrentAccess: CurrentAccess = {
  id: 'access-001',
  userId: 'user-002',
  userName: 'Bob Smith',
  userEmail: 'bob.smith@company.com',
  productId: 'product-002',
  productName: 'Financial Risk Metrics',
  grantedAt: '2024-01-01T10:00:00Z',
  expiresAt: '2024-12-31T10:00:00Z',
  grantedBy: 'admin-001',
  accessLevel: 'read',
  status: 'active'
}

const admin = getCurrentAdministrator()

console.log('=== Audit Logging Demo ===\n')

// 1. Create approval audit entry
console.log('1. Creating approval audit entry...')
const approvalEntry = createApprovalAuditEntry(
  mockPendingRequest,
  admin.id,
  admin.name,
  admin.email,
  'Approved after security review. Business justification is sufficient.',
  { ipAddress: admin.ipAddress, userAgent: admin.userAgent }
)
console.log('Approval audit entry:', JSON.stringify(approvalEntry, null, 2))
console.log()

// 2. Create decline audit entry
console.log('2. Creating decline audit entry...')
const declineEntry = createDeclineAuditEntry(
  mockPendingRequest,
  admin.id,
  admin.name,
  admin.email,
  'Access denied due to insufficient security clearance. Please complete security training.',
  'template-security-001',
  { ipAddress: admin.ipAddress, userAgent: admin.userAgent }
)
console.log('Decline audit entry:', JSON.stringify(declineEntry, null, 2))
console.log()

// 3. Create renewal audit entry
console.log('3. Creating renewal audit entry...')
const renewalEntry = createRenewalAuditEntry(
  mockCurrentAccess,
  admin.id,
  admin.name,
  admin.email,
  { ipAddress: admin.ipAddress, userAgent: admin.userAgent }
)
console.log('Renewal audit entry:', JSON.stringify(renewalEntry, null, 2))
console.log()

// 4. Create bulk renewal audit entries
console.log('4. Creating bulk renewal audit entries...')
const accessList = [
  mockCurrentAccess,
  { ...mockCurrentAccess, id: 'access-002', userName: 'Carol Davis', userEmail: 'carol.davis@company.com' }
]
const bulkRenewalEntries = createBulkRenewalAuditEntry(
  accessList,
  admin.id,
  admin.name,
  admin.email,
  { ipAddress: admin.ipAddress, userAgent: admin.userAgent }
)
console.log(`Created ${bulkRenewalEntries.length} bulk renewal entries:`)
bulkRenewalEntries.forEach((entry, index) => {
  console.log(`Entry ${index + 1}:`, JSON.stringify(entry, null, 2))
})
console.log()

// 5. Create scheduled revocation audit entry
console.log('5. Creating scheduled revocation audit entry...')
const revocationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
const scheduledRevocationEntry = createScheduledRevocationAuditEntry(
  mockCurrentAccess,
  admin.id,
  admin.name,
  admin.email,
  revocationDate,
  { ipAddress: admin.ipAddress, userAgent: admin.userAgent }
)
console.log('Scheduled revocation audit entry:', JSON.stringify(scheduledRevocationEntry, null, 2))
console.log()

// 6. Create force revocation audit entry
console.log('6. Creating force revocation audit entry...')
const forceRevocationEntry = createForceRevocationAuditEntry(
  mockCurrentAccess,
  admin.id,
  admin.name,
  admin.email,
  'Immediate revocation due to security policy violation',
  { ipAddress: admin.ipAddress, userAgent: admin.userAgent }
)
console.log('Force revocation audit entry:', JSON.stringify(forceRevocationEntry, null, 2))
console.log()

// 7. Demonstrate filtering and sorting
console.log('7. Demonstrating filtering and sorting...')
const allEntries = [
  approvalEntry,
  declineEntry,
  renewalEntry,
  ...bulkRenewalEntries,
  scheduledRevocationEntry,
  forceRevocationEntry
]

console.log(`Total audit entries: ${allEntries.length}`)

// Filter by action type
const approvalEntries = filterAuditEntries(allEntries, { actions: ['approve'] })
console.log(`Approval entries: ${approvalEntries.length}`)

// Filter by administrator
const adminEntries = filterAuditEntries(allEntries, { administratorIds: [admin.id] })
console.log(`Entries by current admin: ${adminEntries.length}`)

// Sort entries (newest first)
const sortedEntries = sortAuditEntries(allEntries, 'desc')
console.log('Entries sorted by timestamp (newest first):')
sortedEntries.slice(0, 3).forEach((entry, index) => {
  console.log(`${index + 1}. ${entry.action} - ${entry.timestamp}`)
})
console.log()

// 8. Generate audit summary
console.log('8. Generating audit summary...')
const summary = generateAuditSummary(allEntries)
console.log('Audit summary:', JSON.stringify(summary, null, 2))
console.log()

// 9. Create audit report
console.log('9. Creating audit report...')
const filters: AuditReportFilters = {
  dateRange: {
    from: '2024-02-01T00:00:00Z',
    to: '2024-02-28T23:59:59Z'
  }
}
const report = createAuditReport(
  allEntries,
  filters,
  `${admin.name} (${admin.email})`,
  'February 2024 Access Management Audit Report',
  'json'
)
console.log('Audit report created:', {
  id: report.id,
  title: report.title,
  totalEntries: report.entries.length,
  dateRange: report.dateRange,
  exportFormat: report.exportFormat
})
console.log()

// 10. Export to CSV
console.log('10. Exporting audit report to CSV...')
const csvContent = exportAuditReportToCSV(report)
console.log('CSV export preview (first 200 characters):')
console.log(csvContent.substring(0, 200) + '...')
console.log(`Full CSV length: ${csvContent.length} characters`)
console.log()

// 11. Format entries for display
console.log('11. Formatting entries for display...')
console.log('Formatted audit entries:')
allEntries.slice(0, 3).forEach((entry, index) => {
  const formatted = formatAuditEntryForDisplay(entry)
  console.log(`\nEntry ${index + 1}:`)
  console.log(`  Timestamp: ${formatted.timestamp}`)
  console.log(`  Action: ${formatted.action}`)
  console.log(`  Description: ${formatted.description}`)
  console.log(`  Administrator: ${formatted.administrator}`)
  console.log(`  Target: ${formatted.target}`)
  console.log(`  Product: ${formatted.product}`)
})
console.log()

// 12. Demonstrate date range filtering
console.log('12. Demonstrating date range filtering...')
const todayFilters: AuditReportFilters = {
  dateRange: {
    from: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
    to: new Date().toISOString().split('T')[0] + 'T23:59:59Z'
  }
}
const todayEntries = filterAuditEntries(allEntries, todayFilters)
console.log(`Entries from today: ${todayEntries.length}`)

// 13. Demonstrate action-specific filtering
console.log('13. Demonstrating action-specific filtering...')
const revocationActions = filterAuditEntries(allEntries, { 
  actions: ['schedule_revocation', 'force_revoke'] 
})
console.log(`Revocation-related entries: ${revocationActions.length}`)
revocationActions.forEach(entry => {
  const formatted = formatAuditEntryForDisplay(entry)
  console.log(`  - ${formatted.action}: ${formatted.description}`)
})
console.log()

console.log('=== Demo Complete ===')
console.log('This demo showed how to:')
console.log('- Create audit entries for all admin actions')
console.log('- Filter and sort audit entries')
console.log('- Generate audit summaries and reports')
console.log('- Export audit data to CSV format')
console.log('- Format entries for user-friendly display')
console.log('- Apply various filtering criteria')