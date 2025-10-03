import { ThemeToggle } from "@/components/theme-toggle"
import { CartSidebar } from "@/components/cart"
import { NotificationSidebar } from "@/components/notification"
import { SearchModal } from "@/components/search"
import { useCartStore } from "@/stores/cart"
import { useNotificationStore } from "@/stores/notification"
import { useSearchStore } from "@/stores/search"
import { Button, Badge } from "@/components/ui"
import { ShoppingCart, Bell, Search, BarChart3 } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate()
  const { toggleCart, getCartCount } = useCartStore()
  const { toggleNotifications, getUnreadCount } = useNotificationStore()
  const cartCount = getCartCount()
  const unreadCount = getUnreadCount()
  
  const handleOpenSearch = () => {
    useSearchStore.getState().openSearch();
  }

  const handleDashboardClick = () => {
    // Close any open modals before navigating
    useSearchStore.getState().closeSearch();
    useCartStore.getState().closeCart();
    useNotificationStore.getState().closeNotifications();
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-xl font-bold truncate">DataContract Catalog</h1>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenSearch}
              className="p-2"
              aria-label="Search data catalog (Cmd+K)"
            >
              <Search className="h-4 w-4" />
            </Button>
            
            {/* Dashboard Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDashboardClick}
              className="p-2"
              aria-label="Dashboard"
              title="Dashboard"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            
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
      
      {/* Search Modal */}
      <SearchModal />
      
      {/* Notification Sidebar */}
      <NotificationSidebar />
      
      {/* Cart Sidebar */}
      <CartSidebar />
      
      {/* Toast Notifications - Temporarily disabled */}
      {/* <Toaster /> */}
    </div>
  )
}