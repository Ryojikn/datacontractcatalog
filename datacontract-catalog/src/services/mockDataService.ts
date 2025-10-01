import type {
  Domain,
  Collection,
  DataContract,
  DataProduct,
  ExecutionInfo,
  QualityRule,
  DeploymentInfo,
  QualityAlert,
  Layer,
  Status,
  ExecutionStatus,
  QualitySeverity
} from '../types';

// Mock data for banking domains
const mockDomains: Domain[] = [
  {
    id: 'cartoes',
    name: 'Cartões',
    description: 'Domínio responsável por todos os produtos e serviços relacionados a cartões de crédito e débito',
    collections: []
  },
  {
    id: 'seguros',
    name: 'Seguros',
    description: 'Domínio que gerencia produtos de seguros diversos como vida, auto, residencial',
    collections: []
  },
  {
    id: 'consorcio',
    name: 'Consórcio',
    description: 'Domínio dedicado aos produtos de consórcio imobiliário e de veículos',
    collections: []
  },
  {
    id: 'investimentos',
    name: 'Investimentos',
    description: 'Domínio que abrange produtos de investimento, fundos e aplicações financeiras',
    collections: []
  }
];

// Mock collections for cartões domain
const mockCollections: Collection[] = [
  {
    id: 'cartoes-credito',
    name: 'Cartões de Crédito',
    domainId: 'cartoes',
    contracts: []
  },
  {
    id: 'cartoes-debito',
    name: 'Cartões de Débito',
    domainId: 'cartoes',
    contracts: []
  },
  {
    id: 'cartoes-pre-pago',
    name: 'Cartões Pré-pago',
    domainId: 'cartoes',
    contracts: []
  }
];

// Mock quality rules
const mockQualityRules: QualityRule[] = [
  {
    id: 'qr-001',
    name: 'CPF Validation',
    description: 'Validates CPF format and check digit',
    type: 'format_validation',
    severity: 'high' as QualitySeverity,
    rule: 'cpf_column IS NOT NULL AND LENGTH(cpf_column) = 11',
    enabled: true,
    lastExecuted: '2024-01-09T10:30:00Z'
  },
  {
    id: 'qr-002',
    name: 'Email Format Check',
    description: 'Ensures email addresses follow valid format',
    type: 'format_validation',
    severity: 'medium' as QualitySeverity,
    rule: 'email_column REGEXP \'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$\'',
    enabled: true,
    lastExecuted: '2024-01-09T09:15:00Z'
  },
  {
    id: 'qr-003',
    name: 'Transaction Amount Range',
    description: 'Validates transaction amounts are within expected range',
    type: 'range_validation',
    severity: 'critical' as QualitySeverity,
    rule: 'transaction_amount > 0 AND transaction_amount < 1000000',
    enabled: true,
    lastExecuted: '2024-01-09T11:45:00Z'
  }
];

// Mock execution info
const mockExecutions: ExecutionInfo[] = [
  {
    id: 'exec-001',
    date: '2024-01-09T08:00:00Z',
    status: 'success' as ExecutionStatus,
    duration: 1200,
    technology: 'Databricks',
    logs: 'Job completed successfully'
  },
  {
    id: 'exec-002',
    date: '2024-01-08T08:00:00Z',
    status: 'success' as ExecutionStatus,
    duration: 1150,
    technology: 'Databricks'
  },
  {
    id: 'exec-003',
    date: '2024-01-07T08:00:00Z',
    status: 'failure' as ExecutionStatus,
    duration: 300,
    technology: 'Databricks',
    errorMessage: 'Connection timeout to source database'
  }
];

// Mock data contracts
const mockDataContracts: DataContract[] = [
  {
    id: 'dc-cartoes-transacoes',
    fundamentals: {
      name: 'Transações de Cartão de Crédito',
      version: '2.1.0',
      owner: 'time-cartoes@banco.com',
      domain: 'cartoes',
      collection: 'cartoes-credito',
      description: 'Contrato de dados para transações realizadas com cartões de crédito',
      createdAt: '2023-06-15T10:00:00Z',
      updatedAt: '2024-01-05T14:30:00Z'
    },
    schema: {
      tableName: 'cartoes_transacoes',
      columns: [
        {
          name: 'transaction_id',
          type: 'VARCHAR(50)',
          nullable: false,
          primaryKey: true,
          description: 'Identificador único da transação'
        },
        {
          name: 'card_number_hash',
          type: 'VARCHAR(64)',
          nullable: false,
          description: 'Hash do número do cartão para segurança'
        },
        {
          name: 'customer_cpf',
          type: 'VARCHAR(11)',
          nullable: false,
          description: 'CPF do cliente titular do cartão'
        },
        {
          name: 'transaction_amount',
          type: 'DECIMAL(15,2)',
          nullable: false,
          description: 'Valor da transação em reais'
        },
        {
          name: 'merchant_name',
          type: 'VARCHAR(200)',
          nullable: true,
          description: 'Nome do estabelecimento comercial'
        },
        {
          name: 'transaction_date',
          type: 'TIMESTAMP',
          nullable: false,
          description: 'Data e hora da transação'
        },
        {
          name: 'status',
          type: 'VARCHAR(20)',
          nullable: false,
          description: 'Status da transação (approved, denied, pending)'
        }
      ],
      dictionary: {
        'transaction_id': 'Chave primária única gerada pelo sistema de pagamentos',
        'card_number_hash': 'Número do cartão criptografado usando SHA-256',
        'customer_cpf': 'Documento de identificação do cliente, validado pelo sistema',
        'transaction_amount': 'Valor monetário com precisão de centavos',
        'merchant_name': 'Razão social ou nome fantasia do estabelecimento',
        'transaction_date': 'Timestamp UTC da autorização da transação',
        'status': 'Estados possíveis: approved, denied, pending, cancelled'
      },
      primaryKeys: ['transaction_id']
    },
    qualityRules: mockQualityRules,
    tags: {
      layer: 'Silver' as Layer,
      status: 'published' as Status,
      sensitivity: 'high',
      retention: '7years'
    },
    terms: {
      'data_retention': '7 anos conforme regulamentação do Banco Central',
      'access_level': 'Restrito a equipes de cartões e compliance',
      'update_frequency': 'Tempo real via CDC (Change Data Capture)'
    }
  }
];

// Mock deployments
const mockDeployments: DeploymentInfo[] = [
  {
    id: 'deploy-001',
    date: '2024-01-09T12:00:00Z',
    status: 'success' as ExecutionStatus,
    environment: 'production',
    version: 'v2.1.0',
    deployedBy: 'github-actions',
    githubRunId: '7234567890'
  },
  {
    id: 'deploy-002',
    date: '2024-01-08T15:30:00Z',
    status: 'success' as ExecutionStatus,
    environment: 'staging',
    version: 'v2.1.0-rc1',
    deployedBy: 'github-actions',
    githubRunId: '7234567889'
  },
  {
    id: 'deploy-003',
    date: '2024-01-07T09:15:00Z',
    status: 'failure' as ExecutionStatus,
    environment: 'production',
    version: 'v2.0.9',
    deployedBy: 'github-actions',
    githubRunId: '7234567888'
  }
];

// Mock quality alerts
const mockQualityAlerts: QualityAlert[] = [
  {
    id: 'qa-001',
    ruleId: 'qr-001',
    ruleName: 'CPF Validation',
    severity: 'high' as QualitySeverity,
    message: '15 registros com CPF inválido detectados na última execução',
    date: '2024-01-09T10:35:00Z',
    resolved: false,
    productId: 'dp-cartoes-etl'
  },
  {
    id: 'qa-002',
    ruleId: 'qr-003',
    ruleName: 'Transaction Amount Range',
    severity: 'medium' as QualitySeverity,
    message: '3 transações com valores fora do range esperado',
    date: '2024-01-08T14:20:00Z',
    resolved: true,
    productId: 'dp-cartoes-etl'
  }
];

// Mock data products
const mockDataProducts: DataProduct[] = [
  {
    id: 'dp-cartoes-etl',
    name: 'ETL Transações Cartões',
    dataContractId: 'dc-cartoes-transacoes',
    configJson: {
      source: {
        type: 'database',
        connection: 'oracle-prod-cartoes',
        table: 'TRANSACTIONS',
        incremental_column: 'UPDATED_AT'
      },
      target: {
        type: 'delta_lake',
        database: 'silver_cartoes',
        table: 'transacoes',
        partition_by: ['year', 'month']
      },
      transformation: {
        hash_columns: ['card_number'],
        mask_columns: ['customer_cpf'],
        quality_checks: true
      },
      schedule: {
        frequency: 'hourly',
        start_time: '00:00',
        timezone: 'America/Sao_Paulo'
      }
    },
    github: {
      repoName: 'data-cartoes-etl',
      repoUrl: 'https://github.com/banco/data-cartoes-etl',
      pagesUrl: 'https://banco.github.io/data-cartoes-etl',
      branch: 'main',
      lastCommit: {
        sha: 'a1b2c3d4e5f6',
        message: 'feat: add new quality validation rules',
        date: '2024-01-05T14:30:00Z',
        author: 'dev-team@banco.com'
      }
    },
    lastExecution: mockExecutions[0],
    technology: 'Databricks + Delta Lake',
    deployments: mockDeployments,
    qualityAlerts: mockQualityAlerts,
    description: 'Pipeline de ETL responsável por processar transações de cartões de crédito do sistema legado para o data lake',
    createdAt: '2023-06-15T10:00:00Z',
    updatedAt: '2024-01-05T14:30:00Z'
  },
  {
    id: 'dp-cartoes-analytics',
    name: 'Analytics Cartões Dashboard',
    dataContractId: 'dc-cartoes-transacoes',
    configJson: {
      source: {
        type: 'delta_lake',
        database: 'silver_cartoes',
        table: 'transacoes'
      },
      aggregations: {
        daily_summary: true,
        merchant_analysis: true,
        fraud_indicators: true
      },
      output: {
        type: 'power_bi',
        dataset: 'cartoes_analytics',
        refresh_schedule: 'daily'
      }
    },
    github: {
      repoName: 'cartoes-analytics-dashboard',
      repoUrl: 'https://github.com/banco/cartoes-analytics-dashboard',
      pagesUrl: 'https://banco.github.io/cartoes-analytics-dashboard',
      branch: 'main'
    },
    lastExecution: mockExecutions[1],
    technology: 'Power BI + Databricks',
    deployments: mockDeployments.slice(0, 2),
    qualityAlerts: [],
    description: 'Dashboard analítico para monitoramento de transações e detecção de padrões de uso de cartões',
    createdAt: '2023-08-20T09:00:00Z',
    updatedAt: '2024-01-03T11:15:00Z'
  }
];

// Populate collections with contracts
mockCollections[0].contracts = [mockDataContracts[0]]; // cartoes-credito
mockDomains[0].collections = mockCollections; // cartoes domain

/**
 * Mock Data Service
 * Simulates API calls with realistic delays and error scenarios
 */
export class MockDataService {
  private static instance: MockDataService;
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  // Domain operations
  async getDomains(): Promise<Domain[]> {
    await this.delay(300); // Simulate network delay
    return [...mockDomains];
  }

  async getDomainById(id: string): Promise<Domain | null> {
    await this.delay(200);
    return mockDomains.find(domain => domain.id === id) || null;
  }

  // Collection operations
  async getCollectionsByDomain(domainId: string): Promise<Collection[]> {
    await this.delay(250);
    return mockCollections.filter(collection => collection.domainId === domainId);
  }

  async getCollectionById(id: string): Promise<Collection | null> {
    await this.delay(200);
    return mockCollections.find(collection => collection.id === id) || null;
  }

  // DataContract operations
  async getContractsByCollection(collectionId: string): Promise<DataContract[]> {
    await this.delay(300);
    const collection = mockCollections.find(c => c.id === collectionId);
    return collection?.contracts || [];
  }

  async getContractById(id: string): Promise<DataContract | null> {
    await this.delay(250);
    return mockDataContracts.find(contract => contract.id === id) || null;
  }

  // DataProduct operations
  async getProductsByContract(contractId: string): Promise<DataProduct[]> {
    await this.delay(300);
    return mockDataProducts.filter(product => product.dataContractId === contractId);
  }

  async getProductById(id: string): Promise<DataProduct | null> {
    await this.delay(250);
    return mockDataProducts.find(product => product.id === id) || null;
  }

  // Quality and execution operations
  async getExecutionHistory(_productId: string): Promise<ExecutionInfo[]> {
    await this.delay(200);
    // Return mock executions for any product
    return [...mockExecutions];
  }

  async getQualityAlerts(productId: string): Promise<QualityAlert[]> {
    await this.delay(200);
    return mockQualityAlerts.filter(alert => alert.productId === productId);
  }

  async getDeployments(_productId: string): Promise<DeploymentInfo[]> {
    await this.delay(200);
    // Return mock deployments for any product
    return [...mockDeployments];
  }

  // Search operations
  async searchContracts(query: string): Promise<DataContract[]> {
    await this.delay(400);
    const lowerQuery = query.toLowerCase();
    return mockDataContracts.filter(contract => 
      contract.fundamentals.name.toLowerCase().includes(lowerQuery) ||
      contract.fundamentals.description?.toLowerCase().includes(lowerQuery)
    );
  }

  async searchProducts(query: string): Promise<DataProduct[]> {
    await this.delay(400);
    const lowerQuery = query.toLowerCase();
    return mockDataProducts.filter(product => 
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description?.toLowerCase().includes(lowerQuery)
    );
  }
}

// Export singleton instance
export const mockDataService = MockDataService.getInstance();