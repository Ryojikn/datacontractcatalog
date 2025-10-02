import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  Button,
  Input,
  Textarea,
  Label
} from '@/components/ui'
import { useAccessRequestStore } from '@/stores/access'
import type { DataProduct } from '@/types'

interface RequestAccessModalProps {
  product: DataProduct
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormData {
  bdac: string
  businessJustification: string
}

interface FormErrors {
  bdac?: string
  businessJustification?: string
}

export function RequestAccessModal({ product, open, onOpenChange }: RequestAccessModalProps) {
  const { submitAccessRequest, loading, error } = useAccessRequestStore()
  const [formData, setFormData] = useState<FormData>({
    bdac: '',
    businessJustification: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.bdac.trim()) {
      newErrors.bdac = 'BDAC (Access Group) is required'
    }

    if (!formData.businessJustification.trim()) {
      newErrors.businessJustification = 'Business justification is required'
    } else if (formData.businessJustification.trim().length < 10) {
      newErrors.businessJustification = 'Business justification must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await submitAccessRequest({
        productId: product.id,
        productName: product.name,
        requesterId: 'current-user-id', // In a real app, this would come from auth context
        requesterName: 'Current User', // In a real app, this would come from auth context
        requesterEmail: 'user@company.com', // In a real app, this would come from auth context
        bdac: formData.bdac,
        businessJustification: formData.businessJustification
      })

      // Reset form and close modal on success
      setFormData({ bdac: '', businessJustification: '' })
      setErrors({})
      onOpenChange(false)
      
      // Show success message
      alert('Access request submitted successfully! You will be notified when approved.')
      
    } catch (error) {
      // Error is handled by the store
      console.error('Failed to submit access request:', error)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({ bdac: '', businessJustification: '' })
      setErrors({})
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Access to Data Product</DialogTitle>
          <DialogDescription>
            Request access to <strong>{product.name}</strong>. Your request will be sent to the Access Group Owner and Data Product Owner for approval.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bdac">
              BDAC (Access Group) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="bdac"
              placeholder="Enter your BDAC or Access Group"
              value={formData.bdac}
              onChange={(e) => handleInputChange('bdac', e.target.value)}
              disabled={loading}
              className={errors.bdac ? 'border-destructive' : ''}
              aria-describedby={errors.bdac ? 'bdac-error' : undefined}
            />
            {errors.bdac && (
              <p id="bdac-error" className="text-sm text-destructive">
                {errors.bdac}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessJustification">
              Business Justification <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="businessJustification"
              placeholder="Explain why you need access to this data product and how it will be used..."
              value={formData.businessJustification}
              onChange={(e) => handleInputChange('businessJustification', e.target.value)}
              disabled={loading}
              className={errors.businessJustification ? 'border-destructive' : ''}
              rows={4}
              aria-describedby={errors.businessJustification ? 'justification-error' : undefined}
            />
            {errors.businessJustification && (
              <p id="justification-error" className="text-sm text-destructive">
                {errors.businessJustification}
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}