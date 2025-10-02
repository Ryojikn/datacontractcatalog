import { render, screen } from '@testing-library/react'
import { DeploymentsModule } from '../deployments-module'
import type { DataProduct } from '@/types'

// Mock data for testing
const mockProduct: DataProduct = {
  id: 'test-product',
  name: 'Test Product',
  dataContractId: 'test-contract',
  configJson: {},
  github: {
    repoName: 'test-repo',
    repoUrl: 'https://github.com/test/test-repo',
    pagesUrl: 'https://test.github.io/test-repo'
  },
  deployments: [
    {
      id: 'deploy-1',
      date: '2024-01-09T12:00:00Z',
      status: 'success',
      environment: 'production',
      version: 'v1.0.0',
      deployedBy: 'github-actions',
      githubRunId: '123456789'
    },
    {
      id: 'deploy-2',
      date: '2024-01-08T15:30:00Z',
      status: 'failure',
      environment: 'staging',
      version: 'v0.9.9',
      deployedBy: 'github-actions',
      githubRunId: '123456788'
    },
    {
      id: 'deploy-3',
      date: '2024-01-07T09:15:00Z',
      status: 'running',
      environment: 'development',
      deployedBy: 'developer'
    }
  ]
}

const mockProductNoDeployments: DataProduct = {
  ...mockProduct,
  deployments: []
}

describe('DeploymentsModule', () => {
  it('renders deployments correctly', () => {
    render(<DeploymentsModule product={mockProduct} />)
    
    // Check if the title is rendered
    expect(screen.getByText('Recent Deployments')).toBeInTheDocument()
    
    // Check if deployments are rendered
    expect(screen.getByText('production')).toBeInTheDocument()
    expect(screen.getByText('staging')).toBeInTheDocument()
    expect(screen.getByText('development')).toBeInTheDocument()
    
    // Check if status badges are rendered
    expect(screen.getByText('success')).toBeInTheDocument()
    expect(screen.getByText('failure')).toBeInTheDocument()
    expect(screen.getByText('running')).toBeInTheDocument()
    
    // Check if versions are displayed
    expect(screen.getByText('v1.0.0')).toBeInTheDocument()
    expect(screen.getByText('v0.9.9')).toBeInTheDocument()
  })

  it('renders empty state when no deployments', () => {
    render(<DeploymentsModule product={mockProductNoDeployments} />)
    
    expect(screen.getByText('Recent Deployments')).toBeInTheDocument()
    expect(screen.getByText('No deployments found')).toBeInTheDocument()
    expect(screen.getByText('Deployments will appear here once GitHub Actions runs are executed')).toBeInTheDocument()
  })

  it('renders GitHub Actions links when githubRunId is available', () => {
    render(<DeploymentsModule product={mockProduct} />)
    
    // Check if external link icons are rendered for deployments with githubRunId
    const externalLinks = screen.getAllByTitle('View GitHub Actions run')
    expect(externalLinks).toHaveLength(2) // Only deploy-1 and deploy-2 have githubRunId
    
    // Check if the links have correct href
    expect(externalLinks[0]).toHaveAttribute('href', 'https://github.com/test/test-repo/actions/runs/123456789')
    expect(externalLinks[1]).toHaveAttribute('href', 'https://github.com/test/test-repo/actions/runs/123456788')
  })

  it('sorts deployments by date (most recent first)', () => {
    render(<DeploymentsModule product={mockProduct} />)
    
    const deploymentElements = screen.getAllByText(/production|staging|development/)
    
    // The order should be: production (2024-01-09), staging (2024-01-08), development (2024-01-07)
    expect(deploymentElements[0]).toHaveTextContent('production')
    expect(deploymentElements[1]).toHaveTextContent('staging')
    expect(deploymentElements[2]).toHaveTextContent('development')
  })

  it('shows deployed by information when available', () => {
    render(<DeploymentsModule product={mockProduct} />)
    
    expect(screen.getByText('by github-actions')).toBeInTheDocument()
    expect(screen.getByText('by developer')).toBeInTheDocument()
  })
})