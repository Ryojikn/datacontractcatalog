import { Info, AlertCircle } from 'lucide-react';
import type { Layer, PipelineType } from '@/types';
import { PIPELINE_TYPES } from '@/types';
import { DataContractValidator } from '@/lib/dataContractValidation';

interface PipelineTypeSelectorProps {
  selectedType: PipelineType | null;
  onTypeSelect: (type: PipelineType) => void;
  contractLayer?: Layer;
  className?: string;
}

const PIPELINE_DESCRIPTIONS: Record<PipelineType, string> = {
  'ingestion': 'Reads data from external sources and writes to Bronze layer tables',
  'processing': 'ETL operations that read from one or more tables and produce a single output table',
  'model_inference': 'Applies trained ML models to data, combining tables with model artifacts to produce predictions',
  'model_training': 'Trains machine learning models using multiple data sources and produces model artifacts',
  'model_serving': 'Serves trained models via API endpoints with optional prediction logging'
};

const PIPELINE_ICONS: Record<PipelineType, string> = {
  'ingestion': '📥',
  'processing': '⚙️',
  'model_inference': '🔮',
  'model_training': '🧠',
  'model_serving': '🚀'
};

export function PipelineTypeSelector({
  selectedType,
  onTypeSelect,
  contractLayer,
  className = ''
}: PipelineTypeSelectorProps) {
  const recommendedTypes = contractLayer 
    ? DataContractValidator.getRecommendedPipelineTypes(contractLayer)
    : PIPELINE_TYPES;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <h3 className="font-semibold">Pipeline Type</h3>
        {contractLayer && (
          <div className="flex items-center gap-1 text-sm text-blue-600">
            <Info className="h-4 w-4" />
            <span>Layer: {contractLayer}</span>
          </div>
        )}
      </div>

      {contractLayer && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-800">
              Recommended for {contractLayer} Layer
            </span>
          </div>
          <p className="text-xs text-blue-700">
            {recommendedTypes.join(', ')}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PIPELINE_TYPES.map((type) => {
          const isRecommended = recommendedTypes.includes(type);
          const isSelected = selectedType === type;
          const isDisabled = contractLayer && !isRecommended;

          return (
            <button
              key={type}
              onClick={() => !isDisabled && onTypeSelect(type)}
              disabled={isDisabled}
              className={`
                p-4 rounded-lg border-2 text-left transition-all
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : isDisabled
                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    : isRecommended
                      ? 'border-green-200 bg-green-50 hover:border-green-300'
                      : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{PIPELINE_ICONS[type]}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium capitalize ${
                      isDisabled ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      {type.replace('_', ' ')}
                    </h4>
                    {isRecommended && !isDisabled && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Recommended
                      </span>
                    )}
                    {isDisabled && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                        Not allowed
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${
                    isDisabled ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {PIPELINE_DESCRIPTIONS[type]}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {contractLayer && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Layer Rules</span>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Bronze:</strong> Only ingestion pipelines (raw data from sources)</p>
            <p><strong>Silver/Gold:</strong> Processing, model inference, or model serving</p>
            <p><strong>Model:</strong> Only model training (produces ML artifacts)</p>
          </div>
        </div>
      )}

      {selectedType && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{PIPELINE_ICONS[selectedType]}</span>
            <span className="font-medium text-blue-800 capitalize">
              {selectedType.replace('_', ' ')} Pipeline
            </span>
          </div>
          <p className="text-sm text-blue-700">
            {PIPELINE_DESCRIPTIONS[selectedType]}
          </p>
        </div>
      )}
    </div>
  );
}

export default PipelineTypeSelector;