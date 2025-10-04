import type { DataProduct } from '../types';
import { mockExecutions, mockDeployments, mockQualityAlerts } from './mockDataShared';

// Corrected data products - consistent layers and pipeline types, max 3 per contract
export const mockDataProducts: DataProduct[] = [
  // CARTÕES DE CRÉDITO - Transações (Bronze Layer) - CORRETO: Bronze + Ingestion
  {
    id: 'dp-transacoes-cartao-credito-streaming',
    name: 'Ingestão Streaming Transações Cartão de Crédito',
    dataContractId: 'dc-cartoes-transacoes',
    pipelineType: 'ingestion' as const,
    configJson: {
      type: 'ingestion' as const,
      source: {
        type: 'kafka_stream',
        topic: 'credit-card-transactions'
      },
      target: {
        type: 'delta_lake',
        database: 'bronze_cartoes',
        table: 'transacoes_raw'
      }
    },
    github: {
      repoName: 'transacoes-cartao-credito-streaming',
      repoUrl: 'https://github.com/banco/transacoes-cartao-credito-streaming',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/'
    },
    lastExecution: mockExecutions[0],
    technology: 'Databricks + Kafka',
    environment: 'pro',
    deployments: mockDeployments,
    qualityAlerts: mockQualityAlerts.slice(0, 1),
    description: 'Pipeline de ingestão em tempo real para transações de cartão de crédito',
    createdAt: '2023-06-15T10:00:00Z',
    updatedAt: '2024-01-08T10:15:00Z'
  },
  {
    id: 'dp-transacoes-cartao-credito-batch',
    name: 'Ingestão Batch Transações Cartão de Crédito',
    dataContractId: 'dc-cartoes-transacoes',
    pipelineType: 'ingestion' as const,
    configJson: {
      type: 'ingestion' as const,
      source: {
        type: 'database',
        connection: 'postgres-cards-prod'
      },
      target: {
        type: 'delta_lake',
        database: 'bronze_cartoes',
        table: 'transacoes_batch'
      }
    },
    github: {
      repoName: 'transacoes-cartao-credito-batch',
      repoUrl: 'https://github.com/banco/transacoes-cartao-credito-batch',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/'
    },
    lastExecution: mockExecutions[1],
    technology: 'Airflow + PostgreSQL',
    environment: 'pro',
    deployments: mockDeployments,
    qualityAlerts: [],
    description: 'Pipeline de ingestão batch para transações de cartão de crédito',
    createdAt: '2023-06-15T10:00:00Z',
    updatedAt: '2024-01-08T10:15:00Z'
  },

  // CARTÕES DE CRÉDITO - Clientes (Gold Layer) - CORRETO: Gold + Processing/Inference
  {
    id: 'dp-clientes-cartao-credito-processing',
    name: 'Processamento Clientes Cartão de Crédito',
    dataContractId: 'dc-cartoes-clientes',
    pipelineType: 'processing' as const,
    configJson: {
      type: 'processing' as const,
      source: {
        type: 'delta_lake',
        tables: ['silver_cartoes.clientes_raw', 'silver_cartoes.contas']
      },
      target: {
        type: 'delta_lake',
        database: 'gold_cartoes',
        table: 'clientes_processados'
      }
    },
    github: {
      repoName: 'clientes-cartao-credito-processing',
      repoUrl: 'https://github.com/banco/clientes-cartao-credito-processing',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/'
    },
    lastExecution: mockExecutions[2],
    technology: 'Databricks + Spark',
    environment: 'pro',
    deployments: mockDeployments,
    qualityAlerts: [],
    description: 'Pipeline de processamento e enriquecimento de dados de clientes de cartão de crédito',
    createdAt: '2023-07-10T15:00:00Z',
    updatedAt: '2024-01-05T14:30:00Z'
  },
  {
    id: 'dp-clientes-cartao-credito-scoring',
    name: 'Credit Scoring Clientes Cartão de Crédito',
    dataContractId: 'dc-cartoes-clientes',
    pipelineType: 'model_inference' as const,
    configJson: {
      type: 'model_inference' as const,
      source: {
        type: 'delta_lake',
        tables: ['gold_cartoes.clientes_processados']
      },
      model: {
        type: 'logistic_regression',
        artifact_path: '/models/credit_scoring/'
      },
      target: {
        type: 'delta_lake',
        database: 'gold_cartoes',
        table: 'clientes_scores'
      }
    },
    github: {
      repoName: 'clientes-cartao-credito-scoring',
      repoUrl: 'https://github.com/banco/clientes-cartao-credito-scoring',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/'
    },
    lastExecution: mockExecutions[3],
    technology: 'MLflow + Scikit-learn',
    environment: 'pro',
    deployments: mockDeployments,
    qualityAlerts: [],
    description: 'Pipeline de inferência para cálculo de credit scoring de clientes de cartão de crédito',
    createdAt: '2023-10-15T09:00:00Z',
    updatedAt: '2024-01-02T13:45:00Z'
  },

  // CARTÕES DÉBITO - Transações (Silver Layer) - CORRIGIDO: Silver + Processing
  {
    id: 'dp-transacoes-cartao-debito-processing',
    name: 'Processamento Transações Cartão de Débito',
    dataContractId: 'dc-debito-transacoes',
    pipelineType: 'processing' as const,
    configJson: {
      type: 'processing' as const,
      source: {
        type: 'delta_lake',
        tables: ['bronze_cartoes.debito_raw']
      },
      target: {
        type: 'delta_lake',
        database: 'silver_cartoes',
        table: 'debito_processado'
      }
    },
    github: {
      repoName: 'transacoes-cartao-debito-processing',
      repoUrl: 'https://github.com/banco/transacoes-cartao-debito-processing',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/'
    },
    lastExecution: mockExecutions[4],
    technology: 'Databricks + Spark',
    environment: 'pro',
    deployments: mockDeployments,
    qualityAlerts: [],
    description: 'Pipeline de processamento de transações de cartão de débito',
    createdAt: '2023-04-20T12:00:00Z',
    updatedAt: '2024-01-07T09:30:00Z'
  },

  // CARTÕES PRÉ-PAGO - Transações (Silver Layer) - CORRIGIDO: Silver + Processing
  {
    id: 'dp-transacoes-cartao-prepago-processing',
    name: 'Processamento Transações Cartão Pré-pago',
    dataContractId: 'dc-prepago-transacoes',
    pipelineType: 'processing' as const,
    configJson: {
      type: 'processing' as const,
      source: {
        type: 'delta_lake',
        tables: ['bronze_cartoes.prepago_raw']
      },
      target: {
        type: 'delta_lake',
        database: 'silver_cartoes',
        table: 'prepago_processado'
      }
    },
    github: {
      repoName: 'transacoes-cartao-prepago-processing',
      repoUrl: 'https://github.com/banco/transacoes-cartao-prepago-processing',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/'
    },
    lastExecution: mockExecutions[5],
    technology: 'Databricks + Spark',
    environment: 'dev',
    deployments: mockDeployments,
    qualityAlerts: [],
    description: 'Pipeline de processamento de transações de cartão pré-pago',
    createdAt: '2023-08-01T11:00:00Z',
    updatedAt: '2024-01-03T14:20:00Z'
  },

  // SEGUROS VIDA - Apólices (Bronze Layer) - CORRIGIDO: Bronze + Ingestion
  {
    id: 'dp-apolices-seguro-vida-streaming',
    name: 'Ingestão Streaming Apólices Seguro de Vida',
    dataContractId: 'dc-seguros-vida-apolices',
    pipelineType: 'ingestion' as const,
    configJson: {
      type: 'ingestion' as const,
      source: {
        type: 'api_stream',
        endpoint: 'https://core-seguros.banco.com/api/policies/stream'
      },
      target: {
        type: 'delta_lake',
        database: 'bronze_seguros',
        table: 'vida_apolices_raw'
      }
    },
    github: {
      repoName: 'apolices-seguro-vida-streaming',
      repoUrl: 'https://github.com/banco/apolices-seguro-vida-streaming',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/'
    },
    lastExecution: mockExecutions[6],
    technology: 'Kafka + Confluent',
    environment: 'pro',
    deployments: mockDeployments,
    qualityAlerts: mockQualityAlerts.slice(1, 2),
    description: 'Pipeline de ingestão em tempo real de apólices de seguro de vida',
    createdAt: '2023-06-01T09:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z'
  },
  {
    id: 'dp-apolices-seguro-vida-batch',
    name: 'Ingestão Batch Apólices Seguro de Vida',
    dataContractId: 'dc-seguros-vida-apolices',
    pipelineType: 'ingestion' as const,
    configJson: {
      type: 'ingestion' as const,
      source: {
        type: 'database',
        connection: 'oracle-seguros-prod'
      },
      target: {
        type: 'delta_lake',
        database: 'bronze_seguros',
        table: 'vida_apolices_batch'
      }
    },
    github: {
      repoName: 'apolices-seguro-vida-batch',
      repoUrl: 'https://github.com/banco/apolices-seguro-vida-batch',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/'
    },
    lastExecution: mockExecutions[7],
    technology: 'Airflow + Oracle',
    environment: 'pro',
    deployments: mockDeployments,
    qualityAlerts: [],
    description: 'Pipeline de ingestão batch de apólices de seguro de vida',
    createdAt: '2023-08-01T12:00:00Z',
    updatedAt: '2024-01-04T14:30:00Z'
  },

  // SEGUROS AUTO - Sinistros (Bronze Layer) - CORRIGIDO: Bronze + Ingestion
  {
    id: 'dp-sinistros-seguro-auto-streaming',
    name: 'Ingestão Streaming Sinistros Seguro Auto',
    dataContractId: 'dc-seguros-auto-sinistros',
    pipelineType: 'ingestion' as const,
    configJson: {
      type: 'ingestion' as const,
      source: {
        type: 'kinesis_stream',
        stream_name: 'auto-claims-stream'
      },
      target: {
        type: 'delta_lake',
        database: 'bronze_seguros',
        table: 'auto_sinistros_raw'
      }
    },
    github: {
      repoName: 'sinistros-seguro-auto-streaming',
      repoUrl: 'https://github.com/banco/sinistros-seguro-auto-streaming',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/'
    },
    lastExecution: mockExecutions[8],
    technology: 'Databricks + Kinesis',
    environment: 'pro',
    deployments: mockDeployments,
    qualityAlerts: mockQualityAlerts.slice(2, 3),
    description: 'Pipeline de ingestão em tempo real de sinistros de seguro auto',
    createdAt: '2023-07-20T10:00:00Z',
    updatedAt: '2024-01-07T15:45:00Z'
  },

  // SEGUROS AUTO - Sinistros Processados (Silver Layer) - NOVO: Silver + Processing + Inference
  {
    id: 'dp-sinistros-seguro-auto-processing',
    name: 'Processamento Sinistros Seguro Auto',
    dataContractId: 'dc-seguros-auto-sinistros-processados',
    pipelineType: 'processing' as const,
    configJson: {
      type: 'processing' as const,
      source: {
        type: 'delta_lake',
        tables: ['bronze_seguros.auto_sinistros_raw']
      },
      target: {
        type: 'delta_lake',
        database: 'silver_seguros',
        table: 'auto_sinistros_processados'
      }
    },
    github: {
      repoName: 'sinistros-seguro-auto-processing',
      repoUrl: 'https://github.com/banco/sinistros-seguro-auto-processing',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/'
    },
    lastExecution: mockExecutions[9],
    technology: 'Databricks + Spark',
    environment: 'pro',
    deployments: mockDeployments,
    qualityAlerts: [],
    description: 'Pipeline de processamento e enriquecimento de sinistros de seguro auto',
    createdAt: '2023-08-15T10:00:00Z',
    updatedAt: '2024-01-05T15:30:00Z'
  },
  {
    id: 'dp-sinistros-seguro-auto-fraud-detection',
    name: 'Detecção Fraude Sinistros Seguro Auto',
    dataContractId: 'dc-seguros-auto-sinistros-processados',
    pipelineType: 'model_inference' as const,
    configJson: {
      type: 'model_inference' as const,
      source: {
        type: 'delta_lake',
        tables: ['silver_seguros.auto_sinistros_processados']
      },
      model: {
        type: 'ensemble',
        artifact_path: '/models/claims_fraud/'
      },
      target: {
        type: 'delta_lake',
        database: 'silver_seguros',
        table: 'sinistros_fraud_scores'
      }
    },
    github: {
      repoName: 'sinistros-seguro-auto-fraud-detection',
      repoUrl: 'https://github.com/banco/sinistros-seguro-auto-fraud-detection',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/'
    },
    lastExecution: mockExecutions[10],
    technology: 'MLflow + Scikit-learn',
    environment: 'pro',
    deployments: mockDeployments,
    qualityAlerts: mockQualityAlerts.slice(3, 4),
    description: 'Pipeline de detecção de fraude em sinistros de seguro auto usando ML',
    createdAt: '2023-09-15T13:00:00Z',
    updatedAt: '2024-01-05T10:30:00Z'
  },

  // SEGUROS RESIDENCIAL - Apólices (Silver Layer) - CORRIGIDO: Silver + Processing
  {
    id: 'dp-apolices-seguro-residencial-processing',
    name: 'Processamento Apólices Seguro Residencial',
    dataContractId: 'dc-seguros-residencial-apolices',
    pipelineType: 'processing' as const,
    configJson: {
      type: 'processing' as const,
      source: {
        type: 'delta_lake',
        tables: ['silver_seguros.residencial_raw']
      },
      target: {
        type: 'delta_lake',
        database: 'gold_seguros',
        table: 'residencial_processado'
      }
    },
    github: {
      repoName: 'apolices-seguro-residencial-processing',
      repoUrl: 'https://github.com/banco/apolices-seguro-residencial-processing',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/'
    },
    lastExecution: mockExecutions[10],
    technology: 'Databricks + Spark',
    environment: 'pro',
    deployments: mockDeployments,
    qualityAlerts: [],
    description: 'Pipeline de processamento de apólices de seguro residencial',
    createdAt: '2023-09-01T09:00:00Z',
    updatedAt: '2024-01-05T11:30:00Z'
  },

  // CONSÓRCIO IMÓVEIS - Grupos (Silver Layer) - CORRETO: Silver + Processing
  {
    id: 'dp-grupos-consorcio-imoveis-processing',
    name: 'Processamento Grupos Consórcio Imóveis',
    dataContractId: 'dc-consorcio-imoveis-grupos',
    pipelineType: 'processing' as const,
    configJson: {
      type: 'processing' as const,
      source: {
        type: 'delta_lake',
        tables: ['bronze_consorcio.grupos_imoveis_raw']
      },
      target: {
        type: 'delta_lake',
        database: 'silver_consorcio',
        table: 'grupos_imoveis_processados'
      }
    },
    github: {
      repoName: 'grupos-consorcio-imoveis-processing',
      repoUrl: 'https://github.com/banco/grupos-consorcio-imoveis-processing',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/'
    },
    lastExecution: mockExecutions[11],
    technology: 'Databricks + Spark',
    environment: 'pro',
    deployments: mockDeployments,
    qualityAlerts: [],
    description: 'Pipeline de processamento de dados de grupos de consórcio imobiliário',
    createdAt: '2023-09-01T09:00:00Z',
    updatedAt: '2024-01-05T11:30:00Z'
  },

  // CONSÓRCIO VEÍCULOS - Participantes (Gold Layer) - CORRIGIDO: Gold + ETL + Modelos
  {
    id: 'dp-participantes-consorcio-veiculos-etl',
    name: 'ETL Participantes Consórcio Veículos',
    dataContractId: 'dc-consorcio-veiculos-participantes',
    pipelineType: 'processing' as const,
    configJson: {
      type: 'processing' as const,
      source: {
        type: 'delta_lake',
        tables: ['silver_consorcio.participantes_raw', 'silver_consorcio.pagamentos', 'silver_consorcio.grupos']
      },
      target: {
        type: 'delta_lake',
        database: 'gold_consorcio',
        table: 'participantes_enriquecidos'
      }
    },
    github: {
      repoName: 'participantes-consorcio-veiculos-etl',
      repoUrl: 'https://github.com/banco/participantes-consorcio-veiculos-etl',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/'
    },
    lastExecution: mockExecutions[12],
    technology: 'Databricks + Spark',
    environment: 'pro',
    deployments: mockDeployments,
    qualityAlerts: mockQualityAlerts.slice(4, 5),
    description: 'Pipeline ETL para enriquecimento de dados de participantes de consórcio de veículos',
    createdAt: '2023-04-10T09:00:00Z',
    updatedAt: '2024-01-06T11:20:00Z'
  },
  {
    id: 'dp-participantes-consorcio-veiculos-churn-model',
    name: 'Modelo Churn Participantes Consórcio Veículos',
    dataContractId: 'dc-consorcio-veiculos-participantes',
    pipelineType: 'model_inference' as const,
    configJson: {
      type: 'model_inference' as const,
      source: {
        type: 'delta_lake',
        tables: ['gold_consorcio.participantes_enriquecidos']
      },
      model: {
        type: 'gradient_boosting',
        artifact_path: '/models/consorcio_churn/'
      },
      target: {
        type: 'delta_lake',
        database: 'gold_consorcio',
        table: 'participantes_churn_scores'
      }
    },
    github: {
      repoName: 'participantes-consorcio-veiculos-churn-model',
      repoUrl: 'https://github.com/banco/participantes-consorcio-veiculos-churn-model',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/'
    },
    lastExecution: mockExecutions[13],
    technology: 'MLflow + XGBoost',
    environment: 'pro',
    deployments: mockDeployments,
    qualityAlerts: [],
    description: 'Modelo de predição de churn para participantes de consórcio de veículos',
    createdAt: '2023-10-15T13:00:00Z',
    updatedAt: '2024-01-08T10:45:00Z'
  },
  {
    id: 'dp-participantes-consorcio-veiculos-serving',
    name: 'API Scoring Participantes Consórcio Veículos',
    dataContractId: 'dc-consorcio-veiculos-participantes',
    pipelineType: 'model_serving' as const,
    configJson: {
      type: 'model_serving' as const,
      model: {
        type: 'gradient_boosting',
        artifact_path: '/models/consorcio_churn/production/'
      },
      endpoint: {
        type: 'rest_api',
        url: 'https://api.banco.com/ml/consorcio-churn/v1'
      },
      target: {
        type: 'delta_lake',
        database: 'gold_consorcio',
        table: 'churn_predictions_log'
      }
    },
    github: {
      repoName: 'participantes-consorcio-veiculos-serving',
      repoUrl: 'https://github.com/banco/participantes-consorcio-veiculos-serving',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/'
    },
    lastExecution: mockExecutions[14],
    technology: 'FastAPI + MLflow',
    environment: 'pro',
    deployments: mockDeployments,
    qualityAlerts: [],
    description: 'API de serving para scoring de churn de participantes de consórcio de veículos',
    createdAt: '2023-11-01T14:00:00Z',
    updatedAt: '2024-01-08T16:45:00Z'
  },

  // INVESTIMENTOS - Fundos Cotas (Gold Layer) - CORRIGIDO: Gold + Processing
  {
    id: 'dp-fundos-cotas-investimentos-processing',
    name: 'Processamento Fundos de Cotas Investimentos',
    dataContractId: 'dc-investimentos-fundos-cotas',
    pipelineType: 'processing' as const,
    configJson: {
      type: 'processing' as const,
      source: {
        type: 'delta_lake',
        tables: ['silver_investimentos.fundos_cotas_raw']
      },
      target: {
        type: 'delta_lake',
        database: 'gold_investimentos',
        table: 'fundos_cotas_processados'
      }
    },
    github: {
      repoName: 'fundos-cotas-investimentos-processing',
      repoUrl: 'https://github.com/banco/fundos-cotas-investimentos-processing',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/'
    },
    lastExecution: mockExecutions[14],
    technology: 'Databricks + Spark',
    environment: 'pro',
    deployments: mockDeployments,
    qualityAlerts: mockQualityAlerts.slice(5, 6),
    description: 'Pipeline de processamento de dados de fundos de cotas de investimentos',
    createdAt: '2023-03-01T07:00:00Z',
    updatedAt: '2024-01-09T08:15:00Z'
  },
  {
    id: 'dp-fundos-cotas-investimentos-performance',
    name: 'Cálculo Performance Fundos de Cotas',
    dataContractId: 'dc-investimentos-fundos-cotas',
    pipelineType: 'processing' as const,
    configJson: {
      type: 'processing' as const,
      source: {
        type: 'delta_lake',
        tables: ['gold_investimentos.fundos_cotas_processados']
      },
      target: {
        type: 'delta_lake',
        database: 'gold_investimentos',
        table: 'fundos_performance'
      }
    },
    github: {
      repoName: 'fundos-cotas-investimentos-performance',
      repoUrl: 'https://github.com/banco/fundos-cotas-investimentos-performance',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/'
    },
    lastExecution: mockExecutions[15],
    technology: 'Python + Pandas',
    environment: 'pro',
    deployments: mockDeployments,
    qualityAlerts: [],
    description: 'Pipeline de cálculo de performance de fundos de cotas',
    createdAt: '2023-05-01T09:00:00Z',
    updatedAt: '2024-01-07T16:30:00Z'
  },

  // INVESTIMENTOS - Renda Fixa Posições (Silver Layer) - CORRIGIDO: Silver + Processing/Inference
  {
    id: 'dp-posicoes-renda-fixa-processing',
    name: 'Processamento Posições Renda Fixa',
    dataContractId: 'dc-investimentos-renda-fixa-posicoes',
    pipelineType: 'processing' as const,
    configJson: {
      type: 'processing' as const,
      source: {
        type: 'delta_lake',
        tables: ['bronze_investimentos.renda_fixa_raw']
      },
      target: {
        type: 'delta_lake',
        database: 'silver_investimentos',
        table: 'renda_fixa_processado'
      }
    },
    github: {
      repoName: 'posicoes-renda-fixa-processing',
      repoUrl: 'https://github.com/banco/posicoes-renda-fixa-processing',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/'
    },
    lastExecution: mockExecutions[0],
    technology: 'Databricks + Spark',
    environment: 'pro',
    deployments: mockDeployments,
    qualityAlerts: mockQualityAlerts.slice(6, 7),
    description: 'Pipeline de processamento de posições de renda fixa',
    createdAt: '2023-04-01T08:00:00Z',
    updatedAt: '2024-01-08T12:20:00Z'
  },
  {
    id: 'dp-posicoes-renda-fixa-risk-model',
    name: 'Modelo Risco Posições Renda Fixa',
    dataContractId: 'dc-investimentos-renda-fixa-posicoes',
    pipelineType: 'model_inference' as const,
    configJson: {
      type: 'model_inference' as const,
      source: {
        type: 'delta_lake',
        tables: ['silver_investimentos.renda_fixa_processado']
      },
      model: {
        type: 'risk_modeling',
        artifact_path: '/models/risk_assessment/'
      },
      target: {
        type: 'delta_lake',
        database: 'silver_investimentos',
        table: 'renda_fixa_risk_scores'
      }
    },
    github: {
      repoName: 'posicoes-renda-fixa-risk-model',
      repoUrl: 'https://github.com/banco/posicoes-renda-fixa-risk-model',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/'
    },
    lastExecution: mockExecutions[1],
    technology: 'R + MLflow',
    environment: 'pro',
    deployments: mockDeployments,
    qualityAlerts: mockQualityAlerts.slice(7, 8),
    description: 'Pipeline de modelagem de risco para posições de renda fixa',
    createdAt: '2023-07-01T11:00:00Z',
    updatedAt: '2024-01-05T15:20:00Z'
  },

  // MODELO DE FRAUDE (Model Layer) - CORRETO: Model + Training
  {
    id: 'dp-modelo-deteccao-fraude-training',
    name: 'Treinamento Modelo Detecção Fraude Cartões',
    dataContractId: 'dc-cartoes-fraud-model',
    pipelineType: 'model_training' as const,
    configJson: {
      type: 'model_training' as const,
      source: {
        type: 'delta_lake',
        tables: ['gold_cartoes.fraud_training_dataset']
      },
      model: {
        type: 'gradient_boosting',
        framework: 'xgboost',
        artifact_path: '/models/fraud_detection/'
      }
    },
    github: {
      repoName: 'modelo-deteccao-fraude-training',
      repoUrl: 'https://github.com/banco/modelo-deteccao-fraude-training',
      pagesUrl: 'https://ryojikn.github.io/mlflow-proxy/'
    },
    lastExecution: mockExecutions[2],
    technology: 'MLflow + XGBoost',
    environment: 'pro',
    deployments: mockDeployments,
    qualityAlerts: mockQualityAlerts.slice(0, 1),
    description: 'Pipeline de treinamento do modelo de detecção de fraude para cartões',
    createdAt: '2023-09-01T11:00:00Z',
    updatedAt: '2024-01-04T16:20:00Z'
  }
];