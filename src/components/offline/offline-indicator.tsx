import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/use-online-status';
import { useEffect, useRef } from 'react';
// import { toast } from '../../hooks/use-toast'; // Temporarily disabled

export const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
    } else if (wasOffline.current && isOnline) {
      // Show success message when coming back online (toast temporarily disabled)
      console.log("✅ Conexão restabelecida - Você está online novamente");
      wasOffline.current = false;
    }
  }, [isOnline]);

  // Show offline indicator only when offline
  if (!isOnline) {
    return (
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg shadow-lg animate-in slide-in-from-top-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">Sem conexão</span>
      </div>
    );
  }

  return null;
};

// Banner component for offline state in main content
export const OfflineBanner = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        <WifiOff className="w-5 h-5 text-destructive flex-shrink-0" />
        <div>
          <h4 className="font-medium text-destructive">Modo offline</h4>
          <p className="text-sm text-muted-foreground">
            Você está offline. Algumas funcionalidades podem não estar disponíveis.
          </p>
        </div>
      </div>
    </div>
  );
};