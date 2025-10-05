import React, { useState } from 'react';
import type { CurrentAccess } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Calendar, 
  User, 
  Clock,
  Zap
} from 'lucide-react';

interface RevocationNoticeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleRevocation: (accessId: string) => void;
  onForceRevocation: (accessId: string) => void;
  access: CurrentAccess | null;
  loading?: boolean;
}

const RevocationNoticeDialog: React.FC<RevocationNoticeDialogProps> = ({
  isOpen,
  onClose,
  onScheduleRevocation,
  onForceRevocation,
  access,
  loading = false
}) => {
  const [selectedAction, setSelectedAction] = useState<'schedule' | 'force' | null>(null);

  const handleClose = () => {
    setSelectedAction(null);
    onClose();
  };

  const handleScheduleRevocation = () => {
    if (access) {
      onScheduleRevocation(access.id);
      handleClose();
    }
  };

  const handleForceRevocation = () => {
    if (access) {
      onForceRevocation(access.id);
      handleClose();
    }
  };

  const formatExpirationDate = (expiresAt: string): string => {
    try {
      const date = new Date(expiresAt);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getAccessLevelVariant = (level: string) => {
    switch (level) {
      case 'admin':
        return 'destructive';
      case 'write':
        return 'default';
      case 'read':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  if (!access) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Revoke Access Permission
          </DialogTitle>
          <DialogDescription>
            Choose how to revoke access for this user. This action will remove their permission to access the data product.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Access Details */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{access.userName}</span>
                <Badge variant={getAccessLevelVariant(access.accessLevel)} className="text-xs">
                  {access.accessLevel}
                </Badge>
              </div>
              
              <div className="text-sm">
                <span className="font-medium">Product:</span>
                <span className="text-muted-foreground ml-1">{access.productName}</span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Granted: {new Date(access.grantedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Expires: {formatExpirationDate(access.expiresAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Revocation Options */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Select Revocation Method:</h4>
            
            {/* Schedule Revocation Option */}
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedAction === 'schedule' 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-border hover:bg-muted/50'
              }`}
              onClick={() => setSelectedAction('schedule')}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedAction === 'schedule' 
                      ? 'border-orange-500 bg-orange-500' 
                      : 'border-muted-foreground'
                  }`}>
                    {selectedAction === 'schedule' && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">Schedule Revocation (Recommended)</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Notify the user 30 days in advance before revoking access. This gives them time to complete their work and request renewal if needed.
                  </p>
                  <div className="text-xs text-orange-600 font-medium">
                    • User will receive advance notification
                    • Access will be revoked in 30 days
                    • User can request renewal during notice period
                  </div>
                </div>
              </div>
            </div>

            {/* Force Revocation Option */}
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedAction === 'force' 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-border hover:bg-muted/50'
              }`}
              onClick={() => setSelectedAction('force')}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedAction === 'force' 
                      ? 'border-red-500 bg-red-500' 
                      : 'border-muted-foreground'
                  }`}>
                    {selectedAction === 'force' && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-red-600" />
                    <span className="font-medium">Force Immediate Revocation</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Immediately revoke access without advance notice. Use this option only for security incidents or policy violations.
                  </p>
                  <div className="text-xs text-red-600 font-medium">
                    ⚠️ Warning: Access will be removed immediately
                    • No advance notification
                    • User will be notified after revocation
                    • May disrupt ongoing work
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          
          {selectedAction === 'schedule' && (
            <Button
              onClick={handleScheduleRevocation}
              disabled={loading}
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
            >
              {loading ? 'Scheduling...' : 'Schedule Revocation (30 days)'}
            </Button>
          )}
          
          {selectedAction === 'force' && (
            <Button
              onClick={handleForceRevocation}
              disabled={loading}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              {loading ? 'Revoking...' : 'Force Revoke Now'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RevocationNoticeDialog;
export { RevocationNoticeDialog };