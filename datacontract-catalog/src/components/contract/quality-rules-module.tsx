import type { QualityRule } from '@/types'

interface QualityRulesModuleProps {
  qualityRules: QualityRule[]
}

export function QualityRulesModule({ qualityRules }: QualityRulesModuleProps) {
  return (
    <div className="border rounded-lg p-6 bg-card">
      <h2 className="text-xl font-semibold mb-4">Quality Rules</h2>
      
      {qualityRules.length === 0 && (
        <p className="text-muted-foreground text-sm">No quality rules defined for this contract.</p>
      )}

      {qualityRules.length > 0 && (
        <div className="space-y-3">
          {qualityRules.map((rule) => (
            <div key={rule.id} className="border rounded p-3">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{rule.name}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    rule.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    rule.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    rule.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {rule.severity}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
              <div className="text-xs">
                <p className="text-muted-foreground">Type: {rule.type}</p>
                <p className="text-muted-foreground">Rule: {rule.rule}</p>
                {rule.lastExecuted && (
                  <p className="text-muted-foreground">
                    Last executed: {new Date(rule.lastExecuted).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}