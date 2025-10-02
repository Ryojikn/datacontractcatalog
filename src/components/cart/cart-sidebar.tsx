import { useState } from 'react'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  Button,
  Checkbox,
  Badge
} from '@/components/ui'
import { BulkAccessRequestModal } from './bulk-access-request-modal'
import { useCartStore } from '@/stores/cart'
import { Trash2, ShoppingCart, Package } from 'lucide-react'
import type { CartItem } from '@/types'

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function CartSidebar() {
  const { 
    items, 
    isOpen, 
    closeCart, 
    removeFromCart, 
    clearCart, 
    toggleCartItem, 
    selectAllItems,
    getSelectedItems 
  } = useCartStore()
  
  const [showBulkRequestModal, setShowBulkRequestModal] = useState(false)
  const selectedItems = getSelectedItems()
  const allSelected = items.length > 0 && selectedItems.length === items.length

  const handleSelectAll = () => {
    selectAllItems(!allSelected)
  }

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId)
  }

  const handleProceedToRequest = () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one data product to request access.')
      return
    }
    setShowBulkRequestModal(true)
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={closeCart}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Data Product Cart
              {items.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {items.length}
                </Badge>
              )}
            </SheetTitle>
            <SheetDescription>
              Select data products to request access in bulk
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground text-sm">
                  Add data products to your cart to request access in bulk
                </p>
              </div>
            ) : (
              <>
                {/* Select All / Clear Cart Controls */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all items"
                    />
                    <span className="text-sm font-medium">
                      Select All ({selectedItems.length}/{items.length})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-destructive hover:text-destructive"
                  >
                    Clear Cart
                  </Button>
                </div>

                {/* Cart Items */}
                <div className="space-y-4">
                  {items.map((item) => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                      onToggle={() => toggleCartItem(item.productId)}
                      onRemove={() => handleRemoveItem(item.productId)}
                    />
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-4 border-t space-y-3">
                  <Button
                    onClick={handleProceedToRequest}
                    disabled={selectedItems.length === 0}
                    className="w-full"
                  >
                    Request Access ({selectedItems.length} selected)
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    You can select specific products and request access for multiple items at once
                  </p>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Bulk Access Request Modal */}
      <BulkAccessRequestModal 
        open={showBulkRequestModal}
        onOpenChange={setShowBulkRequestModal}
      />
    </>
  )
}

interface CartItemCardProps {
  item: CartItem
  onToggle: () => void
  onRemove: () => void
}

function CartItemCard({ item, onToggle, onRemove }: CartItemCardProps) {
  return (
    <div className="flex items-start space-x-3 p-3 border rounded-lg bg-card">
      <Checkbox
        checked={item.selected}
        onCheckedChange={onToggle}
        aria-label={`Select ${item.productName}`}
        className="mt-1"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate">
              {item.productName}
            </h4>
            {item.technology && (
              <Badge variant="outline" className="text-xs mt-1">
                {item.technology}
              </Badge>
            )}
            {item.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {item.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Added on {formatDate(item.addedAt)}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive ml-2 flex-shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}