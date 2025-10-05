import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApprovalActionDialog } from '../approval-action-dialog';
import type { PendingAccessRequest, CommentTemplate } from '@/types';

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

const mockRequest: PendingAccessRequest = {
  id: 'req-001',
  productId: 'product-001',
  productName: 'Test Product',
  requesterId: 'user-001',
  requesterName: 'John Doe',
  requesterEmail: 'john.doe@company.com',
  bdac: 'ANALYTICS_TEAM',
  businessJustification: 'Need access for analysis',
  status: 'pending',
  createdAt: '2024-02-08T10:30:00Z',
  updatedAt: '2024-02-08T10:30:00Z',
  priority: 'high',
  daysWaiting: 3,
  escalated: false
};

const mockCommentTemplates: CommentTemplate[] = [
  {
    id: 'template-001',
    category: 'security',
    title: 'Security Clearance Required',
    content: 'Access denied due to insufficient security clearance for {productName}.',
    variables: ['productName']
  },
  {
    id: 'template-002',
    category: 'policy',
    title: 'Policy Violation',
    content: 'Request violates company policy.',
    variables: []
  }
];

describe('ApprovalActionDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders approval dialog correctly', () => {
    render(
      <ApprovalActionDialog
        request={mockRequest}
        action="approve"
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        commentTemplates={mockCommentTemplates}
      />
    );

    expect(screen.getByText('Approve Access Request')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Approve Request')).toBeInTheDocument();
  });

  it('renders decline dialog correctly', () => {
    render(
      <ApprovalActionDialog
        request={mockRequest}
        action="decline"
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        commentTemplates={mockCommentTemplates}
      />
    );

    expect(screen.getByText('Decline Access Request')).toBeInTheDocument();
    expect(screen.getByText('Decline reason (required)')).toBeInTheDocument();
    expect(screen.getByText('Decline Request')).toBeInTheDocument();
  });

  it('shows template selection for decline action', () => {
    render(
      <ApprovalActionDialog
        request={mockRequest}
        action="decline"
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        commentTemplates={mockCommentTemplates}
      />
    );

    expect(screen.getByText('Use a template (optional)')).toBeInTheDocument();
    expect(screen.getByText('Select a decline reason template...')).toBeInTheDocument();
  });

  it('does not show template selection for approve action', () => {
    render(
      <ApprovalActionDialog
        request={mockRequest}
        action="approve"
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        commentTemplates={mockCommentTemplates}
      />
    );

    expect(screen.queryByText('Use a template (optional)')).not.toBeInTheDocument();
  });

  it('calls onConfirm with comment when approve is clicked', async () => {
    render(
      <ApprovalActionDialog
        request={mockRequest}
        action="approve"
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        commentTemplates={mockCommentTemplates}
      />
    );

    const commentInput = screen.getByPlaceholderText('Add any notes about this approval (optional)...');
    fireEvent.change(commentInput, { target: { value: 'Approved for testing' } });

    const approveButton = screen.getByText('Approve Request');
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith('Approved for testing');
    });
  });

  it('requires comment for decline action', async () => {
    render(
      <ApprovalActionDialog
        request={mockRequest}
        action="decline"
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        commentTemplates={mockCommentTemplates}
      />
    );

    const declineButton = screen.getByText('Decline Request');
    
    // Button should be disabled when no comment is provided
    expect(declineButton).toBeDisabled();

    // Add comment
    const commentInput = screen.getByPlaceholderText('Provide a reason for declining this request...');
    fireEvent.change(commentInput, { target: { value: 'Insufficient justification' } });

    // Button should now be enabled
    expect(declineButton).not.toBeDisabled();

    fireEvent.click(declineButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith('Insufficient justification');
    });
  });

  it('populates comment when template is selected', async () => {
    render(
      <ApprovalActionDialog
        request={mockRequest}
        action="decline"
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        commentTemplates={mockCommentTemplates}
      />
    );

    // Open template selector
    const templateSelect = screen.getByText('Select a decline reason template...');
    fireEvent.click(templateSelect);

    // Select a template
    const securityTemplate = screen.getByText('Security Clearance Required');
    fireEvent.click(securityTemplate);

    // Check that comment is populated with template content and variables replaced
    const commentInput = screen.getByDisplayValue('Access denied due to insufficient security clearance for Test Product.');
    expect(commentInput).toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked', () => {
    render(
      <ApprovalActionDialog
        request={mockRequest}
        action="approve"
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        commentTemplates={mockCommentTemplates}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows loading state correctly', () => {
    render(
      <ApprovalActionDialog
        request={mockRequest}
        action="approve"
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        commentTemplates={mockCommentTemplates}
        loading={true}
      />
    );

    const approveButton = screen.getByText('Approve Request');
    const cancelButton = screen.getByText('Cancel');
    
    expect(approveButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('does not render when request is null', () => {
    const { container } = render(
      <ApprovalActionDialog
        request={null}
        action="approve"
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        commentTemplates={mockCommentTemplates}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});