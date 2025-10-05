import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Notification } from '@/types'
import { 
  getExpirationTemplate, 
  getRevocationTemplate, 
  getNotificationTemplate,
  populateNotificationTemplate,
  formatNotificationDate,
  calculateDaysUntil,
  processBatchNotifications,
  type BatchNotificationRequest
} from '@/lib/notificationTemplates'
// import { toast } from '@/hooks/use-toast' // Temporarily disabled

interface NotificationStore {
  notifications: Notification[]
  isOpen: boolean
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  addAccessApprovedNotification: (productName: string, productId?: string) => void
  addAccessRejectedNotification: (productName: string, reason?: string, productId?: string) => void
  addAccessPendingNotification: (productName: string, productId?: string) => void
  addSystemNotification: (title: string, message: string) => void
  addAccessApprovedWithToast: (productName: string, productId?: string) => void
  addAccessRejectedWithToast: (productName: string, reason?: string, productId?: string) => void
  
  // Access management notifications
  addAccessExpiringNotification: (userName: string, productName: string, expirationDate: string, productId?: string) => void
  addAccessRevocationScheduledNotification: (userName: string, productName: string, revocationDate: string, productId?: string) => void
  addAccessRevocationImminentNotification: (userName: string, productName: string, revocationDate: string, productId?: string) => void
  addAccessRenewedNotification: (userName: string, productName: string, newExpirationDate: string, productId?: string) => void
  addAccessForceRevokedNotification: (userName: string, productName: string, reason?: string, productId?: string) => void
  
  // Batch notification processing
  scheduleRevocationNotices: (accessList: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    productId: string;
    productName: string;
    revocationDate: string;
  }>) => void
  processExpirationReminders: (accessList: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    productId: string;
    productName: string;
    expirationDate: string;
    daysUntilExpiration: number;
  }>) => void
  
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  removeNotification: (notificationId: string) => void
  clearAllNotifications: () => void
  getUnreadCount: () => number
  getUnreadNotifications: () => Notification[]
  openNotifications: () => void
  closeNotifications: () => void
  toggleNotifications: () => void
}

// Mock notification data for testing
const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'access_approved',
    title: 'Access Request Approved',
    message: 'Your access request for Credit Card Analytics has been approved by both access group and product owners.',
    productId: 'product-1',
    productName: 'Credit Card Analytics',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: 'notif-2',
    type: 'access_pending',
    title: 'Access Request Pending',
    message: 'Your access request for Loan Risk Model is pending approval from the product owner.',
    productId: 'product-2',
    productName: 'Loan Risk Model',
    read: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
  },
  {
    id: 'notif-3',
    type: 'access_rejected',
    title: 'Access Request Rejected',
    message: 'Your access request for Customer Segmentation was rejected. Insufficient business justification provided.',
    productId: 'product-3',
    productName: 'Customer Segmentation',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    id: 'notif-4',
    type: 'access_expiring_soon',
    title: 'Access Expiring Soon',
    message: 'Your access to Financial Risk Metrics will expire in 7 days on March 15, 2024. Please request renewal if you need continued access.',
    productId: 'product-5',
    productName: 'Financial Risk Metrics',
    read: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
  },
  {
    id: 'notif-5',
    type: 'access_revocation_scheduled',
    title: 'Access Revocation Scheduled',
    message: 'Your access to Customer Segmentation Data is scheduled for revocation on March 20, 2024. You have 30 days to complete your work or request renewal. Contact your administrator if you need to extend access.',
    productId: 'product-6',
    productName: 'Customer Segmentation Data',
    read: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
  },
  {
    id: 'notif-6',
    type: 'access_renewed',
    title: 'Access Renewed',
    message: '✅ Your access to Transaction Monitoring has been renewed and will now expire on February 10, 2025. You can continue using this data product.',
    productId: 'product-4',
    productName: 'Transaction Monitoring',
    read: true,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  {
    id: 'notif-7',
    type: 'access_revocation_imminent',
    title: 'Access Revocation Imminent',
    message: '⚠️ URGENT: Your access to Credit Risk Assessment will be revoked in 1 day on February 12, 2024. This is your final notice. Contact your administrator immediately if you need to extend access.',
    productId: 'product-7',
    productName: 'Credit Risk Assessment',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
  },
  {
    id: 'notif-8',
    type: 'system',
    title: 'Batch Revocation Notices Sent',
    message: 'Successfully sent revocation notices to 5 users. All affected users have been notified of their scheduled access revocation in 30 days.',
    read: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
  },
  {
    id: 'notif-9',
    type: 'system',
    title: 'Expiration Reminders Processed',
    message: 'Successfully processed 8 expiration reminder(s): 3 30-day reminder(s), 3 7-day reminder(s), 2 final notice(s).',
    read: true,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
  }
]

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: mockNotifications,
      isOpen: false,

      addNotification: (notificationData) => {
        const newNotification: Notification = {
          ...notificationData,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString()
        }

        set(state => ({
          notifications: [newNotification, ...state.notifications]
        }))
      },

      addAccessApprovedNotification: (productName: string, productId?: string) => {
        get().addNotification({
          type: 'access_approved',
          title: 'Access Request Approved',
          message: `Your access request for ${productName} has been approved by both access group and product owners.`,
          productId,
          productName,
          read: false
        })
      },

      addAccessRejectedNotification: (productName: string, reason?: string, productId?: string) => {
        get().addNotification({
          type: 'access_rejected',
          title: 'Access Request Rejected',
          message: `Your access request for ${productName} was rejected.${reason ? ` Reason: ${reason}` : ''}`,
          productId,
          productName,
          read: false
        })
      },

      addAccessPendingNotification: (productName: string, productId?: string) => {
        get().addNotification({
          type: 'access_pending',
          title: 'Access Request Pending',
          message: `Your access request for ${productName} is pending approval from the access group and product owners.`,
          productId,
          productName,
          read: false
        })
      },

      addSystemNotification: (title: string, message: string) => {
        get().addNotification({
          type: 'system',
          title,
          message,
          read: false
        })
      },

      addAccessApprovedWithToast: (productName: string, productId?: string) => {
        get().addAccessApprovedNotification(productName, productId)
        
        console.log(`Access Approved! 🎉 - Your access to ${productName} has been approved.`)
      },

      addAccessRejectedWithToast: (productName: string, reason?: string, productId?: string) => {
        get().addAccessRejectedNotification(productName, reason, productId)
        
        console.log(`Access Request Rejected - Your access request for ${productName} was rejected.`)
      },

      // Access management notifications
      addAccessExpiringNotification: (_userName: string, productName: string, expirationDate: string, productId?: string) => {
        const daysUntilExpiration = calculateDaysUntil(expirationDate)
        const template = getExpirationTemplate(daysUntilExpiration)
        
        if (template) {
          const { title, message } = populateNotificationTemplate(template, {
            productName,
            expirationDate: formatNotificationDate(expirationDate)
          })
          
          get().addNotification({
            type: 'access_expiring_soon',
            title,
            message,
            productId,
            productName,
            read: false
          })
        } else {
          // Fallback for edge cases
          get().addNotification({
            type: 'access_expiring_soon',
            title: 'Access Expiring Soon',
            message: `Your access to ${productName} will expire on ${formatNotificationDate(expirationDate)}. Please request renewal if you need continued access.`,
            productId,
            productName,
            read: false
          })
        }
      },

      addAccessRevocationScheduledNotification: (_userName: string, productName: string, revocationDate: string, productId?: string) => {
        const template = getNotificationTemplate('revocation-scheduled')
        
        if (template) {
          const { title, message } = populateNotificationTemplate(template, {
            productName,
            revocationDate: formatNotificationDate(revocationDate)
          })
          
          get().addNotification({
            type: 'access_revocation_scheduled',
            title,
            message,
            productId,
            productName,
            read: false
          })
        }
      },

      addAccessRevocationImminentNotification: (_userName: string, productName: string, revocationDate: string, productId?: string) => {
        const daysUntilRevocation = calculateDaysUntil(revocationDate)
        const template = getRevocationTemplate(daysUntilRevocation)
        
        if (template) {
          const { title, message } = populateNotificationTemplate(template, {
            productName,
            revocationDate: formatNotificationDate(revocationDate)
          })
          
          get().addNotification({
            type: 'access_revocation_imminent',
            title,
            message,
            productId,
            productName,
            read: false
          })
        }
      },

      addAccessRenewedNotification: (_userName: string, productName: string, newExpirationDate: string, productId?: string) => {
        const template = getNotificationTemplate('access-renewed')
        
        if (template) {
          const { title, message } = populateNotificationTemplate(template, {
            productName,
            newExpirationDate: formatNotificationDate(newExpirationDate)
          })
          
          get().addNotification({
            type: 'access_renewed',
            title,
            message,
            productId,
            productName,
            read: false
          })
        }
      },

      addAccessForceRevokedNotification: (_userName: string, productName: string, reason?: string, productId?: string) => {
        const templateId = reason?.toLowerCase().includes('security') 
          ? 'force-revoked-security'
          : reason?.toLowerCase().includes('policy')
          ? 'force-revoked-policy'
          : 'force-revoked-administrative'
        
        const template = getNotificationTemplate(templateId)
        
        if (template) {
          const { title, message } = populateNotificationTemplate(template, {
            productName,
            reason: reason ? ` Reason: ${reason}` : ''
          })
          
          get().addNotification({
            type: 'access_force_revoked',
            title,
            message,
            productId,
            productName,
            read: false
          })
        }
      },

      // Batch notification processing
      scheduleRevocationNotices: (accessList) => {
        const batchRequests: BatchNotificationRequest[] = accessList.map(access => ({
          userId: access.userId,
          userName: access.userName,
          userEmail: access.userEmail,
          productId: access.productId,
          productName: access.productName,
          targetDate: access.revocationDate,
          notificationType: 'revocation',
          daysUntilTarget: calculateDaysUntil(access.revocationDate)
        }))
        
        try {
          const processedNotifications = processBatchNotifications(batchRequests)
          
          // Add individual notifications
          processedNotifications.forEach(notification => {
            get().addNotification({
              type: notification.type,
              title: notification.title,
              message: notification.message,
              productId: notification.productId,
              productName: notification.productName,
              read: false
            })
          })
          
          // Add summary notification for administrators
          if (accessList.length > 1) {
            get().addSystemNotification(
              'Batch Revocation Notices Sent',
              `Successfully sent revocation notices to ${accessList.length} users. All affected users have been notified of their scheduled access revocation in 30 days.`
            )
          }
          
          console.log(`Scheduled ${accessList.length} revocation notice(s):`, accessList.map(a => `${a.userName} - ${a.productName}`))
        } catch (error) {
          console.error('Failed to process batch revocation notices:', error)
          
          // Fallback to individual processing
          accessList.forEach(access => {
            get().addAccessRevocationScheduledNotification(
              access.userName,
              access.productName,
              access.revocationDate,
              access.productId
            )
          })
        }
      },

      processExpirationReminders: (accessList) => {
        const remindersSent = {
          thirtyDay: 0,
          sevenDay: 0,
          oneDay: 0
        }
        
        // Group access by days until expiration for batch processing
        const groupedByDays = accessList.reduce((groups, access) => {
          const days = access.daysUntilExpiration
          if (!groups[days]) groups[days] = []
          groups[days].push(access)
          return groups
        }, {} as Record<number, typeof accessList>)
        
        // Process each group
        Object.entries(groupedByDays).forEach(([days, accessGroup]) => {
          const daysNum = parseInt(days)
          
          const batchRequests: BatchNotificationRequest[] = accessGroup.map(access => ({
            userId: access.userId,
            userName: access.userName,
            userEmail: access.userEmail,
            productId: access.productId,
            productName: access.productName,
            targetDate: access.expirationDate,
            notificationType: 'expiration',
            daysUntilTarget: daysNum
          }))
          
          try {
            const processedNotifications = processBatchNotifications(batchRequests)
            
            // Add individual notifications
            processedNotifications.forEach(notification => {
              get().addNotification({
                type: notification.type,
                title: notification.title,
                message: notification.message,
                productId: notification.productId,
                productName: notification.productName,
                read: false
              })
            })
            
            // Count reminders by type
            if (daysNum === 30) remindersSent.thirtyDay += accessGroup.length
            else if (daysNum === 7) remindersSent.sevenDay += accessGroup.length
            else if (daysNum === 1) remindersSent.oneDay += accessGroup.length
            
          } catch (error) {
            console.error(`Failed to process expiration reminders for ${daysNum} days:`, error)
            
            // Fallback to individual processing
            accessGroup.forEach(access => {
              if (daysNum === 1) {
                get().addAccessRevocationImminentNotification(
                  access.userName,
                  access.productName,
                  access.expirationDate,
                  access.productId
                )
              } else {
                get().addAccessExpiringNotification(
                  access.userName,
                  access.productName,
                  access.expirationDate,
                  access.productId
                )
              }
            })
          }
        })
        
        // Add summary notification for administrators
        const totalReminders = remindersSent.thirtyDay + remindersSent.sevenDay + remindersSent.oneDay
        if (totalReminders > 0) {
          const summaryParts = []
          if (remindersSent.thirtyDay > 0) summaryParts.push(`${remindersSent.thirtyDay} 30-day reminder(s)`)
          if (remindersSent.sevenDay > 0) summaryParts.push(`${remindersSent.sevenDay} 7-day reminder(s)`)
          if (remindersSent.oneDay > 0) summaryParts.push(`${remindersSent.oneDay} final notice(s)`)
          
          get().addSystemNotification(
            'Expiration Reminders Processed',
            `Successfully processed ${totalReminders} expiration reminder(s): ${summaryParts.join(', ')}.`
          )
        }
        
        console.log(`Processed ${totalReminders} expiration reminder(s):`, {
          thirtyDay: remindersSent.thirtyDay,
          sevenDay: remindersSent.sevenDay,
          oneDay: remindersSent.oneDay,
          accessList: accessList.map(a => `${a.userName} - ${a.productName} (${a.daysUntilExpiration} days)`)
        })
      },

      markAsRead: (notificationId: string) => {
        set(state => ({
          notifications: state.notifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        }))
      },

      markAllAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(notification => ({
            ...notification,
            read: true
          }))
        }))
      },

      removeNotification: (notificationId: string) => {
        set(state => ({
          notifications: state.notifications.filter(notification => 
            notification.id !== notificationId
          )
        }))
      },

      clearAllNotifications: () => {
        set({ notifications: [] })
      },

      getUnreadCount: () => {
        return get().notifications.filter(notification => !notification.read).length
      },

      getUnreadNotifications: () => {
        return get().notifications.filter(notification => !notification.read)
      },

      openNotifications: () => {
        set({ isOpen: true })
      },

      closeNotifications: () => {
        set({ isOpen: false })
      },

      toggleNotifications: () => {
        set(state => ({ isOpen: !state.isOpen }))
      }
    }),
    {
      name: 'notification-storage', // localStorage key
      partialize: (state) => ({ 
        notifications: state.notifications 
      }) // Only persist notifications, not isOpen state
    }
  )
)