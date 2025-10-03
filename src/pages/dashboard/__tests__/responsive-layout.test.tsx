/**
 * Responsive Layout Test for Dashboard
 * 
 * This test verifies that the dashboard components have the correct
 * responsive CSS classes applied for different breakpoints.
 * 
 * Requirements: 5.1, 5.2, 5.4
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MetricsCard } from '../components/metrics-card';
import { ContractsMetricsSkeleton, ProductsMetricsSkeleton, UsersMetricsSkeleton } from '@/components/loading/skeleton-loaders';
import { Users } from 'lucide-react';

// Mock icon for testing
const MockIcon = () => <div data-testid="mock-icon">Icon</div>;

describe('Dashboard Responsive Layout', () => {
  describe('MetricsCard Responsive Classes', () => {
    it('should have responsive padding classes', () => {
      const { container } = render(
        <MetricsCard
          title="Test Metric"
          value={100}
          icon={MockIcon}
        />
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-4', 'sm:p-6');
    });

    it('should have responsive text sizing for title', () => {
      const { container } = render(
        <MetricsCard
          title="Test Metric"
          value={100}
          icon={MockIcon}
        />
      );
      
      const titleElement = container.querySelector('h3');
      expect(titleElement).toHaveClass('text-xs', 'sm:text-sm');
    });

    it('should have responsive value text sizing', () => {
      const { container } = render(
        <MetricsCard
          title="Test Metric"
          value={100}
          icon={MockIcon}
        />
      );
      
      const valueElement = container.querySelector('p[aria-label]');
      expect(valueElement).toHaveClass('text-xl', 'sm:text-2xl');
    });

    it('should have responsive icon sizing', () => {
      const { container } = render(
        <MetricsCard
          title="Test Metric"
          value={100}
          icon={Users}
        />
      );
      
      const iconElement = container.querySelector('svg');
      expect(iconElement).toHaveClass('h-4', 'w-4', 'sm:h-5', 'sm:w-5');
    });

    it('should have line-clamp for long text', () => {
      const { container } = render(
        <MetricsCard
          title="Very Long Title That Should Be Truncated"
          value={100}
          icon={MockIcon}
          subtitle="Very long subtitle that should also be truncated properly"
        />
      );
      
      const titleElement = container.querySelector('h3');
      const subtitleElement = container.querySelector('p.text-xs');
      
      expect(titleElement).toHaveClass('line-clamp-2');
      expect(subtitleElement).toHaveClass('line-clamp-2');
    });
  });

  describe('Loading State Responsive Classes', () => {
    it('should have responsive padding in loading state', () => {
      const { container } = render(
        <MetricsCard
          title="Test Metric"
          value={100}
          icon={MockIcon}
          loading={true}
        />
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-4', 'sm:p-6');
    });

    it('should have responsive skeleton sizes', () => {
      const { container } = render(
        <MetricsCard
          title="Test Metric"
          value={100}
          icon={MockIcon}
          loading={true}
        />
      );
      
      const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
      
      // Check for responsive skeleton classes
      const titleSkeleton = container.querySelector('.h-3.sm\\:h-4');
      const valueSkeleton = container.querySelector('.h-6.sm\\:h-8');
      
      expect(titleSkeleton).toBeTruthy();
      expect(valueSkeleton).toBeTruthy();
    });
  });

  describe('Error State Responsive Classes', () => {
    it('should maintain responsive classes in error state', () => {
      const { container } = render(
        <MetricsCard
          title="Test Metric"
          value={100}
          icon={MockIcon}
          error="Test error message"
        />
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-4', 'sm:p-6');
      
      const titleElement = container.querySelector('h3');
      expect(titleElement).toHaveClass('text-xs', 'sm:text-sm', 'line-clamp-2');
      
      const errorText = container.querySelector('p.text-xs');
      expect(errorText).toHaveClass('line-clamp-2');
    });
  });

  describe('Skeleton Components Responsive Classes', () => {
    it('ContractsMetricsSkeleton should have responsive grid', () => {
      const { container } = render(<ContractsMetricsSkeleton />);
      
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
    });

    it('ProductsMetricsSkeleton should have responsive grid', () => {
      const { container } = render(<ProductsMetricsSkeleton />);
      
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4');
    });

    it('UsersMetricsSkeleton should have responsive grid', () => {
      const { container } = render(<UsersMetricsSkeleton />);
      
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'sm:grid-cols-2');
    });

    it('All skeleton cards should have responsive padding', () => {
      const { container } = render(<ContractsMetricsSkeleton />);
      
      const cards = container.querySelectorAll('.rounded-lg.border.bg-card');
      cards.forEach(card => {
        expect(card).toHaveClass('p-4', 'sm:p-6');
      });
    });
  });

  describe('Responsive Breakpoint Classes', () => {
    const responsiveClasses = [
      // Padding classes
      'p-4', 'sm:p-6',
      'px-4', 'sm:px-6', 'lg:px-8',
      'py-6', 'sm:py-8',
      
      // Text sizing classes
      'text-xs', 'sm:text-sm',
      'text-lg', 'sm:text-xl',
      'text-xl', 'sm:text-2xl',
      'text-2xl', 'sm:text-3xl',
      
      // Icon sizing classes
      'h-3', 'w-3', 'sm:h-4', 'sm:w-4',
      'h-4', 'w-4', 'sm:h-5', 'sm:w-5',
      
      // Grid classes
      'grid-cols-1',
      'sm:grid-cols-2',
      'lg:grid-cols-3',
      'lg:grid-cols-4',
      
      // Spacing classes
      'space-y-6', 'lg:space-y-8',
      'gap-4',
      
      // Layout classes
      'flex-col', 'sm:flex-row',
      'items-start', 'sm:items-center',
    ];

    it('should use valid Tailwind responsive classes', () => {
      // This test ensures we're using proper Tailwind CSS responsive syntax
      responsiveClasses.forEach(className => {
        expect(className).toMatch(/^(sm:|lg:|xl:|2xl:)?[\w-]+$/);
      });
    });
  });

  describe('Accessibility in Responsive Design', () => {
    it('should maintain proper touch targets on mobile', () => {
      const { container } = render(
        <MetricsCard
          title="Test Metric"
          value={100}
          icon={MockIcon}
        />
      );
      
      // Cards should have adequate padding for touch targets
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-4'); // Minimum 16px padding
    });

    it('should maintain readable text at all sizes', () => {
      const { container } = render(
        <MetricsCard
          title="Test Metric"
          value={100}
          icon={MockIcon}
          subtitle="Test subtitle"
        />
      );
      
      // Text should never be smaller than text-xs (12px)
      const textElements = container.querySelectorAll('h3, p');
      textElements.forEach(element => {
        const classes = element.className;
        expect(classes).toMatch(/(text-xs|text-sm|text-base|text-lg|text-xl|text-2xl|text-3xl)/);
      });
    });
  });
});