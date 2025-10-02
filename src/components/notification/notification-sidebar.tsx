import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  Button,
  Badge
} from '@/components/ui'
import { useNotificationStore } from '@/stores/notification'
import { Bell, BellOff, Check, CheckCheck, Trash2, Package, AlertCircle, Clock, TestTube } from 'lucide-react'
import type { Notification } from '@/types'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }
}

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'access_approved':
      return <Check className="h-4 w-4 text-green-500" />
    case 'access_rejected':
      return <AlertCircle className="h-4 w-4 text-red-500" />
    case 'access_pending':
      return <Clock className="h-4 w-4 text-yellow-500" />
    case 'system':
      return <Bell className="h-4 w-4 text-blue-500" />
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />
  }
}

function getNotificationBadgeVariant(type: Notification['type']) {
  switch (type) {
    case 'access_approved':
      return 'default' as const
    case 'access_rejected':
      return 'destructive' as const
    case 'access_pending':
      return 'secondary' as const
    case 'system':
      return 'outline' as const
    default:
      return 'outline' as const
  }
}

export function NotificationSidebar() {
  const { 
    notifications, 
    isOpen, 
    closeNotifications, 
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getUnreadCount,
    addAccessApprovedWithToast,
    addAccessRejectedWithToast,
    addSystemNotification
  } = useNotificationStore()
  
  const unreadCount = getUnreadCount()
  const hasNotifications = notifications.length > 0

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId)
  }

  const handleRemoveNotification = (notificationId: string) => {
    removeNotification(notificationId)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  const handleClearAll = () => {
    clearAllNotifications()
  }

  // Demo functions for testing toast notifications
  const handleTestApproval = () => {
    addAccessApprovedWithToast('Credit Card Analytics Demo', 'product-demo-1')
  }

  const handleTestRejection = () => {
    addAccessRejectedWithToast('Loan Risk Model Demo', 'Insufficient business justification', 'product-demo-2')
  }

  const handleTestSystem = () => {
    addSystemNotification('System Update', 'New features have been deployed to the platform.')
  }

  return (
    <Sheet open={isOpen} onOpenChange={closeNotifications}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Stay updated with access requests and system notifications
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex-1 overflow-y-auto">
          {!hasNotifications ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No notifications</h3>
              <p className="text-muted-foreground text-sm">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Action Controls */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                    {unreadCount > 0 && ` (${unreadCount} unread)`}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="text-xs"
                    >
                      <CheckCheck className="h-3 w-3 mr-1" />
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-destructive hover:text-destructive text-xs"
                  >
                    Clear all
                  </Button>
                </div>
              </div>

              {/* Demo Toast Testing (Development Only) */}
              <div className="mb-4 p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <TestTube className="h-4 w-4" />
                  <span className="text-sm font-medium">Test Toast Notifications</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestApproval}
                    className="text-xs"
                  >
                    Test Approval
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestRejection}
                    className="text-xs"
                  >
                    Test Rejection
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestSystem}
                    className="text-xs"
                  >
                    Test System
                  </Button>
                </div>
              </div>

              {/* Notification Items */}
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={() => handleMarkAsRead(notification.id)}
                    onRemove={() => handleRemoveNotification(notification.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface NotificationCardProps {
  notification: Notification
  onMarkAsRead: () => void
  onRemove: () => void
}

function NotificationCard({ notification, onMarkAsRead, onRemove }: NotificationCardProps) {
  const isUnread = !notification.read

  return (
    <div className={`p-3 border rounded-lg bg-card transition-colors ${
      isUnread ? 'border-primary/20 bg-primary/5' : 'border-border'
    }`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`text-sm font-medium truncate ${
                  isUnread ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {notification.title}
                </h4>
                {isUnread && (
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                )}
              </div>
              
              <p className={`text-xs mb-2 ${
                isUnread ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {notification.message}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={getNotificationBadgeVariant(notification.type)}
                    className="text-xs"
                  >
                    {notification.type.replace('_', ' ')}
                  </Badge>
                  {notification.productName && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Package className="h-3 w-3" />
                      <span className="truncate max-w-[120px]">
                        {notification.productName}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(notification.createdAt)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
              {isUnread && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMarkAsRead}
                  className="h-6 w-6 p-0"
                  title="Mark as read"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                title="Remove notification"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}