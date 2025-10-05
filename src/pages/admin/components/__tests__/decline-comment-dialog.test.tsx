import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeclineCommentDialog } from '../decline-comment-dialog';
import type { PendingAccessRequest, CommentTemplate } from '@/types';

// Mock the UI components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => 
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="dialog-content">{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="dialog-footer">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="dialog-title">{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, ...props }: any) => (
    <textarea 
      value={value} 
      onChange={onChange} 
      data-testid="comment-textarea"
      {...props} 
    />
  ),
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select-container">
      <select 
        value={value} 
        onChange={(e) => onValueChange(e.target.value)}
        data-testid="template-select"
      >
        {children}
      </select>
    </div>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => 
    <span data-testid="badge">{children}</span>,
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children }: { children: React.ReactNode }) => 
    <label>{children}</label>,
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  User: () => <div data-testid="user-icon" />,
  FileText: () => <div data-testid="file-text-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  RotateCcw: () => <div data-testid="rotate-ccw-icon" />,
  Lightbulb: () => <div data-testid="lightbulb-icon" />,
}));

const mockRequest: PendingAccessRequest = {
  id: 'req-001',
  productId: 'product-001',
  productName: 'Test Data Product',
  requesterId: 'user-001',
  requesterName: 'John Doe',
  requesterEmail: 'john.doe@company.com',
  bdac: 'ANALYTICS_TEAM',
  businessJustification: 'Need access for quarterly analysis',
  status: 'pending',
  createdAt: '2024-02-08T10:30:00Z',
  updatedAt: '2024-02-08T10:30:00Z',
  priority: 'high',
  daysWaiting: 3,
  escalated: false
};

const mockTemplates: CommentTemplate[] = [
  {
    id: 'template-001',
    category: 'security',
    title: 'Security Clearance Required',
    content: 'Access denied due to insufficient security clearance for {productName}.',
    variables: ['productName']
  },
  {
    id: 'template-002',
    category: 'justification',
    title: 'Insufficient Business Justification',
    content: 'The business justification provided is insufficient for {productName}. Please provide more details.',
    variables: ['productName']
  },
  {
    id: 'template-003',
    category: 'policy',
    title: 'Policy Violation',
    content: 'Request violates company policy for {productName}.',
    variables: ['productName']
  }
];

describe('DeclineCommentDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(
      <DeclineCommentDialog
        request={mockRequest}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        commentTemplates={mockTemplates}
      />
    );

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Decline Access Request')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Test Data Product')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <DeclineCommentDialog
        request={mockRequest}
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        commentTemplates={mockTemplates}
      />
    );

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('displays request details correctly', () => {
    render(
      <DeclineCommentDialog
        request={mockRequest}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        commentTemplates={mockTemplates}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('high priority')).toBeInTheDocument();
    expect(screen.getByText('Product: Test Data Product')).toBeInTheDocument();
    expect(screen.getByText('Waiting 3 days')).toBeInTheDocument();
    expect(screen.getByText('Need access for quarterly analysis')).toBeInTheDocument();
  });

  it('shows template selection when templates are provided', () => {
    render(
      <DeclineCommentDialog
        request={mockRequest}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        commentTemplates={mockTemplates}
      />
    );

    expect(screen.getByText('Use a Template')).toBeInTheDocument();
    expect(screen.getByTestId('template-select')).toBeInTheDocument();
  });

  it('populates comment field when template is selected', async () => {
    const user = userEvent.setup();
    
    render(
      <DeclineCommentDialog
        request={mockRequest}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        commentTemplates={mockTemplates}
      />
    );

    const select = screen.getByTestId('template-select');
    await user.selectOptions(select, 'template-001');

    const textarea = screen.getByTestId('comment-textarea');
    expect(textarea).toHaveValue('Access denied due to insufficient security clearance for Test Data Product.');
  });

  it('filters templates by category', async () => {
    const user = userEvent.setup();
    
    render(
      <DeclineCommentDialog
        request={mockRequest}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        commentTemplates={mockTemplates}
      />
    );

    // Check that category filter is present
    expect(screen.getByText('Category:')).toBeInTheDocument();
  });

  it('requires comment before submission', async () => {
    const user = userEvent.setup();
    
    render(
      <DeclineCommentDialog
        request={mockRequest}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        commentTemplates={mockTemplates}
      />
    );

    const submitButton = screen.getByText('Decline Request');
    expect(submitButton).toBeDisabled();

    // Add comment
    const textarea = screen.getByTestId('comment-textarea');
    await user.type(textarea, 'This is a decline reason');

    expect(submitButton).not.toBeDisabled();
  });

  it('calls onConfirm with comment when submitted', async () => {
    const user = userEvent.setup();
    
    render(
      <DeclineCommentDialog
        request={mockRequest}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        commentTemplates={mockTemplates}
      />
    );

    const textarea = screen.getByTestId('comment-textarea');
    await user.type(textarea, 'This is a decline reason');

    const submitButton = screen.getByText('Decline Request');
    await user.click(submitButton);

    expect(mockOnConfirm).toHaveBeenCalledWith('This is a decline reason');
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <DeclineCommentDialog
        request={mockRequest}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        commentTemplates={mockTemplates}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows character count for comment', async () => {
    const user = userEvent.setup();
    
    render(
      <DeclineCommentDialog
        request={mockRequest}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        commentTemplates={mockTemplates}
      />
    );

    expect(screen.getByText('0 characters')).toBeInTheDocument();

    const textarea = screen.getByTestId('comment-textarea');
    await user.type(textarea, 'Test');

    expect(screen.getByText('4 characters')).toBeInTheDocument();
  });

  it('shows template preview when preview button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <DeclineCommentDialog
        request={mockRequest}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        commentTemplates={mockTemplates}
      />
    );

    // Select a template first
    const select = screen.getByTestId('template-select');
    await user.selectOptions(select, 'template-001');

    // Click show preview button
    const previewButton = screen.getByText('Show Preview');
    await user.click(previewButton);

    expect(screen.getByText('Template Preview:')).toBeInTheDocument();
    expect(screen.getByText('Access denied due to insufficient security clearance for Test Data Product.')).toBeInTheDocument();
  });

  it('resets comment to template when reset button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <DeclineCommentDialog
        request={mockRequest}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        commentTemplates={mockTemplates}
      />
    );

    // Select template and modify comment
    const select = screen.getByTestId('template-select');
    await user.selectOptions(select, 'template-001');

    const textarea = screen.getByTestId('comment-textarea');
    await user.clear(textarea);
    await user.type(textarea, 'Modified comment');

    // Reset to template
    const resetButton = screen.getByText('Reset to Template');
    await user.click(resetButton);

    expect(textarea).toHaveValue('Access denied due to insufficient security clearance for Test Data Product.');
  });

  it('handles loading state correctly', () => {
    render(
      <DeclineCommentDialog
        request={mockRequest}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        commentTemplates={mockTemplates}
        loading={true}
      />
    );

    const submitButton = screen.getByText('Decline Request');
    const cancelButton = screen.getByText('Cancel');
    
    expect(submitButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('shows variable substitution information', () => {
    render(
      <DeclineCommentDialog
        request={mockRequest}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        commentTemplates={mockTemplates}
      />
    );

    // Select a template to show variable info
    const select = screen.getByTestId('template-select');
    fireEvent.change(select, { target: { value: 'template-001' } });

    expect(screen.getByText('Available Variables:')).toBeInTheDocument();
  });
});