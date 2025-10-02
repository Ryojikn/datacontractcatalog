import { ThemeToggle } from "@/components/theme-toggle"
import { CartSidebar } from "@/components/cart"
import { useCartStore } from "@/stores/cart"
import { Button, Badge, Toaster } from "@/components/ui"
import { ShoppingCart } from "lucide-react"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { toggleCart, getCartCount } = useCartStore()
  const cartCount = getCartCount()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">DataContract Catalog</h1>
          </div>
          <div className="flex items-center space-x-2">
            {/* Cart Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCart}
              className="relative"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      
      {/* Cart Sidebar */}
      <CartSidebar />
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  )
}