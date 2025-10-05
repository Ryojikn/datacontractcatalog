/**
 * Demo file showing how the notification system for access revocations works
 * This demonstrates the complete workflow from scheduling to processing notifications
 */

import { 
  generateExpirationReminders,
  generateRevocationNotices,
  processDueNotifications,
  markNotificationsAsSent,
  getNotificationStats,
  type ScheduledNotification
} from '../notificationScheduler'
import {
  getExpirationTemplate,
  getRevocationTemplate,
  populateNotificationTemplate,
  formatNotificationDate,
  processBatchNotifications,
  type BatchNotificationRequest
} from '../notificationTemplates'
import type { CurrentAccess, AccessRevocationNotice } from '@/types'

// Demo: Complete notification workflow
export function demoNotificationWorkflow() {
  console.log('🔔 Access Management Notification System Demo')
  console.log('=' .repeat(50))

  // Sample data
  const now = new Date()
  const futureDate30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const futureDate7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const futureDate1 = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)

  const currentAccess: CurrentAccess[] = [
    {
      id: 'access-1',
      userId: 'user-1',
      userName: 'Alice Johnson',
      userEmail: 'alice@company.com',
      productId: 'product-1',
      productName: 'Customer Analytics Dashboard',
      grantedAt: '2024-01-01T00:00:00Z',
      expiresAt: futureDate30.toISOString(),
      grantedBy: 'admin-1',
      accessLevel: 'read',
      status: 'active'
    },
    {
      id: 'access-2',
      userId: 'user-2',
      userName: 'Bob Smith',
      userEmail: 'bob@company.com',
      productId: 'product-2',
      productName: 'Financial Risk Model',
      grantedAt: '2024-01-01T00:00:00Z',
      expiresAt: futureDate7.toISOString(),
      grantedBy: 'admin-1',
      accessLevel: 'write',
      status: 'expiring_soon'
    },
    {
      id: 'access-3',
      userId: 'user-3',
      userName: 'Carol Davis',
      userEmail: 'carol@company.com',
      productId: 'product-3',
      productName: 'Credit Scoring Engine',
      grantedAt: '2024-01-01T00:00:00Z',
      expiresAt: futureDate1.toISOString(),
      grantedBy: 'admin-1',
      accessLevel: 'admin',
      status: 'expiring_soon'
    }
  ]

  const revocationNotices: AccessRevocationNotice[] = [
    {
      id: 'notice-1',
      accessId: 'access-1',
      userId: 'user-1',
      scheduledRevocationDate: futureDate30.toISOString(),
      notificationDate: now.toISOString(),
      notificationSent: false,
      remindersSent: 0,
      createdAt: now.toISOString()
    }
  ]

  console.log('\n📊 Sample Data:')
  console.log(`- ${currentAccess.length} active access permissions`)
  console.log(`- ${revocationNotices.length} scheduled revocations`)

  // Step 1: Generate expiration reminders
  console.log('\n🔄 Step 1: Generating expiration reminders...')
  const expirationReminders = generateExpirationReminders(currentAccess)
  console.log(`Generated ${expirationReminders.length} expiration reminder notifications`)
  
  expirationReminders.slice(0, 3).forEach(reminder => {
    console.log(`  - ${reminder.userName}: ${reminder.productName} (${reminder.daysBeforeTarget} days before)`)
  })

  // Step 2: Generate revocation notices
  console.log('\n🔄 Step 2: Generating revocation notices...')
  const revocationNotifications = generateRevocationNotices(revocationNotices, currentAccess)
  console.log(`Generated ${revocationNotifications.length} revocation notifications`)
  
  revocationNotifications.slice(0, 3).forEach(notice => {
    console.log(`  - ${notice.userName}: ${notice.productName} (${notice.notificationType})`)
  })

  // Step 3: Combine all scheduled notifications
  const allScheduledNotifications: ScheduledNotification[] = [
    ...expirationReminders,
    ...revocationNotifications
  ]

  console.log(`\n📋 Total scheduled notifications: ${allScheduledNotifications.length}`)

  // Step 4: Process due notifications (simulate some being due)
  console.log('\n🔄 Step 3: Processing due notifications...')
  
  // Make some notifications due by setting their scheduled date to the past
  const notificationsWithDue = allScheduledNotifications.map((notification, index) => 
    index < 3 ? {
      ...notification,
      scheduledDate: new Date(now.getTime() - 1000).toISOString() // 1 second ago
    } : notification
  )

  const { expirationReminders: dueExpirationReminders, revocationNotices: dueRevocationNotices, processedNotificationIds } = 
    processDueNotifications(notificationsWithDue)

  console.log(`Found ${processedNotificationIds.length} due notifications:`)
  console.log(`  - ${dueExpirationReminders.length} expiration reminders`)
  console.log(`  - ${dueRevocationNotices.length} revocation notices`)

  // Step 5: Show notification templates in action
  console.log('\n📝 Step 4: Notification templates in action...')
  
  // Example: 30-day expiration reminder
  const template30Day = getExpirationTemplate(30)
  if (template30Day) {
    const populated = populateNotificationTemplate(template30Day, {
      productName: 'Customer Analytics Dashboard',
      expirationDate: formatNotificationDate(futureDate30.toISOString())
    })
    console.log('\n30-day expiration reminder:')
    console.log(`Title: ${populated.title}`)
    console.log(`Message: ${populated.message}`)
  }

  // Example: 7-day revocation warning
  const template7DayRevocation = getRevocationTemplate(7)
  if (template7DayRevocation) {
    const populated = populateNotificationTemplate(template7DayRevocation, {
      productName: 'Financial Risk Model',
      revocationDate: formatNotificationDate(futureDate7.toISOString())
    })
    console.log('\n7-day revocation warning:')
    console.log(`Title: ${populated.title}`)
    console.log(`Message: ${populated.message}`)
  }

  // Step 6: Batch processing demo
  console.log('\n🔄 Step 5: Batch processing demo...')
  
  const batchRequests: BatchNotificationRequest[] = [
    {
      userId: 'user-1',
      userName: 'Alice Johnson',
      userEmail: 'alice@company.com',
      productId: 'product-1',
      productName: 'Customer Analytics Dashboard',
      targetDate: futureDate30.toISOString(),
      notificationType: 'expiration',
      daysUntilTarget: 30
    },
    {
      userId: 'user-2',
      userName: 'Bob Smith',
      userEmail: 'bob@company.com',
      productId: 'product-2',
      productName: 'Financial Risk Model',
      targetDate: futureDate7.toISOString(),
      notificationType: 'revocation',
      daysUntilTarget: 7
    }
  ]

  const batchResults = processBatchNotifications(batchRequests)
  console.log(`Processed ${batchResults.length} notifications in batch:`)
  batchResults.forEach(result => {
    console.log(`  - ${result.userName}: ${result.title} (${result.urgencyLevel} priority)`)
  })

  // Step 7: Mark notifications as sent and show statistics
  console.log('\n📊 Step 6: Notification statistics...')
  
  const updatedNotifications = markNotificationsAsSent(notificationsWithDue, processedNotificationIds)
  const stats = getNotificationStats(updatedNotifications)
  
  console.log(`Statistics:`)
  console.log(`  - Total: ${stats.total}`)
  console.log(`  - Sent: ${stats.sent}`)
  console.log(`  - Pending: ${stats.pending}`)
  console.log(`  - Overdue: ${stats.overdue}`)
  
  console.log('\nBy type:')
  Object.entries(stats.byType).forEach(([type, typeStats]) => {
    console.log(`  - ${type}: ${typeStats.total} total (${typeStats.sent} sent, ${typeStats.pending} pending)`)
  })

  console.log('\n✅ Demo completed successfully!')
  console.log('=' .repeat(50))

  return {
    scheduledNotifications: allScheduledNotifications,
    dueNotifications: processedNotificationIds.length,
    batchResults,
    stats
  }
}

// Demo: Template system
export function demoTemplateSystem() {
  console.log('\n📝 Notification Template System Demo')
  console.log('=' .repeat(40))

  const scenarios = [
    { days: 30, type: 'expiration' as const, productName: 'Customer Data Warehouse' },
    { days: 7, type: 'expiration' as const, productName: 'Risk Assessment Model' },
    { days: 1, type: 'expiration' as const, productName: 'Credit Scoring Engine' },
    { days: 30, type: 'revocation' as const, productName: 'Financial Analytics' },
    { days: 7, type: 'revocation' as const, productName: 'Transaction Monitor' },
    { days: 1, type: 'revocation' as const, productName: 'Fraud Detection System' }
  ]

  scenarios.forEach(scenario => {
    const template = scenario.type === 'expiration' 
      ? getExpirationTemplate(scenario.days)
      : getRevocationTemplate(scenario.days)

    if (template) {
      const targetDate = new Date(Date.now() + scenario.days * 24 * 60 * 60 * 1000)
      const populated = populateNotificationTemplate(template, {
        productName: scenario.productName,
        expirationDate: formatNotificationDate(targetDate.toISOString()),
        revocationDate: formatNotificationDate(targetDate.toISOString())
      })

      console.log(`\n${scenario.type.toUpperCase()} - ${scenario.days} day(s):`)
      console.log(`📋 ${populated.title}`)
      console.log(`💬 ${populated.message}`)
      console.log(`⚠️  Urgency: ${template.urgencyLevel}`)
    }
  })

  console.log('\n✅ Template demo completed!')
}

// Run demos if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demoNotificationWorkflow()
  demoTemplateSystem()
}