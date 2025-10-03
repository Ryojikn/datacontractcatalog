import { Button } from '../ui/button';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  showRetry?: boolean;
  variant?: 'default' | 'network' | 'not-found' | 'server';
  className?: string;
}

export const ErrorMessage = ({
  title,
  message,
  onRetry,
  retryLabel = 'Tentar novamente',
  showRetry = true,
  variant = 'default',
  className = ''
}: ErrorMessageProps) => {
  const getIcon = () => {
    switch (variant) {
      case 'network':
        return <WifiOff className="w-8 h-8 text-destructive" />;
      case 'not-found':
        return <AlertTriangle className="w-8 h-8 text-muted-foreground" />;
      case 'server':
        return <AlertTriangle className="w-8 h-8 text-destructive" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-destructive" />;
    }
  };

  const getDefaultTitle = () => {
    switch (variant) {
      case 'network':
        return 'Problema de conexão';
      case 'not-found':
        return 'Não encontrado';
      case 'server':
        return 'Erro do servidor';
      default:
        return 'Erro';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-destructive/10">
        {getIcon()}
      </div>
      
      <h3 className="mb-2 text-lg font-semibold text-foreground">
        {title || getDefaultTitle()}
      </h3>
      
      <p className="mb-6 text-sm text-muted-foreground max-w-md">
        {message}
      </p>

      {showRetry && onRetry && (
        <Button 
          onClick={onRetry}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

// Specific error components for common scenarios
export const NetworkError = ({ onRetry }: { onRetry?: () => void }) => (
  <ErrorMessage
    variant="network"
    message="Verifique sua conexão com a internet e tente novamente."
    onRetry={onRetry}
  />
);

export const NotFoundError = ({ 
  message = "O item que você está procurando não foi encontrado.",
  onRetry 
}: { 
  message?: string;
  onRetry?: () => void;
}) => (
  <ErrorMessage
    variant="not-found"
    message={message}
    onRetry={onRetry}
    showRetry={!!onRetry}
  />
);

export const ServerError = ({ onRetry }: { onRetry?: () => void }) => (
  <ErrorMessage
    variant="server"
    message="Ocorreu um erro interno. Tente novamente em alguns instantes."
    onRetry={onRetry}
  />
);

// Inline error component for smaller spaces
export const InlineError = ({ 
  message, 
  onRetry,
  className = ''
}: { 
  message: string;
  onRetry?: () => void;
  className?: string;
}) => (
  <div className={`flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-lg ${className}`}>
    <div className="flex items-center gap-2">
      <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
      <span className="text-sm text-destructive">{message}</span>
    </div>
    
    {onRetry && (
      <Button 
        onClick={onRetry}
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
      >
        <RefreshCw className="w-3 h-3" />
      </Button>
    )}
  </div>
);