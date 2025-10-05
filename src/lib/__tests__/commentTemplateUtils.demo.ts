/**
 * Demo file showing how to use the comment template system
 * This file demonstrates the key functionality of the comment template utilities
 */

import type { CommentTemplate } from '@/types'
import {
  substituteTemplateVariables,
  extractTemplateVariables,
  validateTemplateVariables,
  filterTemplatesByCategory,
  previewTemplate,
  getTemplateSuggestions,
  getCommonVariables
} from '../commentTemplateUtils'

// Example templates
const exampleTemplates: CommentTemplate[] = [
  {
    id: 'demo-001',
    category: 'security',
    title: 'Security Clearance Required',
    content: 'Access denied for {requesterName} due to insufficient security clearance for {productName}. Please contact the security team at security@company.com.',
    variables: ['requesterName', 'productName']
  },
  {
    id: 'demo-002',
    category: 'justification',
    title: 'Insufficient Business Justification',
    content: 'The business justification provided for {productName} is insufficient. Please provide more details about: 1) Specific use case, 2) Expected outcomes, 3) Data retention timeline.',
    variables: ['productName']
  },
  {
    id: 'demo-003',
    category: 'policy',
    title: 'Data Classification Restriction',
    content: 'Access to {productName} is restricted due to its {dataClassification} classification. Please contact {dataStewart} for alternative options.',
    variables: ['productName', 'dataClassification', 'dataStewart']
  }
]

// Example usage scenarios
export function demonstrateCommentTemplateSystem() {
  console.log('=== Comment Template System Demo ===\n')

  // 1. Basic template substitution
  console.log('1. Basic Template Substitution:')
  const template = exampleTemplates[0]
  const variables = {
    requesterName: 'John Doe',
    productName: 'Customer Analytics Data'
  }
  
  const substitutedContent = substituteTemplateVariables(template, variables)
  console.log('Original:', template.content)
  console.log('Substituted:', substitutedContent)
  console.log()

  // 2. Extract variables from template
  console.log('2. Extract Variables:')
  const extractedVars = extractTemplateVariables(template.content)
  console.log('Variables found:', extractedVars)
  console.log()

  // 3. Validate template variables
  console.log('3. Validate Template Variables:')
  const validation = validateTemplateVariables(template, variables)
  console.log('Validation result:', validation)
  
  // Test with missing variables
  const incompleteVars = { requesterName: 'John Doe' }
  const incompleteValidation = validateTemplateVariables(template, incompleteVars)
  console.log('Incomplete validation:', incompleteValidation)
  console.log()

  // 4. Filter templates by category
  console.log('4. Filter by Category:')
  const securityTemplates = filterTemplatesByCategory(exampleTemplates, 'security')
  const policyTemplates = filterTemplatesByCategory(exampleTemplates, 'policy')
  console.log('Security templates:', securityTemplates.length)
  console.log('Policy templates:', policyTemplates.length)
  console.log()

  // 5. Preview template with placeholders
  console.log('5. Template Preview:')
  const preview = previewTemplate(template, { requesterName: 'John Doe' })
  console.log('Preview with partial variables:', preview)
  console.log()

  // 6. Get template suggestions based on context
  console.log('6. Template Suggestions:')
  const context = {
    productName: 'Sensitive Customer Data',
    businessJustification: 'Need data'
  }
  const suggestions = getTemplateSuggestions(exampleTemplates, context)
  console.log('Suggested templates:', suggestions.map(t => t.title))
  console.log()

  // 7. Get common variables for access request context
  console.log('7. Common Variables:')
  const requestContext = {
    productName: 'Customer Analytics Data',
    requesterName: 'John Doe',
    requesterEmail: 'john.doe@company.com',
    bdac: 'ANALYTICS_TEAM',
    businessJustification: 'Need for quarterly analysis'
  }
  const commonVars = getCommonVariables(requestContext)
  console.log('Common variables:', Object.keys(commonVars))
  console.log()

  // 8. Complete workflow example
  console.log('8. Complete Workflow Example:')
  console.log('Scenario: Declining an access request')
  
  // Select appropriate template
  const declineTemplate = exampleTemplates[1] // Insufficient justification
  
  // Get variables for the request context
  const workflowVars = getCommonVariables({
    productName: 'Financial Risk Data',
    requesterName: 'Jane Smith',
    businessJustification: 'Need data for project'
  })
  
  // Validate we have all required variables
  const workflowValidation = validateTemplateVariables(declineTemplate, workflowVars)
  console.log('Workflow validation:', workflowValidation.isValid)
  
  if (workflowValidation.isValid) {
    // Generate final decline message
    const finalMessage = substituteTemplateVariables(declineTemplate, workflowVars)
    console.log('Final decline message:')
    console.log(finalMessage)
  }
  
  console.log('\n=== Demo Complete ===')
}

// Uncomment to run the demo
// demonstrateCommentTemplateSystem()