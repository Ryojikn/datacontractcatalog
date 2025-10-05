import { describe, it, expect, beforeEach } from 'vitest'
import {
  generateExpirationReminders,
  generateRevocationNotices,
  getDueNotifications,
  groupNotificationsByType,
  processDueNotifications,
  markNotificationsAsSent,
  cleanupOldNotifications,
  getNotificationStats,
  validateSchedulerConfig,
  defaultSchedulerConfig,
  type ScheduledNotification,
  type NotificationSchedulerConfig
} from '../notificationScheduler'
import type { CurrentAccess, AccessRevocationNotice } from '@/types'

describe('notificationScheduler', () => {
  let mockCurrentAccess: CurrentAccess[]
  let mockRevocationNotices: AccessRevocationNotice[]
  let mockScheduledNotifications: ScheduledNotification[]

  beforeEach(() => {
    const now = new Date()
    const futureDate30 = new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000) // 35 days to ensure all reminders are in future
    const futureDate7 = new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000) // 35 days to ensure all reminders are in future

    mockCurrentAccess = [
      {
        id: 'access-1',
        userId: 'user-1',
        userName: 'John Doe',
        userEmail: 'john@example.com',
        productId: 'product-1',
        productName: 'Test Product 1',
        grantedAt: '2024-01-01T00:00:00Z',
        expiresAt: futureDate30.toISOString(),
        grantedBy: 'admin-1',
        accessLevel: 'read',
        status: 'active'
      },
      {
        id: 'access-2',
        userId: 'user-2',
        userName: 'Jane Smith',
        userEmail: 'jane@example.com',
        productId: 'product-2',
        productName: 'Test Product 2',
        grantedAt: '2024-01-01T00:00:00Z',
        expiresAt: futureDate7.toISOString(),
        grantedBy: 'admin-1',
        accessLevel: 'write',
        status: 'expiring_soon'
      }
    ]

    mockRevocationNotices = [
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

    mockScheduledNotifications = [
      {
        id: 'scheduled-1',
        accessId: 'access-1',
        userId: 'user-1',
        userName: 'John Doe',
        userEmail: 'john@example.com',
        productId: 'product-1',
        productName: 'Test Product 1',
        notificationType: 'expiration_reminder',
        scheduledDate: new Date(now.getTime() - 1000).toISOString(), // 1 second ago (due)
        targetDate: futureDate30.toISOString(),
        daysBeforeTarget: 30,
        sent: false,
        createdAt: now.toISOString()
      },
      {
        id: 'scheduled-2',
        accessId: 'access-2',
        userId: 'user-2',
        userName: 'Jane Smith',
        userEmail: 'jane@example.com',
        productId: 'product-2',
        productName: 'Test Product 2',
        notificationType: 'expiration_reminder',
        scheduledDate: new Date(now.getTime() + 60000).toISOString(), // 1 minute from now (not due)
        targetDate: futureDate7.toISOString(),
        daysBeforeTarget: 7,
        sent: false,
        createdAt: now.toISOString()
      }
    ]
  })

  describe('generateExpirationReminders', () => {
    it('should generate expiration reminders for active access', () => {
      const reminders = generateExpirationReminders(mockCurrentAccess)
      
      expect(reminders.length).toBeGreaterThan(0)
      
      // Should generate reminders for each access and each reminder day
      const access1Reminders = reminders.filter(r => r.accessId === 'access-1')
      const access2Reminders = reminders.filter(r => r.accessId === 'access-2')
      
      expect(access1Reminders.length).toBe(defaultSchedulerConfig.expirationReminderDays.length)
      expect(access2Reminders.length).toBe(defaultSchedulerConfig.expirationReminderDays.length)
      
      // Check reminder structure
      const reminder = reminders[0]
      expect(reminder.notificationType).toBe('expiration_reminder')
      expect(reminder.userId).toBeDefined()
      expect(reminder.userName).toBeDefined()
      expect(reminder.productName).toBeDefined()
      expect(reminder.sent).toBe(false)
    })

    it('should skip access scheduled for revocation', () => {
      const accessWithRevocation: CurrentAccess[] = [
        {
          ...mockCurrentAccess[0],
          status: 'scheduled_for_revocation'
        }
      ]
      
      const reminders = generateExpirationReminders(accessWithRevocation)
      expect(reminders).toHaveLength(0)
    })

    it('should only generate future reminders', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Yesterday
      const accessWithPastExpiration: CurrentAccess[] = [
        {
          ...mockCurrentAccess[0],
          expiresAt: pastDate
        }
      ]
      
      const reminders = generateExpirationReminders(accessWithPastExpiration)
      expect(reminders).toHaveLength(0)
    })
  })

  describe('generateRevocationNotices', () => {
    it('should generate revocation notices', () => {
      const notices = generateRevocationNotices(mockRevocationNotices, mockCurrentAccess)
      
      expect(notices.length).toBeGreaterThan(0)
      
      // Should include initial notice and reminders
      const initialNotice = notices.find(n => n.notificationType === 'revocation_notice')
      const reminders = notices.filter(n => n.notificationType === 'revocation_reminder')
      
      expect(initialNotice).toBeDefined()
      expect(reminders.length).toBe(defaultSchedulerConfig.revocationReminderDays.length)
    })

    it('should skip already sent notices', () => {
      const sentNotices: AccessRevocationNotice[] = [
        {
          ...mockRevocationNotices[0],
          notificationSent: true
        }
      ]
      
      const notices = generateRevocationNotices(sentNotices, mockCurrentAccess)
      
      // Should only have reminder notices, not the initial notice
      const initialNotice = notices.find(n => n.notificationType === 'revocation_notice')
      expect(initialNotice).toBeUndefined()
    })
  })

  describe('getDueNotifications', () => {
    it('should return only due notifications', () => {
      const dueNotifications = getDueNotifications(mockScheduledNotifications)
      
      expect(dueNotifications).toHaveLength(1)
      expect(dueNotifications[0].id).toBe('scheduled-1')
    })

    it('should exclude sent notifications', () => {
      const notificationsWithSent = [
        ...mockScheduledNotifications,
        {
          ...mockScheduledNotifications[0],
          id: 'scheduled-3',
          sent: true,
          scheduledDate: new Date(Date.now() - 1000).toISOString()
        }
      ]
      
      const dueNotifications = getDueNotifications(notificationsWithSent)
      expect(dueNotifications).toHaveLength(1) // Still only the original due notification
    })
  })

  describe('groupNotificationsByType', () => {
    it('should group notifications by type', () => {
      const grouped = groupNotificationsByType(mockScheduledNotifications)
      
      expect(grouped.expiration_reminder).toHaveLength(2)
      expect(grouped.revocation_notice).toBeUndefined()
    })
  })

  describe('processDueNotifications', () => {
    it('should process due notifications and return batch requests', () => {
      const result = processDueNotifications(mockScheduledNotifications)
      
      expect(result.expirationReminders).toHaveLength(1)
      expect(result.revocationNotices).toHaveLength(0)
      expect(result.processedNotificationIds).toHaveLength(1)
      expect(result.processedNotificationIds[0]).toBe('scheduled-1')
      
      const reminder = result.expirationReminders[0]
      expect(reminder.userName).toBe('John Doe')
      expect(reminder.productName).toBe('Test Product 1')
    })
  })

  describe('markNotificationsAsSent', () => {
    it('should mark specified notifications as sent', () => {
      const updatedNotifications = markNotificationsAsSent(
        mockScheduledNotifications,
        ['scheduled-1']
      )
      
      const sentNotification = updatedNotifications.find(n => n.id === 'scheduled-1')
      const unsentNotification = updatedNotifications.find(n => n.id === 'scheduled-2')
      
      expect(sentNotification?.sent).toBe(true)
      expect(sentNotification?.sentAt).toBeDefined()
      expect(unsentNotification?.sent).toBe(false)
    })
  })

  describe('cleanupOldNotifications', () => {
    it('should remove old sent notifications', () => {
      const oldDate = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) // 100 days ago
      const oldNotifications = [
        {
          ...mockScheduledNotifications[0],
          sent: true,
          sentAt: oldDate.toISOString()
        },
        ...mockScheduledNotifications.slice(1)
      ]
      
      const cleanedNotifications = cleanupOldNotifications(oldNotifications, 90)
      
      expect(cleanedNotifications).toHaveLength(1) // Only the unsent notification remains
      expect(cleanedNotifications[0].id).toBe('scheduled-2')
    })

    it('should keep unsent notifications regardless of age', () => {
      const oldDate = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000)
      const oldNotifications = [
        {
          ...mockScheduledNotifications[0],
          sent: false,
          createdAt: oldDate.toISOString()
        }
      ]
      
      const cleanedNotifications = cleanupOldNotifications(oldNotifications, 90)
      expect(cleanedNotifications).toHaveLength(1)
    })
  })

  describe('getNotificationStats', () => {
    it('should calculate notification statistics', () => {
      const notificationsWithMixed = [
        ...mockScheduledNotifications,
        {
          ...mockScheduledNotifications[0],
          id: 'scheduled-3',
          sent: true,
          sentAt: new Date().toISOString()
        },
        {
          ...mockScheduledNotifications[0],
          id: 'scheduled-4',
          scheduledDate: new Date(Date.now() - 1000).toISOString(), // Overdue
          sent: false
        }
      ]
      
      const stats = getNotificationStats(notificationsWithMixed)
      
      expect(stats.total).toBe(4)
      expect(stats.sent).toBe(1)
      expect(stats.pending).toBe(1) // scheduled-2 is pending (future)
      expect(stats.overdue).toBe(2) // scheduled-1 and scheduled-4 are overdue
      expect(stats.byType.expiration_reminder.total).toBe(4)
    })
  })

  describe('validateSchedulerConfig', () => {
    it('should validate valid configuration', () => {
      const result = validateSchedulerConfig(defaultSchedulerConfig)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect invalid configuration', () => {
      const invalidConfig: NotificationSchedulerConfig = {
        expirationReminderDays: [], // Empty array
        revocationReminderDays: [0], // Invalid day value
        enableBatchProcessing: 'true' as any, // Wrong type
        maxBatchSize: -1 // Invalid value
      }
      
      const result = validateSchedulerConfig(invalidConfig)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should detect out-of-range reminder days', () => {
      const invalidConfig: NotificationSchedulerConfig = {
        expirationReminderDays: [400], // Too high
        revocationReminderDays: [50], // Too high for revocation
        enableBatchProcessing: true,
        maxBatchSize: 50
      }
      
      const result = validateSchedulerConfig(invalidConfig)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('365'))).toBe(true)
      expect(result.errors.some(e => e.includes('30'))).toBe(true)
    })
  })
})