import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MetricsCard } from '../metrics-card';
import { MetricTrend } from '../../types/dashboard.types';
import { Users } from 'lucide-react';

// Mock do ícone para testes
const MockIcon = ({ className }: { className?: string }) => (
  <div className={className} data-testid="mock-icon">Icon</div>
);

describe('MetricsCard', () => {
  const defaultProps = {
    title: 'Test Metric',
    value: 100,
    icon: MockIcon,
  };

  describe('Renderização básica', () => {
    it('deve renderizar título e valor corretamente', () => {
      render(<MetricsCard {...defaultProps} />);
      
      expect(screen.getByText('Test Metric')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });

    it('deve renderizar subtitle quando fornecido', () => {
      render(
        <MetricsCard 
          {...defaultProps} 
          subtitle="Additional info" 
        />
      );
      
      expect(screen.getByText('Additional info')).toBeInTheDocument();
    });

    it('deve aplicar className customizada', () => {
      const { container } = render(
        <MetricsCard 
          {...defaultProps} 
          className="custom-class" 
        />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Formatação de valores', () => {
    it('deve formatar números grandes com sufixo K', () => {
      render(<MetricsCard {...defaultProps} value={1500} />);
      expect(screen.getByText('1.5K')).toBeInTheDocument();
    });

    it('deve formatar números grandes com sufixo M', () => {
      render(<MetricsCard {...defaultProps} value={2500000} />);
      expect(screen.getByText('2.5M')).toBeInTheDocument();
    });

    it('deve formatar números grandes com sufixo B', () => {
      render(<MetricsCard {...defaultProps} value={1200000000} />);
      expect(screen.getByText('1.2B')).toBeInTheDocument();
    });

    it('deve manter strings como estão', () => {
      render(<MetricsCard {...defaultProps} value="Custom Value" />);
      expect(screen.getByText('Custom Value')).toBeInTheDocument();
    });

    it('deve manter números pequenos sem formatação', () => {
      render(<MetricsCard {...defaultProps} value={999} />);
      expect(screen.getByText('999')).toBeInTheDocument();
    });
  });

  describe('Estados de trend', () => {
    const upTrend: MetricTrend = {
      value: 15,
      direction: 'up',
      period: 'mês anterior',
      percentage: 15.5,
    };

    const downTrend: MetricTrend = {
      value: -10,
      direction: 'down',
      period: 'semana anterior',
      percentage: -10.2,
    };

    const stableTrend: MetricTrend = {
      value: 1,
      direction: 'stable',
      period: 'período anterior',
      percentage: 0.5,
    };

    it('deve renderizar trend positivo corretamente', () => {
      render(<MetricsCard {...defaultProps} trend={upTrend} />);
      
      expect(screen.getByText('+15.5%')).toBeInTheDocument();
      expect(screen.getByText('vs mês anterior')).toBeInTheDocument();
    });

    it('deve renderizar trend negativo corretamente', () => {
      render(<MetricsCard {...defaultProps} trend={downTrend} />);
      
      expect(screen.getByText('-10.2%')).toBeInTheDocument();
      expect(screen.getByText('vs semana anterior')).toBeInTheDocument();
    });

    it('deve renderizar trend estável corretamente', () => {
      render(<MetricsCard {...defaultProps} trend={stableTrend} />);
      
      expect(screen.getByText('+0.5%')).toBeInTheDocument();
      expect(screen.getByText('vs período anterior')).toBeInTheDocument();
    });

    it('não deve renderizar trend quando não fornecido', () => {
      render(<MetricsCard {...defaultProps} />);
      
      expect(screen.queryByText(/vs/)).not.toBeInTheDocument();
    });

    it('deve aplicar cores corretas para trend positivo', () => {
      const { container } = render(<MetricsCard {...defaultProps} trend={upTrend} />);
      
      const trendElement = container.querySelector('.text-emerald-600');
      expect(trendElement).toBeInTheDocument();
    });

    it('deve aplicar cores corretas para trend negativo', () => {
      const { container } = render(<MetricsCard {...defaultProps} trend={downTrend} />);
      
      const trendElement = container.querySelector('.text-red-600');
      expect(trendElement).toBeInTheDocument();
    });

    it('deve aplicar cores corretas para trend estável', () => {
      const { container } = render(<MetricsCard {...defaultProps} trend={stableTrend} />);
      
      const trendElement = container.querySelector('.text-slate-600');
      expect(trendElement).toBeInTheDocument();
    });
  });

  describe('Tooltips de trend', () => {
    const upTrend: MetricTrend = {
      value: 15,
      direction: 'up',
      period: 'mês anterior',
      percentage: 15.5,
    };

    const downTrend: MetricTrend = {
      value: -10,
      direction: 'down',
      period: 'semana anterior',
      percentage: -10.2,
    };

    it('deve mostrar tooltip ao fazer hover no trend positivo', async () => {
      render(<MetricsCard {...defaultProps} trend={upTrend} />);
      
      const trendElement = screen.getByText('+15.5%').closest('div');
      expect(trendElement).toHaveClass('cursor-help');
      
      // Simular hover
      if (trendElement) {
        fireEvent.mouseEnter(trendElement);
        
        await waitFor(() => {
          expect(screen.getByText('Crescimento')).toBeInTheDocument();
        });
      }
    });

    it('deve mostrar tooltip ao fazer hover no trend negativo', async () => {
      render(<MetricsCard {...defaultProps} trend={downTrend} />);
      
      const trendElement = screen.getByText('-10.2%').closest('div');
      expect(trendElement).toHaveClass('cursor-help');
      
      // Simular hover
      if (trendElement) {
        fireEvent.mouseEnter(trendElement);
        
        await waitFor(() => {
          expect(screen.getByText('Redução')).toBeInTheDocument();
        });
      }
    });

    it('deve incluir variação absoluta no tooltip', async () => {
      render(<MetricsCard {...defaultProps} trend={upTrend} />);
      
      const trendElement = screen.getByText('+15.5%').closest('div');
      
      if (trendElement) {
        fireEvent.mouseEnter(trendElement);
        
        await waitFor(() => {
          expect(screen.getByText('Variação absoluta:')).toBeInTheDocument();
          expect(screen.getByText('+15')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Estado de loading', () => {
    it('deve renderizar skeleton quando loading=true', () => {
      const { container } = render(
        <MetricsCard {...defaultProps} loading={true} />
      );
      
      // Verifica se há elementos skeleton
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
      
      // Não deve mostrar o conteúdo real
      expect(screen.queryByText('Test Metric')).not.toBeInTheDocument();
      expect(screen.queryByText('100')).not.toBeInTheDocument();
    });

    it('deve renderizar conteúdo normal quando loading=false', () => {
      render(<MetricsCard {...defaultProps} loading={false} />);
      
      expect(screen.getByText('Test Metric')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  describe('Estado de erro', () => {
    it('deve renderizar estado de erro corretamente', () => {
      render(
        <MetricsCard 
          {...defaultProps} 
          error="Failed to load data" 
        />
      );
      
      expect(screen.getByText('Test Metric')).toBeInTheDocument();
      expect(screen.getByText('--')).toBeInTheDocument();
      expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    });

    it('deve aplicar estilos de erro quando há erro', () => {
      const { container } = render(
        <MetricsCard 
          {...defaultProps} 
          error="Error message" 
        />
      );
      
      expect(container.firstChild).toHaveClass('border-destructive/50');
    });

    it('deve priorizar erro sobre loading', () => {
      render(
        <MetricsCard 
          {...defaultProps} 
          loading={true}
          error="Error message" 
        />
      );
      
      // Deve mostrar erro, não loading
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('100')).not.toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter aria-label apropriado para o valor', () => {
      render(<MetricsCard {...defaultProps} />);
      
      const valueElement = screen.getByLabelText('Test Metric: 100');
      expect(valueElement).toBeInTheDocument();
    });

    it('deve marcar ícone como aria-hidden', () => {
      render(<MetricsCard {...defaultProps} />);
      
      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Interações visuais', () => {
    it('deve aplicar classes de hover', () => {
      const { container } = render(<MetricsCard {...defaultProps} />);
      
      expect(container.firstChild).toHaveClass('hover:shadow-md');
    });

    it('deve aplicar transições', () => {
      const { container } = render(<MetricsCard {...defaultProps} />);
      
      expect(container.firstChild).toHaveClass('transition-all');
    });
  });

  describe('Integração com ícones reais', () => {
    it('deve funcionar com ícones do lucide-react', () => {
      render(
        <MetricsCard 
          title="Users"
          value={42}
          icon={Users}
        />
      );
      
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });
});