import React, { useState } from 'react';
import { DeclineCommentDialog } from '../decline-comment-dialog';
import type { PendingAccessRequest, CommentTemplate } from '@/types';

const mockRequest: PendingAccessRequest = {
  id: 'req-001',
  productId: 'product-001',
  productName: 'Credit Card Transactions ETL',
  requesterId: 'user-001',
  requesterName: 'João Silva',
  requesterEmail: 'joao.silva@company.com',
  bdac: 'ANALYTICS_TEAM',
  businessJustification: 'Need access to credit card transaction data for monthly risk analysis and fraud detection model training.',
  status: 'pending',
  createdAt: '2024-02-08T10:30:00Z',
  updatedAt: '2024-02-08T10:30:00Z',
  priority: 'high',
  daysWaiting: 3,
  adminNotes: 'High priority due to regulatory compliance requirements',
  escalated: false
};

const mockTemplates: CommentTemplate[] = [
  {
    id: 'template-001',
    category: 'security',
    title: 'Security Clearance Required',
    content: 'Access denied due to insufficient security clearance. The requested data contains sensitive information that requires additional security approval from the Information Security team.',
    variables: ['productName', 'requesterName']
  },
  {
    id: 'template-002',
    category: 'security',
    title: 'PII Data Access Restriction',
    content: 'Access to {productName} cannot be granted as it contains Personally Identifiable Information (PII). Please complete the PII handling training and obtain appropriate data handling certification before resubmitting your request.',
    variables: ['productName', 'requesterName']
  },
  {
    id: 'template-003',
    category: 'justification',
    title: 'Insufficient Business Justification',
    content: 'The business justification provided is insufficient for granting access to {productName}. Please provide more detailed information about: 1) Specific use case and business objectives, 2) Expected outcomes and success metrics, 3) Data retention and usage timeline, 4) Alternative data sources considered.',
    variables: ['productName', 'requesterName']
  },
  {
    id: 'template-004',
    category: 'policy',
    title: 'Data Governance Policy Violation',
    content: 'Request declined as it violates company data governance policy section {policySection}. Please review the data governance guidelines at {policyUrl} and resubmit with proper justification.',
    variables: ['productName', 'policySection', 'policyUrl']
  },
  {
    id: 'template-005',
    category: 'technical',
    title: 'Technical Requirements Not Met',
    content: 'Access cannot be granted due to unmet technical requirements. Please ensure your environment meets: 1) {technicalRequirements}, 2) Network security standards, 3) Data encryption capabilities. Contact IT support for assistance with setup.',
    variables: ['productName', 'technicalRequirements']
  }
];

/**
 * Demo component for DeclineCommentDialog
 * 
 * This component demonstrates the functionality of the DeclineCommentDialog:
 * - Template selection and categorization
 * - Variable substitution in templates
 * - Template preview functionality
 * - Comment editing and validation
 * - Reset to template functionality
 * 
 * Key features tested:
 * 1. Dialog opens and displays request information
 * 2. Template categories can be filtered
 * 3. Templates can be selected and populate the comment field
 * 4. Variables are properly substituted (e.g., {productName} becomes actual product name)
 * 5. Template preview shows the final content
 * 6. Comment can be manually edited
 * 7. Reset button restores original template content
 * 8. Form validation requires a comment before submission
 * 9. Character count is displayed
 * 10. Variable substitution information is shown
 */
const DeclineCommentDialogDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastComment, setLastComment] = useState<string>('');

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleConfirm = (comment: string) => {
    setLastComment(comment);
    console.log('Decline comment:', comment);
    setIsOpen(false);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">DeclineCommentDialog Demo</h1>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-muted/50">
            <h2 className="font-semibold mb-2">Test Request Details:</h2>
            <ul className="text-sm space-y-1">
              <li><strong>Requester:</strong> {mockRequest.requesterName}</li>
              <li><strong>Product:</strong> {mockRequest.productName}</li>
              <li><strong>Priority:</strong> {mockRequest.priority}</li>
              <li><strong>Days Waiting:</strong> {mockRequest.daysWaiting}</li>
              <li><strong>Justification:</strong> {mockRequest.businessJustification}</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4 bg-muted/50">
            <h2 className="font-semibold mb-2">Available Templates ({mockTemplates.length}):</h2>
            <ul className="text-sm space-y-1">
              {mockTemplates.map(template => (
                <li key={template.id}>
                  <strong>{template.category}:</strong> {template.title}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleOpen}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Open Decline Dialog
          </button>

          {lastComment && (
            <div className="border rounded-lg p-4 bg-green-50">
              <h2 className="font-semibold mb-2">Last Decline Comment:</h2>
              <p className="text-sm whitespace-pre-wrap">{lastComment}</p>
            </div>
          )}
        </div>
      </div>

      <DeclineCommentDialog
        request={mockRequest}
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        commentTemplates={mockTemplates}
      />
    </div>
  );
};

export default DeclineCommentDialogDemo;