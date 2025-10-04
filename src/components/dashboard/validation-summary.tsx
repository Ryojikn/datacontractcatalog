import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import type { DataContract, DataProduct } from '@/types';
import { validateCollection } from '@/lib/dataContractValidation';

interface ValidationSummaryProps {
  contracts: DataContract[];
  products: DataProduct[];
  className?: string;
}

export function ValidationSummary({ 
  contracts, 
  products, 
  className = '' 
}: ValidationSummaryProps) {
  const validationResults = validateCollection(contracts, products);
  
  const stats = {
    total: contracts.length,
    valid: 0,
    invalid: 0,
    warnings: 0
  };

  Object.values(validationResults).forEach(result => {
    if (result.isValid) {
      stats.valid++;
    } else {
      stats.invalid++;
    }
    if (result.warnings.length > 0) {
      stats.warnings++;
    }
  });

  const validPercentage = stats.total > 0 ? Math.round((stats.valid / stats.total) * 100) : 0;

  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Contract Validation</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          validPercentage === 100 
            ? 'bg-green-100 text-green-700'
            : validPercentage >= 80
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
        }`}>
          {validPercentage}% Valid
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Contracts</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-2xl font-bold text-green-600">{stats.valid}</span>
          </div>
          <div className="text-sm text-gray-500">Valid</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <XCircle className="h-5 w-5 text-red-500" />
            <span className="text-2xl font-bold text-red-600">{stats.invalid}</span>
          </div>
          <div className="text-sm text-gray-500">Invalid</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <span className="text-2xl font-bold text-yellow-600">{stats.warnings}</span>
          </div>
          <div className="text-sm text-gray-500">Warnings</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Validation Progress</span>
          <span>{stats.valid}/{stats.total}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              validPercentage === 100 
                ? 'bg-green-500'
                : validPercentage >= 80
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${validPercentage}%` }}
          />
        </div>
      </div>

      {/* Invalid Contracts List */}
      {stats.invalid > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Contracts with Issues
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {Object.entries(validationResults)
              .filter(([_, result]) => !result.isValid)
              .map(([contractId, result]) => {
                const contract = contracts.find(c => c.id === contractId);
                return (
                  <div key={contractId} className="text-sm">
                    <div className="font-medium text-gray-900">
                      {contract?.fundamentals.name || contractId}
                    </div>
                    <div className="text-red-600 text-xs">
                      {result.errors.length} error(s)
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Business Rules Summary */}
      <div className="border-t pt-4 mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-800">Business Rules</span>
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• Multiple products per contract require different technologies</p>
          <p>• Bronze layer: Ingestion only</p>
          <p>• Silver/Gold layer: Processing, inference, or serving</p>
          <p>• Model layer: Training only</p>
        </div>
      </div>
    </div>
  );
}

export default ValidationSummary;