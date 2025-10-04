import type { ExecutionInfo, DeploymentInfo, QualityAlert, ExecutionStatus, QualitySeverity } from '../types';

// Shared mock data used by both services
export const mockExecutions: ExecutionInfo[] = [
  {
    id: 'exec-001',
    date: '2024-01-09T08:00:00Z',
    status: 'success' as ExecutionStatus,
    duration: 1200,
    technology: 'Databricks',
    logs: 'Pipeline executed successfully'
  },
  {
    id: 'exec-002',
    date: '2024-01-08T14:30:00Z',
    status: 'success' as ExecutionStatus,
    duration: 850,
    technology: 'Airflow',
    logs: 'Batch processing completed'
  },
  {
    id: 'exec-003',
    date: '2024-01-07T10:15:00Z',
    status: 'failure' as ExecutionStatus,
    duration: 300,
    technology: 'Spark',
    errorMessage: 'Connection timeout',
    logs: 'Failed to connect to data source'
  },
  {
    id: 'exec-004',
    date: '2024-01-06T16:45:00Z',
    status: 'success' as ExecutionStatus,
    duration: 2100,
    technology: 'MLflow',
    logs: 'Model training completed successfully'
  },
  {
    id: 'exec-005',
    date: '2024-01-05T09:20:00Z',
    status: 'success' as ExecutionStatus,
    duration: 450,
    technology: 'Kafka',
    logs: 'Real-time ingestion running smoothly'
  },
  {
    id: 'exec-006',
    date: '2024-01-04T13:10:00Z',
    status: 'success' as ExecutionStatus,
    duration: 1800,
    technology: 'Databricks',
    logs: 'Data transformation completed'
  },
  {
    id: 'exec-007',
    date: '2024-01-03T11:30:00Z',
    status: 'failure' as ExecutionStatus,
    duration: 180,
    technology: 'Airflow',
    errorMessage: 'Memory limit exceeded',
    logs: 'Task failed due to insufficient memory'
  },
  {
    id: 'exec-008',
    date: '2024-01-02T14:15:00Z',
    status: 'success' as ExecutionStatus,
    duration: 920,
    technology: 'Spark',
    logs: 'Batch processing completed successfully'
  },
  {
    id: 'exec-009',
    date: '2024-01-01T08:00:00Z',
    status: 'success' as ExecutionStatus,
    duration: 1500,
    technology: 'Python',
    logs: 'Data quality checks passed'
  },
  {
    id: 'exec-010',
    date: '2023-12-31T20:30:00Z',
    status: 'success' as ExecutionStatus,
    duration: 3600,
    technology: 'R',
    logs: 'Statistical analysis completed'
  },
  {
    id: 'exec-011',
    date: '2023-12-30T12:45:00Z',
    status: 'success' as ExecutionStatus,
    duration: 680,
    technology: 'Tableau',
    logs: 'Dashboard refresh completed'
  },
  {
    id: 'exec-012',
    date: '2023-12-29T15:20:00Z',
    status: 'success' as ExecutionStatus,
    duration: 1200,
    technology: 'Power BI',
    logs: 'Report generation successful'
  },
  {
    id: 'exec-013',
    date: '2023-12-28T10:10:00Z',
    status: 'success' as ExecutionStatus,
    duration: 2400,
    technology: 'Scikit-learn',
    logs: 'Model inference completed'
  },
  {
    id: 'exec-014',
    date: '2023-12-27T17:30:00Z',
    status: 'success' as ExecutionStatus,
    duration: 540,
    technology: 'Kinesis',
    logs: 'Stream processing active'
  },
  {
    id: 'exec-015',
    date: '2023-12-26T09:45:00Z',
    status: 'success' as ExecutionStatus,
    duration: 1100,
    technology: 'XGBoost',
    logs: 'Model training iteration completed'
  },
  {
    id: 'exec-016',
    date: '2023-12-25T14:00:00Z',
    status: 'success' as ExecutionStatus,
    duration: 800,
    technology: 'FastAPI',
    logs: 'API serving model predictions'
  }
];

export const mockDeployments: DeploymentInfo[] = [
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

export const mockQualityAlerts: QualityAlert[] = [
  {
    id: 'qa-001',
    ruleId: 'qr-001',
    ruleName: 'CPF Validation',
    severity: 'high' as QualitySeverity,
    message: '15 registros com CPF inválido detectados na última execução',
    date: '2024-01-09T10:35:00Z',
    resolved: false,
    productId: 'dp-transacoes-cartao-credito-ingestion'
  },
  {
    id: 'qa-002',
    ruleId: 'qr-002',
    ruleName: 'Amount Range Check',
    severity: 'medium' as QualitySeverity,
    message: 'Valores de transação fora do range esperado detectados',
    date: '2024-01-08T14:20:00Z',
    resolved: true,
    productId: 'dp-apolices-seguro-vida-ingestion'
  },
  {
    id: 'qa-003',
    ruleId: 'qr-003',
    ruleName: 'Schema Validation',
    severity: 'critical' as QualitySeverity,
    message: 'Schema validation failed for incoming data',
    date: '2024-01-07T16:45:00Z',
    resolved: false,
    productId: 'dp-sinistros-seguro-auto-ingestion'
  },
  {
    id: 'qa-004',
    ruleId: 'qr-004',
    ruleName: 'Duplicate Detection',
    severity: 'low' as QualitySeverity,
    message: 'Duplicate records found in data stream',
    date: '2024-01-06T11:30:00Z',
    resolved: true,
    productId: 'dp-participantes-consorcio-veiculos-ingestion'
  },
  {
    id: 'qa-005',
    ruleId: 'qr-005',
    ruleName: 'Data Freshness',
    severity: 'medium' as QualitySeverity,
    message: 'Data freshness threshold exceeded',
    date: '2024-01-05T08:15:00Z',
    resolved: false,
    productId: 'dp-fundos-cotas-investimentos-ingestion'
  },
  {
    id: 'qa-006',
    ruleId: 'qr-006',
    ruleName: 'Null Value Check',
    severity: 'high' as QualitySeverity,
    message: 'Unexpected null values in required fields',
    date: '2024-01-04T13:20:00Z',
    resolved: true,
    productId: 'dp-posicoes-renda-fixa-ingestion'
  },
  {
    id: 'qa-007',
    ruleId: 'qr-007',
    ruleName: 'Model Performance',
    severity: 'critical' as QualitySeverity,
    message: 'Model accuracy dropped below threshold',
    date: '2024-01-03T10:45:00Z',
    resolved: false,
    productId: 'dp-modelo-deteccao-fraude-training'
  },
  {
    id: 'qa-008',
    ruleId: 'qr-008',
    ruleName: 'Data Volume Check',
    severity: 'medium' as QualitySeverity,
    message: 'Data volume significantly lower than expected',
    date: '2024-01-02T15:30:00Z',
    resolved: true,
    productId: 'dp-clientes-cartao-credito-processing'
  }
];