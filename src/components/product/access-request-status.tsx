import { useEffect } from 'react'
import { Badge, Button } from '@/components/ui'
import { useAccessRequestStore } from '@/stores/access'
import { CheckCircle, XCircle, Clock, User, UserCheck } from 'lucide-react'
import type { DataProduct, AccessRequest, AccessRequestStatus } from '@/types'

interface AccessRequestStatusProps {
  product: DataProduct
}

function getStatusIcon(status: AccessRequestStatus) {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-600" />
    case 'approved_by_access_group':
    case 'approved_by_product_owner':
      return <UserCheck className="h-4 w-4 text-blue-600" />
    case 'pending':
    default:
      return <Clock className="h-4 w-4 text-yellow-600" />
  }
}

function getStatusBadgeVariant(status: AccessRequestStatus) {
  switch (status) {
    case 'approved':
      return 'default' // Green
    case 'rejected':
      return 'destructive' // Red
    case 'approved_by_access_group':
    case 'approved_by_product_owner':
      return 'secondary' // Blue
    case 'pending':
    default:
      return 'outline' // Gray
  }
}

function getStatusLabel(status: AccessRequestStatus) {
  switch (status) {
    case 'approved':
      return 'Approved'
    case 'rejected':
      return 'Rejected'
    case 'approved_by_access_group':
      return 'Approved by Access Group'
    case 'approved_by_product_owner':
      return 'Approved by Product Owner'
    case 'pending':
    default:
      return 'Pending'
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function AccessRequestStatus({ product }: AccessRequestStatusProps) {
  const { requests, fetchAccessRequestsByProduct, loading, approveByAccessGroup, approveByProductOwner, rejectAccessRequest } = useAccessRequestStore()

  useEffect(() => {
    fetchAccessRequestsByProduct(product.id)
  }, [product.id, fetchAccessRequestsByProduct])

  // For demo purposes, we'll show the current user's requests for this product
  const userRequests = requests.filter(req => req.productId === product.id)

  const handleApproveAsAccessGroup = async (request: AccessRequest) => {
    await approveByAccessGroup(request.id, {
      approvedBy: 'current-access-group-owner', // In real app, from auth context
      approvedAt: new Date().toISOString(),
      comments: 'Approved for business use'
    })
  }

  const handleApproveAsProductOwner = async (request: AccessRequest) => {
    await approveByProductOwner(request.id, {
      approvedBy: 'current-product-owner', // In real app, from auth context
      approvedAt: new Date().toISOString(),
      comments: 'Approved by product owner'
    })
  }

  const handleReject = async (request: AccessRequest) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (reason) {
      await rejectAccessRequest(request.id, reason)
    }
  }

  if (loading) {
    return (
      <div className="border rounded-lg p-4 bg-card">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Access Requests</h3>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted animate-pulse rounded" />
          <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
        </div>
      </div>
    )
  }

  if (userRequests.length === 0) {
    return (
      <div className="border rounded-lg p-4 bg-card">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Access Requests</h3>
        </div>
        <div className="text-center py-4">
          <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">No access requests found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center gap-2 mb-4">
        <User className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">Access Requests</h3>
      </div>
      
      <div className="space-y-4">
        {userRequests.map((request) => (
          <div key={request.id} className="border rounded-md p-3 bg-muted/30">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(request.status)}
                <Badge variant={getStatusBadgeVariant(request.status)} className="text-xs">
                  {getStatusLabel(request.status)}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDate(request.createdAt)}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Requester:</span> {request.requesterName}
              </div>
              <div>
                <span className="font-medium">BDAC:</span> {request.bdac}
              </div>
              <div>
                <span className="font-medium">Justification:</span>
                <p className="text-muted-foreground mt-1 text-xs">
                  {request.businessJustification}
                </p>
              </div>
            </div>

            {/* Approval Status */}
            {(request.accessGroupOwnerApproval || request.productOwnerApproval) && (
              <div className="mt-3 pt-3 border-t space-y-2">
                {request.accessGroupOwnerApproval && (
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>Access Group approved on {formatDate(request.accessGroupOwnerApproval.approvedAt)}</span>
                  </div>
                )}
                {request.productOwnerApproval && (
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>Product Owner approved on {formatDate(request.productOwnerApproval.approvedAt)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Rejection Reason */}
            {request.status === 'rejected' && request.rejectionReason && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center gap-2 text-xs text-red-600">
                  <XCircle className="h-3 w-3" />
                  <span className="font-medium">Rejected:</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {request.rejectionReason}
                </p>
              </div>
            )}

            {/* Action Buttons for Approvers (Demo purposes) */}
            {request.status === 'pending' && (
              <div className="mt-3 pt-3 border-t flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApproveAsAccessGroup(request)}
                  className="text-xs"
                >
                  Approve as Access Group
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApproveAsProductOwner(request)}
                  className="text-xs"
                >
                  Approve as Product Owner
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(request)}
                  className="text-xs"
                >
                  Reject
                </Button>
              </div>
            )}

            {/* Pending approval actions */}
            {request.status === 'approved_by_access_group' && !request.productOwnerApproval && (
              <div className="mt-3 pt-3 border-t flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApproveAsProductOwner(request)}
                  className="text-xs"
                >
                  Approve as Product Owner
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(request)}
                  className="text-xs"
                >
                  Reject
                </Button>
              </div>
            )}

            {request.status === 'approved_by_product_owner' && !request.accessGroupOwnerApproval && (
              <div className="mt-3 pt-3 border-t flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApproveAsAccessGroup(request)}
                  className="text-xs"
                >
                  Approve as Access Group
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(request)}
                  className="text-xs"
                >
                  Reject
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}