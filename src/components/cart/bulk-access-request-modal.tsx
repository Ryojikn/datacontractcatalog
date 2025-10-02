import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  Button,
  Textarea,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  Badge
} from '@/components/ui'
import { useCartStore } from '@/stores/cart'
import { useAccessRequestStore } from '@/stores/access'
import { useToast } from '@/hooks/use-toast'
import { ChevronRight, Users, User } from 'lucide-react'


interface BulkAccessRequestModalProps {
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
  selectedItems?: string
}

// Mock BDAC options
const BDAC_OPTIONS = [
  { value: 'bdac1', label: 'BDAC1 - Analytics Team' },
  { value: 'bdac2', label: 'BDAC2 - Data Science Team' },
  { value: 'bdac3', label: 'BDAC3 - Business Intelligence Team' }
]

// Mock data product owners
const getProductOwner = (productName: string): string => {
  const owners = [
    'João Silva - Data Product Owner',
    'Maria Santos - Senior Data Engineer', 
    'Pedro Costa - Data Platform Lead'
  ]
  // Simple hash to consistently assign owners
  const hash = productName.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  return owners[hash % owners.length]
}

export function BulkAccessRequestModal({ open, onOpenChange }: BulkAccessRequestModalProps) {
  const { getSelectedItems, clearCart } = useCartStore()
  const { submitAccessRequest, loading } = useAccessRequestStore()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState<'form' | 'preview'>('form')
  const [formData, setFormData] = useState<FormData>({
    bdac: '',
    businessJustification: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const selectedItems = getSelectedItems()

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.bdac) {
      newErrors.bdac = 'BDAC (Access Group) is required'
    }

    if (!formData.businessJustification.trim()) {
      newErrors.businessJustification = 'Business justification is required'
    } else if (formData.businessJustification.trim().length < 10) {
      newErrors.businessJustification = 'Business justification must be at least 10 characters'
    }

    if (selectedItems.length === 0) {
      newErrors.selectedItems = 'Please select at least one data product'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      setCurrentStep('preview')
    }
  }

  const handleBack = () => {
    setCurrentStep('form')
  }

  const handleSubmit = async () => {
    try {
      // Submit individual access requests for each selected product
      for (const item of selectedItems) {
        await submitAccessRequest({
          productId: item.productId,
          productName: item.productName,
          requesterId: 'current-user-id',
          requesterName: 'Current User',
          requesterEmail: 'user@company.com',
          bdac: formData.bdac,
          businessJustification: formData.businessJustification
        })
      }

      // Clear cart and close modal
      clearCart()
      setFormData({ bdac: '', businessJustification: '' })
      setErrors({})
      setCurrentStep('form')
      onOpenChange(false)
      
      // Show success toast
      toast({
        title: "Access Request Submitted",
        description: `Successfully submitted access request for ${selectedItems.length} data products. You will be notified when approved.`,
      })
      
    } catch (error) {
      console.error('Failed to submit bulk access request:', error)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({ bdac: '', businessJustification: '' })
      setErrors({})
      setCurrentStep('form')
      onOpenChange(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const selectedBdacOption = BDAC_OPTIONS.find(option => option.value === formData.bdac)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentStep === 'form' ? 'Bulk Access Request' : 'Review & Submit'}
            <Badge variant="secondary" className="ml-2">
              {selectedItems.length} products
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'form' 
              ? 'Request access to multiple data products at once'
              : 'Review the approval workflow and submit your request'
            }
          </DialogDescription>
        </DialogHeader>

        {currentStep === 'form' ? (
          <div className="space-y-6">
            {/* Selected Products */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Selected Data Products</Label>
              <div className="max-h-32 overflow-y-auto space-y-2 border rounded-md p-3 bg-muted/30">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <Checkbox checked disabled />
                    <span className="font-medium">{item.productName}</span>
                    {item.technology && (
                      <Badge variant="outline" className="text-xs">
                        {item.technology}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              {errors.selectedItems && (
                <p className="text-sm text-destructive">{errors.selectedItems}</p>
              )}
            </div>

            {/* BDAC Selection */}
            <div className="space-y-2">
              <Label htmlFor="bdac">
                BDAC (Access Group) <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.bdac} onValueChange={(value) => handleInputChange('bdac', value)}>
                <SelectTrigger className={errors.bdac ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select your BDAC or Access Group" />
                </SelectTrigger>
                <SelectContent>
                  {BDAC_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bdac && (
                <p className="text-sm text-destructive">{errors.bdac}</p>
              )}
            </div>

            {/* Business Justification */}
            <div className="space-y-2">
              <Label htmlFor="businessJustification">
                Business Justification <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="businessJustification"
                placeholder="Explain why you need access to these data products and how they will be used..."
                value={formData.businessJustification}
                onChange={(e) => handleInputChange('businessJustification', e.target.value)}
                disabled={loading}
                className={errors.businessJustification ? 'border-destructive' : ''}
                rows={4}
              />
              {errors.businessJustification && (
                <p className="text-sm text-destructive">{errors.businessJustification}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Approval Workflow Preview */}
            <div className="space-y-4">
              <h3 className="font-medium">Expected Approval Workflow</h3>
              
              {/* BDAC Owner Approval */}
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">BDAC Owner Approval</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedBdacOption?.label} - Access Group Owner
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">Step 1</div>
              </div>

              <div className="flex justify-center">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Data Product Owners */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Data Product Owner Approvals</p>
                {selectedItems.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {getProductOwner(item.productName)}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">Step {index + 2}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Request Summary */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium text-sm">Request Summary</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">BDAC:</span> {selectedBdacOption?.label}
                </div>
                <div>
                  <span className="font-medium">Products:</span> {selectedItems.length} data products
                </div>
                <div>
                  <span className="font-medium">Justification:</span>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {formData.businessJustification}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {currentStep === 'form' ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={loading || selectedItems.length === 0}
              >
                Next: Review Workflow
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}