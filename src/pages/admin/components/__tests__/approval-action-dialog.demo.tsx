import React, { useState } from 'react';
import { ApprovalActionDialog } from '../approval-action-dialog';
import { Button } from '@/components/ui/button';
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

const mockCommentTemplates: CommentTemplate[] = [
  {
    id: 'template-001',
    category: 'security',
    title: 'Security Clearance Required',
    content: 'Access denied due to insufficient security clearance. The requested data contains sensitive information that requires additional security approval from the Information Security team.',
    variables: ['productName', 'requesterName']
  },
  {
    id: 'template-002',
    category: 'policy',
    title: 'Data Governance Policy Violation',
    content: 'Request declined as it violates company data governance policy. Please review the data governance guidelines and resubmit with proper justification.',
    variables: ['productName']
  },
  {
    id: 'template-003',
    category: 'justification',
    title: 'Insufficient Business Justification',
    content: 'The business justification provided is insufficient for granting access to {productName}. Please provide more detailed information about your specific use case and expected outcomes.',
    variables: ['productName', 'requesterName']
  },
  {
    id: 'template-004',
    category: 'technical',
    title: 'Technical Requirements Not Met',
    content: 'Access cannot be granted due to unmet technical requirements. Please ensure your environment meets the necessary security standards and contact IT support for assistance.',
    variables: ['productName']
  }
];

/**
 * Demo component for testing ApprovalActionDialog functionality
 * This component can be used to manually test the dialog in the browser
 */
const ApprovalActionDialogDemo: React.FC = () => {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    action: 'approve' | 'decline';
  }>({
    isOpen: false,
    action: 'approve'
  });

  const [loading, setLoading] = useState(false);

  const handleOpenApprove = () => {
    setDialogState({ isOpen: true, action: 'approve' });
  };

  const handleOpenDecline = () => {
    setDialogState({ isOpen: true, action: 'decline' });
  };

  const handleClose = () => {
    setDialogState({ isOpen: false, action: 'approve' });
    setLoading(false);
  };

  const handleConfirm = async (comment?: string) => {
    console.log(`${dialogState.action} action confirmed with comment:`, comment);
    
    // Simulate API call
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    
    alert(`Request ${dialogState.action}d successfully!${comment ? `\nComment: ${comment}` : ''}`);
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">ApprovalActionDialog Demo</h1>
      
      <div className="space-y-4">
        <div className="border rounded-lg p-4 bg-muted/50">
          <h3 className="font-medium mb-2">Mock Request Details:</h3>
          <p><strong>Requester:</strong> {mockRequest.requesterName}</p>
          <p><strong>Product:</strong> {mockRequest.productName}</p>
          <p><strong>Priority:</strong> {mockRequest.priority}</p>
          <p><strong>Days Waiting:</strong> {mockRequest.daysWaiting}</p>
          <p><strong>Justification:</strong> {mockRequest.businessJustification}</p>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={handleOpenApprove}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Test Approve Dialog
          </Button>
          <Button 
            onClick={handleOpenDecline}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            Test Decline Dialog
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>• Approve dialog allows optional comments</p>
          <p>• Decline dialog requires a comment and shows template options</p>
          <p>• Templates include variable substitution (e.g., {'{productName}'})</p>
          <p>• Loading states are simulated with 2-second delays</p>
        </div>
      </div>

      <ApprovalActionDialog
        request={mockRequest}
        action={dialogState.action}
        isOpen={dialogState.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        commentTemplates={mockCommentTemplates}
        loading={loading}
      />
    </div>
  );
};

export default ApprovalActionDialogDemo;