import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, User, FileText } from 'lucide-react';
import type { PendingAccessRequest, CommentTemplate } from '@/types';

interface ApprovalActionDialogProps {
  request: PendingAccessRequest | null;
  action: 'approve' | 'decline';
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment?: string) => void;
  commentTemplates?: CommentTemplate[];
  loading?: boolean;
}

const ApprovalActionDialog: React.FC<ApprovalActionDialogProps> = ({
  request,
  action,
  isOpen,
  onClose,
  onConfirm,
  commentTemplates = [],
  loading = false
}) => {
  const [comment, setComment] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when dialog opens/closes or action changes
  useEffect(() => {
    if (isOpen) {
      setComment('');
      setSelectedTemplate('');
      setIsSubmitting(false);
    }
  }, [isOpen, action, request?.id]);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = commentTemplates.find(t => t.id === templateId);
    if (template) {
      // Replace template variables with actual values
      let templateContent = template.content;
      if (request) {
        templateContent = templateContent
          .replace(/\{productName\}/g, request.productName)
          .replace(/\{requesterName\}/g, request.requesterName)
          .replace(/\{businessJustification\}/g, request.businessJustification || 'Not provided');
      }
      setComment(templateContent);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (action === 'decline' && !comment.trim()) {
      return; // Don't submit if decline without comment
    }

    setIsSubmitting(true);
    try {
      await onConfirm(comment.trim() || undefined);
      onClose();
    } catch (error) {
      console.error('Failed to submit approval action:', error);
      // Don't close dialog on error - let parent handle error state
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get dialog configuration based on action
  const getDialogConfig = () => {
    if (action === 'approve') {
      return {
        title: 'Approve Access Request',
        description: 'This will grant access to the requested data product with a one-year expiration date.',
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        confirmButtonText: 'Approve Request',
        confirmButtonClass: 'bg-green-600 hover:bg-green-700 text-white',
        showCommentTemplates: false,
        commentRequired: false,
        commentLabel: 'Optional approval comment',
        commentPlaceholder: 'Add any notes about this approval (optional)...'
      };
    } else {
      return {
        title: 'Decline Access Request',
        description: 'This will reject the access request and notify the requester with your decline reason.',
        icon: <AlertCircle className="h-5 w-5 text-red-600" />,
        confirmButtonText: 'Decline Request',
        confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white',
        showCommentTemplates: true,
        commentRequired: true,
        commentLabel: 'Decline reason (required)',
        commentPlaceholder: 'Provide a reason for declining this request...'
      };
    }
  };

  const config = getDialogConfig();

  // Filter templates for decline action
  const availableTemplates = action === 'decline' 
    ? commentTemplates.filter(template => 
        ['security', 'policy', 'justification', 'technical'].includes(template.category)
      )
    : [];

  if (!request) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {config.icon}
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Request Summary */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{request.requesterName}</span>
                <Badge variant="outline" className="text-xs">
                  {request.priority} priority
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Product: {request.productName}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Waiting {request.daysWaiting} day{request.daysWaiting === 1 ? '' : 's'}</span>
              </div>
              
              {request.businessJustification && (
                <div className="text-sm">
                  <span className="font-medium">Business Justification:</span>
                  <p className="text-muted-foreground mt-1">
                    {request.businessJustification}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Template Selection for Decline */}
          {config.showCommentTemplates && availableTemplates.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="template-select">Use a template (optional)</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger id="template-select">
                  <SelectValue placeholder="Select a decline reason template..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                        <span>{template.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Comment Input */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="flex items-center gap-1">
              {config.commentLabel}
              {config.commentRequired && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={config.commentPlaceholder}
              rows={4}
              className="resize-none"
            />
            {config.commentRequired && !comment.trim() && (
              <p className="text-sm text-red-600">
                A decline reason is required.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting || loading}
          >
            Cancel
          </Button>
          <Button
            className={config.confirmButtonClass}
            onClick={handleSubmit}
            disabled={
              isSubmitting || 
              loading || 
              (config.commentRequired && !comment.trim())
            }
          >
            {isSubmitting ? 'Processing...' : config.confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalActionDialog;
export { ApprovalActionDialog };