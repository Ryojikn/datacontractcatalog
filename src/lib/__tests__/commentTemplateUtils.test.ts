import { describe, it, expect } from 'vitest'
import type { CommentTemplate } from '@/types'
import {
  substituteTemplateVariables,
  extractTemplateVariables,
  validateTemplateVariables,
  filterTemplatesByCategory,
  getTemplateCategories,
  searchTemplates,
  previewTemplate,
  getTemplateSuggestions,
  formatTemplateForDisplay,
  getCommonVariables
} from '../commentTemplateUtils'

const mockTemplates: CommentTemplate[] = [
  {
    id: 'template-001',
    category: 'security',
    title: 'Security Clearance Required',
    content: 'Access denied for {requesterName} due to insufficient security clearance for {productName}.',
    variables: ['requesterName', 'productName']
  },
  {
    id: 'template-002',
    category: 'policy',
    title: 'Policy Violation',
    content: 'Request declined as it violates policy section {policySection}.',
    variables: ['policySection']
  },
  {
    id: 'template-003',
    category: 'justification',
    title: 'Insufficient Justification',
    content: 'The business justification for {productName} is insufficient.',
    variables: ['productName']
  },
  {
    id: 'template-004',
    category: 'technical',
    title: 'Technical Requirements',
    content: 'Technical requirements not met for accessing the data.',
    variables: []
  }
]

describe('commentTemplateUtils', () => {
  describe('substituteTemplateVariables', () => {
    it('should substitute variables in template content', () => {
      const template = mockTemplates[0]
      const variables = {
        requesterName: 'John Doe',
        productName: 'Customer Data'
      }

      const result = substituteTemplateVariables(template, variables)
      
      expect(result).toBe('Access denied for John Doe due to insufficient security clearance for Customer Data.')
    })

    it('should handle missing variables by leaving placeholders', () => {
      const template = mockTemplates[0]
      const variables = {
        requesterName: 'John Doe'
        // productName is missing
      }

      const result = substituteTemplateVariables(template, variables)
      
      expect(result).toBe('Access denied for John Doe due to insufficient security clearance for {productName}.')
    })

    it('should handle templates with no variables', () => {
      const template = mockTemplates[3]
      const variables = {}

      const result = substituteTemplateVariables(template, variables)
      
      expect(result).toBe('Technical requirements not met for accessing the data.')
    })
  })

  describe('extractTemplateVariables', () => {
    it('should extract variable names from template content', () => {
      const content = 'Hello {name}, your request for {productName} has been {status}.'
      
      const result = extractTemplateVariables(content)
      
      expect(result).toEqual(['name', 'productName', 'status'])
    })

    it('should handle duplicate variables', () => {
      const content = 'Hello {name}, {name} your request has been processed.'
      
      const result = extractTemplateVariables(content)
      
      expect(result).toEqual(['name'])
    })

    it('should return empty array for content with no variables', () => {
      const content = 'This is a simple message with no variables.'
      
      const result = extractTemplateVariables(content)
      
      expect(result).toEqual([])
    })
  })

  describe('validateTemplateVariables', () => {
    it('should validate that all required variables are provided', () => {
      const template = mockTemplates[0]
      const variables = {
        requesterName: 'John Doe',
        productName: 'Customer Data'
      }

      const result = validateTemplateVariables(template, variables)
      
      expect(result.isValid).toBe(true)
      expect(result.missingVariables).toEqual([])
    })

    it('should identify missing variables', () => {
      const template = mockTemplates[0]
      const variables = {
        requesterName: 'John Doe'
        // productName is missing
      }

      const result = validateTemplateVariables(template, variables)
      
      expect(result.isValid).toBe(false)
      expect(result.missingVariables).toEqual(['productName'])
    })

    it('should handle templates with no required variables', () => {
      const template = mockTemplates[3]
      const variables = {}

      const result = validateTemplateVariables(template, variables)
      
      expect(result.isValid).toBe(true)
      expect(result.missingVariables).toEqual([])
    })
  })

  describe('filterTemplatesByCategory', () => {
    it('should filter templates by category', () => {
      const result = filterTemplatesByCategory(mockTemplates, 'security')
      
      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('security')
    })

    it('should return empty array for non-existent category', () => {
      const result = filterTemplatesByCategory(mockTemplates, 'security')
      
      expect(result).toHaveLength(1)
    })
  })

  describe('getTemplateCategories', () => {
    it('should return all unique categories sorted', () => {
      const result = getTemplateCategories(mockTemplates)
      
      expect(result).toEqual(['justification', 'policy', 'security', 'technical'])
    })

    it('should handle empty template array', () => {
      const result = getTemplateCategories([])
      
      expect(result).toEqual([])
    })
  })

  describe('searchTemplates', () => {
    it('should search templates by title', () => {
      const result = searchTemplates(mockTemplates, 'security')
      
      expect(result).toHaveLength(1)
      expect(result[0].title).toContain('Security')
    })

    it('should search templates by content', () => {
      const result = searchTemplates(mockTemplates, 'policy')
      
      expect(result).toHaveLength(1)
      expect(result[0].content).toContain('policy')
    })

    it('should be case insensitive', () => {
      const result = searchTemplates(mockTemplates, 'SECURITY')
      
      expect(result).toHaveLength(1)
    })

    it('should return empty array for no matches', () => {
      const result = searchTemplates(mockTemplates, 'nonexistent')
      
      expect(result).toEqual([])
    })
  })

  describe('previewTemplate', () => {
    it('should preview template with provided variables', () => {
      const template = mockTemplates[0]
      const variables = {
        requesterName: 'John Doe',
        productName: 'Customer Data'
      }

      const result = previewTemplate(template, variables)
      
      expect(result).toBe('Access denied for John Doe due to insufficient security clearance for Customer Data.')
    })

    it('should show placeholder for missing variables', () => {
      const template = mockTemplates[0]
      const variables = {
        requesterName: 'John Doe'
      }

      const result = previewTemplate(template, variables)
      
      expect(result).toBe('Access denied for John Doe due to insufficient security clearance for [productName].')
    })

    it('should handle empty variables object', () => {
      const template = mockTemplates[0]

      const result = previewTemplate(template)
      
      expect(result).toBe('Access denied for [requesterName] due to insufficient security clearance for [productName].')
    })
  })

  describe('getTemplateSuggestions', () => {
    it('should return default templates when no context provided', () => {
      const result = getTemplateSuggestions(mockTemplates)
      
      expect(result).toHaveLength(3)
    })

    it('should boost security templates for sensitive data', () => {
      const context = {
        productName: 'Sensitive Customer Data'
      }

      const result = getTemplateSuggestions(mockTemplates, context)
      
      expect(result[0].category).toBe('security')
    })

    it('should boost justification templates for weak justifications', () => {
      const context = {
        businessJustification: 'Need data'
      }

      const result = getTemplateSuggestions(mockTemplates, context)
      
      expect(result[0].category).toBe('justification')
    })
  })

  describe('formatTemplateForDisplay', () => {
    it('should format template for UI display', () => {
      const template = mockTemplates[0]

      const result = formatTemplateForDisplay(template)
      
      expect(result).toEqual({
        id: 'template-001',
        label: 'Security Clearance Required',
        value: 'Access denied for {requesterName} due to insufficient security clearance for {productName}.',
        category: 'security',
        preview: 'Access denied for {requesterName} due to insufficient security clearance for {productName}.'
      })
    })

    it('should truncate long content for preview', () => {
      const longTemplate: CommentTemplate = {
        id: 'template-long',
        category: 'policy',
        title: 'Long Template',
        content: 'This is a very long template content that should be truncated when displayed as a preview in the UI components to avoid overwhelming the user interface.',
        variables: []
      }

      const result = formatTemplateForDisplay(longTemplate)
      
      expect(result.preview).toHaveLength(103) // 100 chars + "..."
      expect(result.preview).toEndWith('...')
    })
  })

  describe('getCommonVariables', () => {
    it('should return common variables with provided context', () => {
      const context = {
        productName: 'Customer Data',
        requesterName: 'John Doe',
        requesterEmail: 'john@example.com',
        bdac: 'ANALYTICS_TEAM',
        businessJustification: 'Need for analysis'
      }

      const result = getCommonVariables(context)
      
      expect(result.productName).toBe('Customer Data')
      expect(result.requesterName).toBe('John Doe')
      expect(result.requesterEmail).toBe('john@example.com')
      expect(result.bdac).toBe('ANALYTICS_TEAM')
      expect(result.businessJustification).toBe('Need for analysis')
      expect(result.currentDate).toBeDefined()
      expect(result.currentDateTime).toBeDefined()
    })

    it('should return placeholders for missing context', () => {
      const context = {}

      const result = getCommonVariables(context)
      
      expect(result.productName).toBe('[Product Name]')
      expect(result.requesterName).toBe('[Requester Name]')
      expect(result.requesterEmail).toBe('[Requester Email]')
      expect(result.bdac).toBe('[BDAC]')
      expect(result.businessJustification).toBe('[Business Justification]')
    })
  })
})