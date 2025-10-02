import { render, screen } from '@testing-library/react'
import { QualityMonitorModule } from '../quality-monitor-module'
import type { DataProduct } from '@/types'

// Mock the mockDataService
jest.mock('@/services/mockDataService', () => ({
  mockDataService: {
    getQualityAlerts: jest.fn()
  }
}))

const mockProduct: DataProduct = {
  id: 'test-product',
  name: 'Test Product',
  dataContractId: 'test-contract',
  configJson: {},
  github: {
    repoName: 'test-repo',
    repoUrl: 'https://github.com/test/test-repo',
    pagesUrl: 'https://test.github.io'
  },
  qualityAlerts: [
    {
      id: 'qa-001',
      ruleId: 'qr-001',
      ruleName: 'CPF Validation',
      severity: 'high',
      message: '15 registros com CPF inválido detectados',
      date: '2024-01-09T10:35:00Z',
      resolved: false,
      productId: 'test-product'
    },
    {
      id: 'qa-002',
      ruleId: 'qr-002',
      ruleName: 'Email Format',
      severity: 'medium',
      message: 'Formato de email inválido encontrado',
      date: '2024-01-08T14:20:00Z',
      resolved: true,
      productId: 'test-product'
    }
  ]
}

describe('QualityMonitorModule', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders quality monitoring header', () => {
    render(<QualityMonitorModule product={mockProduct} />)
    expect(screen.getByText('Quality Monitoring')).toBeInTheDocument()
  })

  it('shows overall quality status', async () => {
    const { mockDataService } = await import('@/services/mockDataService')
    ;(mockDataService.getQualityAlerts as jest.Mock).mockResolvedValue(mockProduct.qualityAlerts || [])
    
    render(<QualityMonitorModule product={mockProduct} />)
    
    // Should show warning status due to active high severity alert
    expect(await screen.findByText('Warning')).toBeInTheDocument()
  })

  it('displays quality alerts with severity indicators', async () => {
    const { mockDataService } = await import('@/services/mockDataService')
    ;(mockDataService.getQualityAlerts as jest.Mock).mockResolvedValue(mockProduct.qualityAlerts || [])
    
    render(<QualityMonitorModule product={mockProduct} />)
    
    // Should show alert names
    expect(await screen.findByText('CPF Validation')).toBeInTheDocument()
    expect(await screen.findByText('Email Format')).toBeInTheDocument()
    
    // Should show severity badges
    expect(await screen.findByText('high')).toBeInTheDocument()
    expect(await screen.findByText('medium')).toBeInTheDocument()
  })

  it('shows healthy status when no active alerts', async () => {
    const { mockDataService } = await import('@/services/mockDataService')
    ;(mockDataService.getQualityAlerts as jest.Mock).mockResolvedValue([])
    
    render(<QualityMonitorModule product={mockProduct} />)
    
    expect(await screen.findByText('Healthy')).toBeInTheDocument()
    expect(await screen.findByText('All quality checks passing')).toBeInTheDocument()
  })

  it('includes external links to quality reports', async () => {
    const { mockDataService } = await import('@/services/mockDataService')
    ;(mockDataService.getQualityAlerts as jest.Mock).mockResolvedValue(mockProduct.qualityAlerts || [])
    
    render(<QualityMonitorModule product={mockProduct} />)
    
    // Should have external links for detailed reports
    const externalLinks = await screen.findAllByTitle('View detailed quality report')
    expect(externalLinks.length).toBeGreaterThan(0)
  })
})