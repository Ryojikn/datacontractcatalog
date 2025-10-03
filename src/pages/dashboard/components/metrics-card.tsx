import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { MetricsCardProps } from '../types/dashboard.types';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';

/**
 * MetricsCard - Componente reutilizável para exibir métricas do dashboard
 * 
 * Requirements: 1.3, 2.3, 3.3, 5.2
 * - Suporte a ícones, valores, títulos e trends
 * - Estados de loading e error
 * - Design responsivo e acessível
 */
export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  loading = false,
  error,
  className,
}) => {
  // Renderiza estado de loading
  if (loading) {
    return (
      <div className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm p-4 sm:p-6",
        className
      )}>
        <div className="flex items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
          <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
          <Skeleton className="h-3 w-16 sm:w-20" />
        </div>
      </div>
    );
  }

  // Renderiza estado de erro
  if (error) {
    return (
      <div className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm p-4 sm:p-6",
        "border-destructive/50 bg-destructive/5",
        className
      )}>
        <div className="flex items-center justify-between space-y-0 pb-2">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-2">{title}</h3>
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive flex-shrink-0 ml-2" />
        </div>
        <div className="space-y-1">
          <p className="text-xl sm:text-2xl font-bold text-destructive">--</p>
          <p className="text-xs text-destructive/80 line-clamp-2">{error}</p>
        </div>
      </div>
    );
  }

  // Função para renderizar o indicador de trend com tooltips e cores aprimoradas
  const renderTrend = () => {
    if (!trend) return null;

    const getTrendIcon = () => {
      switch (trend.direction) {
        case 'up':
          return <TrendingUp className="h-3 w-3" />;
        case 'down':
          return <TrendingDown className="h-3 w-3" />;
        case 'stable':
        default:
          return <Minus className="h-3 w-3" />;
      }
    };

    const getTrendColor = () => {
      switch (trend.direction) {
        case 'up':
          return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20';
        case 'down':
          return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20';
        case 'stable':
        default:
          return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/20';
      }
    };

    const formatPercentage = (percentage: number) => {
      const sign = percentage > 0 ? '+' : '';
      return `${sign}${percentage.toFixed(1)}%`;
    };

    const formatAbsoluteChange = (value: number) => {
      const sign = value > 0 ? '+' : '';
      return `${sign}${value}`;
    };

    const getTrendDescription = () => {
      const absChange = Math.abs(trend.value);
      const direction = trend.direction;
      
      switch (direction) {
        case 'up':
          return `Crescimento de ${absChange} unidades (${formatPercentage(trend.percentage)}) em relação ao ${trend.period}. Tendência positiva indica expansão da plataforma.`;
        case 'down':
          return `Redução de ${absChange} unidades (${formatPercentage(trend.percentage)}) em relação ao ${trend.period}. Pode indicar limpeza de dados ou migração.`;
        case 'stable':
          return `Variação mínima de ${formatPercentage(trend.percentage)} em relação ao ${trend.period}. Indica estabilidade na métrica.`;
        default:
          return `Comparação com ${trend.period}`;
      }
    };

    const getTrendEmoji = () => {
      switch (trend.direction) {
        case 'up':
          return '📈';
        case 'down':
          return '📉';
        case 'stable':
        default:
          return '➡️';
      }
    };

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "inline-flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full transition-colors cursor-help",
              getTrendColor()
            )}>
              {getTrendIcon()}
              <span>
                {formatPercentage(trend.percentage)}
              </span>
              <span className="text-xs opacity-75">
                vs {trend.period}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm">{getTrendEmoji()}</span>
                <span className="font-medium">
                  {trend.direction === 'up' ? 'Crescimento' : trend.direction === 'down' ? 'Redução' : 'Estável'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {getTrendDescription()}
              </p>
              <div className="text-xs border-t pt-1 mt-1">
                <span className="font-medium">Variação absoluta:</span> {formatAbsoluteChange(trend.value)}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Função para formatar o valor principal
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;
    
    // Formatar números grandes com sufixos (K, M, B)
    if (val >= 1000000000) {
      return `${(val / 1000000000).toFixed(1)}B`;
    }
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    }
    
    return val.toString();
  };

  return (
    <div className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm p-4 sm:p-6 transition-all hover:shadow-md",
      className
    )}>
      {/* Header com título e ícone */}
      <div className="flex items-center justify-between space-y-0 pb-2">
        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground tracking-tight line-clamp-2">
          {title}
        </h3>
        <Icon 
          className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 ml-2" 
          aria-hidden="true"
        />
      </div>

      {/* Conteúdo principal */}
      <div className="space-y-2">
        <p 
          className="text-xl sm:text-2xl font-bold leading-none tracking-tight"
          aria-label={`${title}: ${value}`}
        >
          {formatValue(value)}
        </p>
        
        {/* Subtitle e trend */}
        <div className="flex flex-col space-y-2">
          {subtitle && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center justify-between">
              {renderTrend()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

MetricsCard.displayName = 'MetricsCard';

export default MetricsCard;