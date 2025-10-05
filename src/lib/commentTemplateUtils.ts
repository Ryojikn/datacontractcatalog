import type { CommentTemplate, CommentTemplateCategory } from '@/types'

/**
 * Substitutes variables in a comment template with provided values
 * Variables in templates are denoted by curly braces, e.g., {productName}
 */
export function substituteTemplateVariables(
  template: CommentTemplate,
  variables: Record<string, string>
): string {
  let content = template.content

  // Replace all variables in the format {variableName}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g')
    content = content.replace(regex, value)
  })

  return content
}

/**
 * Extracts variable names from a template content string
 * Returns an array of variable names found in {variableName} format
 */
export function extractTemplateVariables(content: string): string[] {
  const variableRegex = /\{([^}]+)\}/g
  const variables: string[] = []
  let match

  while ((match = variableRegex.exec(content)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1])
    }
  }

  return variables
}

/**
 * Validates that all required variables are provided for template substitution
 */
export function validateTemplateVariables(
  template: CommentTemplate,
  variables: Record<string, string>
): { isValid: boolean; missingVariables: string[] } {
  const requiredVariables = template.variables || extractTemplateVariables(template.content)
  const missingVariables = requiredVariables.filter(variable => !variables[variable])

  return {
    isValid: missingVariables.length === 0,
    missingVariables
  }
}

/**
 * Filters comment templates by category
 */
export function filterTemplatesByCategory(
  templates: CommentTemplate[],
  category: CommentTemplateCategory
): CommentTemplate[] {
  return templates.filter(template => template.category === category)
}

/**
 * Gets all available template categories from a list of templates
 */
export function getTemplateCategories(templates: CommentTemplate[]): CommentTemplateCategory[] {
  const categories = new Set<CommentTemplateCategory>()
  templates.forEach(template => categories.add(template.category))
  return Array.from(categories).sort()
}

/**
 * Searches templates by title or content
 */
export function searchTemplates(
  templates: CommentTemplate[],
  searchTerm: string
): CommentTemplate[] {
  const term = searchTerm.toLowerCase()
  return templates.filter(template => 
    template.title.toLowerCase().includes(term) ||
    template.content.toLowerCase().includes(term)
  )
}

/**
 * Creates a preview of a template with variable substitution
 * Shows placeholder text for missing variables
 */
export function previewTemplate(
  template: CommentTemplate,
  variables: Record<string, string> = {}
): string {
  let content = template.content
  const requiredVariables = template.variables || extractTemplateVariables(template.content)

  requiredVariables.forEach(variable => {
    const regex = new RegExp(`\\{${variable}\\}`, 'g')
    const value = variables[variable] || `[${variable}]`
    content = content.replace(regex, value)
  })

  return content
}

/**
 * Gets template suggestions based on common decline reasons
 */
export function getTemplateSuggestions(
  templates: CommentTemplate[],
  context?: {
    productName?: string
    requesterName?: string
    businessJustification?: string
  }
): CommentTemplate[] {
  // Simple scoring based on context
  if (!context) {
    return templates.slice(0, 3) // Return first 3 templates as default
  }

  const scored = templates.map(template => {
    let score = 0
    
    // Boost security templates for sensitive data
    if (template.category === 'security' && context.productName?.toLowerCase().includes('sensitive')) {
      score += 2
    }
    
    // Boost justification templates for weak justifications
    if (template.category === 'justification' && 
        context.businessJustification && 
        context.businessJustification.length < 50) {
      score += 2
    }
    
    // Boost policy templates for policy-related keywords
    if (template.category === 'policy' && 
        context.businessJustification?.toLowerCase().includes('policy')) {
      score += 1
    }

    return { template, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.template)
}

/**
 * Formats template for display in UI components
 */
export function formatTemplateForDisplay(template: CommentTemplate): {
  id: string
  label: string
  value: string
  category: string
  preview: string
} {
  return {
    id: template.id,
    label: template.title,
    value: template.content,
    category: template.category,
    preview: template.content.length > 100 
      ? `${template.content.substring(0, 100)}...` 
      : template.content
  }
}

/**
 * Common variable mappings for access request context
 */
export function getCommonVariables(context: {
  productName?: string
  requesterName?: string
  requesterEmail?: string
  bdac?: string
  businessJustification?: string
}): Record<string, string> {
  return {
    productName: context.productName || '[Product Name]',
    requesterName: context.requesterName || '[Requester Name]',
    requesterEmail: context.requesterEmail || '[Requester Email]',
    bdac: context.bdac || '[BDAC]',
    businessJustification: context.businessJustification || '[Business Justification]',
    currentDate: new Date().toLocaleDateString(),
    currentDateTime: new Date().toLocaleString()
  }
}