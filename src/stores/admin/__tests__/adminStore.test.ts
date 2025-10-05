import { renderHook, act } from '@testing-library/react'
import { useAdminStore } from '../adminStore'

describe('AdminStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAdminStore.setState({
      pendingRequests: [],
      currentAccess: [],
      commentTemplates: [],
      revocationNotices: [],
      loading: false,
      error: null
    })
  })

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useAdminStore())
    
    expect(result.current.pendingRequests).toEqual([])
    expect(result.current.currentAccess).toEqual([])
    expect(result.current.commentTemplates).toEqual([])
    expect(result.current.revocationNotices).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should fetch pending requests', async () => {
    const { result } = renderHook(() => useAdminStore())
    
    await act(async () => {
      await result.current.fetchPendingRequests()
    })
    
    expect(result.current.pendingRequests).toHaveLength(3)
    expect(result.current.pendingRequests[0]).toMatchObject({
      id: 'req-001',
      productName: 'Credit Card Transactions ETL',
      requesterName: 'João Silva',
      priority: 'high',
      daysWaiting: 3
    })
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should fetch current access', async () => {
    const { result } = renderHook(() => useAdminStore())
    
    await act(async () => {
      await result.current.fetchCurrentAccess()
    })
    
    expect(result.current.currentAccess).toHaveLength(3)
    expect(result.current.currentAccess[0]).toMatchObject({
      id: 'access-001',
      userName: 'Ana Costa',
      productName: 'Credit Card Transactions ETL',
      accessLevel: 'read',
      status: 'active'
    })
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should load comment templates', async () => {
    const { result } = renderHook(() => useAdminStore())
    
    await act(async () => {
      await result.current.loadCommentTemplates()
    })
    
    expect(result.current.commentTemplates).toHaveLength(5)
    expect(result.current.commentTemplates[0]).toMatchObject({
      id: 'template-001',
      category: 'security',
      title: 'Security Clearance Required'
    })
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should approve request and move to current access', async () => {
    const { result } = renderHook(() => useAdminStore())
    
    // First fetch pending requests
    await act(async () => {
      await result.current.fetchPendingRequests()
    })
    
    const initialPendingCount = result.current.pendingRequests.length
    const initialCurrentCount = result.current.currentAccess.length
    
    // Approve a request
    await act(async () => {
      await result.current.approveRequest('req-001', 'Approved for business needs')
    })
    
    expect(result.current.pendingRequests).toHaveLength(initialPendingCount - 1)
    expect(result.current.currentAccess).toHaveLength(initialCurrentCount + 1)
    
    const newAccess = result.current.currentAccess.find(access => 
      access.userName === 'João Silva'
    )
    expect(newAccess).toBeDefined()
    expect(newAccess?.status).toBe('active')
    expect(newAccess?.accessLevel).toBe('read')
  })

  it('should decline request and remove from pending', async () => {
    const { result } = renderHook(() => useAdminStore())
    
    // First fetch pending requests
    await act(async () => {
      await result.current.fetchPendingRequests()
    })
    
    const initialCount = result.current.pendingRequests.length
    
    // Decline a request
    await act(async () => {
      await result.current.declineRequest('req-002', 'Insufficient justification')
    })
    
    expect(result.current.pendingRequests).toHaveLength(initialCount - 1)
    expect(result.current.pendingRequests.find(req => req.id === 'req-002')).toBeUndefined()
  })

  it('should renew access and extend expiration', async () => {
    const { result } = renderHook(() => useAdminStore())
    
    // First fetch current access
    await act(async () => {
      await result.current.fetchCurrentAccess()
    })
    
    const originalAccess = result.current.currentAccess.find(access => access.id === 'access-002')
    const originalExpiration = originalAccess?.expiresAt
    
    // Renew access
    await act(async () => {
      await result.current.renewAccess('access-002')
    })
    
    const renewedAccess = result.current.currentAccess.find(access => access.id === 'access-002')
    expect(renewedAccess?.expiresAt).not.toBe(originalExpiration)
    expect(renewedAccess?.status).toBe('active')
    expect(renewedAccess?.revocationScheduledAt).toBeUndefined()
  })

  it('should bulk renew multiple access permissions', async () => {
    const { result } = renderHook(() => useAdminStore())
    
    // First fetch current access
    await act(async () => {
      await result.current.fetchCurrentAccess()
    })
    
    const accessIds = ['access-001', 'access-002']
    const originalAccess = result.current.currentAccess.filter(access => accessIds.includes(access.id))
    const originalExpirations = originalAccess.map(access => access.expiresAt)
    
    // Bulk renew access
    await act(async () => {
      await result.current.bulkRenewAccess(accessIds)
    })
    
    const renewedAccess = result.current.currentAccess.filter(access => accessIds.includes(access.id))
    
    // All renewed access should have new expiration dates
    renewedAccess.forEach((access, index) => {
      expect(access.expiresAt).not.toBe(originalExpirations[index])
      expect(access.status).toBe('active')
      expect(access.revocationScheduledAt).toBeUndefined()
    })
    
    // Should have removed any revocation notices for these access permissions
    const remainingNotices = result.current.revocationNotices.filter(notice => 
      accessIds.includes(notice.accessId)
    )
    expect(remainingNotices).toHaveLength(0)
  })

  it('should bulk renew access with scheduled revocations', async () => {
    const { result } = renderHook(() => useAdminStore())
    
    // First fetch current access and schedule a revocation
    await act(async () => {
      await result.current.fetchCurrentAccess()
      await result.current.scheduleRevocation('access-001')
    })
    
    // Verify revocation was scheduled
    const scheduledAccess = result.current.currentAccess.find(access => access.id === 'access-001')
    expect(scheduledAccess?.status).toBe('scheduled_for_revocation')
    expect(result.current.revocationNotices).toHaveLength(1)
    
    // Bulk renew the scheduled access
    await act(async () => {
      await result.current.bulkRenewAccess(['access-001'])
    })
    
    // Should cancel the revocation and make it active
    const renewedAccess = result.current.currentAccess.find(access => access.id === 'access-001')
    expect(renewedAccess?.status).toBe('active')
    expect(renewedAccess?.revocationScheduledAt).toBeUndefined()
    expect(result.current.revocationNotices).toHaveLength(0)
  })

  it('should schedule revocation with notification', async () => {
    const { result } = renderHook(() => useAdminStore())
    
    // First fetch current access
    await act(async () => {
      await result.current.fetchCurrentAccess()
    })
    
    // Schedule revocation
    await act(async () => {
      await result.current.scheduleRevocation('access-001')
    })
    
    const access = result.current.currentAccess.find(access => access.id === 'access-001')
    expect(access?.status).toBe('scheduled_for_revocation')
    expect(access?.revocationScheduledAt).toBeDefined()
    expect(result.current.revocationNotices).toHaveLength(1)
    
    const notice = result.current.revocationNotices[0]
    expect(notice.accessId).toBe('access-001')
    expect(notice.userId).toBe('user-004')
  })

  it('should force revocation and remove access immediately', async () => {
    const { result } = renderHook(() => useAdminStore())
    
    // First fetch current access
    await act(async () => {
      await result.current.fetchCurrentAccess()
    })
    
    const initialCount = result.current.currentAccess.length
    
    // Force revocation
    await act(async () => {
      await result.current.forceRevocation('access-001')
    })
    
    expect(result.current.currentAccess).toHaveLength(initialCount - 1)
    expect(result.current.currentAccess.find(access => access.id === 'access-001')).toBeUndefined()
  })

  it('should clear error state', () => {
    const { result } = renderHook(() => useAdminStore())
    
    // Set an error
    act(() => {
      useAdminStore.setState({ error: 'Test error' })
    })
    
    expect(result.current.error).toBe('Test error')
    
    // Clear error
    act(() => {
      result.current.clearError()
    })
    
    expect(result.current.error).toBe(null)
  })

  it('should handle loading states correctly', async () => {
    const { result } = renderHook(() => useAdminStore())
    
    expect(result.current.loading).toBe(false)
    
    // Start async operation
    const fetchPromise = act(async () => {
      await result.current.fetchPendingRequests()
    })
    
    // Should be loading during async operation
    expect(result.current.loading).toBe(true)
    
    await fetchPromise
    
    // Should not be loading after completion
    expect(result.current.loading).toBe(false)
  })

  describe('Comment Template Management', () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useAdminStore())
      await act(async () => {
        await result.current.loadCommentTemplates()
      })
    })

    it('should get templates by category', () => {
      const { result } = renderHook(() => useAdminStore())
      
      const securityTemplates = result.current.getTemplatesByCategory('security')
      const policyTemplates = result.current.getTemplatesByCategory('policy')
      
      expect(securityTemplates).toHaveLength(3)
      expect(policyTemplates).toHaveLength(3)
      expect(securityTemplates.every(t => t.category === 'security')).toBe(true)
      expect(policyTemplates.every(t => t.category === 'policy')).toBe(true)
    })

    it('should search comment templates', () => {
      const { result } = renderHook(() => useAdminStore())
      
      const securityResults = result.current.searchCommentTemplates('security')
      const policyResults = result.current.searchCommentTemplates('policy')
      const noResults = result.current.searchCommentTemplates('nonexistent')
      
      expect(securityResults.length).toBeGreaterThan(0)
      expect(policyResults.length).toBeGreaterThan(0)
      expect(noResults).toHaveLength(0)
    })

    it('should get template suggestions based on context', () => {
      const { result } = renderHook(() => useAdminStore())
      
      const suggestions = result.current.getTemplateSuggestions({
        productName: 'Sensitive Customer Data',
        businessJustification: 'Need data for analysis'
      })
      
      expect(suggestions).toHaveLength(5)
      expect(suggestions[0].category).toBe('security') // Should boost security templates
    })

    it('should add new comment template', async () => {
      const { result } = renderHook(() => useAdminStore())
      
      const initialCount = result.current.commentTemplates.length
      
      const newTemplate = {
        category: 'policy' as const,
        title: 'Test Template',
        content: 'This is a test template for {productName}.',
        variables: ['productName']
      }
      
      await act(async () => {
        await result.current.addCommentTemplate(newTemplate)
      })
      
      expect(result.current.commentTemplates).toHaveLength(initialCount + 1)
      
      const addedTemplate = result.current.commentTemplates.find(t => t.title === 'Test Template')
      expect(addedTemplate).toBeDefined()
      expect(addedTemplate?.category).toBe('policy')
      expect(addedTemplate?.id).toBeDefined()
    })

    it('should update existing comment template', async () => {
      const { result } = renderHook(() => useAdminStore())
      
      const templateId = result.current.commentTemplates[0].id
      const updates = {
        title: 'Updated Title',
        content: 'Updated content for {productName}.'
      }
      
      await act(async () => {
        await result.current.updateCommentTemplate(templateId, updates)
      })
      
      const updatedTemplate = result.current.commentTemplates.find(t => t.id === templateId)
      expect(updatedTemplate?.title).toBe('Updated Title')
      expect(updatedTemplate?.content).toBe('Updated content for {productName}.')
    })

    it('should delete comment template', async () => {
      const { result } = renderHook(() => useAdminStore())
      
      const initialCount = result.current.commentTemplates.length
      const templateId = result.current.commentTemplates[0].id
      
      await act(async () => {
        await result.current.deleteCommentTemplate(templateId)
      })
      
      expect(result.current.commentTemplates).toHaveLength(initialCount - 1)
      expect(result.current.commentTemplates.find(t => t.id === templateId)).toBeUndefined()
    })
  })
})