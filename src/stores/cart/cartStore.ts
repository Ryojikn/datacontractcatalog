import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, DataProduct } from '@/types'
// import { toast } from '@/hooks/use-toast' // Temporarily disabled

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  
  // Actions
  addToCart: (product: DataProduct) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  toggleCartItem: (productId: string) => void
  selectAllItems: (selected: boolean) => void
  getSelectedItems: () => CartItem[]
  getCartCount: () => number
  isInCart: (productId: string) => boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addToCart: (product: DataProduct) => {
        const existingItem = get().items.find(item => item.productId === product.id)
        
        if (existingItem) {
          // Item already in cart, don't add duplicate
          console.log(`${product.name} is already in your cart.`)
          return
        }

        const newItem: CartItem = {
          id: `cart-${product.id}-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          dataContractId: product.dataContractId,
          technology: product.technology,
          description: product.description,
          addedAt: new Date().toISOString(),
          selected: true // Default to selected when added
        }

        set(state => ({
          items: [...state.items, newItem]
        }))

        console.log(`${product.name} has been added to your cart.`)
      },

      removeFromCart: (productId: string) => {
        const item = get().items.find(item => item.productId === productId)
        
        set(state => ({
          items: state.items.filter(item => item.productId !== productId)
        }))

        if (item) {
          console.log(`${item.productName} has been removed from your cart.`)
        }
      },

      clearCart: () => {
        const itemCount = get().items.length
        set({ items: [] })
        
        if (itemCount > 0) {
          console.log(`All ${itemCount} item${itemCount !== 1 ? 's' : ''} removed from your cart.`)
        }
      },

      toggleCartItem: (productId: string) => {
        set(state => ({
          items: state.items.map(item =>
            item.productId === productId
              ? { ...item, selected: !item.selected }
              : item
          )
        }))
      },

      selectAllItems: (selected: boolean) => {
        set(state => ({
          items: state.items.map(item => ({ ...item, selected }))
        }))
      },

      getSelectedItems: () => {
        return get().items.filter(item => item.selected)
      },

      getCartCount: () => {
        return get().items.length
      },

      isInCart: (productId: string) => {
        return get().items.some(item => item.productId === productId)
      },

      openCart: () => {
        set({ isOpen: true })
      },

      closeCart: () => {
        set({ isOpen: false })
      },

      toggleCart: () => {
        set(state => ({ isOpen: !state.isOpen }))
      }
    }),
    {
      name: 'cart-storage', // localStorage key
      partialize: (state) => ({ items: state.items }) // Only persist items, not isOpen state
    }
  )
)