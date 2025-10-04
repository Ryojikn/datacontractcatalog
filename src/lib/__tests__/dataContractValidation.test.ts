import { DataContract, DataProduct, Layer, PipelineType } from '@/types';
import { DataContractValidator, validateDataContract } from '../dataContractValidation';

// Mock data for testing
const mockBronzeContract: DataContract = {
  id: 'test-bronze',
  fundamentals: {
    name: 'Test Bronze Contract',
    version: '1.0.0',
    owner: 'test@example.com',
    domain: 'test',
    collection: 'test'
  },
  schema: {
    tableName: 'test_table',
    columns: [],
    dictionary: {}
  },
  qualityRules: [],
  tags: {
    layer: 'Bronze' as Layer,
    status: 'published'
  }
};

const mockSilverContract: DataContract = {
  ...mockBronzeContract,
  id: 'test-silver',
  tags: {
    layer: 'Silver' as Layer,
    status: 'published'
  }
};

const mockModelContract: DataContract = {
  ...mockBronzeContract,
  id: 'test-model',
  tags: {
    layer: 'Model' as Layer,
    status: 'published'
  }
};

const mockIngestionProduct: DataProduct = {
  id: 'test-ingestion',
  name: 'Test Ingestion',
  dataContractId: 'test-bronze',
  pipelineType: 'ingestion' as PipelineType,
  configJson: {
    type: 'ingestion',
    source: { type: 'database' },
    target: { type: 'delta_lake' }
  },
  github: {
    repoName: 'test',
    repoUrl: 'https://github.com/test',
    pagesUrl: 'https://test.github.io'
  },
  technology: 'Databricks'
};

const mockProcessingProduct: DataProduct = {
  ...mockIngestionProduct,
  id: 'test-processing',
  name: 'Test Processing',
  dataContractId: 'test-silver',
  pipelineType: 'processing' as PipelineType,
  configJson: {
    type: 'processing',
    source: { type: 'delta_lake' },
    target: { type: 'delta_lake' }
  }
};

const mockModelTrainingProduct: DataProduct = {
  ...mockIngestionProduct,
  id: 'test-training',
  name: 'Test Training',
  dataContractId: 'test-model',
  pipelineType: 'model_training' as PipelineType,
  configJson: {
    type: 'model_training',
    source: { type: 'delta_lake' },
    model: { type: 'xgboost', artifact_path: '/models/test' }
  }
};

describe('DataContractValidator', () => {
  describe('validateLayerPipelineCompatibility', () => {
    it('should allow ingestion for Bronze layer', () => {
      const result = DataContractValidator.validateLayerPipelineCompatibility('Bronze', 'ingestion');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should not allow processing for Bronze layer', () => {
      const result = DataContractValidator.validateLayerPipelineCompatibility('Bronze', 'processing');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('not allowed for layer');
    });

    it('should allow processing for Silver layer', () => {
      const result = DataContractValidator.validateLayerPipelineCompatibility('Silver', 'processing');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should allow model_training for Model layer', () => {
      const result = DataContractValidator.validateLayerPipelineCompatibility('Model', 'model_training');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should not allow ingestion for Model layer', () => {
      const result = DataContractValidator.validateLayerPipelineCompatibility('Model', 'ingestion');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('validateMultipleProductsTechnology', () => {
    it('should allow single product', () => {
      const result = DataContractValidator.validateMultipleProductsTechnology(
        mockBronzeContract,
        [mockIngestionProduct]
      );
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should allow multiple products with different technologies', () => {
      const product1 = { ...mockIngestionProduct, technology: 'Databricks' };
      const product2 = { ...mockIngestionProduct, id: 'test-2', technology: 'Airflow' };
      
      const result = DataContractValidator.validateMultipleProductsTechnology(
        mockBronzeContract,
        [product1, product2]
      );
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should not allow multiple products with same technology', () => {
      const product1 = { ...mockIngestionProduct, technology: 'Databricks' };
      const product2 = { ...mockIngestionProduct, id: 'test-2', technology: 'Databricks' };
      
      const result = DataContractValidator.validateMultipleProductsTechnology(
        mockBronzeContract,
        [product1, product2]
      );
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('same technology');
    });
  });

  describe('validatePipelineConfig', () => {
    it('should validate ingestion pipeline config', () => {
      const result = DataContractValidator.validatePipelineConfig(mockIngestionProduct);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require source for ingestion pipeline', () => {
      const invalidProduct = {
        ...mockIngestionProduct,
        configJson: { type: 'ingestion' as const }
      };
      
      const result = DataContractValidator.validatePipelineConfig(invalidProduct);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('source'))).toBe(true);
    });

    it('should validate model training pipeline config', () => {
      const result = DataContractValidator.validatePipelineConfig(mockModelTrainingProduct);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require model artifact for training pipeline', () => {
      const invalidProduct = {
        ...mockModelTrainingProduct,
        configJson: {
          type: 'model_training' as const,
          source: { type: 'delta_lake' },
          model: { type: 'xgboost' } // Missing artifact_path
        }
      };
      
      const result = DataContractValidator.validatePipelineConfig(invalidProduct);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('artifact'))).toBe(true);
    });
  });

  describe('validateDataContract', () => {
    it('should validate correct Bronze contract with ingestion product', () => {
      const result = validateDataContract(mockBronzeContract, [mockIngestionProduct]);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should invalidate Bronze contract with processing product', () => {
      const invalidProduct = {
        ...mockProcessingProduct,
        dataContractId: 'test-bronze'
      };
      
      const result = validateDataContract(mockBronzeContract, [invalidProduct]);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate Model contract with training product', () => {
      const result = validateDataContract(mockModelContract, [mockModelTrainingProduct]);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('getRecommendedPipelineTypes', () => {
    it('should return ingestion for Bronze layer', () => {
      const types = DataContractValidator.getRecommendedPipelineTypes('Bronze');
      expect(types).toEqual(['ingestion']);
    });

    it('should return multiple types for Silver layer', () => {
      const types = DataContractValidator.getRecommendedPipelineTypes('Silver');
      expect(types).toContain('processing');
      expect(types).toContain('model_inference');
      expect(types).toContain('model_serving');
    });

    it('should return model_training for Model layer', () => {
      const types = DataContractValidator.getRecommendedPipelineTypes('Model');
      expect(types).toEqual(['model_training']);
    });
  });

  describe('suggestLayerForPipelineType', () => {
    it('should suggest Bronze for ingestion', () => {
      const layers = DataContractValidator.suggestLayerForPipelineType('ingestion');
      expect(layers).toEqual(['Bronze']);
    });

    it('should suggest Silver/Gold for processing', () => {
      const layers = DataContractValidator.suggestLayerForPipelineType('processing');
      expect(layers).toContain('Silver');
      expect(layers).toContain('Gold');
    });

    it('should suggest Model for training', () => {
      const layers = DataContractValidator.suggestLayerForPipelineType('model_training');
      expect(layers).toEqual(['Model']);
    });
  });
});