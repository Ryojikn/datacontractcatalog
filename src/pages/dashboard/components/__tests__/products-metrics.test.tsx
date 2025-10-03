import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProductsMetrics } from '../products-metrics';
import type { ProductMetrics } from '../../types/dashboard.types';

// Mock data for testing
const mockProductMetrics: ProductMetrics = {
  total: 42,
  byEnvironment: {
    dev: 15,
    pre: 12,
    pro: 10,
    undefined: 5
  },
  trend: {
    value: 8,
    direction: 'up',
    period: 'semana anterior',
    percentage: 12.5
  }
};

const mockProductMetricsEmpty: ProductMetrics = {
  total: 0,
  byEnvironment: {
    dev: 0,
    pre: 0,
    pro: 0,
    undefined: 0
  }
};

describe('ProductsMetrics', () => {
  it('renders total products correctly', () => {
    render(
      <ProductsMetrics 
        data={mockProductMetrics} 
        loading={false} 
      />
    );

    expect(screen.getByText('Total Data Products')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders environment distribution correctly', () => {
    render(
      <ProductsMetrics 
        data={mockProductMetrics} 
        loading={false} 
      />
    );

    // Check all environment cards are rendered
    expect(screen.getByText('Development Products')).toBeInTheDocument();
    expect(screen.getByText('Pre-production Products')).toBeInTheDocument();
    expect(screen.getByText('Production Products')).toBeInTheDocument();
    expect(screen.getByText('Undefined Products')).toBeInTheDocument();

    // Check values
    expect(screen.getByText('15')).toBeInTheDocument(); // dev
    expect(screen.getByText('12')).toBeInTheDocument(); // pre
    expect(screen.getByText('10')).toBeInTheDocument(); // pro
    expect(screen.getByText('5')).toBeInTheDocument();  // undefined
  });

  it('calculates percentages correctly', () => {
    render(
      <ProductsMetrics 
        data={mockProductMetrics} 
        loading={false} 
      />
    );

    // Check percentage calculations (15/42 = 35.7%, 12/42 = 28.6%, etc.)
    expect(screen.getByText('35.7% of total')).toBeInTheDocument(); // dev
    expect(screen.getByText('28.6% of total')).toBeInTheDocument(); // pre
    expect(screen.getByText('23.8% of total')).toBeInTheDocument(); // pro
    expect(screen.getByText('11.9% of total')).toBeInTheDocument(); // undefined
  });

  it('renders trend information when available', () => {
    render(
      <ProductsMetrics 
        data={mockProductMetrics} 
        loading={false} 
      />
    );

    expect(screen.getByText('+12.5%')).toBeInTheDocument();
    expect(screen.getByText('vs semana anterior')).toBeInTheDocument();
  });

  it('renders subtitle with environment summary', () => {
    render(
      <ProductsMetrics 
        data={mockProductMetrics} 
        loading={false} 
      />
    );

    expect(screen.getByText('10 production, 12 pre-prod, 15 development')).toBeInTheDocument();
  });

  it('handles empty data correctly', () => {
    render(
      <ProductsMetrics 
        data={mockProductMetricsEmpty} 
        loading={false} 
      />
    );

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getAllByText('0.0% of total')).toHaveLength(4);
  });

  it('renders loading state correctly', () => {
    render(
      <ProductsMetrics 
        data={mockProductMetrics} 
        loading={true} 
      />
    );

    // Should render skeleton loaders
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders error state correctly', () => {
    render(
      <ProductsMetrics 
        data={mockProductMetrics} 
        loading={false}
        error="Failed to load product metrics"
      />
    );

    expect(screen.getByText('Failed to load product metrics')).toBeInTheDocument();
    expect(screen.getAllByText('--')).toHaveLength(5); // Main card + 4 environment cards
  });

  it('applies correct CSS classes for environment borders', () => {
    const { container } = render(
      <ProductsMetrics 
        data={mockProductMetrics} 
        loading={false} 
      />
    );

    // Check that border classes are applied
    expect(container.querySelector('.border-l-blue-500')).toBeInTheDocument(); // dev
    expect(container.querySelector('.border-l-yellow-500')).toBeInTheDocument(); // pre
    expect(container.querySelector('.border-l-green-500')).toBeInTheDocument(); // pro
    expect(container.querySelector('.border-l-gray-500')).toBeInTheDocument(); // undefined
  });

  it('renders correct icons for each environment', () => {
    render(
      <ProductsMetrics 
        data={mockProductMetrics} 
        loading={false} 
      />
    );

    // Icons should be rendered (we can't easily test specific icons, but we can check they exist)
    const icons = document.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(4); // At least 5 icons (main + 4 environments)
  });
});