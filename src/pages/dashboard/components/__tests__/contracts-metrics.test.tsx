import React from 'react';
import { render, screen } from '@testing-library/react';
import { ContractsMetrics } from '../contracts-metrics';
import type { ContractMetrics } from '../../types/dashboard.types';

// Mock data for testing
const mockContractData: ContractMetrics = {
  total: 150,
  byStatus: {
    draft: 45,
    published: 85,
    archived: 20,
  },
  trend: {
    value: 12,
    direction: 'up',
    period: 'last month',
    percentage: 8.7,
  },
};

const mockContractDataEmpty: ContractMetrics = {
  total: 0,
  byStatus: {
    draft: 0,
    published: 0,
    archived: 0,
  },
};

describe('ContractsMetrics', () => {
  it('renders total contracts correctly', () => {
    render(
      <ContractsMetrics 
        data={mockContractData} 
        loading={false} 
      />
    );

    expect(screen.getByText('Total Data Contracts')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('renders status distribution correctly', () => {
    render(
      <ContractsMetrics 
        data={mockContractData} 
        loading={false} 
      />
    );

    expect(screen.getByText('Draft Contracts')).toBeInTheDocument();
    expect(screen.getByText('Published Contracts')).toBeInTheDocument();
    expect(screen.getByText('Archived Contracts')).toBeInTheDocument();
    
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('calculates percentages correctly', () => {
    render(
      <ContractsMetrics 
        data={mockContractData} 
        loading={false} 
      />
    );

    // Draft: 45/150 = 30%
    expect(screen.getByText('30.0% of total')).toBeInTheDocument();
    // Published: 85/150 = 56.7%
    expect(screen.getByText('56.7% of total')).toBeInTheDocument();
    // Archived: 20/150 = 13.3%
    expect(screen.getByText('13.3% of total')).toBeInTheDocument();
  });

  it('displays trend information when available', () => {
    render(
      <ContractsMetrics 
        data={mockContractData} 
        loading={false} 
      />
    );

    expect(screen.getByText('+8.7%')).toBeInTheDocument();
    expect(screen.getByText('vs last month')).toBeInTheDocument();
  });

  it('handles empty data correctly', () => {
    render(
      <ContractsMetrics 
        data={mockContractDataEmpty} 
        loading={false} 
      />
    );

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getAllByText('0.0% of total')).toHaveLength(3);
  });

  it('shows loading state', () => {
    render(
      <ContractsMetrics 
        data={mockContractData} 
        loading={true} 
      />
    );

    // Should show skeleton loaders
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows error state', () => {
    render(
      <ContractsMetrics 
        data={mockContractData} 
        loading={false}
        error="Failed to load contract metrics"
      />
    );

    expect(screen.getAllByText('--')).toHaveLength(4); // One for each card
    expect(screen.getAllByText('Failed to load contract metrics')).toHaveLength(4);
  });

  it('displays subtitle with correct contract counts', () => {
    render(
      <ContractsMetrics 
        data={mockContractData} 
        loading={false} 
      />
    );

    expect(screen.getByText('85 published, 45 draft, 20 archived')).toBeInTheDocument();
  });
});