/**
 * Notification scheduler for access management
 * Handles automatic scheduling and processing of access-related notifications
 */

import type { CurrentAccess, AccessRevocationNotice } from '@/types'
import { calculateDaysUntil } from './notificationTemplates'

export interface ScheduledNotification {
  id: string;
  accessId: string;
  userId: string;
  userName: string;
  userEmail: string;
  productId: string;
  productName: string;
  notificationType: 'expiration_reminder' | 'revocation_notice' | 'revocation_reminder';
  scheduledDate: string;
  targetDate: string; // expiration or revocation date
  daysBeforeTarget: number;
  sent: boolean;
  createdAt: string;
  sentAt?: string;
}

export interface NotificationSchedulerConfig {
  expirationReminderDays: number[]; // Days before expiration to send reminders (e.g., [30, 7, 1])
  revocationReminderDays: number[]; // Days before revocation to send reminders (e.g., [7, 1])
  enableBatchProcessing: boolean;
  maxBatchSize: number;
}

export const defaultSchedulerConfig: NotificationSchedulerConfig = {
  expirationReminderDays: [30, 7, 1],
  revocationReminderDays: [7, 1],
  enableBatchProcessing: true,
  maxBatchSize: 50
}

/**
 * Generate scheduled notifications for access expiration reminders
 */
export function generateExpirationReminders(
  currentAccess: CurrentAccess[],
  config: NotificationSchedulerConfig = defaultSchedulerConfig
): ScheduledNotification[] {
  const scheduledNotifications: ScheduledNotification[] = []
  
  currentAccess.forEach(access => {
    // Skip if access is already scheduled for revocation
    if (access.status === 'scheduled_for_revocation') {
      return
    }
    
    config.expirationReminderDays.forEach(daysBefore => {
      const expirationDate = new Date(access.expiresAt)
      const reminderDate = new Date(expirationDate.getTime() - (daysBefore * 24 * 60 * 60 * 1000))
      
      // Only schedule future reminders
      if (reminderDate.getTime() > Date.now()) {
        scheduledNotifications.push({
          id: `exp-reminder-${access.id}-${daysBefore}d`,
          accessId: access.id,
          userId: access.userId,
          userName: access.userName,
          userEmail: access.userEmail,
          productId: access.productId,
          productName: access.productName,
          notificationType: 'expiration_reminder',
          scheduledDate: reminderDate.toISOString(),
          targetDate: access.expiresAt,
          daysBeforeTarget: daysBefore,
          sent: false,
          createdAt: new Date().toISOString()
        })
      }
    })
  })
  
  return scheduledNotifications
}

/**
 * Generate scheduled notifications for access revocation notices
 */
export function generateRevocationNotices(
  revocationNotices: AccessRevocationNotice[],
  currentAccess: CurrentAccess[],
  config: NotificationSchedulerConfig = defaultSchedulerConfig
): ScheduledNotification[] {
  const scheduledNotifications: ScheduledNotification[] = []
  
  revocationNotices.forEach(notice => {
    const access = currentAccess.find(a => a.id === notice.accessId)
    if (!access) return
    
    // Initial revocation notice (30 days before)
    if (!notice.notificationSent) {
      scheduledNotifications.push({
        id: `rev-notice-${notice.id}`,
        accessId: notice.accessId,
        userId: notice.userId,
        userName: access.userName,
        userEmail: access.userEmail,
        productId: access.productId,
        productName: access.productName,
        notificationType: 'revocation_notice',
        scheduledDate: notice.notificationDate,
        targetDate: notice.scheduledRevocationDate,
        daysBeforeTarget: 30,
        sent: notice.notificationSent,
        createdAt: notice.createdAt
      })
    }
    
    // Additional reminders before revocation
    config.revocationReminderDays.forEach(daysBefore => {
      const revocationDate = new Date(notice.scheduledRevocationDate)
      const reminderDate = new Date(revocationDate.getTime() - (daysBefore * 24 * 60 * 60 * 1000))
      
      // Only schedule future reminders
      if (reminderDate.getTime() > Date.now()) {
        scheduledNotifications.push({
          id: `rev-reminder-${notice.id}-${daysBefore}d`,
          accessId: notice.accessId,
          userId: notice.userId,
          userName: access.userName,
          userEmail: access.userEmail,
          productId: access.productId,
          productName: access.productName,
          notificationType: 'revocation_reminder',
          scheduledDate: reminderDate.toISOString(),
          targetDate: notice.scheduledRevocationDate,
          daysBeforeTarget: daysBefore,
          sent: false,
          createdAt: new Date().toISOString()
        })
      }
    })
  })
  
  return scheduledNotifications
}

/**
 * Get notifications that are due to be sent
 */
export function getDueNotifications(
  scheduledNotifications: ScheduledNotification[],
  currentTime: Date = new Date()
): ScheduledNotification[] {
  return scheduledNotifications.filter(notification => 
    !notification.sent && 
    new Date(notification.scheduledDate).getTime() <= currentTime.getTime()
  )
}

/**
 * Group notifications by type for batch processing
 */
export function groupNotificationsByType(
  notifications: ScheduledNotification[]
): Record<string, ScheduledNotification[]> {
  return notifications.reduce((groups, notification) => {
    const key = notification.notificationType
    if (!groups[key]) groups[key] = []
    groups[key].push(notification)
    return groups
  }, {} as Record<string, ScheduledNotification[]>)
}

/**
 * Process due notifications and return batch requests
 */
export function processDueNotifications(
  scheduledNotifications: ScheduledNotification[],
  _config: NotificationSchedulerConfig = defaultSchedulerConfig
): {
  expirationReminders: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    productId: string;
    productName: string;
    expirationDate: string;
    daysUntilExpiration: number;
  }>;
  revocationNotices: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    productId: string;
    productName: string;
    revocationDate: string;
  }>;
  processedNotificationIds: string[];
} {
  const dueNotifications = getDueNotifications(scheduledNotifications)
  const groupedNotifications = groupNotificationsByType(dueNotifications)
  
  const expirationReminders = [
    ...(groupedNotifications.expiration_reminder || [])
  ].map(notification => ({
    userId: notification.userId,
    userName: notification.userName,
    userEmail: notification.userEmail,
    productId: notification.productId,
    productName: notification.productName,
    expirationDate: notification.targetDate,
    daysUntilExpiration: calculateDaysUntil(notification.targetDate)
  }))
  
  const revocationNotices = [
    ...(groupedNotifications.revocation_notice || []),
    ...(groupedNotifications.revocation_reminder || [])
  ].map(notification => ({
    userId: notification.userId,
    userName: notification.userName,
    userEmail: notification.userEmail,
    productId: notification.productId,
    productName: notification.productName,
    revocationDate: notification.targetDate
  }))
  
  const processedNotificationIds = dueNotifications.map(n => n.id)
  
  return {
    expirationReminders,
    revocationNotices,
    processedNotificationIds
  }
}

/**
 * Mark notifications as sent
 */
export function markNotificationsAsSent(
  scheduledNotifications: ScheduledNotification[],
  notificationIds: string[],
  sentAt: Date = new Date()
): ScheduledNotification[] {
  return scheduledNotifications.map(notification => 
    notificationIds.includes(notification.id)
      ? { ...notification, sent: true, sentAt: sentAt.toISOString() }
      : notification
  )
}

/**
 * Clean up old sent notifications (older than specified days)
 */
export function cleanupOldNotifications(
  scheduledNotifications: ScheduledNotification[],
  retentionDays: number = 90
): ScheduledNotification[] {
  const cutoffDate = new Date(Date.now() - (retentionDays * 24 * 60 * 60 * 1000))
  
  return scheduledNotifications.filter(notification => {
    if (!notification.sent) return true // Keep unsent notifications
    
    const sentDate = notification.sentAt ? new Date(notification.sentAt) : new Date(notification.createdAt)
    return sentDate.getTime() > cutoffDate.getTime()
  })
}

/**
 * Get notification statistics
 */
export function getNotificationStats(
  scheduledNotifications: ScheduledNotification[]
): {
  total: number;
  sent: number;
  pending: number;
  overdue: number;
  byType: Record<string, { total: number; sent: number; pending: number }>;
} {
  const now = new Date()
  const stats = {
    total: scheduledNotifications.length,
    sent: 0,
    pending: 0,
    overdue: 0,
    byType: {} as Record<string, { total: number; sent: number; pending: number }>
  }
  
  scheduledNotifications.forEach(notification => {
    const scheduledDate = new Date(notification.scheduledDate)
    const isOverdue = !notification.sent && scheduledDate.getTime() < now.getTime()
    
    if (notification.sent) {
      stats.sent++
    } else if (isOverdue) {
      stats.overdue++
    } else {
      stats.pending++
    }
    
    // By type stats
    const type = notification.notificationType
    if (!stats.byType[type]) {
      stats.byType[type] = { total: 0, sent: 0, pending: 0 }
    }
    
    stats.byType[type].total++
    if (notification.sent) {
      stats.byType[type].sent++
    } else {
      stats.byType[type].pending++
    }
  })
  
  return stats
}

/**
 * Validate notification configuration
 */
export function validateSchedulerConfig(config: NotificationSchedulerConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = []
  
  if (!Array.isArray(config.expirationReminderDays) || config.expirationReminderDays.length === 0) {
    errors.push('expirationReminderDays must be a non-empty array')
  }
  
  if (!Array.isArray(config.revocationReminderDays) || config.revocationReminderDays.length === 0) {
    errors.push('revocationReminderDays must be a non-empty array')
  }
  
  if (typeof config.enableBatchProcessing !== 'boolean') {
    errors.push('enableBatchProcessing must be a boolean')
  }
  
  if (typeof config.maxBatchSize !== 'number' || config.maxBatchSize <= 0) {
    errors.push('maxBatchSize must be a positive number')
  }
  
  // Check for reasonable reminder days
  if (config.expirationReminderDays.some(days => days <= 0 || days > 365)) {
    errors.push('expirationReminderDays must contain values between 1 and 365')
  }
  
  if (config.revocationReminderDays.some(days => days <= 0 || days > 30)) {
    errors.push('revocationReminderDays must contain values between 1 and 30')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}