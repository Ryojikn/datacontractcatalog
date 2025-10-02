import { ThemeToggle } from "@/components/theme-toggle"
import { CartSidebar } from "@/components/cart"
import { NotificationSidebar } from "@/components/notification"
import { useCartStore } from "@/stores/cart"
import { useNotificationStore } from "@/stores/notification"
import { Button, Badge, Toaster } from "@/components/ui"
import { ShoppingCart, Bell } from "lucide-react"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { toggleCart, getCartCount } = useCartStore()
  const { toggleNotifications, getUnreadCount } = useNotificationStore()
  const cartCount = getCartCount()
  const unreadCount = getUnreadCount()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-xl font-bold truncate">DataContract Catalog</h1>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Cart Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCart}
              className="relative p-2"
              aria-label={`Shopping cart${cartCount > 0 ? ` (${cartCount} items)` : ''}`}
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs min-w-[1.25rem]"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </Badge>
              )}
            </Button>
            
            {/* Notification Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleNotifications}
              className="relative p-2"
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs min-w-[1.25rem]"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
            
            {/* Theme Toggle */}
            <div className="ml-1 sm:ml-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      
      {/* Notification Sidebar */}
      <NotificationSidebar />
      
      {/* Cart Sidebar */}
      <CartSidebar />
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  )
}