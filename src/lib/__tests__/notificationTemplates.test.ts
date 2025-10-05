import { describe, it, expect } from 'vitest'
import {
  notificationTemplates,
  getNotificationTemplate,
  getNotificationTemplatesByType,
  getNotificationTemplatesByCategory,
  getNotificationTemplatesByUrgency,
  populateNotificationTemplate,
  getExpirationTemplate,
  getRevocationTemplate,
  formatNotificationDate,
  calculateDaysUntil,
  processBatchNotifications,
  type BatchNotificationRequest
} from '../notificationTemplates'

describe('notificationTemplates', () => {
  describe('template retrieval', () => {
    it('should get template by ID', () => {
      const template = getNotificationTemplate('expiring-30-days')
      expect(template).toBeDefined()
      expect(template?.id).toBe('expiring-30-days')
      expect(template?.type).toBe('access_expiring_soon')
    })

    it('should return undefined for non-existent template ID', () => {
      const template = getNotificationTemplate('non-existent')
      expect(template).toBeUndefined()
    })

    it('should get templates by type', () => {
      const templates = getNotificationTemplatesByType('access_expiring_soon')
      expect(templates.length).toBeGreaterThan(0)
      expect(templates.every(t => t.type === 'access_expiring_soon')).toBe(true)
    })

    it('should get templates by category', () => {
      const templates = getNotificationTemplatesByCategory('expiration')
      expect(templates.length).toBeGreaterThan(0)
      expect(templates.every(t => t.category === 'expiration')).toBe(true)
    })

    it('should get templates by urgency level', () => {
      const criticalTemplates = getNotificationTemplatesByUrgency('critical')
      expect(criticalTemplates.length).toBeGreaterThan(0)
      expect(criticalTemplates.every(t => t.urgencyLevel === 'critical')).toBe(true)
    })
  })

  describe('template population', () => {
    it('should populate template with variables', () => {
      const template = getNotificationTemplate('expiring-30-days')!
      const result = populateNotificationTemplate(template, {
        productName: 'Test Product',
        expirationDate: 'March 15, 2024'
      })

      expect(result.title).toBe('Access Expiring in 30 Days')
      expect(result.message).toContain('Test Product')
      expect(result.message).toContain('March 15, 2024')
    })

    it('should handle missing variables gracefully', () => {
      const template = getNotificationTemplate('expiring-30-days')!
      const result = populateNotificationTemplate(template, {
        productName: 'Test Product'
        // Missing expirationDate
      })

      expect(result.message).toContain('Test Product')
      expect(result.message).toContain('{expirationDate}') // Should remain as placeholder
    })
  })

  describe('template selection', () => {
    it('should get appropriate expiration template for 30+ days', () => {
      const template = getExpirationTemplate(35)
      expect(template?.id).toBe('expiring-30-days')
    })

    it('should get appropriate expiration template for 7+ days', () => {
      const template = getExpirationTemplate(10)
      expect(template?.id).toBe('expiring-7-days')
    })

    it('should get appropriate expiration template for 1+ days', () => {
      const template = getExpirationTemplate(1)
      expect(template?.id).toBe('expiring-1-day')
    })

    it('should return undefined for 0 or negative days', () => {
      const template = getExpirationTemplate(0)
      expect(template).toBeUndefined()
    })

    it('should get appropriate revocation template for 30+ days', () => {
      const template = getRevocationTemplate(35)
      expect(template?.id).toBe('revocation-scheduled')
    })

    it('should get appropriate revocation template for 7+ days', () => {
      const template = getRevocationTemplate(10)
      expect(template?.id).toBe('revocation-7-days')
    })

    it('should get appropriate revocation template for 1+ days', () => {
      const template = getRevocationTemplate(1)
      expect(template?.id).toBe('revocation-1-day')
    })
  })

  describe('date utilities', () => {
    it('should format notification date correctly', () => {
      const formatted = formatNotificationDate('2024-03-15T10:00:00Z')
      expect(formatted).toBe('March 15, 2024')
    })

    it('should calculate days until target date', () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const days = calculateDaysUntil(futureDate)
      expect(days).toBe(7)
    })

    it('should handle past dates correctly', () => {
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const days = calculateDaysUntil(pastDate)
      expect(days).toBe(-7)
    })
  })

  describe('batch notification processing', () => {
    it('should process batch expiration notifications', () => {
      const requests: BatchNotificationRequest[] = [
        {
          userId: 'user1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          productId: 'product1',
          productName: 'Test Product 1',
          targetDate: '2024-03-15T10:00:00Z',
          notificationType: 'expiration',
          daysUntilTarget: 30
        },
        {
          userId: 'user2',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          productId: 'product2',
          productName: 'Test Product 2',
          targetDate: '2024-03-22T10:00:00Z',
          notificationType: 'expiration',
          daysUntilTarget: 7
        }
      ]

      const results = processBatchNotifications(requests)
      
      expect(results).toHaveLength(2)
      expect(results[0].userName).toBe('John Doe')
      expect(results[0].type).toBe('access_expiring_soon')
      expect(results[0].urgencyLevel).toBe('low') // 30-day reminder
      expect(results[1].userName).toBe('Jane Smith')
      expect(results[1].urgencyLevel).toBe('medium') // 7-day reminder
    })

    it('should process batch revocation notifications', () => {
      const requests: BatchNotificationRequest[] = [
        {
          userId: 'user1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          productId: 'product1',
          productName: 'Test Product 1',
          targetDate: '2024-03-15T10:00:00Z',
          notificationType: 'revocation',
          daysUntilTarget: 30
        }
      ]

      const results = processBatchNotifications(requests)
      
      expect(results).toHaveLength(1)
      expect(results[0].type).toBe('access_revocation_scheduled')
      expect(results[0].urgencyLevel).toBe('medium')
    })

    it('should throw error for invalid template selection', () => {
      const requests: BatchNotificationRequest[] = [
        {
          userId: 'user1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          productId: 'product1',
          productName: 'Test Product 1',
          targetDate: '2024-03-15T10:00:00Z',
          notificationType: 'expiration',
          daysUntilTarget: 0 // Invalid days
        }
      ]

      expect(() => processBatchNotifications(requests)).toThrow()
    })
  })

  describe('template validation', () => {
    it('should have all required templates', () => {
      const requiredTemplateIds = [
        'expiring-30-days',
        'expiring-7-days',
        'expiring-1-day',
        'revocation-scheduled',
        'revocation-7-days',
        'revocation-1-day',
        'access-renewed',
        'force-revoked-security',
        'force-revoked-policy',
        'force-revoked-administrative'
      ]

      requiredTemplateIds.forEach(id => {
        const template = getNotificationTemplate(id)
        expect(template).toBeDefined()
        expect(template?.id).toBe(id)
      })
    })

    it('should have valid template structure', () => {
      notificationTemplates.forEach(template => {
        expect(template.id).toBeDefined()
        expect(template.type).toBeDefined()
        expect(template.title).toBeDefined()
        expect(template.messageTemplate).toBeDefined()
        expect(Array.isArray(template.variables)).toBe(true)
        expect(['low', 'medium', 'high', 'critical']).toContain(template.urgencyLevel)
        expect(['expiration', 'revocation', 'renewal', 'administrative']).toContain(template.category)
      })
    })

    it('should have unique template IDs', () => {
      const ids = notificationTemplates.map(t => t.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })
})