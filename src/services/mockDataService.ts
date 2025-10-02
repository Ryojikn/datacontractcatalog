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

// Mock execution info - comprehensive history with diverse technologies
const mockExecutions: ExecutionInfo[] = [
  // Streaming/Real-time executions
  {
    id: 'exec-001',
    date: '2024-01-09T08:00:00Z',
    status: 'success' as ExecutionStatus,
    duration: 1200,
    technology: 'Databricks Structured Streaming',
    logs: 'Streaming job completed successfully. Processed 1,234,567 records in micro-batches.'
  },
  {
    id: 'exec-002',
    date: '2024-01-09T04:00:00Z',
    status: 'success' as ExecutionStatus,
    duration: 1150,
    technology: 'Airflow + Python',
    logs: 'ETL pipeline completed. API ingestion processed 1,198,432 policy records.'
  },
  {
    id: 'exec-003',
    date: '2024-01-09T00:00:00Z',
    status: 'failure' as ExecutionStatus,
    duration: 300,
    technology: 'AWS Kinesis + Databricks',
    errorMessage: 'Kinesis stream throttling detected. Retrying with exponential backoff.'
  },
  {
    id: 'exec-004',
    date: '2024-01-08T20:00:00Z',
    status: 'success' as ExecutionStatus,
    duration: 1089,
    technology: 'Airflow + MySQL Connector',
    logs: 'Batch ingestion completed. Processed 1,156,789 consortium payment records.'
  },
  {
    id: 'exec-005',
    date: '2024-01-08T16:00:00Z',
    status: 'success' as ExecutionStatus,
    duration: 1245,
    technology: 'Databricks + Azure Data Lake',
    logs: 'File processing completed. Processed 1,267,890 member update records from CSV.'
  },
  {
    id: 'exec-006',
    date: '2024-01-08T12:00:00Z',
    status: 'running' as ExecutionStatus,
    duration: 0,
    technology: 'Bloomberg API + Databricks',
    logs: 'Market data ingestion in progress. Current throughput: 5000 ticks/second.'
  },
  {
    id: 'exec-007',
    date: '2024-01-08T08:00:00Z',
    status: 'success' as ExecutionStatus,
    duration: 1178,
    technology: 'Airflow + Oracle Connector',
    logs: 'Portfolio positions sync completed. Processed 1,145,623 position records.'
  },
  {
    id: 'exec-008',
    date: '2024-01-08T04:00:00Z',
    status: 'failure' as ExecutionStatus,
    duration: 450,
    technology: 'Databricks + PySpark',
    errorMessage: 'SUSEP regulatory report generation failed: missing required fields in 15 records'
  },
  {
    id: 'exec-009',
    date: '2024-01-08T00:00:00Z',
    status: 'success' as ExecutionStatus,
    duration: 1067,
    technology: 'Python + DEAP + MLflow',
    logs: 'Genetic algorithm optimization completed. Generated 1,098,765 optimal group compositions.'
  },
  {
    id: 'exec-010',
    date: '2024-01-07T20:00:00Z',
    status: 'success' as ExecutionStatus,
    duration: 1234,
    technology: 'MLflow + LightGBM',
    logs: 'Default prediction model training completed. F1-score: 0.87, AUC: 0.92.'
  },
  {
    id: 'exec-011',
    date: '2024-01-07T16:00:00Z',
    status: 'failure' as ExecutionStatus,
    duration: 180,
    technology: 'Python + CVXPY + MLflow',
    errorMessage: 'Portfolio optimization failed: infeasible constraints detected in risk model.'
  },
  {
    id: 'exec-012',
    date: '2024-01-07T12:00:00Z',
    status: 'success' as ExecutionStatus,
    duration: 1156,
    technology: 'Python + NumPy + MLflow',
    logs: 'Monte Carlo risk simulation completed. Generated 10,000 scenarios for VaR calculation.'
  },
  {
    id: 'exec-013',
    date: '2024-01-07T08:00:00Z',
    status: 'success' as ExecutionStatus,
    duration: 1089,
    technology: 'Power BI + Azure Functions',
    logs: 'Client report generation completed. Generated 1,123,456 personalized investment reports.'
  },
  {
    id: 'exec-014',
    date: '2024-01-07T04:00:00Z',
    status: 'success' as ExecutionStatus,
    duration: 1198,
    technology: 'Tableau + Databricks SQL',
    logs: 'Dashboard refresh completed. Updated 1,198,765 data points across all visualizations.'
  },
  {
    id: 'exec-015',
    date: '2024-01-07T00:00:00Z',
    status: 'failure' as ExecutionStatus,
    duration: 600,
    technology: 'Power BI + Databricks SQL',
    errorMessage: 'Dashboard refresh failed: SQL query timeout on large aggregation table.'
  },
  // Additional executions for ML models
  {
    id: 'exec-016',
    date: '2024-01-06T18:00:00Z',
    status: 'success' as ExecutionStatus,
    duration: 2400,
    technology: 'MLflow + XGBoost',
    logs: 'Fraud detection model retraining completed. New model deployed with 94% accuracy.'
  },
  {
    id: 'exec-017',
    date: '2024-01-06T14:00:00Z',
    status: 'success' as ExecutionStatus,
    duration: 3600,
    technology: 'MLflow + Scikit-learn',
    logs: 'Credit scoring model training completed. Cross-validation AUC: 0.89.'
  },
  {
    id: 'exec-018',
    date: '2024-01-06T10:00:00Z',
    status: 'success' as ExecutionStatus,
    duration: 1800,
    technology: 'Python + Lifelines + MLflow',
    logs: 'Actuarial survival model training completed. Concordance index: 0.78.'
  },
  {
    id: 'exec-019',
    date: '2024-01-06T06:00:00Z',
    status: 'success' as ExecutionStatus,
    duration: 2100,
    technology: 'MLflow + Ensemble Methods',
    logs: 'Claims fraud detection ensemble training completed. Precision: 0.91, Recall: 0.85.'
  },
  {
    id: 'exec-020',
    date: '2024-01-06T02:00:00Z',
    status: 'success' as ExecutionStatus,
    duration: 900,
    technology: 'Databricks + QuantLib',
    logs: 'Investment performance calculation completed. Risk metrics updated for all portfolios.'
  }
];

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
      layer: 'Gold' as Layer,
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
      layer: 'Silver' as Layer,
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
      layer: 'Gold' as Layer,
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

// Mock quality alerts - diverse alerts across domains
const mockQualityAlerts: QualityAlert[] = [
  // CARTÕES ALERTS
  {
    id: 'qa-001',
    ruleId: 'qr-001',
    ruleName: 'CPF Validation',
    severity: 'high' as QualitySeverity,
    message: '15 registros com CPF inválido detectados na última execução',
    date: '2024-01-09T10:35:00Z',
    resolved: false,
    productId: 'dp-cartoes-ingestion-realtime'
  },
  {
    id: 'qa-002',
    ruleId: 'qr-003',
    ruleName: 'Transaction Amount Range',
    severity: 'medium' as QualitySeverity,
    message: '3 transações com valores fora do range esperado',
    date: '2024-01-08T14:20:00Z',
    resolved: true,
    productId: 'dp-fraud-detection-model'
  },
  // SEGUROS ALERTS
  {
    id: 'qa-003',
    ruleId: 'qr-007',
    ruleName: 'Policy Amount Validation',
    severity: 'critical' as QualitySeverity,
    message: '2 apólices com valores de cobertura acima do limite regulatório',
    date: '2024-01-09T08:15:00Z',
    resolved: false,
    productId: 'dp-seguros-policy-ingestion'
  },
  {
    id: 'qa-004',
    ruleId: 'qr-009',
    ruleName: 'Claim Amount Reasonableness',
    severity: 'critical' as QualitySeverity,
    message: '1 sinistro com valor superior à cobertura da apólice',
    date: '2024-01-08T16:45:00Z',
    resolved: false,
    productId: 'dp-sinistros-streaming-ingestion'
  },
  {
    id: 'qa-005',
    ruleId: 'qr-010',
    ruleName: 'Vehicle Year Validation',
    severity: 'medium' as QualitySeverity,
    message: '8 veículos com ano de fabricação inválido',
    date: '2024-01-07T11:30:00Z',
    resolved: true,
    productId: 'dp-claims-fraud-detection'
  },
  // CONSÓRCIO ALERTS
  {
    id: 'qa-006',
    ruleId: 'qr-012',
    ruleName: 'Payment Amount Consistency',
    severity: 'critical' as QualitySeverity,
    message: '25 pagamentos com valores inconsistentes com parcela do grupo',
    date: '2024-01-09T12:00:00Z',
    resolved: false,
    productId: 'dp-consorcio-payments-ingestion'
  },
  {
    id: 'qa-007',
    ruleId: 'qr-011',
    ruleName: 'Group Participant Count',
    severity: 'high' as QualitySeverity,
    message: '1 grupo com número de participantes abaixo do mínimo',
    date: '2024-01-08T09:20:00Z',
    resolved: true,
    productId: 'dp-consorcio-default-prediction'
  },
  // INVESTIMENTOS ALERTS
  {
    id: 'qa-008',
    ruleId: 'qr-014',
    ruleName: 'Fund NAV Validation',
    severity: 'critical' as QualitySeverity,
    message: '3 fundos com valores de cota negativos ou zerados',
    date: '2024-01-09T17:30:00Z',
    resolved: false,
    productId: 'dp-investimentos-market-data-ingestion'
  },
  {
    id: 'qa-009',
    ruleId: 'qr-015',
    ruleName: 'Investment Amount Consistency',
    severity: 'critical' as QualitySeverity,
    message: '12 posições com inconsistência entre quantidade e valor investido',
    date: '2024-01-09T16:15:00Z',
    resolved: false,
    productId: 'dp-portfolio-positions-ingestion'
  },
  {
    id: 'qa-010',
    ruleId: 'qr-016',
    ruleName: 'Maturity Date Validation',
    severity: 'high' as QualitySeverity,
    message: '5 títulos com data de vencimento no passado',
    date: '2024-01-08T18:45:00Z',
    resolved: true,
    productId: 'dp-investment-risk-model'
  },
  // CROSS-DOMAIN ALERTS
  {
    id: 'qa-011',
    ruleId: 'qr-019',
    ruleName: 'Data Freshness Check',
    severity: 'medium' as QualitySeverity,
    message: 'Dados de 2 tabelas não foram atualizados nas últimas 24 horas',
    date: '2024-01-09T06:00:00Z',
    resolved: false,
    productId: 'dp-cartoes-aggregation'
  },
  {
    id: 'qa-012',
    ruleId: 'qr-020',
    ruleName: 'Record Count Anomaly Detection',
    severity: 'low' as QualitySeverity,
    message: 'Volume de dados 40% abaixo da média dos últimos 30 dias',
    date: '2024-01-08T20:00:00Z',
    resolved: true,
    productId: 'dp-seguros-regulatory-reporting'
  }
];

// Mock data products - Expanded with comprehensive Cartões domain products
const mockDataProducts: DataProduct[] = [
  // INGESTION PRODUCTS
  {
    id: 'dp-cartoes-ingestion-realtime',
    name: 'Ingestão Transações Tempo Real',
    dataContractId: 'dc-cartoes-transacoes',
    configJson: {
      source: {
        type: 'kafka_stream',
        topic: 'credit-card-transactions',
        bootstrap_servers: 'kafka-prod-cluster:9092',
        consumer_group: 'credit-card-ingestion'
      },
      target: {
        type: 'delta_lake',
        database: 'bronze_cartoes',
        table: 'transacoes_raw',
        checkpoint_location: '/mnt/checkpoints/credit-transactions'
      },
      processing: {
        mode: 'streaming',
        trigger: 'continuous',
        max_files_per_trigger: 1000
      },
      schema_validation: true,
      dead_letter_queue: 'credit-card-dlq'
    },
    github: {
      repoName: 'cartoes-realtime-ingestion',
      repoUrl: 'https://github.com/banco/cartoes-realtime-ingestion',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main',
      lastCommit: {
        sha: 'f1e2d3c4b5a6',
        message: 'fix: improve error handling for malformed messages',
        date: '2024-01-08T10:15:00Z',
        author: 'streaming-team@banco.com'
      }
    },
    lastExecution: mockExecutions[0],
    technology: 'Databricks Structured Streaming + Kafka',
    deployments: mockDeployments,
    qualityAlerts: mockQualityAlerts.slice(0, 1),
    description: 'Pipeline de ingestão em tempo real para transações de cartões de crédito via Kafka streaming',
    createdAt: '2023-06-15T10:00:00Z',
    updatedAt: '2024-01-08T10:15:00Z'
  },
  {
    id: 'dp-debito-batch-ingestion',
    name: 'Ingestão Batch Cartões Débito',
    dataContractId: 'dc-debito-transacoes',
    configJson: {
      source: {
        type: 'database',
        connection: 'postgres-debit-prod',
        table: 'debit_transactions',
        incremental_column: 'updated_at',
        batch_size: 50000
      },
      target: {
        type: 'delta_lake',
        database: 'bronze_cartoes',
        table: 'debito_transacoes_raw',
        partition_by: ['year', 'month', 'day']
      },
      schedule: {
        frequency: 'hourly',
        start_time: '00:05',
        timezone: 'America/Sao_Paulo'
      },
      data_quality: {
        null_checks: true,
        duplicate_detection: true,
        schema_evolution: 'strict'
      }
    },
    github: {
      repoName: 'debito-batch-ingestion',
      repoUrl: 'https://github.com/banco/debito-batch-ingestion',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[1],
    technology: 'Airflow + Databricks',
    deployments: mockDeployments.slice(0, 2),
    qualityAlerts: [],
    description: 'Pipeline de ingestão batch para transações de cartões de débito com validação de qualidade',
    createdAt: '2023-04-20T12:00:00Z',
    updatedAt: '2024-01-07T09:30:00Z'
  },
  // TRANSFORMATION PRODUCTS
  {
    id: 'dp-cartoes-aggregation',
    name: 'Agregação Dados Cartões',
    dataContractId: 'dc-cartoes-transacoes',
    configJson: {
      source: {
        type: 'delta_lake',
        database: 'silver_cartoes',
        tables: ['transacoes', 'clientes']
      },
      transformations: {
        daily_aggregations: {
          group_by: ['customer_cpf', 'merchant_category'],
          metrics: ['sum(amount)', 'count(*)', 'avg(amount)']
        },
        monthly_summaries: {
          group_by: ['customer_cpf'],
          metrics: ['total_spent', 'transaction_count', 'unique_merchants']
        }
      },
      target: {
        type: 'delta_lake',
        database: 'gold_cartoes',
        tables: ['daily_customer_summary', 'monthly_customer_summary']
      },
      schedule: {
        frequency: 'daily',
        start_time: '02:00',
        timezone: 'America/Sao_Paulo'
      }
    },
    github: {
      repoName: 'cartoes-data-aggregation',
      repoUrl: 'https://github.com/banco/cartoes-data-aggregation',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[2],
    technology: 'Databricks + Delta Lake',
    deployments: mockDeployments,
    qualityAlerts: [],
    description: 'Pipeline de transformação para agregação de dados de cartões em diferentes granularidades',
    createdAt: '2023-07-10T15:00:00Z',
    updatedAt: '2024-01-05T14:30:00Z'
  },
  // ML MODEL PRODUCTS
  {
    id: 'dp-fraud-detection-model',
    name: 'Modelo Detecção de Fraude',
    dataContractId: 'dc-cartoes-transacoes',
    configJson: {
      model_type: 'gradient_boosting',
      framework: 'xgboost',
      features: [
        'transaction_amount',
        'merchant_category',
        'hour_of_day',
        'day_of_week',
        'customer_avg_amount_30d',
        'merchant_risk_score'
      ],
      target: 'is_fraud',
      training: {
        data_source: 'gold_cartoes.fraud_training_dataset',
        validation_split: 0.2,
        cross_validation_folds: 5
      },
      deployment: {
        endpoint: 'fraud-detection-v2',
        latency_sla: '100ms',
        throughput_sla: '1000rps'
      },
      monitoring: {
        drift_detection: true,
        performance_tracking: true,
        alert_threshold: 0.05
      }
    },
    github: {
      repoName: 'fraud-detection-model',
      repoUrl: 'https://github.com/banco/fraud-detection-model',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[3],
    technology: 'MLflow + Databricks ML',
    deployments: mockDeployments,
    qualityAlerts: mockQualityAlerts.slice(0, 1),
    description: 'Modelo de machine learning para detecção de fraudes em tempo real em transações de cartões',
    createdAt: '2023-09-01T11:00:00Z',
    updatedAt: '2024-01-04T16:20:00Z'
  },
  {
    id: 'dp-credit-scoring-model',
    name: 'Modelo Credit Scoring',
    dataContractId: 'dc-cartoes-clientes',
    configJson: {
      model_type: 'logistic_regression',
      framework: 'scikit-learn',
      features: [
        'income',
        'age',
        'account_tenure_months',
        'avg_monthly_spending',
        'payment_history_score',
        'debt_to_income_ratio'
      ],
      target: 'default_probability',
      training: {
        data_source: 'gold_cartoes.credit_scoring_dataset',
        sample_strategy: 'stratified',
        feature_engineering: 'automated'
      },
      deployment: {
        batch_scoring: true,
        schedule: 'monthly',
        output_table: 'gold_cartoes.customer_credit_scores'
      }
    },
    github: {
      repoName: 'credit-scoring-model',
      repoUrl: 'https://github.com/banco/credit-scoring-model',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[4],
    technology: 'MLflow + Scikit-learn',
    deployments: mockDeployments.slice(0, 2),
    qualityAlerts: [],
    description: 'Modelo para cálculo de score de crédito de clientes baseado em histórico transacional',
    createdAt: '2023-10-15T09:00:00Z',
    updatedAt: '2024-01-02T13:45:00Z'
  },
  // DASHBOARD PRODUCTS
  {
    id: 'dp-cartoes-executive-dashboard',
    name: 'Dashboard Executivo Cartões',
    dataContractId: 'dc-cartoes-transacoes',
    configJson: {
      data_sources: [
        'gold_cartoes.daily_customer_summary',
        'gold_cartoes.monthly_customer_summary',
        'gold_cartoes.fraud_alerts'
      ],
      visualizations: {
        kpis: ['total_volume', 'transaction_count', 'fraud_rate', 'approval_rate'],
        charts: ['volume_trend', 'category_breakdown', 'geographic_distribution'],
        tables: ['top_merchants', 'fraud_alerts', 'performance_metrics']
      },
      refresh_schedule: {
        frequency: 'hourly',
        cache_duration: '30min'
      },
      access_control: {
        roles: ['executive', 'cards_manager', 'risk_analyst'],
        row_level_security: false
      }
    },
    github: {
      repoName: 'cartoes-executive-dashboard',
      repoUrl: 'https://github.com/banco/cartoes-executive-dashboard',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[5],
    technology: 'Power BI + Azure Analysis Services',
    deployments: mockDeployments,
    qualityAlerts: [],
    description: 'Dashboard executivo com KPIs e métricas estratégicas do negócio de cartões',
    createdAt: '2023-08-20T09:00:00Z',
    updatedAt: '2024-01-03T11:15:00Z'
  },
  {
    id: 'dp-fraud-monitoring-dashboard',
    name: 'Dashboard Monitoramento Fraude',
    dataContractId: 'dc-cartoes-transacoes',
    configJson: {
      data_sources: [
        'gold_cartoes.fraud_predictions',
        'gold_cartoes.fraud_investigations',
        'silver_cartoes.real_time_alerts'
      ],
      real_time_updates: true,
      alert_thresholds: {
        fraud_rate_spike: 0.05,
        model_performance_drop: 0.1,
        investigation_backlog: 100
      },
      visualizations: {
        real_time: ['fraud_rate_gauge', 'alert_stream', 'geographic_heatmap'],
        historical: ['fraud_trends', 'model_performance', 'investigation_funnel']
      }
    },
    github: {
      repoName: 'fraud-monitoring-dashboard',
      repoUrl: 'https://github.com/banco/fraud-monitoring-dashboard',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[6],
    technology: 'Tableau + Databricks SQL',
    deployments: mockDeployments.slice(0, 2),
    qualityAlerts: [],
    description: 'Dashboard em tempo real para monitoramento de fraudes e performance dos modelos de detecção',
    createdAt: '2023-11-05T14:00:00Z',
    updatedAt: '2024-01-01T08:30:00Z'
  },
  // SEGUROS DOMAIN PRODUCTS
  // INGESTION PRODUCTS
  {
    id: 'dp-seguros-policy-ingestion',
    name: 'Ingestão Apólices Seguros',
    dataContractId: 'dc-seguros-vida-apolices',
    configJson: {
      source: {
        type: 'api',
        endpoint: 'https://api-seguros-prod.banco.com/policies',
        authentication: 'oauth2',
        rate_limit: '1000rps',
        pagination: 'cursor_based'
      },
      target: {
        type: 'delta_lake',
        database: 'bronze_seguros',
        table: 'apolices_raw',
        partition_by: ['year', 'month']
      },
      schedule: {
        frequency: 'every_4_hours',
        start_time: '00:00',
        timezone: 'America/Sao_Paulo'
      },
      data_validation: {
        schema_validation: true,
        business_rules: ['policy_amount > 0', 'start_date <= current_date']
      }
    },
    github: {
      repoName: 'seguros-policy-ingestion',
      repoUrl: 'https://github.com/banco/seguros-policy-ingestion',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[7],
    technology: 'Airflow + Python',
    deployments: mockDeployments,
    qualityAlerts: [],
    description: 'Pipeline de ingestão de apólices de seguros via API REST com validação de dados',
    createdAt: '2023-03-10T10:00:00Z',
    updatedAt: '2024-01-04T15:20:00Z'
  },
  {
    id: 'dp-sinistros-streaming-ingestion',
    name: 'Ingestão Streaming Sinistros',
    dataContractId: 'dc-seguros-auto-sinistros',
    configJson: {
      source: {
        type: 'kinesis_stream',
        stream_name: 'insurance-claims-stream',
        region: 'us-east-1',
        shard_count: 10
      },
      target: {
        type: 'delta_lake',
        database: 'bronze_seguros',
        table: 'sinistros_raw',
        checkpoint_location: '/mnt/checkpoints/claims-stream'
      },
      processing: {
        mode: 'streaming',
        trigger: 'processingTime',
        interval: '30 seconds'
      },
      enrichment: {
        policy_lookup: true,
        customer_data: true,
        vehicle_data: true
      }
    },
    github: {
      repoName: 'sinistros-streaming-ingestion',
      repoUrl: 'https://github.com/banco/sinistros-streaming-ingestion',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[8],
    technology: 'Databricks + AWS Kinesis',
    deployments: mockDeployments.slice(0, 2),
    qualityAlerts: mockQualityAlerts.slice(0, 1),
    description: 'Pipeline de ingestão em tempo real de sinistros via AWS Kinesis com enriquecimento de dados',
    createdAt: '2023-02-15T08:30:00Z',
    updatedAt: '2024-01-09T12:45:00Z'
  },
  // TRANSFORMATION PRODUCTS
  {
    id: 'dp-seguros-regulatory-reporting',
    name: 'Relatórios Regulatórios SUSEP',
    dataContractId: 'dc-seguros-vida-apolices',
    configJson: {
      source: {
        type: 'delta_lake',
        database: 'silver_seguros',
        tables: ['apolices', 'sinistros', 'premios']
      },
      transformations: {
        susep_report_1: {
          description: 'Relatório de provisões técnicas',
          aggregations: ['sum(reserves)', 'count(policies)', 'avg(premium)'],
          group_by: ['product_type', 'region']
        },
        susep_report_2: {
          description: 'Relatório de sinistralidade',
          calculations: ['claim_ratio', 'loss_ratio', 'expense_ratio'],
          period: 'monthly'
        }
      },
      target: {
        type: 'delta_lake',
        database: 'gold_seguros',
        tables: ['susep_provisoes', 'susep_sinistralidade']
      },
      schedule: {
        frequency: 'monthly',
        day_of_month: 1,
        start_time: '06:00'
      }
    },
    github: {
      repoName: 'seguros-regulatory-reporting',
      repoUrl: 'https://github.com/banco/seguros-regulatory-reporting',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[9],
    technology: 'Databricks + PySpark',
    deployments: mockDeployments,
    qualityAlerts: [],
    description: 'Pipeline de transformação para geração de relatórios regulatórios da SUSEP',
    createdAt: '2023-04-01T12:00:00Z',
    updatedAt: '2024-01-03T09:15:00Z'
  },
  // ML MODEL PRODUCTS
  {
    id: 'dp-actuarial-risk-model',
    name: 'Modelo Risco Atuarial',
    dataContractId: 'dc-seguros-vida-apolices',
    configJson: {
      model_type: 'survival_analysis',
      framework: 'lifelines',
      features: [
        'age',
        'gender',
        'occupation',
        'health_score',
        'lifestyle_factors',
        'family_history'
      ],
      target: 'mortality_probability',
      training: {
        data_source: 'gold_seguros.actuarial_dataset',
        time_horizon: '30_years',
        censoring_handling: 'kaplan_meier'
      },
      deployment: {
        batch_scoring: true,
        schedule: 'quarterly',
        output_table: 'gold_seguros.mortality_predictions'
      }
    },
    github: {
      repoName: 'actuarial-risk-model',
      repoUrl: 'https://github.com/banco/actuarial-risk-model',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[10],
    technology: 'MLflow + Python Lifelines',
    deployments: mockDeployments.slice(0, 2),
    qualityAlerts: [],
    description: 'Modelo atuarial para cálculo de risco e precificação de seguros de vida',
    createdAt: '2023-06-01T10:00:00Z',
    updatedAt: '2024-01-02T14:30:00Z'
  },
  {
    id: 'dp-claims-fraud-detection',
    name: 'Detecção Fraude Sinistros',
    dataContractId: 'dc-seguros-auto-sinistros',
    configJson: {
      model_type: 'ensemble',
      algorithms: ['random_forest', 'gradient_boosting', 'neural_network'],
      features: [
        'claim_amount',
        'time_since_policy_start',
        'customer_claim_history',
        'vehicle_age',
        'claim_location',
        'weather_conditions'
      ],
      target: 'is_fraudulent',
      training: {
        data_source: 'gold_seguros.fraud_training_dataset',
        imbalanced_handling: 'smote',
        feature_selection: 'recursive_elimination'
      },
      deployment: {
        real_time_scoring: true,
        endpoint: 'claims-fraud-detection',
        latency_sla: '200ms'
      }
    },
    github: {
      repoName: 'claims-fraud-detection',
      repoUrl: 'https://github.com/banco/claims-fraud-detection',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[11],
    technology: 'MLflow + Scikit-learn',
    deployments: mockDeployments,
    qualityAlerts: mockQualityAlerts.slice(0, 1),
    description: 'Modelo ensemble para detecção de fraudes em sinistros de seguros automotivos',
    createdAt: '2023-07-15T11:00:00Z',
    updatedAt: '2024-01-05T16:45:00Z'
  },
  // DASHBOARD PRODUCTS
  {
    id: 'dp-seguros-claims-dashboard',
    name: 'Dashboard Sinistros',
    dataContractId: 'dc-seguros-auto-sinistros',
    configJson: {
      data_sources: [
        'gold_seguros.claims_summary',
        'gold_seguros.fraud_predictions',
        'silver_seguros.claims_real_time'
      ],
      visualizations: {
        kpis: ['total_claims', 'avg_claim_amount', 'fraud_rate', 'settlement_time'],
        charts: ['claims_by_type', 'geographic_distribution', 'seasonal_trends'],
        tables: ['high_value_claims', 'fraud_alerts', 'pending_investigations']
      },
      refresh_schedule: {
        frequency: 'every_2_hours',
        cache_duration: '1hour'
      },
      alerts: {
        fraud_spike: 'fraud_rate > 5%',
        high_value_claim: 'claim_amount > 100000',
        settlement_delay: 'days_open > 30'
      }
    },
    github: {
      repoName: 'seguros-claims-dashboard',
      repoUrl: 'https://github.com/banco/seguros-claims-dashboard',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[12],
    technology: 'Tableau + Databricks SQL',
    deployments: mockDeployments,
    qualityAlerts: [],
    description: 'Dashboard para monitoramento de sinistros com alertas de fraude e métricas operacionais',
    createdAt: '2023-08-10T13:00:00Z',
    updatedAt: '2024-01-04T10:20:00Z'
  },
  {
    id: 'dp-seguros-business-intelligence',
    name: 'BI Seguros Executivo',
    dataContractId: 'dc-seguros-vida-apolices',
    configJson: {
      data_sources: [
        'gold_seguros.policy_analytics',
        'gold_seguros.premium_analysis',
        'gold_seguros.customer_segmentation'
      ],
      visualizations: {
        executive_summary: ['revenue_trend', 'policy_growth', 'customer_acquisition'],
        product_analysis: ['product_performance', 'profitability_analysis', 'market_share'],
        risk_analysis: ['loss_ratios', 'reserve_adequacy', 'risk_concentration']
      },
      refresh_schedule: {
        frequency: 'daily',
        start_time: '05:00'
      },
      access_control: {
        roles: ['c_level', 'insurance_director', 'actuarial_manager'],
        data_masking: false
      }
    },
    github: {
      repoName: 'seguros-business-intelligence',
      repoUrl: 'https://github.com/banco/seguros-business-intelligence',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[13],
    technology: 'Power BI + Azure Synapse',
    deployments: mockDeployments.slice(0, 2),
    qualityAlerts: [],
    description: 'Dashboard executivo com análises estratégicas e KPIs do negócio de seguros',
    createdAt: '2023-09-20T15:00:00Z',
    updatedAt: '2024-01-01T12:00:00Z'
  },
  // CONSÓRCIO DOMAIN PRODUCTS
  // INGESTION PRODUCTS
  {
    id: 'dp-consorcio-payments-ingestion',
    name: 'Ingestão Pagamentos Consórcio',
    dataContractId: 'dc-consorcio-veiculos-participantes',
    configJson: {
      source: {
        type: 'database',
        connection: 'mysql-consorcio-prod',
        tables: ['payments', 'participants', 'groups'],
        incremental_strategy: 'timestamp',
        batch_size: 10000
      },
      target: {
        type: 'delta_lake',
        database: 'bronze_consorcio',
        table: 'pagamentos_raw',
        partition_by: ['year', 'month']
      },
      schedule: {
        frequency: 'every_2_hours',
        start_time: '00:15',
        timezone: 'America/Sao_Paulo'
      },
      data_quality: {
        completeness_checks: true,
        referential_integrity: true,
        duplicate_detection: true
      }
    },
    github: {
      repoName: 'consorcio-payments-ingestion',
      repoUrl: 'https://github.com/banco/consorcio-payments-ingestion',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[0],
    technology: 'Airflow + MySQL Connector',
    deployments: mockDeployments,
    qualityAlerts: [],
    description: 'Pipeline de ingestão de pagamentos e dados de participantes de consórcios',
    createdAt: '2023-02-01T11:30:00Z',
    updatedAt: '2024-01-07T16:20:00Z'
  },
  {
    id: 'dp-consorcio-member-management',
    name: 'Gestão Membros Consórcio',
    dataContractId: 'dc-consorcio-imoveis-grupos',
    configJson: {
      source: {
        type: 'file_system',
        path: '/mnt/consorcio/member_updates/',
        file_format: 'csv',
        schema_inference: false,
        delimiter: ';'
      },
      target: {
        type: 'delta_lake',
        database: 'bronze_consorcio',
        table: 'membros_atualizacoes',
        merge_strategy: 'upsert'
      },
      processing: {
        file_pattern: 'member_updates_*.csv',
        archive_processed: true,
        error_handling: 'quarantine'
      },
      schedule: {
        frequency: 'daily',
        start_time: '01:00',
        timezone: 'America/Sao_Paulo'
      }
    },
    github: {
      repoName: 'consorcio-member-management',
      repoUrl: 'https://github.com/banco/consorcio-member-management',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[1],
    technology: 'Databricks + Azure Data Lake',
    deployments: mockDeployments.slice(0, 2),
    qualityAlerts: [],
    description: 'Pipeline para processamento de atualizações de membros via arquivos CSV',
    createdAt: '2023-01-15T09:00:00Z',
    updatedAt: '2024-01-08T14:15:00Z'
  },
  // TRANSFORMATION PRODUCTS
  {
    id: 'dp-consorcio-financial-reporting',
    name: 'Relatórios Financeiros Consórcio',
    dataContractId: 'dc-consorcio-veiculos-participantes',
    configJson: {
      source: {
        type: 'delta_lake',
        database: 'silver_consorcio',
        tables: ['pagamentos', 'grupos', 'participantes']
      },
      transformations: {
        monthly_collections: {
          group_by: ['group_id', 'month'],
          metrics: ['sum(paid_amount)', 'count(payments)', 'avg(installment)']
        },
        delinquency_analysis: {
          calculations: ['days_overdue', 'default_probability', 'recovery_rate'],
          filters: ['status != "quit"']
        },
        group_performance: {
          group_by: ['group_id'],
          metrics: ['collection_rate', 'contemplation_rate', 'profitability']
        }
      },
      target: {
        type: 'delta_lake',
        database: 'gold_consorcio',
        tables: ['monthly_collections', 'delinquency_report', 'group_performance']
      },
      schedule: {
        frequency: 'monthly',
        day_of_month: 2,
        start_time: '03:00'
      }
    },
    github: {
      repoName: 'consorcio-financial-reporting',
      repoUrl: 'https://github.com/banco/consorcio-financial-reporting',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[2],
    technology: 'Databricks + PySpark',
    deployments: mockDeployments,
    qualityAlerts: [],
    description: 'Pipeline de transformação para relatórios financeiros e análise de performance',
    createdAt: '2023-03-20T10:00:00Z',
    updatedAt: '2024-01-05T12:30:00Z'
  },
  // ML MODEL PRODUCTS
  {
    id: 'dp-consorcio-group-optimization',
    name: 'Otimização Formação Grupos',
    dataContractId: 'dc-consorcio-imoveis-grupos',
    configJson: {
      model_type: 'optimization',
      algorithm: 'genetic_algorithm',
      objective: 'maximize_group_success_rate',
      constraints: [
        'min_participants >= 50',
        'max_participants <= 200',
        'credit_value_variance < 0.1'
      ],
      features: [
        'participant_credit_score',
        'income_level',
        'age_distribution',
        'geographic_concentration',
        'payment_history'
      ],
      optimization_criteria: {
        success_rate_weight: 0.4,
        profitability_weight: 0.3,
        risk_distribution_weight: 0.3
      },
      deployment: {
        batch_execution: true,
        schedule: 'weekly',
        output_table: 'gold_consorcio.optimal_group_compositions'
      }
    },
    github: {
      repoName: 'consorcio-group-optimization',
      repoUrl: 'https://github.com/banco/consorcio-group-optimization',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[3],
    technology: 'Python + DEAP + MLflow',
    deployments: mockDeployments.slice(0, 2),
    qualityAlerts: [],
    description: 'Modelo de otimização para formação de grupos de consórcio com máxima taxa de sucesso',
    createdAt: '2023-05-10T14:00:00Z',
    updatedAt: '2024-01-03T11:45:00Z'
  },
  {
    id: 'dp-consorcio-default-prediction',
    name: 'Predição Inadimplência Consórcio',
    dataContractId: 'dc-consorcio-veiculos-participantes',
    configJson: {
      model_type: 'classification',
      algorithm: 'lightgbm',
      features: [
        'payment_history_score',
        'income_to_installment_ratio',
        'age',
        'employment_stability',
        'previous_consortium_experience',
        'economic_indicators'
      ],
      target: 'will_default_next_3_months',
      training: {
        data_source: 'gold_consorcio.default_training_dataset',
        time_series_split: true,
        feature_engineering: 'automated'
      },
      deployment: {
        batch_scoring: true,
        schedule: 'monthly',
        output_table: 'gold_consorcio.default_predictions',
        threshold_optimization: 'f1_score'
      }
    },
    github: {
      repoName: 'consorcio-default-prediction',
      repoUrl: 'https://github.com/banco/consorcio-default-prediction',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[4],
    technology: 'MLflow + LightGBM',
    deployments: mockDeployments,
    qualityAlerts: mockQualityAlerts.slice(0, 1),
    description: 'Modelo para predição de inadimplência de participantes de consórcio',
    createdAt: '2023-06-25T16:00:00Z',
    updatedAt: '2024-01-04T09:20:00Z'
  },
  // DASHBOARD PRODUCTS
  {
    id: 'dp-consorcio-operations-dashboard',
    name: 'Dashboard Operacional Consórcio',
    dataContractId: 'dc-consorcio-imoveis-grupos',
    configJson: {
      data_sources: [
        'gold_consorcio.group_performance',
        'gold_consorcio.monthly_collections',
        'silver_consorcio.real_time_payments'
      ],
      visualizations: {
        kpis: ['active_groups', 'total_participants', 'collection_rate', 'contemplation_rate'],
        charts: ['payment_trends', 'group_formation', 'geographic_distribution'],
        tables: ['top_performing_groups', 'delinquent_participants', 'upcoming_contemplations']
      },
      refresh_schedule: {
        frequency: 'every_4_hours',
        cache_duration: '2hours'
      },
      alerts: {
        low_collection_rate: 'collection_rate < 85%',
        high_delinquency: 'delinquency_rate > 10%',
        group_formation_delay: 'days_to_formation > 30'
      }
    },
    github: {
      repoName: 'consorcio-operations-dashboard',
      repoUrl: 'https://github.com/banco/consorcio-operations-dashboard',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[5],
    technology: 'Power BI + Databricks SQL',
    deployments: mockDeployments,
    qualityAlerts: [],
    description: 'Dashboard operacional para monitoramento de grupos e performance de consórcios',
    createdAt: '2023-04-15T12:00:00Z',
    updatedAt: '2024-01-02T15:30:00Z'
  },
  {
    id: 'dp-consorcio-member-analytics',
    name: 'Analytics Participantes',
    dataContractId: 'dc-consorcio-veiculos-participantes',
    configJson: {
      data_sources: [
        'gold_consorcio.participant_analytics',
        'gold_consorcio.default_predictions',
        'gold_consorcio.contemplation_analysis'
      ],
      visualizations: {
        member_insights: ['payment_behavior', 'risk_segmentation', 'satisfaction_scores'],
        predictive_analytics: ['default_probability', 'contemplation_likelihood', 'churn_risk'],
        portfolio_analysis: ['member_demographics', 'product_preferences', 'lifetime_value']
      },
      refresh_schedule: {
        frequency: 'daily',
        start_time: '06:00'
      },
      access_control: {
        roles: ['consorcio_manager', 'risk_analyst', 'customer_success'],
        row_level_security: true
      }
    },
    github: {
      repoName: 'consorcio-member-analytics',
      repoUrl: 'https://github.com/banco/consorcio-member-analytics',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[6],
    technology: 'Tableau + Databricks SQL',
    deployments: mockDeployments.slice(0, 2),
    qualityAlerts: [],
    description: 'Dashboard analítico para insights sobre participantes e comportamento de pagamento',
    createdAt: '2023-07-30T11:00:00Z',
    updatedAt: '2024-01-06T14:45:00Z'
  },
  // INVESTIMENTOS DOMAIN PRODUCTS
  // INGESTION PRODUCTS
  {
    id: 'dp-investimentos-market-data-ingestion',
    name: 'Ingestão Dados Mercado',
    dataContractId: 'dc-investimentos-fundos-cotas',
    configJson: {
      source: {
        type: 'market_data_feed',
        provider: 'bloomberg_api',
        endpoints: ['equity_prices', 'bond_prices', 'fund_nav'],
        authentication: 'api_key',
        rate_limit: '5000rps'
      },
      target: {
        type: 'delta_lake',
        database: 'bronze_investimentos',
        table: 'market_data_raw',
        partition_by: ['date', 'asset_class']
      },
      processing: {
        mode: 'streaming',
        trigger: 'continuous',
        watermark: '10 minutes'
      },
      data_enrichment: {
        currency_conversion: true,
        benchmark_calculation: true,
        volatility_metrics: true
      }
    },
    github: {
      repoName: 'investimentos-market-data-ingestion',
      repoUrl: 'https://github.com/banco/investimentos-market-data-ingestion',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[7],
    technology: 'Databricks + Bloomberg API',
    deployments: mockDeployments,
    qualityAlerts: [],
    description: 'Pipeline de ingestão em tempo real de dados de mercado via Bloomberg API',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-01-09T13:30:00Z'
  },
  {
    id: 'dp-portfolio-positions-ingestion',
    name: 'Ingestão Posições Carteira',
    dataContractId: 'dc-investimentos-renda-fixa-posicoes',
    configJson: {
      source: {
        type: 'database',
        connection: 'oracle-portfolio-prod',
        tables: ['positions', 'transactions', 'securities'],
        incremental_column: 'last_updated',
        parallel_jobs: 8
      },
      target: {
        type: 'delta_lake',
        database: 'bronze_investimentos',
        table: 'posicoes_raw',
        partition_by: ['year', 'month', 'security_type']
      },
      schedule: {
        frequency: 'every_30_minutes',
        business_hours_only: true,
        timezone: 'America/Sao_Paulo'
      },
      data_quality: {
        position_reconciliation: true,
        price_validation: true,
        exposure_limits_check: true
      }
    },
    github: {
      repoName: 'portfolio-positions-ingestion',
      repoUrl: 'https://github.com/banco/portfolio-positions-ingestion',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[8],
    technology: 'Airflow + Oracle Connector',
    deployments: mockDeployments.slice(0, 2),
    qualityAlerts: mockQualityAlerts.slice(0, 1),
    description: 'Pipeline de ingestão de posições de carteira com reconciliação automática',
    createdAt: '2023-03-05T10:30:00Z',
    updatedAt: '2024-01-08T11:45:00Z'
  },
  // TRANSFORMATION PRODUCTS
  {
    id: 'dp-investimentos-performance-calculation',
    name: 'Cálculo Performance Investimentos',
    dataContractId: 'dc-investimentos-fundos-cotas',
    configJson: {
      source: {
        type: 'delta_lake',
        database: 'silver_investimentos',
        tables: ['posicoes', 'precos', 'benchmarks']
      },
      calculations: {
        returns: {
          daily_returns: true,
          cumulative_returns: true,
          risk_adjusted_returns: true
        },
        risk_metrics: {
          volatility: 'annualized',
          var_calculation: '95_confidence',
          sharpe_ratio: true,
          max_drawdown: true
        },
        attribution: {
          sector_attribution: true,
          security_selection: true,
          asset_allocation: true
        }
      },
      target: {
        type: 'delta_lake',
        database: 'gold_investimentos',
        tables: ['performance_metrics', 'risk_analytics', 'attribution_analysis']
      },
      schedule: {
        frequency: 'daily',
        start_time: '18:00',
        timezone: 'America/Sao_Paulo'
      }
    },
    github: {
      repoName: 'investimentos-performance-calculation',
      repoUrl: 'https://github.com/banco/investimentos-performance-calculation',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[9],
    technology: 'Databricks + QuantLib',
    deployments: mockDeployments,
    qualityAlerts: [],
    description: 'Pipeline para cálculo de performance e métricas de risco de investimentos',
    createdAt: '2023-04-12T14:00:00Z',
    updatedAt: '2024-01-07T10:15:00Z'
  },
  // ML MODEL PRODUCTS
  {
    id: 'dp-portfolio-optimization-model',
    name: 'Modelo Otimização Carteira',
    dataContractId: 'dc-investimentos-fundos-cotas',
    configJson: {
      model_type: 'portfolio_optimization',
      algorithm: 'mean_variance_optimization',
      objective: 'maximize_sharpe_ratio',
      constraints: [
        'max_weight_per_asset <= 0.1',
        'sector_concentration <= 0.3',
        'minimum_liquidity >= 1000000'
      ],
      features: [
        'expected_returns',
        'covariance_matrix',
        'liquidity_scores',
        'esg_ratings',
        'market_cap'
      ],
      optimization_parameters: {
        risk_aversion: 'moderate',
        rebalancing_frequency: 'monthly',
        transaction_costs: true
      },
      deployment: {
        batch_execution: true,
        schedule: 'weekly',
        output_table: 'gold_investimentos.optimal_portfolios'
      }
    },
    github: {
      repoName: 'portfolio-optimization-model',
      repoUrl: 'https://github.com/banco/portfolio-optimization-model',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[10],
    technology: 'Python + CVXPY + MLflow',
    deployments: mockDeployments.slice(0, 2),
    qualityAlerts: [],
    description: 'Modelo de otimização de carteiras usando teoria moderna de portfólio',
    createdAt: '2023-05-20T09:00:00Z',
    updatedAt: '2024-01-04T15:30:00Z'
  },
  {
    id: 'dp-investment-risk-model',
    name: 'Modelo Risco Investimentos',
    dataContractId: 'dc-investimentos-renda-fixa-posicoes',
    configJson: {
      model_type: 'risk_modeling',
      methodology: 'monte_carlo_simulation',
      risk_factors: [
        'interest_rate_risk',
        'credit_risk',
        'liquidity_risk',
        'market_risk',
        'concentration_risk'
      ],
      scenarios: {
        base_case: 'current_market_conditions',
        stress_scenarios: ['recession', 'inflation_spike', 'credit_crisis'],
        monte_carlo_runs: 10000
      },
      outputs: {
        var_estimates: ['1_day', '10_day', '1_month'],
        expected_shortfall: true,
        scenario_analysis: true
      },
      deployment: {
        batch_execution: true,
        schedule: 'daily',
        output_table: 'gold_investimentos.risk_metrics'
      }
    },
    github: {
      repoName: 'investment-risk-model',
      repoUrl: 'https://github.com/banco/investment-risk-model',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[11],
    technology: 'Python + NumPy + MLflow',
    deployments: mockDeployments,
    qualityAlerts: mockQualityAlerts.slice(0, 1),
    description: 'Modelo de risco para cálculo de VaR e análise de cenários de investimentos',
    createdAt: '2023-06-30T11:00:00Z',
    updatedAt: '2024-01-05T13:45:00Z'
  },
  // DASHBOARD PRODUCTS
  {
    id: 'dp-investimentos-client-reporting',
    name: 'Relatórios Clientes Investimentos',
    dataContractId: 'dc-investimentos-fundos-cotas',
    configJson: {
      data_sources: [
        'gold_investimentos.client_positions',
        'gold_investimentos.performance_metrics',
        'gold_investimentos.market_commentary'
      ],
      report_types: {
        monthly_statement: {
          sections: ['position_summary', 'performance_analysis', 'market_outlook'],
          format: 'pdf',
          personalization: true
        },
        quarterly_review: {
          sections: ['portfolio_review', 'risk_analysis', 'recommendations'],
          format: 'interactive_dashboard',
          benchmark_comparison: true
        }
      },
      generation_schedule: {
        monthly_reports: 'first_business_day',
        quarterly_reports: 'within_5_days_quarter_end'
      },
      distribution: {
        email_delivery: true,
        portal_access: true,
        mobile_app: true
      }
    },
    github: {
      repoName: 'investimentos-client-reporting',
      repoUrl: 'https://github.com/banco/investimentos-client-reporting',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[12],
    technology: 'Power BI + Azure Functions',
    deployments: mockDeployments,
    qualityAlerts: [],
    description: 'Sistema de geração automática de relatórios personalizados para clientes',
    createdAt: '2023-07-15T16:00:00Z',
    updatedAt: '2024-01-03T09:30:00Z'
  },
  {
    id: 'dp-investimentos-risk-dashboard',
    name: 'Dashboard Risco Investimentos',
    dataContractId: 'dc-investimentos-renda-fixa-posicoes',
    configJson: {
      data_sources: [
        'gold_investimentos.risk_metrics',
        'gold_investimentos.var_estimates',
        'silver_investimentos.real_time_positions'
      ],
      visualizations: {
        risk_overview: ['portfolio_var', 'risk_decomposition', 'concentration_analysis'],
        stress_testing: ['scenario_analysis', 'sensitivity_analysis', 'correlation_heatmap'],
        monitoring: ['limit_utilization', 'risk_alerts', 'model_performance']
      },
      real_time_updates: true,
      alert_thresholds: {
        var_breach: 'daily_var > limit',
        concentration_risk: 'single_issuer_exposure > 10%',
        model_accuracy: 'backtest_exceptions > 5'
      },
      refresh_schedule: {
        frequency: 'every_15_minutes',
        business_hours_only: true
      }
    },
    github: {
      repoName: 'investimentos-risk-dashboard',
      repoUrl: 'https://github.com/banco/investimentos-risk-dashboard',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/',
      branch: 'main'
    },
    lastExecution: mockExecutions[13],
    technology: 'Tableau + Databricks SQL',
    deployments: mockDeployments.slice(0, 2),
    qualityAlerts: [],
    description: 'Dashboard em tempo real para monitoramento de risco de carteiras de investimento',
    createdAt: '2023-08-25T12:00:00Z',
    updatedAt: '2024-01-02T14:20:00Z'
  }
];

// Populate collections with contracts
mockCollections[0].contracts = [mockDataContracts[0], mockDataContracts[1]]; // cartoes-credito
mockCollections[1].contracts = [mockDataContracts[2]]; // cartoes-debito  
mockCollections[2].contracts = [mockDataContracts[3]]; // cartoes-pre-pago
mockCollections[3].contracts = [mockDataContracts[4]]; // seguros-vida
mockCollections[4].contracts = [mockDataContracts[5]]; // seguros-auto
mockCollections[5].contracts = [mockDataContracts[6]]; // seguros-residencial
mockCollections[6].contracts = [mockDataContracts[7]]; // consorcio-imoveis
mockCollections[7].contracts = [mockDataContracts[8]]; // consorcio-veiculos
mockCollections[8].contracts = [mockDataContracts[9]]; // fundos-investimento
mockCollections[9].contracts = [mockDataContracts[10]]; // renda-fixa

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
  async getExecutionHistory(productId: string): Promise<ExecutionInfo[]> {
    await this.delay(200);
    // Return mock executions for any product
    // In a real implementation, this would filter by productId
    console.log(`Getting execution history for product: ${productId}`);
    return [...mockExecutions];
  }

  async getQualityAlerts(productId: string): Promise<QualityAlert[]> {
    await this.delay(200);
    return mockQualityAlerts.filter(alert => alert.productId === productId);
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
}

// Export singleton instance
export const mockDataService = MockDataService.getInstance();