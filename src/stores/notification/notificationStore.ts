import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Notification } from '@/types'
import { toast } from '@/hooks/use-toast'

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
    type: 'system',
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM EST.',
    read: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
  },
  {
    id: 'notif-5',
    type: 'access_approved',
    title: 'Access Request Approved',
    message: 'Your access request for Transaction Monitoring has been approved.',
    productId: 'product-4',
    productName: 'Transaction Monitoring',
    read: true,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() // 2 days ago
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
        
        toast({
          title: "Access Approved! 🎉",
          description: `Your access to ${productName} has been approved.`,
          variant: "default"
        })
      },

      addAccessRejectedWithToast: (productName: string, reason?: string, productId?: string) => {
        get().addAccessRejectedNotification(productName, reason, productId)
        
        toast({
          title: "Access Request Rejected",
          description: `Your access request for ${productName} was rejected.`,
          variant: "destructive"
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