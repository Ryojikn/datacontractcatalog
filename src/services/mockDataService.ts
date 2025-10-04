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
  QualitySeverity
} from '../types';

import type {
  DashboardData,
  ContractMetrics,
  ProductMetrics,
  UserMetrics,
  MetricTrend
} from '../pages/dashboard/types/dashboard.types';

// Simulate network delays and potential errors
const simulateNetworkCall = async <T>(data: T, delay: number = 300): Promise<T> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, delay))

  // Simulate occasional network errors (2% chance)
  if (Math.random() < 0.02) {
    throw new Error('Network error: Unable to connect to server')
  }

  return data
};

// Generate realistic trend data based on metric type and current value
const generateRealisticTrend = (metricType: 'contracts' | 'products' | 'users', currentValue: number): MetricTrend => {
  // Define realistic trend patterns for each metric type
  const trendPatterns = {
    contracts: {
      // Data contracts typically grow steadily with occasional dips during migrations
      upProbability: 0.65,
      stableProbability: 0.25,
      maxGrowth: 15,
      maxDecline: 8,
      periods: ['mês anterior', 'últimas 4 semanas', 'período anterior']
    },
    products: {
      // Data products grow more aggressively as platform adoption increases
      upProbability: 0.70,
      stableProbability: 0.20,
      maxGrowth: 25,
      maxDecline: 12,
      periods: ['mês anterior', 'últimas 4 semanas', 'trimestre anterior']
    },
    users: {
      // User growth is typically steady with seasonal variations
      upProbability: 0.75,
      stableProbability: 0.15,
      maxGrowth: 30,
      maxDecline: 5,
      periods: ['mês anterior', 'últimas 6 semanas', 'período anterior']
    }
  };

  const pattern = trendPatterns[metricType];
  const random = Math.random();
  
  let direction: 'up' | 'down' | 'stable';
  let percentage: number;
  
  if (random < pattern.upProbability) {
    direction = 'up';
    // Generate realistic growth percentage (weighted towards smaller values)
    const growthFactor = Math.random() * Math.random(); // Bias towards smaller values
    percentage = Math.ceil(growthFactor * pattern.maxGrowth) + 1;
  } else if (random < pattern.upProbability + pattern.stableProbability) {
    direction = 'stable';
    percentage = Math.floor(Math.random() * 3); // 0-2% for stable
  } else {
    direction = 'down';
    // Generate realistic decline percentage
    const declineFactor = Math.random() * Math.random(); // Bias towards smaller values
    percentage = -(Math.ceil(declineFactor * pattern.maxDecline) + 1);
  }

  // Calculate absolute value change based on percentage
  const absoluteChange = Math.round((currentValue * Math.abs(percentage)) / 100);
  
  // Select random period
  const period = pattern.periods[Math.floor(Math.random() * pattern.periods.length)];

  return {
    value: direction === 'down' ? -absoluteChange : absoluteChange,
    direction,
    period,
    percentage: direction === 'stable' ? Math.abs(percentage) : percentage
  };
};

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

// Mock collections for all domains
const mockCollections: Collection[] = [
  // Cartões domain collections
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
  },
  // Seguros domain collections
  {
    id: 'seguros-vida',
    name: 'Seguros de Vida',
    domainId: 'seguros',
    contracts: []
  },
  {
    id: 'seguros-auto',
    name: 'Seguros Auto',
    domainId: 'seguros',
    contracts: []
  },
  {
    id: 'seguros-residencial',
    name: 'Seguros Residencial',
    domainId: 'seguros',
    contracts: []
  },
  // Consórcio domain collections
  {
    id: 'consorcio-imoveis',
    name: 'Consórcio Imóveis',
    domainId: 'consorcio',
    contracts: []
  },
  {
    id: 'consorcio-veiculos',
    name: 'Consórcio Veículos',
    domainId: 'consorcio',
    contracts: []
  },
  // Investimentos domain collections
  {
    id: 'fundos-investimento',
    name: 'Fundos de Investimento',
    domainId: 'investimentos',
    contracts: []
  },
  {
    id: 'renda-fixa',
    name: 'Renda Fixa',
    domainId: 'investimentos',
    contracts: []
  }
];

// Mock quality rules - diverse rules for different domains
const mockQualityRules: QualityRule[] = [
  // CARTÕES QUALITY RULES
  {
    id: 'qr-001',
    name: 'CPF Validation',
    description: 'Validates CPF format and check digit according to Brazilian standards',
    type: 'format_validation',
    severity: 'high' as QualitySeverity,
    rule: 'cpf_column IS NOT NULL AND LENGTH(cpf_column) = 11 AND cpf_check_digit(cpf_column) = true',
    enabled: true,
    lastExecuted: '2024-01-09T10:30:00Z'
  },
  {
    id: 'qr-002',
    name: 'Email Format Check',
    description: 'Ensures email addresses follow valid RFC 5322 format',
    type: 'format_validation',
    severity: 'medium' as QualitySeverity,
    rule: 'email_column REGEXP \'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$\'',
    enabled: true,
    lastExecuted: '2024-01-09T09:15:00Z'
  },
  {
    id: 'qr-003',
    name: 'Transaction Amount Range',
    description: 'Validates transaction amounts are within expected business range to prevent fraud',
    type: 'range_validation',
    severity: 'critical' as QualitySeverity,
    rule: 'transaction_amount > 0 AND transaction_amount < 1000000',
    enabled: true,
    lastExecuted: '2024-01-09T11:45:00Z'
  },
  {
    id: 'qr-004',
    name: 'Transaction ID Uniqueness',
    description: 'Ensures all transaction IDs are unique across the dataset',
    type: 'uniqueness',
    severity: 'critical' as QualitySeverity,
    rule: 'COUNT(DISTINCT transaction_id) = COUNT(*)',
    enabled: true,
    lastExecuted: '2024-01-09T08:00:00Z'
  },
  {
    id: 'qr-005',
    name: 'Merchant Name Completeness',
    description: 'Checks that merchant names are provided for all approved transactions',
    type: 'completeness',
    severity: 'medium' as QualitySeverity,
    rule: 'CASE WHEN status = \'approved\' THEN merchant_name IS NOT NULL ELSE true END',
    enabled: true,
    lastExecuted: '2024-01-09T07:30:00Z'
  },
  {
    id: 'qr-006',
    name: 'Transaction Date Consistency',
    description: 'Validates that transaction dates are not in the future and within reasonable past range',
    type: 'consistency',
    severity: 'high' as QualitySeverity,
    rule: 'transaction_date <= CURRENT_TIMESTAMP AND transaction_date >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 2 YEAR)',
    enabled: true,
    lastExecuted: '2024-01-09T06:45:00Z'
  },
  // SEGUROS QUALITY RULES
  {
    id: 'qr-007',
    name: 'Policy Amount Validation',
    description: 'Ensures policy coverage amounts are within regulatory limits',
    type: 'range_validation',
    severity: 'critical' as QualitySeverity,
    rule: 'coverage_amount > 1000 AND coverage_amount <= 10000000',
    enabled: true,
    lastExecuted: '2024-01-09T05:20:00Z'
  },
  {
    id: 'qr-008',
    name: 'Beneficiary CPF Validation',
    description: 'Validates beneficiary CPF format for life insurance policies',
    type: 'format_validation',
    severity: 'high' as QualitySeverity,
    rule: 'beneficiary_cpf IS NOT NULL AND LENGTH(beneficiary_cpf) = 11 AND cpf_check_digit(beneficiary_cpf) = true',
    enabled: true,
    lastExecuted: '2024-01-08T14:00:00Z'
  },
  {
    id: 'qr-009',
    name: 'Claim Amount Reasonableness',
    description: 'Validates that claim amounts do not exceed policy coverage',
    type: 'business_rule',
    severity: 'critical' as QualitySeverity,
    rule: 'claim_amount <= (SELECT coverage_amount FROM policies WHERE policy_id = claims.policy_id)',
    enabled: true,
    lastExecuted: '2024-01-07T12:30:00Z'
  },
  {
    id: 'qr-010',
    name: 'Vehicle Year Validation',
    description: 'Ensures vehicle year is within acceptable range for auto insurance',
    type: 'range_validation',
    severity: 'medium' as QualitySeverity,
    rule: 'vehicle_year >= 1990 AND vehicle_year <= YEAR(CURRENT_DATE)',
    enabled: true,
    lastExecuted: '2024-01-08T16:20:00Z'
  },
  // CONSÓRCIO QUALITY RULES
  {
    id: 'qr-011',
    name: 'Group Participant Count',
    description: 'Validates that consortium groups have minimum required participants',
    type: 'business_rule',
    severity: 'high' as QualitySeverity,
    rule: 'total_participants >= 50 AND total_participants <= 300',
    enabled: true,
    lastExecuted: '2024-01-08T11:15:00Z'
  },
  {
    id: 'qr-012',
    name: 'Payment Amount Consistency',
    description: 'Ensures payment amounts match group installment values',
    type: 'consistency',
    severity: 'critical' as QualitySeverity,
    rule: 'ABS(payment_amount - monthly_installment) <= 0.01',
    enabled: true,
    lastExecuted: '2024-01-09T09:45:00Z'
  },
  {
    id: 'qr-013',
    name: 'Contemplation Date Logic',
    description: 'Validates that contemplation dates are after join dates',
    type: 'consistency',
    severity: 'high' as QualitySeverity,
    rule: 'contemplation_date IS NULL OR contemplation_date >= join_date',
    enabled: true,
    lastExecuted: '2024-01-08T13:30:00Z'
  },
  // INVESTIMENTOS QUALITY RULES
  {
    id: 'qr-014',
    name: 'Fund NAV Validation',
    description: 'Validates that fund NAV values are positive and within reasonable range',
    type: 'range_validation',
    severity: 'critical' as QualitySeverity,
    rule: 'quota_value > 0 AND quota_value < 1000000',
    enabled: true,
    lastExecuted: '2024-01-09T17:00:00Z'
  },
  {
    id: 'qr-015',
    name: 'Investment Amount Consistency',
    description: 'Ensures investment amounts match quota quantity times quota value',
    type: 'consistency',
    severity: 'critical' as QualitySeverity,
    rule: 'ABS(investment_amount - (quota_quantity * quota_value)) <= 0.01',
    enabled: true,
    lastExecuted: '2024-01-09T17:15:00Z'
  },
  {
    id: 'qr-016',
    name: 'Maturity Date Validation',
    description: 'Validates that fixed income securities have future maturity dates',
    type: 'consistency',
    severity: 'high' as QualitySeverity,
    rule: 'maturity_date > CURRENT_DATE',
    enabled: true,
    lastExecuted: '2024-01-09T16:45:00Z'
  },
  {
    id: 'qr-017',
    name: 'Interest Rate Range',
    description: 'Validates that interest rates are within market reasonable range',
    type: 'range_validation',
    severity: 'medium' as QualitySeverity,
    rule: 'interest_rate >= 0 AND interest_rate <= 50',
    enabled: true,
    lastExecuted: '2024-01-09T16:30:00Z'
  },
  {
    id: 'qr-018',
    name: 'Security Code Format',
    description: 'Validates ISIN code format for securities',
    type: 'format_validation',
    severity: 'medium' as QualitySeverity,
    rule: 'security_code REGEXP \'^[A-Z]{2}[A-Z0-9]{9}[0-9]$\' OR LENGTH(security_code) <= 20',
    enabled: true,
    lastExecuted: '2024-01-09T16:00:00Z'
  },
  // CROSS-DOMAIN QUALITY RULES
  {
    id: 'qr-019',
    name: 'Data Freshness Check',
    description: 'Monitors data freshness across all domains',
    type: 'timeliness',
    severity: 'medium' as QualitySeverity,
    rule: 'DATEDIFF(CURRENT_TIMESTAMP, last_updated) <= 1',
    enabled: true,
    lastExecuted: '2024-01-09T18:00:00Z'
  },
  {
    id: 'qr-020',
    name: 'Record Count Anomaly Detection',
    description: 'Detects unusual spikes or drops in daily record counts',
    type: 'anomaly_detection',
    severity: 'low' as QualitySeverity,
    rule: 'daily_record_count BETWEEN (avg_30_day_count * 0.7) AND (avg_30_day_count * 1.3)',
    enabled: true,
    lastExecuted: '2024-01-09T19:00:00Z'
  }
];

// Import shared mock data
import { mockExecutions, mockDeployments, mockQualityAlerts } from './mockDataShared';

// Mock data contracts - Expanded with comprehensive Cartões domain
const mockDataContracts: DataContract[] = [
  // CARTÕES DE CRÉDITO CONTRACTS
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
          name: 'merchant_category',
          type: 'VARCHAR(4)',
          nullable: true,
          description: 'Código MCC do estabelecimento'
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
        },
        {
          name: 'credit_limit',
          type: 'DECIMAL(15,2)',
          nullable: true,
          description: 'Limite de crédito disponível no momento da transação'
        }
      ],
      dictionary: {
        'transaction_id': 'Chave primária única gerada pelo sistema de pagamentos',
        'card_number_hash': 'Número do cartão criptografado usando SHA-256',
        'customer_cpf': 'Documento de identificação do cliente, validado pelo sistema',
        'transaction_amount': 'Valor monetário com precisão de centavos',
        'merchant_name': 'Razão social ou nome fantasia do estabelecimento',
        'merchant_category': 'Merchant Category Code conforme padrão ISO 18245',
        'transaction_date': 'Timestamp UTC da autorização da transação',
        'status': 'Estados possíveis: approved, denied, pending, cancelled',
        'credit_limit': 'Limite disponível após a transação'
      },
      primaryKeys: ['transaction_id']
    },
    qualityRules: mockQualityRules.slice(0, 5),
    tags: {
      layer: 'Bronze' as Layer,
      status: 'published' as Status,
      sensitivity: 'high',
      retention: '7years'
    },
    terms: {
      'data_retention': '7 anos conforme regulamentação do Banco Central',
      'access_level': 'Restrito a equipes de cartões e compliance',
      'update_frequency': 'Tempo real via CDC (Change Data Capture)'
    }
  },
  {
    id: 'dc-cartoes-clientes',
    fundamentals: {
      name: 'Clientes Cartão de Crédito',
      version: '1.3.0',
      owner: 'time-cartoes@banco.com',
      domain: 'cartoes',
      collection: 'cartoes-credito',
      description: 'Dados dos clientes portadores de cartões de crédito',
      createdAt: '2023-05-10T08:00:00Z',
      updatedAt: '2024-01-08T16:45:00Z'
    },
    schema: {
      tableName: 'cartoes_clientes',
      columns: [
        {
          name: 'customer_id',
          type: 'VARCHAR(36)',
          nullable: false,
          primaryKey: true,
          description: 'UUID do cliente'
        },
        {
          name: 'cpf',
          type: 'VARCHAR(11)',
          nullable: false,
          description: 'CPF do cliente'
        },
        {
          name: 'full_name',
          type: 'VARCHAR(200)',
          nullable: false,
          description: 'Nome completo do cliente'
        },
        {
          name: 'birth_date',
          type: 'DATE',
          nullable: false,
          description: 'Data de nascimento'
        },
        {
          name: 'income',
          type: 'DECIMAL(15,2)',
          nullable: true,
          description: 'Renda mensal declarada'
        },
        {
          name: 'credit_score',
          type: 'INTEGER',
          nullable: true,
          description: 'Score de crédito (0-1000)'
        },
        {
          name: 'account_opening_date',
          type: 'DATE',
          nullable: false,
          description: 'Data de abertura da conta'
        },
        {
          name: 'status',
          type: 'VARCHAR(20)',
          nullable: false,
          description: 'Status do cliente (active, inactive, blocked)'
        }
      ],
      dictionary: {
        'customer_id': 'Identificador único universal do cliente',
        'cpf': 'Cadastro de Pessoa Física validado pela Receita Federal',
        'full_name': 'Nome completo conforme documento de identidade',
        'birth_date': 'Data de nascimento para cálculo de idade',
        'income': 'Renda mensal bruta declarada pelo cliente',
        'credit_score': 'Pontuação de crédito calculada pelo bureau de crédito',
        'account_opening_date': 'Data de início do relacionamento bancário',
        'status': 'Estados: active, inactive, blocked, suspended'
      },
      primaryKeys: ['customer_id']
    },
    qualityRules: [mockQualityRules[0], mockQualityRules[1]],
    tags: {
      layer: 'Gold' as Layer,
      status: 'published' as Status,
      sensitivity: 'critical',
      retention: '10years'
    },
    terms: {
      'data_retention': '10 anos após encerramento da conta',
      'access_level': 'Restrito - necessária aprovação de compliance',
      'update_frequency': 'Diário via batch ETL'
    }
  },
  // CARTÕES DE DÉBITO CONTRACTS
  {
    id: 'dc-debito-transacoes',
    fundamentals: {
      name: 'Transações de Cartão de Débito',
      version: '1.8.0',
      owner: 'time-cartoes@banco.com',
      domain: 'cartoes',
      collection: 'cartoes-debito',
      description: 'Transações realizadas com cartões de débito vinculados a contas correntes',
      createdAt: '2023-04-20T12:00:00Z',
      updatedAt: '2024-01-07T09:30:00Z'
    },
    schema: {
      tableName: 'debito_transacoes',
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
          description: 'Hash do número do cartão'
        },
        {
          name: 'account_number',
          type: 'VARCHAR(20)',
          nullable: false,
          description: 'Número da conta corrente vinculada'
        },
        {
          name: 'customer_cpf',
          type: 'VARCHAR(11)',
          nullable: false,
          description: 'CPF do titular da conta'
        },
        {
          name: 'transaction_amount',
          type: 'DECIMAL(15,2)',
          nullable: false,
          description: 'Valor debitado da conta'
        },
        {
          name: 'available_balance',
          type: 'DECIMAL(15,2)',
          nullable: false,
          description: 'Saldo disponível após transação'
        },
        {
          name: 'merchant_name',
          type: 'VARCHAR(200)',
          nullable: true,
          description: 'Nome do estabelecimento'
        },
        {
          name: 'transaction_date',
          type: 'TIMESTAMP',
          nullable: false,
          description: 'Data e hora da transação'
        },
        {
          name: 'channel',
          type: 'VARCHAR(20)',
          nullable: false,
          description: 'Canal da transação (pos, atm, online)'
        }
      ],
      dictionary: {
        'transaction_id': 'Identificador único gerado pelo sistema de débito',
        'card_number_hash': 'Hash SHA-256 do número do cartão de débito',
        'account_number': 'Número da conta corrente do cliente',
        'customer_cpf': 'CPF do titular da conta corrente',
        'transaction_amount': 'Valor em reais debitado da conta',
        'available_balance': 'Saldo disponível na conta após o débito',
        'merchant_name': 'Estabelecimento onde foi realizada a compra',
        'transaction_date': 'Timestamp da autorização da transação',
        'channel': 'Canais: pos, atm, online, mobile'
      },
      primaryKeys: ['transaction_id']
    },
    qualityRules: [mockQualityRules[0], mockQualityRules[2], mockQualityRules[3]],
    tags: {
      layer: 'Silver' as Layer,
      status: 'published' as Status,
      sensitivity: 'high',
      retention: '5years'
    },
    terms: {
      'data_retention': '5 anos conforme regulamentação bancária',
      'access_level': 'Restrito a equipes de contas e cartões',
      'update_frequency': 'Tempo real via streaming'
    }
  },
  // CARTÕES PRÉ-PAGO CONTRACTS
  {
    id: 'dc-prepago-transacoes',
    fundamentals: {
      name: 'Transações Cartão Pré-pago',
      version: '1.2.0',
      owner: 'time-cartoes@banco.com',
      domain: 'cartoes',
      collection: 'cartoes-pre-pago',
      description: 'Transações realizadas com cartões pré-pagos e recargas',
      createdAt: '2023-08-15T14:00:00Z',
      updatedAt: '2024-01-06T11:20:00Z'
    },
    schema: {
      tableName: 'prepago_transacoes',
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
          description: 'Hash do número do cartão pré-pago'
        },
        {
          name: 'customer_cpf',
          type: 'VARCHAR(11)',
          nullable: true,
          description: 'CPF do portador (opcional para cartões anônimos)'
        },
        {
          name: 'transaction_type',
          type: 'VARCHAR(20)',
          nullable: false,
          description: 'Tipo: purchase, reload, withdrawal'
        },
        {
          name: 'transaction_amount',
          type: 'DECIMAL(15,2)',
          nullable: false,
          description: 'Valor da transação'
        },
        {
          name: 'card_balance_before',
          type: 'DECIMAL(15,2)',
          nullable: false,
          description: 'Saldo do cartão antes da transação'
        },
        {
          name: 'card_balance_after',
          type: 'DECIMAL(15,2)',
          nullable: false,
          description: 'Saldo do cartão após a transação'
        },
        {
          name: 'merchant_name',
          type: 'VARCHAR(200)',
          nullable: true,
          description: 'Nome do estabelecimento'
        },
        {
          name: 'transaction_date',
          type: 'TIMESTAMP',
          nullable: false,
          description: 'Data e hora da transação'
        }
      ],
      dictionary: {
        'transaction_id': 'Chave única da transação no sistema pré-pago',
        'card_number_hash': 'Hash do número do cartão pré-pago',
        'customer_cpf': 'CPF opcional - cartões podem ser anônimos',
        'transaction_type': 'Tipos: purchase (compra), reload (recarga), withdrawal (saque)',
        'transaction_amount': 'Valor em reais da operação',
        'card_balance_before': 'Saldo disponível antes da operação',
        'card_balance_after': 'Saldo resultante após a operação',
        'merchant_name': 'Estabelecimento comercial ou ponto de recarga',
        'transaction_date': 'Timestamp UTC da transação'
      },
      primaryKeys: ['transaction_id']
    },
    qualityRules: [mockQualityRules[2], mockQualityRules[3], mockQualityRules[5]],
    tags: {
      layer: 'Silver' as Layer,
      status: 'published' as Status,
      sensitivity: 'medium',
      retention: '3years'
    },
    terms: {
      'data_retention': '3 anos para cartões nominais, 1 ano para anônimos',
      'access_level': 'Acesso liberado para equipes de produtos pré-pagos',
      'update_frequency': 'Tempo real via API streaming'
    }
  },
  // SEGUROS DOMAIN CONTRACTS
  {
    id: 'dc-seguros-vida-apolices',
    fundamentals: {
      name: 'Apólices Seguro de Vida',
      version: '1.5.0',
      owner: 'time-seguros@banco.com',
      domain: 'seguros',
      collection: 'seguros-vida',
      description: 'Dados das apólices de seguro de vida e beneficiários',
      createdAt: '2023-03-10T10:00:00Z',
      updatedAt: '2024-01-04T15:20:00Z'
    },
    schema: {
      tableName: 'seguros_vida_apolices',
      columns: [
        {
          name: 'policy_id',
          type: 'VARCHAR(36)',
          nullable: false,
          primaryKey: true,
          description: 'UUID da apólice'
        },
        {
          name: 'customer_cpf',
          type: 'VARCHAR(11)',
          nullable: false,
          description: 'CPF do segurado'
        },
        {
          name: 'policy_number',
          type: 'VARCHAR(20)',
          nullable: false,
          description: 'Número da apólice'
        },
        {
          name: 'coverage_amount',
          type: 'DECIMAL(15,2)',
          nullable: false,
          description: 'Valor da cobertura em reais'
        },
        {
          name: 'premium_amount',
          type: 'DECIMAL(10,2)',
          nullable: false,
          description: 'Valor do prêmio mensal'
        },
        {
          name: 'start_date',
          type: 'DATE',
          nullable: false,
          description: 'Data de início da vigência'
        },
        {
          name: 'end_date',
          type: 'DATE',
          nullable: true,
          description: 'Data de fim da vigência'
        },
        {
          name: 'beneficiary_cpf',
          type: 'VARCHAR(11)',
          nullable: false,
          description: 'CPF do beneficiário principal'
        },
        {
          name: 'status',
          type: 'VARCHAR(20)',
          nullable: false,
          description: 'Status da apólice (active, cancelled, expired)'
        }
      ],
      dictionary: {
        'policy_id': 'Identificador único universal da apólice',
        'customer_cpf': 'CPF do segurado titular da apólice',
        'policy_number': 'Número sequencial da apólice para identificação externa',
        'coverage_amount': 'Valor segurado em caso de sinistro',
        'premium_amount': 'Valor mensal pago pelo segurado',
        'start_date': 'Data de início da cobertura do seguro',
        'end_date': 'Data de término da cobertura (null para apólices ativas)',
        'beneficiary_cpf': 'CPF do beneficiário que receberá a indenização',
        'status': 'Estados: active, cancelled, expired, suspended'
      },
      primaryKeys: ['policy_id']
    },
    qualityRules: [mockQualityRules[0], mockQualityRules[2]],
    tags: {
      layer: 'Bronze' as Layer,
      status: 'published' as Status,
      sensitivity: 'critical',
      retention: '30years'
    },
    terms: {
      'data_retention': '30 anos após vencimento da apólice',
      'access_level': 'Restrito - equipes de seguros e atuária',
      'update_frequency': 'Diário via batch ETL'
    }
  },
  {
    id: 'dc-seguros-auto-sinistros',
    fundamentals: {
      name: 'Sinistros Seguro Auto',
      version: '2.0.0',
      owner: 'time-seguros@banco.com',
      domain: 'seguros',
      collection: 'seguros-auto',
      description: 'Dados de sinistros de seguros automotivos e regulações',
      createdAt: '2023-02-15T08:30:00Z',
      updatedAt: '2024-01-09T12:45:00Z'
    },
    schema: {
      tableName: 'seguros_auto_sinistros',
      columns: [
        {
          name: 'claim_id',
          type: 'VARCHAR(36)',
          nullable: false,
          primaryKey: true,
          description: 'UUID do sinistro'
        },
        {
          name: 'policy_id',
          type: 'VARCHAR(36)',
          nullable: false,
          description: 'ID da apólice relacionada'
        },
        {
          name: 'customer_cpf',
          type: 'VARCHAR(11)',
          nullable: false,
          description: 'CPF do segurado'
        },
        {
          name: 'claim_date',
          type: 'TIMESTAMP',
          nullable: false,
          description: 'Data e hora do sinistro'
        },
        {
          name: 'claim_type',
          type: 'VARCHAR(50)',
          nullable: false,
          description: 'Tipo do sinistro (collision, theft, vandalism)'
        },
        {
          name: 'claim_amount',
          type: 'DECIMAL(15,2)',
          nullable: false,
          description: 'Valor solicitado da indenização'
        },
        {
          name: 'approved_amount',
          type: 'DECIMAL(15,2)',
          nullable: true,
          description: 'Valor aprovado para pagamento'
        },
        {
          name: 'vehicle_year',
          type: 'INTEGER',
          nullable: false,
          description: 'Ano do veículo sinistrado'
        },
        {
          name: 'vehicle_brand',
          type: 'VARCHAR(50)',
          nullable: false,
          description: 'Marca do veículo'
        },
        {
          name: 'status',
          type: 'VARCHAR(20)',
          nullable: false,
          description: 'Status do sinistro (open, approved, denied, paid)'
        }
      ],
      dictionary: {
        'claim_id': 'Identificador único do sinistro',
        'policy_id': 'Referência à apólice de seguro auto',
        'customer_cpf': 'CPF do segurado que abriu o sinistro',
        'claim_date': 'Data e hora em que ocorreu o sinistro',
        'claim_type': 'Tipos: collision, theft, vandalism, fire, flood',
        'claim_amount': 'Valor solicitado pelo segurado',
        'approved_amount': 'Valor aprovado após regulação',
        'vehicle_year': 'Ano de fabricação do veículo',
        'vehicle_brand': 'Marca do veículo sinistrado',
        'status': 'Estados: open, under_review, approved, denied, paid'
      },
      primaryKeys: ['claim_id']
    },
    qualityRules: [mockQualityRules[0], mockQualityRules[2], mockQualityRules[5]],
    tags: {
      layer: 'Bronze' as Layer,
      status: 'published' as Status,
      sensitivity: 'high',
      retention: '10years'
    },
    terms: {
      'data_retention': '10 anos conforme regulamentação SUSEP',
      'access_level': 'Restrito a equipes de sinistros e regulação',
      'update_frequency': 'Tempo real via API'
    }
  },
  {
    id: 'dc-seguros-residencial-apolices',
    fundamentals: {
      name: 'Apólices Seguro Residencial',
      version: '1.3.0',
      owner: 'time-seguros@banco.com',
      domain: 'seguros',
      collection: 'seguros-residencial',
      description: 'Dados das apólices de seguro residencial e coberturas',
      createdAt: '2023-05-20T14:00:00Z',
      updatedAt: '2024-01-06T10:30:00Z'
    },
    schema: {
      tableName: 'seguros_residencial_apolices',
      columns: [
        {
          name: 'policy_id',
          type: 'VARCHAR(36)',
          nullable: false,
          primaryKey: true,
          description: 'UUID da apólice residencial'
        },
        {
          name: 'customer_cpf',
          type: 'VARCHAR(11)',
          nullable: false,
          description: 'CPF do segurado'
        },
        {
          name: 'property_address',
          type: 'VARCHAR(500)',
          nullable: false,
          description: 'Endereço completo do imóvel'
        },
        {
          name: 'property_value',
          type: 'DECIMAL(15,2)',
          nullable: false,
          description: 'Valor do imóvel segurado'
        },
        {
          name: 'coverage_fire',
          type: 'DECIMAL(15,2)',
          nullable: false,
          description: 'Cobertura para incêndio'
        },
        {
          name: 'coverage_theft',
          type: 'DECIMAL(15,2)',
          nullable: false,
          description: 'Cobertura para roubo'
        },
        {
          name: 'coverage_natural_disasters',
          type: 'DECIMAL(15,2)',
          nullable: false,
          description: 'Cobertura para desastres naturais'
        },
        {
          name: 'premium_amount',
          type: 'DECIMAL(10,2)',
          nullable: false,
          description: 'Valor do prêmio mensal'
        },
        {
          name: 'start_date',
          type: 'DATE',
          nullable: false,
          description: 'Data de início da vigência'
        },
        {
          name: 'status',
          type: 'VARCHAR(20)',
          nullable: false,
          description: 'Status da apólice'
        }
      ],
      dictionary: {
        'policy_id': 'Identificador único da apólice residencial',
        'customer_cpf': 'CPF do proprietário segurado',
        'property_address': 'Endereço completo do imóvel segurado',
        'property_value': 'Valor de mercado do imóvel',
        'coverage_fire': 'Valor máximo de cobertura para incêndio',
        'coverage_theft': 'Valor máximo de cobertura para roubo',
        'coverage_natural_disasters': 'Cobertura para enchentes, vendavais, etc.',
        'premium_amount': 'Valor mensal do prêmio',
        'start_date': 'Data de início da cobertura',
        'status': 'Estados: active, cancelled, expired'
      },
      primaryKeys: ['policy_id']
    },
    qualityRules: [mockQualityRules[0], mockQualityRules[2]],
    tags: {
      layer: 'Silver' as Layer,
      status: 'published' as Status,
      sensitivity: 'high',
      retention: '15years'
    },
    terms: {
      'data_retention': '15 anos após término da apólice',
      'access_level': 'Restrito a equipes de seguros residenciais',
      'update_frequency': 'Diário via batch'
    }
  },
  {
    id: 'dc-seguros-auto-sinistros-processados',
    fundamentals: {
      name: 'Sinistros Seguro Auto Processados',
      version: '1.2.0',
      owner: 'time-seguros-auto@banco.com',
      domain: 'seguros',
      collection: 'seguros-auto',
      description: 'Contrato de dados para sinistros de seguro auto processados e enriquecidos',
      createdAt: '2023-08-01T10:00:00Z',
      updatedAt: '2024-01-05T14:30:00Z'
    },
    schema: {
      tableName: 'seguros_auto_sinistros_processados',
      columns: [
        {
          name: 'sinistro_id',
          type: 'VARCHAR(50)',
          nullable: false,
          primaryKey: true,
          description: 'Identificador único do sinistro processado'
        },
        {
          name: 'apolice_numero',
          type: 'VARCHAR(30)',
          nullable: false,
          description: 'Número da apólice relacionada'
        },
        {
          name: 'valor_sinistro_processado',
          type: 'DECIMAL(15,2)',
          nullable: false,
          description: 'Valor do sinistro após processamento e validações'
        },
        {
          name: 'categoria_risco',
          type: 'VARCHAR(20)',
          nullable: false,
          description: 'Categoria de risco calculada (baixo, medio, alto)'
        },
        {
          name: 'score_fraude',
          type: 'DECIMAL(5,4)',
          nullable: true,
          description: 'Score de probabilidade de fraude (0-1)'
        },
        {
          name: 'status_processamento',
          type: 'VARCHAR(30)',
          nullable: false,
          description: 'Status do processamento (processado, aprovado, rejeitado)'
        },
        {
          name: 'data_processamento',
          type: 'TIMESTAMP',
          nullable: false,
          description: 'Data e hora do processamento'
        }
      ],
      dictionary: {
        'sinistro_id': 'Chave primária única para sinistros processados',
        'apolice_numero': 'Referência à apólice original',
        'valor_sinistro_processado': 'Valor após aplicação de regras de negócio',
        'categoria_risco': 'Classificação automática de risco',
        'score_fraude': 'Probabilidade de fraude calculada por modelo ML',
        'status_processamento': 'Estados: processado, aprovado, rejeitado, em_analise',
        'data_processamento': 'Timestamp UTC do processamento'
      },
      primaryKeys: ['sinistro_id']
    },
    qualityRules: [mockQualityRules[2], mockQualityRules[3], mockQualityRules[5]],
    tags: {
      layer: 'Silver' as Layer,
      status: 'published' as Status,
      sensitivity: 'high',
      retention: '15years'
    },
    terms: {
      'data_retention': '15 anos após resolução do sinistro',
      'access_level': 'Restrito a equipes de sinistros e auditoria',
      'update_frequency': 'Tempo real via processamento de eventos'
    }
  },
  // CONSÓRCIO DOMAIN CONTRACTS
  {
    id: 'dc-consorcio-imoveis-grupos',
    fundamentals: {
      name: 'Grupos Consórcio Imóveis',
      version: '1.4.0',
      owner: 'time-consorcio@banco.com',
      domain: 'consorcio',
      collection: 'consorcio-imoveis',
      description: 'Dados dos grupos de consórcio imobiliário e participantes',
      createdAt: '2023-01-15T09:00:00Z',
      updatedAt: '2024-01-08T14:15:00Z'
    },
    schema: {
      tableName: 'consorcio_imoveis_grupos',
      columns: [
        {
          name: 'group_id',
          type: 'VARCHAR(36)',
          nullable: false,
          primaryKey: true,
          description: 'UUID do grupo de consórcio'
        },
        {
          name: 'group_number',
          type: 'VARCHAR(20)',
          nullable: false,
          description: 'Número identificador do grupo'
        },
        {
          name: 'total_participants',
          type: 'INTEGER',
          nullable: false,
          description: 'Número total de participantes'
        },
        {
          name: 'credit_value',
          type: 'DECIMAL(15,2)',
          nullable: false,
          description: 'Valor do crédito do grupo'
        },
        {
          name: 'monthly_installment',
          type: 'DECIMAL(10,2)',
          nullable: false,
          description: 'Valor da parcela mensal'
        },
        {
          name: 'duration_months',
          type: 'INTEGER',
          nullable: false,
          description: 'Duração do grupo em meses'
        },
        {
          name: 'start_date',
          type: 'DATE',
          nullable: false,
          description: 'Data de início do grupo'
        },
        {
          name: 'contemplated_count',
          type: 'INTEGER',
          nullable: false,
          description: 'Número de contemplados até o momento'
        },
        {
          name: 'status',
          type: 'VARCHAR(20)',
          nullable: false,
          description: 'Status do grupo (active, completed, cancelled)'
        }
      ],
      dictionary: {
        'group_id': 'Identificador único do grupo de consórcio',
        'group_number': 'Número sequencial do grupo para identificação',
        'total_participants': 'Quantidade total de cotas do grupo',
        'credit_value': 'Valor do bem ou crédito disponível',
        'monthly_installment': 'Valor da parcela mensal por participante',
        'duration_months': 'Prazo total do consórcio em meses',
        'start_date': 'Data de formação e início do grupo',
        'contemplated_count': 'Número de participantes já contemplados',
        'status': 'Estados: active, completed, cancelled, suspended'
      },
      primaryKeys: ['group_id']
    },
    qualityRules: [mockQualityRules[2], mockQualityRules[5]],
    tags: {
      layer: 'Gold' as Layer,
      status: 'published' as Status,
      sensitivity: 'medium',
      retention: '20years'
    },
    terms: {
      'data_retention': '20 anos após encerramento do grupo',
      'access_level': 'Restrito a equipes de consórcio',
      'update_frequency': 'Diário via batch ETL'
    }
  },
  {
    id: 'dc-consorcio-veiculos-participantes',
    fundamentals: {
      name: 'Participantes Consórcio Veículos',
      version: '2.1.0',
      owner: 'time-consorcio@banco.com',
      domain: 'consorcio',
      collection: 'consorcio-veiculos',
      description: 'Dados dos participantes de consórcios de veículos e pagamentos',
      createdAt: '2023-02-01T11:30:00Z',
      updatedAt: '2024-01-07T16:20:00Z'
    },
    schema: {
      tableName: 'consorcio_veiculos_participantes',
      columns: [
        {
          name: 'participant_id',
          type: 'VARCHAR(36)',
          nullable: false,
          primaryKey: true,
          description: 'UUID do participante'
        },
        {
          name: 'group_id',
          type: 'VARCHAR(36)',
          nullable: false,
          description: 'ID do grupo de consórcio'
        },
        {
          name: 'customer_cpf',
          type: 'VARCHAR(11)',
          nullable: false,
          description: 'CPF do consorciado'
        },
        {
          name: 'quota_number',
          type: 'INTEGER',
          nullable: false,
          description: 'Número da cota no grupo'
        },
        {
          name: 'join_date',
          type: 'DATE',
          nullable: false,
          description: 'Data de adesão ao consórcio'
        },
        {
          name: 'paid_installments',
          type: 'INTEGER',
          nullable: false,
          description: 'Número de parcelas pagas'
        },
        {
          name: 'total_paid_amount',
          type: 'DECIMAL(15,2)',
          nullable: false,
          description: 'Valor total pago até o momento'
        },
        {
          name: 'contemplation_date',
          type: 'DATE',
          nullable: true,
          description: 'Data de contemplação (se contemplado)'
        },
        {
          name: 'vehicle_brand',
          type: 'VARCHAR(50)',
          nullable: true,
          description: 'Marca do veículo escolhido'
        },
        {
          name: 'vehicle_model',
          type: 'VARCHAR(100)',
          nullable: true,
          description: 'Modelo do veículo escolhido'
        },
        {
          name: 'status',
          type: 'VARCHAR(20)',
          nullable: false,
          description: 'Status do participante'
        }
      ],
      dictionary: {
        'participant_id': 'Identificador único do participante',
        'group_id': 'Referência ao grupo de consórcio',
        'customer_cpf': 'CPF do consorciado',
        'quota_number': 'Número da cota dentro do grupo',
        'join_date': 'Data de entrada no consórcio',
        'paid_installments': 'Quantidade de parcelas quitadas',
        'total_paid_amount': 'Somatório de valores pagos',
        'contemplation_date': 'Data em que foi contemplado (null se não contemplado)',
        'vehicle_brand': 'Marca do veículo selecionado após contemplação',
        'vehicle_model': 'Modelo específico do veículo',
        'status': 'Estados: active, contemplated, quit, defaulted'
      },
      primaryKeys: ['participant_id']
    },
    qualityRules: [mockQualityRules[0], mockQualityRules[2], mockQualityRules[3]],
    tags: {
      layer: 'Silver' as Layer,
      status: 'published' as Status,
      sensitivity: 'high',
      retention: '15years'
    },
    terms: {
      'data_retention': '15 anos após saída do consórcio',
      'access_level': 'Restrito a equipes de consórcio e cobrança',
      'update_frequency': 'Tempo real via CDC'
    }
  },
  // INVESTIMENTOS DOMAIN CONTRACTS
  {
    id: 'dc-investimentos-fundos-cotas',
    fundamentals: {
      name: 'Cotas Fundos de Investimento',
      version: '1.6.0',
      owner: 'time-investimentos@banco.com',
      domain: 'investimentos',
      collection: 'fundos-investimento',
      description: 'Dados das cotas de fundos de investimento e movimentações',
      createdAt: '2023-01-10T08:00:00Z',
      updatedAt: '2024-01-09T13:30:00Z'
    },
    schema: {
      tableName: 'investimentos_fundos_cotas',
      columns: [
        {
          name: 'quota_id',
          type: 'VARCHAR(36)',
          nullable: false,
          primaryKey: true,
          description: 'UUID da cota'
        },
        {
          name: 'fund_id',
          type: 'VARCHAR(36)',
          nullable: false,
          description: 'ID do fundo de investimento'
        },
        {
          name: 'customer_cpf',
          type: 'VARCHAR(11)',
          nullable: false,
          description: 'CPF do investidor'
        },
        {
          name: 'fund_name',
          type: 'VARCHAR(200)',
          nullable: false,
          description: 'Nome do fundo'
        },
        {
          name: 'fund_type',
          type: 'VARCHAR(50)',
          nullable: false,
          description: 'Tipo do fundo (equity, fixed_income, multimarket)'
        },
        {
          name: 'quota_quantity',
          type: 'DECIMAL(18,6)',
          nullable: false,
          description: 'Quantidade de cotas'
        },
        {
          name: 'quota_value',
          type: 'DECIMAL(15,6)',
          nullable: false,
          description: 'Valor unitário da cota'
        },
        {
          name: 'investment_amount',
          type: 'DECIMAL(15,2)',
          nullable: false,
          description: 'Valor total investido'
        },
        {
          name: 'current_value',
          type: 'DECIMAL(15,2)',
          nullable: false,
          description: 'Valor atual do investimento'
        },
        {
          name: 'investment_date',
          type: 'DATE',
          nullable: false,
          description: 'Data do investimento'
        },
        {
          name: 'status',
          type: 'VARCHAR(20)',
          nullable: false,
          description: 'Status da cota (active, redeemed, blocked)'
        }
      ],
      dictionary: {
        'quota_id': 'Identificador único da cota do investidor',
        'fund_id': 'Referência ao fundo de investimento',
        'customer_cpf': 'CPF do investidor titular',
        'fund_name': 'Nome comercial do fundo',
        'fund_type': 'Classificação: equity, fixed_income, multimarket, balanced',
        'quota_quantity': 'Número de cotas possuídas pelo investidor',
        'quota_value': 'Valor unitário da cota na data de referência',
        'investment_amount': 'Valor total aplicado pelo investidor',
        'current_value': 'Valor atual da posição (cotas * valor unitário)',
        'investment_date': 'Data da aplicação inicial',
        'status': 'Estados: active, redeemed, blocked, suspended'
      },
      primaryKeys: ['quota_id']
    },
    qualityRules: [mockQualityRules[0], mockQualityRules[2], mockQualityRules[5]],
    tags: {
      layer: 'Gold' as Layer,
      status: 'published' as Status,
      sensitivity: 'critical',
      retention: '20years'
    },
    terms: {
      'data_retention': '20 anos conforme regulamentação CVM',
      'access_level': 'Restrito - equipes de investimentos e compliance',
      'update_frequency': 'Diário após fechamento do mercado'
    }
  },
  {
    id: 'dc-investimentos-renda-fixa-posicoes',
    fundamentals: {
      name: 'Posições Renda Fixa',
      version: '1.8.0',
      owner: 'time-investimentos@banco.com',
      domain: 'investimentos',
      collection: 'renda-fixa',
      description: 'Posições em títulos de renda fixa e precificação',
      createdAt: '2023-03-05T10:30:00Z',
      updatedAt: '2024-01-08T11:45:00Z'
    },
    schema: {
      tableName: 'investimentos_renda_fixa_posicoes',
      columns: [
        {
          name: 'position_id',
          type: 'VARCHAR(36)',
          nullable: false,
          primaryKey: true,
          description: 'UUID da posição'
        },
        {
          name: 'customer_cpf',
          type: 'VARCHAR(11)',
          nullable: false,
          description: 'CPF do investidor'
        },
        {
          name: 'security_code',
          type: 'VARCHAR(20)',
          nullable: false,
          description: 'Código do título (ISIN ou código interno)'
        },
        {
          name: 'security_name',
          type: 'VARCHAR(200)',
          nullable: false,
          description: 'Nome do título'
        },
        {
          name: 'security_type',
          type: 'VARCHAR(50)',
          nullable: false,
          description: 'Tipo do título (cdb, lci, lca, tesouro_direto)'
        },
        {
          name: 'face_value',
          type: 'DECIMAL(15,2)',
          nullable: false,
          description: 'Valor nominal do título'
        },
        {
          name: 'purchase_price',
          type: 'DECIMAL(15,6)',
          nullable: false,
          description: 'Preço de compra unitário'
        },
        {
          name: 'current_price',
          type: 'DECIMAL(15,6)',
          nullable: false,
          description: 'Preço atual de mercado'
        },
        {
          name: 'quantity',
          type: 'DECIMAL(18,6)',
          nullable: false,
          description: 'Quantidade de títulos'
        },
        {
          name: 'maturity_date',
          type: 'DATE',
          nullable: false,
          description: 'Data de vencimento'
        },
        {
          name: 'interest_rate',
          type: 'DECIMAL(8,4)',
          nullable: false,
          description: 'Taxa de juros anual (%)'
        },
        {
          name: 'purchase_date',
          type: 'DATE',
          nullable: false,
          description: 'Data da compra'
        }
      ],
      dictionary: {
        'position_id': 'Identificador único da posição em renda fixa',
        'customer_cpf': 'CPF do investidor titular',
        'security_code': 'Código ISIN ou identificador interno do título',
        'security_name': 'Denominação comercial do título',
        'security_type': 'Tipos: cdb, lci, lca, tesouro_direto, debenture',
        'face_value': 'Valor de face ou nominal do título',
        'purchase_price': 'Preço unitário pago na compra',
        'current_price': 'Preço de mercado atual para marcação',
        'quantity': 'Quantidade de títulos na posição',
        'maturity_date': 'Data de vencimento do título',
        'interest_rate': 'Taxa de juros anual contratada',
        'purchase_date': 'Data de aquisição do título'
      },
      primaryKeys: ['position_id']
    },
    qualityRules: [mockQualityRules[0], mockQualityRules[2], mockQualityRules[5], mockQualityRules[6]],
    tags: {
      layer: 'Silver' as Layer,
      status: 'published' as Status,
      sensitivity: 'high',
      retention: '15years'
    },
    terms: {
      'data_retention': '15 anos após vencimento dos títulos',
      'access_level': 'Restrito a equipes de renda fixa e mesa de operações',
      'update_frequency': 'Intraday - atualização contínua de preços'
    }
  },
  // MODEL LAYER CONTRACT - For ML Model Training
  {
    id: 'dc-cartoes-fraud-model',
    fundamentals: {
      name: 'Modelo de Detecção de Fraude - Cartões',
      version: '1.0.0',
      owner: 'ml-team@banco.com',
      domain: 'cartoes',
      collection: 'cartoes-credito',
      description: 'Contrato para modelo de machine learning de detecção de fraude em transações de cartão',
      createdAt: '2023-08-01T10:00:00Z',
      updatedAt: '2024-01-05T14:30:00Z'
    },
    schema: {
      tableName: 'fraud_detection_model_artifacts',
      columns: [
        {
          name: 'model_id',
          type: 'VARCHAR(50)',
          nullable: false,
          primaryKey: true,
          description: 'Identificador único do modelo'
        },
        {
          name: 'model_version',
          type: 'VARCHAR(20)',
          nullable: false,
          description: 'Versão do modelo treinado'
        },
        {
          name: 'algorithm_type',
          type: 'VARCHAR(50)',
          nullable: false,
          description: 'Tipo de algoritmo utilizado (gradient_boosting, random_forest, etc.)'
        },
        {
          name: 'training_accuracy',
          type: 'DECIMAL(5,4)',
          nullable: false,
          description: 'Acurácia do modelo no conjunto de treino'
        },
        {
          name: 'validation_accuracy',
          type: 'DECIMAL(5,4)',
          nullable: false,
          description: 'Acurácia do modelo no conjunto de validação'
        },
        {
          name: 'model_artifact_path',
          type: 'VARCHAR(500)',
          nullable: false,
          description: 'Caminho para o artefato do modelo serializado'
        },
        {
          name: 'feature_importance',
          type: 'JSON',
          nullable: true,
          description: 'Importância das features em formato JSON'
        },
        {
          name: 'training_date',
          type: 'TIMESTAMP',
          nullable: false,
          description: 'Data e hora do treinamento do modelo'
        },
        {
          name: 'model_status',
          type: 'VARCHAR(20)',
          nullable: false,
          description: 'Status do modelo (training, validated, deployed, retired)'
        }
      ],
      dictionary: {
        'model_id': 'Identificador único gerado para cada execução de treinamento',
        'model_version': 'Versionamento semântico do modelo (ex: 1.2.3)',
        'algorithm_type': 'Algoritmo de ML utilizado conforme biblioteca scikit-learn/xgboost',
        'training_accuracy': 'Métrica de acurácia calculada no dataset de treino',
        'validation_accuracy': 'Métrica de acurácia calculada no dataset de validação',
        'model_artifact_path': 'Caminho no MLflow ou storage onde o modelo está armazenado',
        'feature_importance': 'Ranking de importância das features para interpretabilidade',
        'training_date': 'Timestamp UTC do início do processo de treinamento',
        'model_status': 'Estados: training, validated, deployed, retired'
      },
      primaryKeys: ['model_id']
    },
    qualityRules: [mockQualityRules[0], mockQualityRules[2]],
    tags: {
      layer: 'Model' as Layer,
      status: 'published' as Status,
      sensitivity: 'medium',
      retention: '2years'
    },
    terms: {
      'data_retention': '2 anos para modelos e métricas de performance',
      'access_level': 'Restrito a equipes de ML e cientistas de dados',
      'update_frequency': 'Retreinamento mensal ou conforme performance degradar'
    }
  }
];

// Mock data products imported from separate file
// Populate collections with contracts
mockCollections[0].contracts = [mockDataContracts[0], mockDataContracts[1]]; // cartoes-credito
mockCollections[1].contracts = [mockDataContracts[2]]; // cartoes-debito  
mockCollections[2].contracts = [mockDataContracts[3]]; // cartoes-pre-pago
mockCollections[3].contracts = [mockDataContracts[4]]; // seguros-vida
mockCollections[4].contracts = [mockDataContracts[5], mockDataContracts[7]]; // seguros-auto (sinistros + processados)
mockCollections[5].contracts = [mockDataContracts[6]]; // seguros-residencial
mockCollections[6].contracts = [mockDataContracts[8]]; // consorcio-imoveis
mockCollections[7].contracts = [mockDataContracts[9]]; // consorcio-veiculos
mockCollections[8].contracts = [mockDataContracts[10]]; // fundos-investimento
mockCollections[9].contracts = [mockDataContracts[11]]; // renda-fixa

// Import products after all other definitions to avoid circular dependency
import { mockDataProducts } from './mockDataProducts';

// Populate domains with their respective collections
mockDomains.forEach(domain => {
  domain.collections = mockCollections.filter(c => c.domainId === domain.id);
});

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
    return simulateNetworkCall([...mockDomains], 300);
  }

  async getDomainById(id: string): Promise<Domain | null> {
    const domain = mockDomains.find(domain => domain.id === id) || null;
    if (!domain) {
      throw new Error(`Domain with id ${id} not found`);
    }
    return simulateNetworkCall(domain, 200);
  }

  // Collection operations
  async getCollectionsByDomain(domainId: string): Promise<Collection[]> {
    const collections = mockCollections.filter(collection => collection.domainId === domainId);
    return simulateNetworkCall(collections, 250);
  }

  async getCollectionById(id: string): Promise<Collection | null> {
    const collection = mockCollections.find(collection => collection.id === id) || null;
    if (!collection) {
      throw new Error(`Collection with id ${id} not found`);
    }
    return simulateNetworkCall(collection, 200);
  }

  // DataContract operations
  async getAllContracts(): Promise<DataContract[]> {
    return simulateNetworkCall([...mockDataContracts], 300);
  }

  async getContractsByCollection(collectionId: string): Promise<DataContract[]> {
    const collection = mockCollections.find(c => c.id === collectionId);
    const contracts = collection?.contracts || [];
    return simulateNetworkCall(contracts, 300);
  }

  async getContractById(id: string): Promise<DataContract | null> {
    const contract = mockDataContracts.find(contract => contract.id === id) || null;
    if (!contract) {
      throw new Error(`Contract with id ${id} not found`);
    }
    return simulateNetworkCall(contract, 250);
  }

  // DataProduct operations
  async getAllProducts(): Promise<DataProduct[]> {
    return simulateNetworkCall([...mockDataProducts], 300);
  }

  async getProductsByContract(contractId: string): Promise<DataProduct[]> {
    const products = mockDataProducts.filter(product => product.dataContractId === contractId);
    return simulateNetworkCall(products, 300);
  }

  async getProductById(id: string): Promise<DataProduct | null> {
    const product = mockDataProducts.find(product => product.id === id) || null;
    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }
    return simulateNetworkCall(product, 250);
  }

  // Quality and execution operations
  async getExecutionHistory(productId: string): Promise<ExecutionInfo[]> {
    // Return mock executions for any product
    // In a real implementation, this would filter by productId
    console.log(`Getting execution history for product: ${productId}`);
    return simulateNetworkCall([...mockExecutions], 200);
  }

  async getQualityAlerts(productId: string): Promise<QualityAlert[]> {
    const alerts = mockQualityAlerts.filter(alert => alert.productId === productId);
    return simulateNetworkCall(alerts, 200);
  }

  async getDeployments(productId: string): Promise<DeploymentInfo[]> {
    await this.delay(200);
    // Return mock deployments for any product
    // In a real implementation, this would filter by productId
    console.log(`Getting deployments for product: ${productId}`);
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

  // Dashboard metrics operations
  async getDashboardMetrics(): Promise<DashboardData> {
    // Simulate network delay between 300-800ms
    const delay = Math.floor(Math.random() * 500) + 300;

    // Simulate occasional errors (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Dashboard service temporarily unavailable. Please try again.');
    }

    const [contracts, products, users] = await Promise.all([
      this.getContractMetrics(),
      this.getProductMetrics(),
      this.getUserMetrics()
    ]);

    const dashboardData: DashboardData = {
      contracts,
      products,
      users,
      lastUpdated: new Date().toISOString()
    };

    return simulateNetworkCall(dashboardData, delay);
  }

  async getContractMetrics(): Promise<ContractMetrics> {
    // Calculate metrics from mock data contracts
    const total = mockDataContracts.length;

    const byStatus = {
      draft: mockDataContracts.filter(c => c.tags.status === 'draft').length,
      published: mockDataContracts.filter(c => c.tags.status === 'published').length,
      archived: mockDataContracts.filter(c => c.tags.status === 'archived').length
    };

    // Generate realistic trend data based on historical patterns
    const trend: MetricTrend = generateRealisticTrend('contracts', total);

    return simulateNetworkCall({
      total,
      byStatus,
      trend
    }, 200);
  }

  async getProductMetrics(): Promise<ProductMetrics> {
    // Calculate metrics from mock data products
    const total = mockDataProducts.length;

    const byEnvironment = {
      dev: mockDataProducts.filter(p => p.environment === 'dev').length,
      pre: mockDataProducts.filter(p => p.environment === 'pre').length,
      pro: mockDataProducts.filter(p => p.environment === 'pro').length,
      undefined: mockDataProducts.filter(p => !p.environment || p.environment === 'undefined').length
    };

    // Generate realistic trend data based on historical patterns
    const trend: MetricTrend = generateRealisticTrend('products', total);

    return simulateNetworkCall({
      total,
      byEnvironment,
      trend
    }, 180);
  }

  async getUserMetrics(): Promise<UserMetrics> {
    // Generate realistic user metrics based on platform size
    const totalUsers = Math.floor(Math.random() * 500) + 150; // 150-650 users
    const activeUsers = Math.floor(totalUsers * (0.6 + Math.random() * 0.3)); // 60-90% active
    const totalGroups = Math.floor(Math.random() * 25) + 8; // 8-33 groups

    // Generate realistic trend data based on historical patterns
    const trend: MetricTrend = generateRealisticTrend('users', totalUsers);

    return simulateNetworkCall({
      totalUsers,
      activeUsers,
      totalGroups,
      trend
    }, 220);
  }
}

// Export singleton instance
export const mockDataService = MockDataService.getInstance();