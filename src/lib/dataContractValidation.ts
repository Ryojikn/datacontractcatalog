import type { DataContract, DataProduct, Layer, PipelineType } from '@/types';

/**
 * Business rules for Data Contracts and Data Products:
 * 
 * 1. Each Data Contract may have more than one Data Product only if different technologies are applied
 * 2. One DataContract has a schema that is a commitment to what the DataProduct will produce
 * 3. Layer-Pipeline relationships:
 *    - Bronze layer: Only ingestion pipelines (automatic correspondence)
 *    - Silver/Gold layer: ETL (processing) or Model Inference/Serving pipelines
 *    - Model layer: Only Model Training pipelines
 * 
 * 4. Pipeline types:
 *    - ingestion: reads from source
 *    - processing: reads from one/several tables, produces single table
 *    - model_inference: reads from tables + model artifact, produces single table
 *    - model_training: reads from several tables, produces model artifact
 *    - model_serving: consumes model, provides endpoint + optional logging table
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class DataContractValidator {
  /**
   * Validates if a pipeline type is allowed for a given layer
   */
  static validateLayerPipelineCompatibility(layer: Layer, pipelineType: PipelineType): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const layerPipelineRules: Record<Layer, PipelineType[]> = {
      'Bronze': ['ingestion'],
      'Silver': ['processing', 'model_inference', 'model_serving'],
      'Gold': ['processing', 'model_inference', 'model_serving'],
      'Model': ['model_training']
    };

    const allowedPipelines = layerPipelineRules[layer];
    
    if (!allowedPipelines.includes(pipelineType)) {
      result.isValid = false;
      result.errors.push(
        `Pipeline type '${pipelineType}' is not allowed for layer '${layer}'. ` +
        `Allowed types: ${allowedPipelines.join(', ')}`
      );
    }

    return result;
  }

  /**
   * Validates if multiple data products for the same contract use different technologies
   */
  static validateMultipleProductsTechnology(
    contract: DataContract, 
    products: DataProduct[]
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const contractProducts = products.filter(p => p.dataContractId === contract.id);
    
    if (contractProducts.length <= 1) {
      return result; // Single or no products - always valid
    }

    // Check if all products use different technologies
    const technologies = contractProducts.map(p => p.technology || 'undefined');
    const uniqueTechnologies = new Set(technologies);

    if (uniqueTechnologies.size !== contractProducts.length) {
      result.isValid = false;
      result.errors.push(
        `Data Contract '${contract.fundamentals.name}' has multiple products with the same technology. ` +
        `Each product must use a different technology when multiple products exist for the same contract.`
      );
    }

    return result;
  }

  /**
   * Validates pipeline configuration based on type
   */
  static validatePipelineConfig(product: DataProduct): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const { pipelineType, configJson } = product;

    if (!pipelineType) {
      result.warnings.push(`Product '${product.name}' does not have a pipeline type specified`);
      return result;
    }

    switch (pipelineType) {
      case 'ingestion':
        if (!configJson.source) {
          result.errors.push('Ingestion pipeline must have source configuration');
        }
        if (!configJson.target) {
          result.errors.push('Ingestion pipeline must have target configuration');
        }
        break;

      case 'processing':
        if (!configJson.source) {
          result.errors.push('Processing pipeline must have source configuration');
        }
        if (!configJson.target) {
          result.errors.push('Processing pipeline must have target configuration (single table)');
        }
        break;

      case 'model_inference':
        if (!configJson.source) {
          result.errors.push('Model inference pipeline must have source configuration');
        }
        if (!configJson.model) {
          result.errors.push('Model inference pipeline must have model configuration');
        }
        if (!configJson.target) {
          result.errors.push('Model inference pipeline must have target configuration (single table)');
        }
        break;

      case 'model_training':
        if (!configJson.source) {
          result.errors.push('Model training pipeline must have source configuration');
        }
        if (!configJson.model || !configJson.model.artifact_path) {
          result.errors.push('Model training pipeline must have model artifact output configuration');
        }
        break;

      case 'model_serving':
        if (!configJson.model) {
          result.errors.push('Model serving pipeline must have model configuration');
        }
        if (!configJson.endpoint) {
          result.errors.push('Model serving pipeline must have endpoint configuration');
        }
        // Optional: logging table for historical analysis
        if (configJson.target) {
          result.warnings.push('Model serving pipeline has optional logging table configured');
        }
        break;

      default:
        result.errors.push(`Unknown pipeline type: ${pipelineType}`);
    }

    if (result.errors.length > 0) {
      result.isValid = false;
    }

    return result;
  }

  /**
   * Validates the complete data contract and its products
   */
  static validateDataContractWithProducts(
    contract: DataContract, 
    products: DataProduct[]
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const contractProducts = products.filter(p => p.dataContractId === contract.id);

    // Validate each product individually
    for (const product of contractProducts) {
      // Validate layer-pipeline compatibility
      if (product.pipelineType) {
        const layerValidation = this.validateLayerPipelineCompatibility(
          contract.tags.layer, 
          product.pipelineType
        );
        result.errors.push(...layerValidation.errors);
        result.warnings.push(...layerValidation.warnings);
      } else {
        result.warnings.push(`Product '${product.name}' does not have a pipeline type specified`);
      }

      // Validate pipeline configuration
      const configValidation = this.validatePipelineConfig(product);
      result.errors.push(...configValidation.errors);
      result.warnings.push(...configValidation.warnings);
    }

    // Validate multiple products technology constraint
    const technologyValidation = this.validateMultipleProductsTechnology(contract, products);
    result.errors.push(...technologyValidation.errors);
    result.warnings.push(...technologyValidation.warnings);

    result.isValid = result.errors.length === 0;

    return result;
  }

  /**
   * Gets recommended pipeline types for a given layer
   */
  static getRecommendedPipelineTypes(layer: Layer): PipelineType[] {
    const layerPipelineRules: Record<Layer, PipelineType[]> = {
      'Bronze': ['ingestion'],
      'Silver': ['processing', 'model_inference', 'model_serving'],
      'Gold': ['processing', 'model_inference', 'model_serving'],
      'Model': ['model_training']
    };

    return layerPipelineRules[layer] || [];
  }

  /**
   * Suggests layer based on pipeline type
   */
  static suggestLayerForPipelineType(pipelineType: PipelineType): Layer[] {
    const pipelineLayerMap: Record<PipelineType, Layer[]> = {
      'ingestion': ['Bronze'],
      'processing': ['Silver', 'Gold'],
      'model_inference': ['Silver', 'Gold'],
      'model_training': ['Model'],
      'model_serving': ['Silver', 'Gold']
    };

    return pipelineLayerMap[pipelineType] || [];
  }
}

/**
 * Helper function to validate a single data contract with its products
 */
export function validateDataContract(
  contract: DataContract, 
  allProducts: DataProduct[]
): ValidationResult {
  return DataContractValidator.validateDataContractWithProducts(contract, allProducts);
}

/**
 * Helper function to validate all contracts and products in a collection
 */
export function validateCollection(
  contracts: DataContract[], 
  products: DataProduct[]
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};

  for (const contract of contracts) {
    results[contract.id] = validateDataContract(contract, products);
  }

  return results;
}