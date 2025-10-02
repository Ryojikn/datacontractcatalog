import { create } from 'zustand'
import type { AccessRequest, AccessRequestStatus, ApprovalInfo } from '@/types'

interface AccessRequestStore {
  requests: AccessRequest[]
  selectedRequest: AccessRequest | null
  loading: boolean
  error: string | null
  
  // Actions
  submitAccessRequest: (request: Omit<AccessRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>
  fetchAccessRequests: () => Promise<void>
  fetchAccessRequestsByProduct: (productId: string) => Promise<void>
  fetchAccessRequestsByUser: (userId: string) => Promise<void>
  approveByAccessGroup: (requestId: string, approval: ApprovalInfo) => Promise<void>
  approveByProductOwner: (requestId: string, approval: ApprovalInfo) => Promise<void>
  rejectAccessRequest: (requestId: string, reason: string) => Promise<void>
  selectRequest: (requestId: string) => void
  clearError: () => void
}

// Mock data for demonstration
const mockAccessRequests: AccessRequest[] = [
  {
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
    updatedAt: '2024-02-08T10:30:00Z'
  },
  {
    id: 'req-002',
    productId: 'product-002',
    productName: 'Customer Segmentation Data',
    requesterId: 'user-002',
    requesterName: 'Maria Santos',
    requesterEmail: 'maria.santos@company.com',
    bdac: 'MARKETING_TEAM',
    businessJustification: 'Required for customer segmentation analysis and targeted marketing campaigns.',
    status: 'approved_by_access_group',
    createdAt: '2024-02-07T14:15:00Z',
    updatedAt: '2024-02-08T09:20:00Z',
    accessGroupOwnerApproval: {
      approvedBy: 'access-owner-001',
      approvedAt: '2024-02-08T09:20:00Z',
      comments: 'Approved for marketing analysis purposes'
    }
  }
]

export const useAccessRequestStore = create<AccessRequestStore>((set, get) => ({
  requests: [],
  selectedRequest: null,
  loading: false,
  error: null,

  submitAccessRequest: async (requestData) => {
    set({ loading: true, error: null })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newRequest: AccessRequest = {
        ...requestData,
        id: `req-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      set(state => ({
        requests: [...state.requests, newRequest],
        loading: false
      }))
      
      // In a real implementation, this would trigger notifications
      console.log('Access request submitted:', newRequest)
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to submit access request',
        loading: false 
      })
    }
  },

  fetchAccessRequests: async () => {
    set({ loading: true, error: null })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      set({ 
        requests: mockAccessRequests,
        loading: false 
      })
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch access requests',
        loading: false 
      })
    }
  },

  fetchAccessRequestsByProduct: async (productId: string) => {
    set({ loading: true, error: null })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const productRequests = mockAccessRequests.filter(req => req.productId === productId)
      
      set({ 
        requests: productRequests,
        loading: false 
      })
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch product access requests',
        loading: false 
      })
    }
  },

  fetchAccessRequestsByUser: async (userId: string) => {
    set({ loading: true, error: null })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const userRequests = mockAccessRequests.filter(req => req.requesterId === userId)
      
      set({ 
        requests: userRequests,
        loading: false 
      })
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch user access requests',
        loading: false 
      })
    }
  },

  approveByAccessGroup: async (requestId: string, approval: ApprovalInfo) => {
    set({ loading: true, error: null })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      set(state => ({
        requests: state.requests.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                status: 'approved_by_access_group' as AccessRequestStatus,
                accessGroupOwnerApproval: approval,
                updatedAt: new Date().toISOString()
              }
            : req
        ),
        loading: false
      }))
      
      console.log('Access request approved by access group:', requestId)
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to approve access request',
        loading: false 
      })
    }
  },

  approveByProductOwner: async (requestId: string, approval: ApprovalInfo) => {
    set({ loading: true, error: null })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      set(state => ({
        requests: state.requests.map(req => {
          if (req.id === requestId) {
            const hasAccessGroupApproval = req.accessGroupOwnerApproval
            const newStatus: AccessRequestStatus = hasAccessGroupApproval ? 'approved' : 'approved_by_product_owner'
            
            return {
              ...req,
              status: newStatus,
              productOwnerApproval: approval,
              updatedAt: new Date().toISOString()
            }
          }
          return req
        }),
        loading: false
      }))
      
      console.log('Access request approved by product owner:', requestId)
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to approve access request',
        loading: false 
      })
    }
  },

  rejectAccessRequest: async (requestId: string, reason: string) => {
    set({ loading: true, error: null })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      set(state => ({
        requests: state.requests.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                status: 'rejected' as AccessRequestStatus,
                rejectionReason: reason,
                updatedAt: new Date().toISOString()
              }
            : req
        ),
        loading: false
      }))
      
      console.log('Access request rejected:', requestId, reason)
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to reject access request',
        loading: false 
      })
    }
  },

  selectRequest: (requestId: string) => {
    const request = get().requests.find(req => req.id === requestId)
    set({ selectedRequest: request || null })
  },

  clearError: () => {
    set({ error: null })
  }
}))