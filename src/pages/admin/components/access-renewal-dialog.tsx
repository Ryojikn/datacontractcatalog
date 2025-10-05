import React, { useState } from 'react';
import type { CurrentAccess } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, AlertTriangle, CheckCircle } from 'lucide-react';

interface AccessRenewalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (accessIds: string[]) => void;
  accessItems: CurrentAccess[];
  loading?: boolean;
}

const AccessRenewalDialog: React.FC<AccessRenewalDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  accessItems,
  loading = false
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const accessIds = accessItems.map(access => access.id);
      await onConfirm(accessIds);
      onClose();
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    if (!isConfirming) {
      onClose();
    }
  };

  // Calculate new expiration date (1 year from now)
  const newExpirationDate = new Date();
  newExpirationDate.setFullYear(newExpirationDate.getFullYear() + 1);

  const formatExpirationDate = (expiresAt: string): { text: string; isExpired: boolean; isExpiringSoon: boolean } => {
    try {
      const date = new Date(expiresAt);
      const now = new Date();
      const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays < 0) {
        return {
          text: `Expired ${Math.abs(diffInDays)} day${Math.abs(diffInDays) === 1 ? '' : 's'} ago`,
          isExpired: true,
          isExpiringSoon: false
        };
      } else if (diffInDays <= 30) {
        return {
          text: `Expires in ${diffInDays} day${diffInDays === 1 ? '' : 's'}`,
          isExpired: false,
          isExpiringSoon: true
        };
      } else {
        return {
          text: date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          isExpired: false,
          isExpiringSoon: false
        };
      }
    } catch (error) {
      return {
        text: 'Invalid date',
        isExpired: false,
        isExpiringSoon: false
      };
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

  const isSingleRenewal = accessItems.length === 1;

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            {isSingleRenewal ? 'Renew Access Permission' : `Renew ${accessItems.length} Access Permissions`}
          </DialogTitle>
          <DialogDescription>
            {isSingleRenewal 
              ? 'This will extend the access permission by one year from today.'
              : `This will extend all selected access permissions by one year from today.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* New expiration date info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">New Expiration Date</span>
            </div>
            <p className="text-green-700 mt-1">
              {newExpirationDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Access items list */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              {isSingleRenewal ? 'Access Permission' : 'Access Permissions to Renew'}
            </h4>
            
            {accessItems.map((access, index) => {
              const expirationInfo = formatExpirationDate(access.expiresAt);
              
              return (
                <div key={access.id}>
                  <div className="border rounded-lg p-3 bg-muted/30">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{access.userName}</span>
                          <Badge 
                            variant={getAccessLevelVariant(access.accessLevel)}
                            className="text-xs"
                          >
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
                            <span>Current expiration: </span>
                            <span className={expirationInfo.isExpired ? 'text-destructive font-medium' : expirationInfo.isExpiringSoon ? 'text-orange-600 font-medium' : ''}>
                              {expirationInfo.text}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status indicator */}
                      <div className="flex items-center">
                        {expirationInfo.isExpired ? (
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        ) : expirationInfo.isExpiringSoon ? (
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {index < accessItems.length - 1 && <Separator className="my-2" />}
                </div>
              );
            })}
          </div>

          {/* Warning for scheduled revocations */}
          {accessItems.some(access => access.status === 'scheduled_for_revocation') && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-orange-800 font-medium text-sm">
                    Scheduled Revocations Will Be Cancelled
                  </p>
                  <p className="text-orange-700 text-sm mt-1">
                    {accessItems.filter(access => access.status === 'scheduled_for_revocation').length === 1
                      ? 'One of the selected permissions is scheduled for revocation. Renewing will cancel the scheduled revocation.'
                      : `${accessItems.filter(access => access.status === 'scheduled_for_revocation').length} of the selected permissions are scheduled for revocation. Renewing will cancel these scheduled revocations.`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isConfirming || loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConfirming || loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isConfirming || loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {isSingleRenewal ? 'Renewing...' : 'Renewing All...'}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {isSingleRenewal ? 'Renew Access' : `Renew ${accessItems.length} Permissions`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AccessRenewalDialog;
export { AccessRenewalDialog };