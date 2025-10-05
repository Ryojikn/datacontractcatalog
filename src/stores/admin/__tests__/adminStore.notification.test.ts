import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAdminStore } from '../adminStore'
import type { CurrentAccess, AccessRevocationNotice } from '@/types'

// Mock the notification store
const mockNotificationStore = {
  addAccessExpiringNotification: vi.fn(),
  addAccessRevocationScheduledNotification: vi.fn(),
  addAccessRevocationImminentNotification: vi.fn(),
  addAccessRenewedNotification: vi.fn(),
  addAccessForceRevokedNotification: vi.fn(),
  scheduleRevocationNotices: vi.fn(),
  processExpirationReminders: vi.fn(),
  addNotification: vi.fn()
}

// Mock the notification store import
vi.mock('@/stores/notification/notificationStore', () => ({
  useNotificationStore: {
    getState: () => mockNotificationStore
  }
}))

describe('AdminStore Notification Integration', () => {
  let store: ReturnType<typeof useAdminStore>

  beforeEach(() => {
    // Reset the store state
    store = useAdminStore.getState()
    
    // Clear all mocks
    vi.clearAllMocks()
    
    // Reset store to initial state
    useAdminStore.setState({
      pendingRequests: [],
      currentAccess: [],
      commentTemplates: [],
      revocationNotices: [],
      scheduledNotifications: [],
      loading: false,
      error: null,
      lastRefresh: null
    })
  })

  describe('notification scheduling', () => {
    it('should generate notification schedule for current access', async () => {
      const mockAccess: CurrentAccess[] = [
        {
          id: 'access-1',
          userId: 'user-1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          productId: 'product-1',
          productName: 'Test Product',
          grantedAt: '2024-01-01T00:00:00Z',
          expiresAt: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
          grantedBy: 'admin-1',
          accessLevel: 'read',
          status: 'active'
        }
      ]

      // Set up store state
      useAdminStore.setState({ currentAccess: mockAccess })

      // Generate notification schedule
      await store.generateNotificationSchedule()

      const state = useAdminStore.getState()
      expect(state.scheduledNotifications.length).toBeGreaterThan(0)
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should process pending notifications', async () => {
      const now = new Date()
      const mockScheduledNotifications = [
        {
          id: 'scheduled-1',
          accessId: 'access-1',
          userId: 'user-1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          productId: 'product-1',
          productName: 'Test Product',
          notificationType: 'expiration_reminder' as const,
          scheduledDate: new Date(now.getTime() - 1000).toISOString(), // Due
          targetDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          daysBeforeTarget: 30,
          sent: false,
          createdAt: now.toISOString()
        }
      ]

      // Set up store state
      useAdminStore.setState({ scheduledNotifications: mockScheduledNotifications })

      // Process pending notifications
      await store.processPendingNotifications()

      // Verify notification store methods were called
      expect(mockNotificationStore.processExpirationReminders).toHaveBeenCalled()

      // Verify notification was marked as sent
      const state = useAdminStore.getState()
      const processedNotification = state.scheduledNotifications.find(n => n.id === 'scheduled-1')
      expect(processedNotification?.sent).toBe(true)
    })

    it('should schedule expiration reminders for specific access list', async () => {
      const mockAccess: CurrentAccess[] = [
        {
          id: 'access-1',
          userId: 'user-1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          productId: 'product-1',
          productName: 'Test Product',
          grantedAt: '2024-01-01T00:00:00Z',
          expiresAt: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
          grantedBy: 'admin-1',
          accessLevel: 'read',
          status: 'active'
        }
      ]

      await store.scheduleExpirationReminders(mockAccess)

      const state = useAdminStore.getState()
      expect(state.scheduledNotifications.length).toBeGreaterThan(0)
      
      // Should have reminders for the specified access
      const accessReminders = state.scheduledNotifications.filter(n => n.accessId === 'access-1')
      expect(accessReminders.length).toBeGreaterThan(0)
    })

    it('should schedule revocation notices for specific revocation list', async () => {
      const mockAccess: CurrentAccess[] = [
        {
          id: 'access-1',
          userId: 'user-1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          productId: 'product-1',
          productName: 'Test Product',
          grantedAt: '2024-01-01T00:00:00Z',
          expiresAt: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
          grantedBy: 'admin-1',
          accessLevel: 'read',
          status: 'scheduled_for_revocation'
        }
      ]

      const mockRevocationNotices: AccessRevocationNotice[] = [
        {
          id: 'notice-1',
          accessId: 'access-1',
          userId: 'user-1',
          scheduledRevocationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          notificationDate: new Date().toISOString(),
          notificationSent: false,
          remindersSent: 0,
          createdAt: new Date().toISOString()
        }
      ]

      // Set up store state
      useAdminStore.setState({ currentAccess: mockAccess })

      await store.scheduleRevocationNotices(mockRevocationNotices)

      const state = useAdminStore.getState()
      expect(state.scheduledNotifications.length).toBeGreaterThan(0)
      
      // Should have notifications for the revocation
      const revocationNotifications = state.scheduledNotifications.filter(n => n.accessId === 'access-1')
      expect(revocationNotifications.length).toBeGreaterThan(0)
    })
  })

  describe('notification configuration', () => {
    it('should update notification configuration', () => {
      const newConfig = {
        expirationReminderDays: [15, 5, 1],
        maxBatchSize: 100
      }

      store.updateNotificationConfig(newConfig)

      const state = useAdminStore.getState()
      expect(state.notificationConfig.expirationReminderDays).toEqual([15, 5, 1])
      expect(state.notificationConfig.maxBatchSize).toBe(100)
    })

    it('should get notification statistics', () => {
      const mockScheduledNotifications = [
        {
          id: 'scheduled-1',
          accessId: 'access-1',
          userId: 'user-1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          productId: 'product-1',
          productName: 'Test Product',
          notificationType: 'expiration_reminder' as const,
          scheduledDate: new Date().toISOString(),
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          daysBeforeTarget: 30,
          sent: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'scheduled-2',
          accessId: 'access-2',
          userId: 'user-2',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          productId: 'product-2',
          productName: 'Test Product 2',
          notificationType: 'revocation_notice' as const,
          scheduledDate: new Date().toISOString(),
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          daysBeforeTarget: 30,
          sent: true,
          createdAt: new Date().toISOString(),
          sentAt: new Date().toISOString()
        }
      ]

      useAdminStore.setState({ scheduledNotifications: mockScheduledNotifications })

      const stats = store.getNotificationStatistics()
      
      expect(stats.total).toBe(2)
      expect(stats.sent).toBe(1)
      expect(stats.pending).toBe(1)
      expect(stats.byType.expiration_reminder.total).toBe(1)
      expect(stats.byType.revocation_notice.total).toBe(1)
    })

    it('should cleanup old notifications', () => {
      const oldDate = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) // 100 days ago
      const mockScheduledNotifications = [
        {
          id: 'scheduled-old',
          accessId: 'access-1',
          userId: 'user-1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          productId: 'product-1',
          productName: 'Test Product',
          notificationType: 'expiration_reminder' as const,
          scheduledDate: oldDate.toISOString(),
          targetDate: oldDate.toISOString(),
          daysBeforeTarget: 30,
          sent: true,
          createdAt: oldDate.toISOString(),
          sentAt: oldDate.toISOString()
        },
        {
          id: 'scheduled-recent',
          accessId: 'access-2',
          userId: 'user-2',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          productId: 'product-2',
          productName: 'Test Product 2',
          notificationType: 'expiration_reminder' as const,
          scheduledDate: new Date().toISOString(),
          targetDate: new Date().toISOString(),
          daysBeforeTarget: 30,
          sent: false,
          createdAt: new Date().toISOString()
        }
      ]

      useAdminStore.setState({ scheduledNotifications: mockScheduledNotifications })

      store.cleanupOldNotifications(90)

      const state = useAdminStore.getState()
      expect(state.scheduledNotifications).toHaveLength(1)
      expect(state.scheduledNotifications[0].id).toBe('scheduled-recent')
    })
  })

  describe('integration with access management actions', () => {
    it('should schedule notifications when scheduling revocation', async () => {
      const mockAccess: CurrentAccess[] = [
        {
          id: 'access-1',
          userId: 'user-1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          productId: 'product-1',
          productName: 'Test Product',
          grantedAt: '2024-01-01T00:00:00Z',
          expiresAt: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
          grantedBy: 'admin-1',
          accessLevel: 'read',
          status: 'active'
        }
      ]

      useAdminStore.setState({ currentAccess: mockAccess })

      await store.scheduleRevocation('access-1')

      // Verify that notification was sent
      expect(mockNotificationStore.addAccessRevocationScheduledNotification).toHaveBeenCalledWith(
        'John Doe',
        'Test Product',
        expect.any(String),
        'product-1'
      )

      // Verify that access status was updated
      const state = useAdminStore.getState()
      const updatedAccess = state.currentAccess.find(a => a.id === 'access-1')
      expect(updatedAccess?.status).toBe('scheduled_for_revocation')
    })

    it('should send notification when renewing access', async () => {
      const mockAccess: CurrentAccess[] = [
        {
          id: 'access-1',
          userId: 'user-1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          productId: 'product-1',
          productName: 'Test Product',
          grantedAt: '2024-01-01T00:00:00Z',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          grantedBy: 'admin-1',
          accessLevel: 'read',
          status: 'expiring_soon'
        }
      ]

      useAdminStore.setState({ currentAccess: mockAccess })

      await store.renewAccess('access-1')

      // Verify that renewal notification was sent
      expect(mockNotificationStore.addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'access_renewed',
          title: 'Access Renewed'
        })
      )
    })

    it('should send notification when force revoking access', async () => {
      const mockAccess: CurrentAccess[] = [
        {
          id: 'access-1',
          userId: 'user-1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          productId: 'product-1',
          productName: 'Test Product',
          grantedAt: '2024-01-01T00:00:00Z',
          expiresAt: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
          grantedBy: 'admin-1',
          accessLevel: 'read',
          status: 'active'
        }
      ]

      useAdminStore.setState({ currentAccess: mockAccess })

      await store.forceRevocation('access-1')

      // Verify that force revocation notification was sent
      expect(mockNotificationStore.addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'access_force_revoked',
          title: 'Access Immediately Revoked'
        })
      )

      // Verify that access was removed
      const state = useAdminStore.getState()
      const removedAccess = state.currentAccess.find(a => a.id === 'access-1')
      expect(removedAccess).toBeUndefined()
    })
  })

  describe('error handling', () => {
    it('should handle errors in notification scheduling gracefully', async () => {
      // Mock an error in the notification scheduling
      const originalConsoleWarn = console.warn
      console.warn = vi.fn()

      // Set up invalid data that might cause errors
      useAdminStore.setState({ 
        currentAccess: [],
        revocationNotices: []
      })

      await store.generateNotificationSchedule()

      // Should not throw error and should complete successfully
      const state = useAdminStore.getState()
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()

      console.warn = originalConsoleWarn
    })

    it('should handle errors in notification processing gracefully', async () => {
      const originalConsoleError = console.error
      console.error = vi.fn()

      // Mock notification store to throw error
      mockNotificationStore.processExpirationReminders.mockImplementation(() => {
        throw new Error('Notification processing failed')
      })

      const mockScheduledNotifications = [
        {
          id: 'scheduled-1',
          accessId: 'access-1',
          userId: 'user-1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          productId: 'product-1',
          productName: 'Test Product',
          notificationType: 'expiration_reminder' as const,
          scheduledDate: new Date(Date.now() - 1000).toISOString(),
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          daysBeforeTarget: 30,
          sent: false,
          createdAt: new Date().toISOString()
        }
      ]

      useAdminStore.setState({ scheduledNotifications: mockScheduledNotifications })

      await store.processPendingNotifications()

      // Should handle error gracefully
      const state = useAdminStore.getState()
      expect(state.loading).toBe(false)
      // Error should be set due to the mocked failure
      expect(state.error).toBe('Notification processing failed')

      console.error = originalConsoleError
    })
  })
})