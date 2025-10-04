# Data Contract and Product Constraints Implementation

## Overview

This document describes the business rules and constraints implemented for Data Contracts and Data Products in the platform, ensuring proper governance and consistency across the data ecosystem.

## Key Improvements Made

✅ **Removed validation UI components** - As requested, removed the validation display from contract detail pages  
✅ **Reduced products per contract** - Limited to maximum 3 products per contract for better manageability  
✅ **Aligned product names with contracts** - Product names now clearly relate to their parent contract names  
✅ **Improved naming consistency** - Products like "Ingestão Transações Cartão de Crédito" instead of generic names  
✅ **Better layer distribution** - Mixed Bronze, Silver, Gold, and Model layers across different domains

## Business Rules Implemented

### 1. Multiple Products per Contract Rule
- **Rule**: Each Data Contract may have more than one Data Product only if different technologies are applied
- **Implementation**: Validation logic checks that all products associated with a contract use different technologies
- **Example**: A contract can have both a "Databricks" and an "Airflow" product, but not two "Databricks" products

### 2. Layer-Pipeline Type Compatibility
Data Contracts are organized in layers, and each layer has specific allowed pipeline types:

#### Bronze Layer
- **Allowed Pipeline Types**: `ingestion` only
- **Purpose**: Raw data ingestion from external sources
- **Automatic Correspondence**: Bronze contracts automatically correspond to ingestion processes

#### Silver/Gold Layer
- **Allowed Pipeline Types**: `processing`, `model_inference`, `model_serving`
- **Purpose**: 
  - `processing`: ETL operations that transform and clean data
  - `model_inference`: Apply trained models to data for predictions
  - `model_serving`: Serve models via API endpoints

#### Model Layer
- **Allowed Pipeline Types**: `model_training` only
- **Purpose**: Training machine learning models and producing model artifacts

### 3. Pipeline Type Definitions

#### Ingestion Pipeline (`ingestion`)
- **Input**: External data sources (databases, APIs, files, streams)
- **Output**: Raw data tables in Bronze layer
- **Required Config**: `source`, `target`
- **Example**: Kafka streaming ingestion, batch database extraction

#### Processing Pipeline (`processing`)
- **Input**: One or several tables from Bronze/Silver layers
- **Output**: Single transformed table
- **Required Config**: `source`, `target`
- **Example**: Data aggregation, cleaning, feature engineering

#### Model Inference Pipeline (`model_inference`)
- **Input**: Data tables + trained model artifact
- **Output**: Single table with predictions
- **Required Config**: `source`, `model`, `target`
- **Example**: Batch scoring, real-time prediction pipeline

#### Model Training Pipeline (`model_training`)
- **Input**: Multiple data tables for training
- **Output**: Model artifact (serialized model)
- **Required Config**: `source`, `model` (with `artifact_path`)
- **Example**: ML model training, hyperparameter tuning

#### Model Serving Pipeline (`model_serving`)
- **Input**: Trained model artifact
- **Output**: API endpoint + optional logging table
- **Required Config**: `model`, `endpoint`
- **Optional Config**: `target` (for prediction logging)
- **Example**: REST API for real-time predictions

## Implementation Details

### Validation System

#### Core Validation Class: `DataContractValidator`
Located in `src/lib/dataContractValidation.ts`

**Key Methods:**
- `validateLayerPipelineCompatibility()`: Ensures pipeline type is allowed for the contract's layer
- `validateMultipleProductsTechnology()`: Ensures different technologies for multiple products
- `validatePipelineConfig()`: Validates pipeline configuration based on type
- `validateDataContractWithProducts()`: Complete validation of contract and its products

#### Validation Results
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
```

### UI Components

#### Data Contract Validation Component
- **Location**: `src/components/contract/data-contract-validation.tsx`
- **Purpose**: Displays validation status, errors, and warnings for a contract
- **Features**:
  - Real-time validation feedback
  - Layer rules explanation
  - Pipeline type descriptions
  - Products summary with technology information

#### Pipeline Type Selector
- **Location**: `src/components/product/pipeline-type-selector.tsx`
- **Purpose**: Helps users select appropriate pipeline types when creating products
- **Features**:
  - Layer-aware recommendations
  - Visual pipeline type descriptions
  - Disabled options for incompatible types

#### Validation Summary Dashboard
- **Location**: `src/components/dashboard/validation-summary.tsx`
- **Purpose**: Overview of validation status across all contracts
- **Features**:
  - Validation statistics
  - Progress tracking
  - List of contracts with issues

### Data Model Updates

#### Enhanced Types
- Added `PipelineType` enum with 5 pipeline types
- Enhanced `DataProduct` interface with `pipelineType` field
- Added `PipelineConfig` interface for structured configuration

#### Backward Compatibility
- Made `pipelineType` optional in `DataProduct` for existing data
- Flexible `PipelineConfig` allows various configuration structures
- Validation provides warnings for missing pipeline types

### Mock Data Updates

#### Sample Implementations
The mock data includes examples of all pipeline types:

1. **Ingestion Products**:
   - `dp-cartoes-ingestion-realtime`: Kafka streaming ingestion
   - `dp-debito-batch-ingestion`: Batch database ingestion

2. **Processing Products**:
   - `dp-cartoes-aggregation`: Data aggregation and transformation

3. **Model Training Products**:
   - `dp-fraud-detection-model`: Fraud detection model training

4. **Model Inference Products**:
   - `dp-credit-scoring-model`: Credit scoring inference

5. **Model Serving Products**:
   - `dp-fraud-detection-serving`: Real-time fraud detection API

#### Layer Examples
- **Bronze Layer**: `dc-cartoes-transacoes` (ingestion only)
- **Silver/Gold Layer**: `dc-cartoes-clientes` (processing, inference, serving)
- **Model Layer**: `dc-cartoes-fraud-model` (training only)

## Usage Guidelines

### For Data Engineers
1. **Creating Ingestion Products**: Use Bronze layer contracts with `ingestion` pipeline type
2. **Creating ETL Products**: Use Silver/Gold layer contracts with `processing` pipeline type
3. **Technology Diversity**: Ensure different technologies when creating multiple products for the same contract

### For Data Scientists
1. **Model Training**: Use Model layer contracts with `model_training` pipeline type
2. **Model Inference**: Use Silver/Gold layer contracts with `model_inference` pipeline type
3. **Model Serving**: Use Silver/Gold layer contracts with `model_serving` pipeline type

### For Product Owners
1. **Contract Planning**: Choose appropriate layer based on intended pipeline types
2. **Validation Monitoring**: Use dashboard validation summary to track compliance
3. **Technology Strategy**: Plan technology diversity for contracts requiring multiple products

## Validation Integration

### Contract Detail Page
- Displays validation status prominently
- Shows specific errors and warnings
- Provides guidance on fixing issues

### Dashboard
- Overall validation health metrics
- Quick identification of problematic contracts
- Progress tracking for compliance

### Product Creation
- Pipeline type selector with layer-aware recommendations
- Real-time validation feedback
- Prevention of invalid configurations

## Benefits

1. **Data Governance**: Ensures consistent data architecture patterns
2. **Quality Assurance**: Prevents invalid pipeline configurations
3. **Technology Diversity**: Promotes resilient data infrastructure
4. **Clear Separation**: Maintains clean boundaries between data layers
5. **Guided Development**: Helps developers make correct architectural decisions

## Future Enhancements

1. **Automated Remediation**: Suggest fixes for validation errors
2. **Policy Engine**: Configurable business rules
3. **Integration Testing**: Validate actual pipeline implementations
4. **Metrics Collection**: Track validation compliance over time
5. **Advanced Constraints**: More sophisticated business rules

## Testing

The validation system includes comprehensive unit tests in `src/lib/__tests__/dataContractValidation.test.ts` covering:
- Layer-pipeline compatibility
- Technology diversity validation
- Pipeline configuration validation
- Edge cases and error conditions

## Conclusion

This implementation provides a robust foundation for data contract governance, ensuring that data products follow established architectural patterns while maintaining flexibility for diverse use cases. The validation system helps teams build consistent, high-quality data infrastructure while providing clear guidance and feedback throughout the development process.