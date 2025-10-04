import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import type { DataContract, DataProduct } from '@/types';
import { validateDataContract, DataContractValidator } from '@/lib/dataContractValidation';

interface DataContractValidationProps {
  contract: DataContract;
  products: DataProduct[];
  className?: string;
}

export function DataContractValidation({ 
  contract, 
  products, 
  className = '' 
}: DataContractValidationProps) {
  const validationResult = validateDataContract(contract, products);
  const contractProducts = products.filter(p => p.dataContractId === contract.id);
  const recommendedPipelines = DataContractValidator.getRecommendedPipelineTypes(contract.tags.layer);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Validation Status */}
      <div className="flex items-center gap-2">
        {validationResult.isValid ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500" />
        )}
        <h3 className="font-semibold">
          Contract Validation {validationResult.isValid ? 'Passed' : 'Failed'}
        </h3>
      </div>

      {/* Errors */}
      {validationResult.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="font-medium text-red-800">Validation Errors</span>
          </div>
          <ul className="space-y-1 text-sm text-red-700">
            {validationResult.errors.map((error, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {validationResult.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="font-medium text-yellow-800">Warnings</span>
          </div>
          <ul className="space-y-1 text-sm text-yellow-700">
            {validationResult.warnings.map((warning, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Layer-Pipeline Rules */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-blue-500" />
          <span className="font-medium text-blue-800">Layer Rules</span>
        </div>
        <div className="text-sm text-blue-700">
          <p className="mb-2">
            <strong>Layer:</strong> {contract.tags.layer}
          </p>
          <p className="mb-2">
            <strong>Allowed Pipeline Types:</strong> {recommendedPipelines.join(', ')}
          </p>
          <div className="text-xs text-blue-600 mt-2">
            <p><strong>Bronze:</strong> Ingestion only (raw data from sources)</p>
            <p><strong>Silver/Gold:</strong> Processing, Model Inference, or Model Serving</p>
            <p><strong>Model:</strong> Model Training only (produces ML artifacts)</p>
          </div>
        </div>
      </div>

      {/* Products Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-800">Products Summary</span>
        </div>
        <div className="text-sm text-gray-700">
          <p className="mb-2">
            <strong>Total Products:</strong> {contractProducts.length}
          </p>
          {contractProducts.length > 0 && (
            <div className="space-y-1">
              <p><strong>Pipeline Types:</strong></p>
              <ul className="ml-4 space-y-1">
                {contractProducts.map(product => (
                  <li key={product.id} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span>{product.name}</span>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                      {product.pipelineType}
                    </span>
                    {product.technology && (
                      <span className="text-xs text-gray-500">
                        ({product.technology})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {contractProducts.length > 1 && (
            <div className="mt-2 text-xs text-gray-600">
              <p><strong>Multi-Product Rule:</strong> Each product must use different technologies</p>
            </div>
          )}
        </div>
      </div>

      {/* Pipeline Type Descriptions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-800">Pipeline Types</span>
        </div>
        <div className="text-xs text-gray-600 space-y-2">
          <div>
            <strong>Ingestion:</strong> Reads from external sources, writes to Bronze layer
          </div>
          <div>
            <strong>Processing:</strong> ETL operations, reads from tables, produces single table
          </div>
          <div>
            <strong>Model Inference:</strong> Applies trained models to data, produces predictions
          </div>
          <div>
            <strong>Model Training:</strong> Trains ML models, produces model artifacts
          </div>
          <div>
            <strong>Model Serving:</strong> Serves models via API, optional logging table
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataContractValidation;