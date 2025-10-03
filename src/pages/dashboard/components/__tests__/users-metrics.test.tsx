import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { UsersMetrics } from '../users-metrics';
import type { UserMetrics } from '../../types/dashboard.types';

// Mock data for testing
const mockUserMetrics: UserMetrics = {
  totalUsers: 250,
  activeUsers: 200,
  totalGroups: 15,
  trend: {
    value: 25,
    direction: 'up',
    period: 'mês anterior',
    percentage: 8.5
  }
};

const mockUserMetricsEmpty: UserMetrics = {
  totalUsers: 0,
  activeUsers: 0,
  totalGroups: 0
};

const mockUserMetricsNoGroups: UserMetrics = {
  totalUsers: 100,
  activeUsers: 75,
  totalGroups: 0
};

describe('UsersMetrics', () => {
  it('renders total users correctly', () => {
    render(
      <UsersMetrics 
        data={mockUserMetrics} 
        loading={false} 
      />
    );

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();
  });

  it('renders active users correctly', () => {
    render(
      <UsersMetrics 
        data={mockUserMetrics} 
        loading={false} 
      />
    );

    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('renders access groups correctly', () => {
    render(
      <UsersMetrics 
        data={mockUserMetrics} 
        loading={false} 
      />
    );

    expect(screen.getByText('Access Groups')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('calculates active user percentage correctly', () => {
    render(
      <UsersMetrics 
        data={mockUserMetrics} 
        loading={false} 
      />
    );

    // 200/250 = 80.0%
    expect(screen.getByText('80.0% of total users')).toBeInTheDocument();
  });

  it('renders main subtitle with active and inactive users', () => {
    render(
      <UsersMetrics 
        data={mockUserMetrics} 
        loading={false} 
      />
    );

    // 200 active (80.0%), 50 inactive
    expect(screen.getByText('200 active (80.0%), 50 inactive')).toBeInTheDocument();
  });

  it('calculates average users per group correctly', () => {
    render(
      <UsersMetrics 
        data={mockUserMetrics} 
        loading={false} 
      />
    );

    // 250 users / 15 groups = ~17 users per group
    expect(screen.getByText('~17 usuários por grupo')).toBeInTheDocument();
  });

  it('renders trend information when available', () => {
    render(
      <UsersMetrics 
        data={mockUserMetrics} 
        loading={false} 
      />
    );

    expect(screen.getByText('+8.5%')).toBeInTheDocument();
    expect(screen.getByText('vs mês anterior')).toBeInTheDocument();
  });

  it('handles empty data correctly', () => {
    render(
      <UsersMetrics 
        data={mockUserMetricsEmpty} 
        loading={false} 
      />
    );

    expect(screen.getByText('0 active (0%), 0 inactive')).toBeInTheDocument();
    expect(screen.getByText('0.0% of total users')).toBeInTheDocument();
  });

  it('handles zero groups with fallback message', () => {
    render(
      <UsersMetrics 
        data={mockUserMetricsNoGroups} 
        loading={false} 
      />
    );

    expect(screen.getByText('Sistema em configuração')).toBeInTheDocument();
  });

  it('renders loading state correctly', () => {
    render(
      <UsersMetrics 
        data={mockUserMetrics} 
        loading={true} 
      />
    );

    // Should render skeleton loaders
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders error state correctly', () => {
    render(
      <UsersMetrics 
        data={mockUserMetrics} 
        loading={false}
        error="Failed to load user metrics"
      />
    );

    expect(screen.getByText('Failed to load user metrics')).toBeInTheDocument();
    expect(screen.getAllByText('--')).toHaveLength(3); // Main card + 2 detail cards
  });

  it('applies correct CSS classes for card borders', () => {
    const { container } = render(
      <UsersMetrics 
        data={mockUserMetrics} 
        loading={false} 
      />
    );

    // Check that border classes are applied
    expect(container.querySelector('.border-l-green-500')).toBeInTheDocument(); // active users
    expect(container.querySelector('.border-l-blue-500')).toBeInTheDocument(); // access groups
  });

  it('renders correct icons for each metric', () => {
    render(
      <UsersMetrics 
        data={mockUserMetrics} 
        loading={false} 
      />
    );

    // Icons should be rendered (we can't easily test specific icons, but we can check they exist)
    const icons = document.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(2); // At least 3 icons (main + 2 detail cards)
  });

  it('handles edge case where active users exceed total users', () => {
    const edgeCaseData: UserMetrics = {
      totalUsers: 100,
      activeUsers: 120, // More active than total (shouldn't happen but let's handle it)
      totalGroups: 5
    };

    render(
      <UsersMetrics 
        data={edgeCaseData} 
        loading={false} 
      />
    );

    // Should still calculate percentage correctly
    expect(screen.getByText('120.0% of total users')).toBeInTheDocument();
    // Inactive users should be 0 (not negative)
    expect(screen.getByText('120 active (120.0%), 0 inactive')).toBeInTheDocument();
  });

  it('handles division by zero in percentage calculation', () => {
    const zeroTotalData: UserMetrics = {
      totalUsers: 0,
      activeUsers: 0,
      totalGroups: 5
    };

    render(
      <UsersMetrics 
        data={zeroTotalData} 
        loading={false} 
      />
    );

    expect(screen.getByText('0.0% of total users')).toBeInTheDocument();
  });

  it('handles division by zero in groups calculation', () => {
    const zeroGroupsData: UserMetrics = {
      totalUsers: 100,
      activeUsers: 80,
      totalGroups: 0
    };

    render(
      <UsersMetrics 
        data={zeroGroupsData} 
        loading={false} 
      />
    );

    expect(screen.getByText('Sistema em configuração')).toBeInTheDocument();
  });
});