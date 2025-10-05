import React, { useState, useEffect, useMemo } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, 
  Clock, 
  User, 
  FileText, 
  Eye, 
  RotateCcw,
  Lightbulb
} from 'lucide-react';
import type { PendingAccessRequest, CommentTemplate, CommentTemplateCategory } from '@/types';
import { 
  substituteTemplateVariables, 
  previewTemplate, 
  getCommonVariables,
  validateTemplateVariables 
} from '@/lib/commentTemplateUtils';

interface DeclineCommentDialogProps {
  request: PendingAccessRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
  commentTemplates?: CommentTemplate[];
  loading?: boolean;
}

const DeclineCommentDialog: React.FC<DeclineCommentDialogProps> = ({
  request,
  isOpen,
  onClose,
  onConfirm,
  commentTemplates = [],
  loading = false
}) => {
  const [comment, setComment] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CommentTemplateCategory | 'all'>('all');
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when dialog opens/closes or request changes
  useEffect(() => {
    if (isOpen) {
      setComment('');
      setSelectedTemplate('');
      setSelectedCategory('all');
      setShowPreview(false);
      setIsSubmitting(false);
    }
  }, [isOpen, request?.id]);

  // Get common variables for template substitution
  const templateVariables = useMemo(() => {
    if (!request) return {};
    
    return getCommonVariables({
      productName: request.productName,
      requesterName: request.requesterName,
      requesterEmail: request.requesterEmail,
      bdac: request.bdac,
      businessJustification: request.businessJustification
    });
  }, [request]);

  // Filter templates by category
  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'all') {
      return commentTemplates;
    }
    return commentTemplates.filter(template => template.category === selectedCategory);
  }, [commentTemplates, selectedCategory]);

  // Get available categories
  const availableCategories = useMemo(() => {
    const categories = new Set<CommentTemplateCategory>();
    commentTemplates.forEach(template => categories.add(template.category));
    return Array.from(categories).sort();
  }, [commentTemplates]);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = commentTemplates.find(t => t.id === templateId);
    
    if (template && request) {
      const substitutedContent = substituteTemplateVariables(template, templateVariables);
      setComment(substitutedContent);
      setShowPreview(false); // Hide preview when template is applied
    }
  };

  // Handle template preview
  const getTemplatePreview = (template: CommentTemplate): string => {
    if (!request) return template.content;
    return previewTemplate(template, templateVariables);
  };

  // Reset comment to original template
  const handleResetToTemplate = () => {
    if (selectedTemplate) {
      const template = commentTemplates.find(t => t.id === selectedTemplate);
      if (template && request) {
        const substitutedContent = substituteTemplateVariables(template, templateVariables);
        setComment(substitutedContent);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!comment.trim()) {
      return; // Don't submit without comment
    }

    setIsSubmitting(true);
    try {
      await onConfirm(comment.trim());
      onClose();
    } catch (error) {
      console.error('Failed to decline request:', error);
      // Don't close dialog on error - let parent handle error state
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get template validation info
  const getTemplateValidation = (template: CommentTemplate) => {
    if (!request) return { isValid: true, missingVariables: [] };
    return validateTemplateVariables(template, templateVariables);
  };

  if (!request) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Decline Access Request
          </DialogTitle>
          <DialogDescription>
            Provide a detailed reason for declining this access request. The requester will be notified with your explanation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
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
                  <p className="text-muted-foreground mt-1 text-xs bg-background p-2 rounded border">
                    {request.businessJustification}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Template Selection Section */}
          {commentTemplates.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-600" />
                <Label className="text-base font-medium">Use a Template</Label>
              </div>
              
              {/* Category Filter */}
              <div className="flex items-center gap-4">
                <Label htmlFor="category-select" className="text-sm">Category:</Label>
                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as CommentTemplateCategory | 'all')}>
                  <SelectTrigger id="category-select" className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {availableCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {category}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Template Selection */}
              <div className="space-y-2">
                <Label htmlFor="template-select">Select Template:</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger id="template-select">
                    <SelectValue placeholder="Choose a decline reason template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTemplates.map((template) => {
                      const validation = getTemplateValidation(template);
                      return (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center gap-2 w-full">
                            <Badge variant="outline" className="text-xs capitalize">
                              {template.category}
                            </Badge>
                            <span className="flex-1">{template.title}</span>
                            {!validation.isValid && (
                              <AlertCircle className="h-3 w-3 text-amber-500" />
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Template Preview */}
              {selectedTemplate && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      {showPreview ? 'Hide' : 'Show'} Preview
                    </Button>
                    {comment && selectedTemplate && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResetToTemplate}
                        className="flex items-center gap-1"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reset to Template
                      </Button>
                    )}
                  </div>
                  
                  {showPreview && (
                    <div className="border rounded-lg p-3 bg-muted/30">
                      <Label className="text-xs text-muted-foreground">Template Preview:</Label>
                      <p className="text-sm mt-1 whitespace-pre-wrap">
                        {(() => {
                          const template = commentTemplates.find(t => t.id === selectedTemplate);
                          return template ? getTemplatePreview(template) : '';
                        })()}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <Separator />
            </div>
          )}

          {/* Comment Input */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="flex items-center gap-1 text-base font-medium">
              Decline Reason
              <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Provide a detailed reason for declining this access request. Be specific about what the requester needs to address or why access cannot be granted..."
              rows={6}
              className="resize-none"
            />
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                {comment.length} characters
              </div>
              {!comment.trim() && (
                <p className="text-sm text-red-600">
                  A decline reason is required.
                </p>
              )}
            </div>
          </div>

          {/* Variable Substitution Info */}
          {selectedTemplate && (
            <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
              <div className="font-medium mb-1">Available Variables:</div>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(templateVariables).map(([key, value]) => (
                  <div key={key} className="flex gap-1">
                    <code className="bg-background px-1 rounded">{`{${key}}`}</code>
                    <span>→</span>
                    <span className="truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleSubmit}
            disabled={
              isSubmitting || 
              loading || 
              !comment.trim()
            }
          >
            {isSubmitting ? 'Declining...' : 'Decline Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeclineCommentDialog;
export { DeclineCommentDialog };