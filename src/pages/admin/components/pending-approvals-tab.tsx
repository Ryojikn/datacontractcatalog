import React, { useState } from 'react';
import { useAdminStore } from '@/stores/admin';
import { PendingApprovalsList } from './pending-approvals-list';
import { ApprovalActionDialog } from './approval-action-dialog';
import { DeclineCommentDialog } from './decline-comment-dialog';
import type { PendingAccessRequest } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface PendingApprovalsTabProps {
  className?: string;
}

const PendingApprovalsTab: React.FC<PendingApprovalsTabProps> = ({ className }) => {
  const { 
    pendingRequests, 
    loading, 
    error, 
    approveRequest, 
    declineRequest,
    commentTemplates,
    loadCommentTemplates
  } = useAdminStore();
  
  const { toast } = useToast();
  
  // Dialog state
  const [approveDialogState, setApproveDialogState] = useState<{
    isOpen: boolean;
    request: PendingAccessRequest | null;
  }>({
    isOpen: false,
    request: null
  });

  const [declineDialogState, setDeclineDialogState] = useState<{
    isOpen: boolean;
    request: PendingAccessRequest | null;
  }>({
    isOpen: false,
    request: null
  });

  // Optimistic update state for rollback capability
  const [optimisticUpdates, setOptimisticUpdates] = useState<{
    [requestId: string]: {
      originalRequest: PendingAccessRequest;
      action: 'approve' | 'decline';
      timestamp: number;
    }
  }>({});

  // Load comment templates when component mounts
  React.useEffect(() => {
    if (commentTemplates.length === 0) {
      loadCommentTemplates();
    }
  }, [commentTemplates.length, loadCommentTemplates]);

  const handleApprove = (requestId: string) => {
    const request = pendingRequests.find(req => req.id === requestId);
    if (!request) return;

    setApproveDialogState({
      isOpen: true,
      request
    });
  };

  const handleDecline = (requestId: string) => {
    const request = pendingRequests.find(req => req.id === requestId);
    if (!request) return;

    setDeclineDialogState({
      isOpen: true,
      request
    });
  };

  const handleApproveDialogClose = () => {
    setApproveDialogState({
      isOpen: false,
      request: null
    });
  };

  const handleDeclineDialogClose = () => {
    setDeclineDialogState({
      isOpen: false,
      request: null
    });
  };

  const handleConfirmApprove = async (comment?: string) => {
    if (!approveDialogState.request) return;

    const request = approveDialogState.request;
    const requestId = request.id;

    // Store original request for potential rollback
    setOptimisticUpdates(prev => ({
      ...prev,
      [requestId]: {
        originalRequest: request,
        action: 'approve',
        timestamp: Date.now()
      }
    }));

    try {
      await approveRequest(requestId, comment);
      
      toast({
        title: 'Request Approved',
        description: `Access granted to ${request.requesterName} for ${request.productName}`,
      });

      // Clear optimistic update on success
      setOptimisticUpdates(prev => {
        const { [requestId]: removed, ...rest } = prev;
        return rest;
      });

    } catch (error) {
      // Rollback optimistic update on error
      console.error('Failed to approve request:', error);
      
      setOptimisticUpdates(prev => {
        const { [requestId]: removed, ...rest } = prev;
        return rest;
      });

      toast({
        title: 'Failed to Approve Request',
        description: error instanceof Error ? error.message : 'An error occurred while approving the request',
        variant: 'destructive',
      });

      // Re-throw to prevent dialog from closing
      throw error;
    }
  };

  const handleConfirmDecline = async (comment: string) => {
    if (!declineDialogState.request) return;

    const request = declineDialogState.request;
    const requestId = request.id;

    // Store original request for potential rollback
    setOptimisticUpdates(prev => ({
      ...prev,
      [requestId]: {
        originalRequest: request,
        action: 'decline',
        timestamp: Date.now()
      }
    }));

    try {
      await declineRequest(requestId, comment);
      
      toast({
        title: 'Request Declined',
        description: `Access request from ${request.requesterName} has been declined`,
      });

      // Clear optimistic update on success
      setOptimisticUpdates(prev => {
        const { [requestId]: removed, ...rest } = prev;
        return rest;
      });

    } catch (error) {
      // Rollback optimistic update on error
      console.error('Failed to decline request:', error);
      
      setOptimisticUpdates(prev => {
        const { [requestId]: removed, ...rest } = prev;
        return rest;
      });

      toast({
        title: 'Failed to Decline Request',
        description: error instanceof Error ? error.message : 'An error occurred while declining the request',
        variant: 'destructive',
      });

      // Re-throw to prevent dialog from closing
      throw error;
    }
  };

  // Filter out optimistically updated requests from the display
  const displayRequests = pendingRequests.filter(request => 
    !optimisticUpdates[request.id]
  );

  return (
    <>
      <PendingApprovalsList
        requests={displayRequests}
        loading={loading}
        error={error}
        onApprove={handleApprove}
        onDecline={handleDecline}
        className={className}
      />
      
      <ApprovalActionDialog
        request={approveDialogState.request}
        action="approve"
        isOpen={approveDialogState.isOpen}
        onClose={handleApproveDialogClose}
        onConfirm={handleConfirmApprove}
        commentTemplates={commentTemplates}
        loading={loading}
      />
      
      <DeclineCommentDialog
        request={declineDialogState.request}
        isOpen={declineDialogState.isOpen}
        onClose={handleDeclineDialogClose}
        onConfirm={handleConfirmDecline}
        commentTemplates={commentTemplates}
        loading={loading}
      />
    </>
  );
};

export default PendingApprovalsTab;
export { PendingApprovalsTab };