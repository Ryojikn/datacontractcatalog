import type { DataProduct } from '@/types'

interface QualityMonitorModuleProps {
  product: DataProduct
}

export function QualityMonitorModule({ product }: QualityMonitorModuleProps) {
  const alerts = product.qualityAlerts || []
  const activeAlerts = alerts.filter(alert => !alert.resolved)

  return (
    <div className="border rounded-lg p-4 bg-card">
      <h3 className="font-semibold mb-3">Quality Monitoring</h3>
      
      {activeAlerts.length === 0 && (
        <div className="text-center py-4">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-green-600 text-sm">✓</span>
          </div>
          <p className="text-sm text-muted-foreground">No active quality alerts</p>
        </div>
      )}

      {activeAlerts.length > 0 && (
        <div className="space-y-2">
          {activeAlerts.slice(0, 3).map((alert) => (
            <div key={alert.id} className="border rounded p-2">
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm font-medium">{alert.ruleName}</p>
                <span className={`px-1 py-0.5 text-xs rounded ${
                  alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                  alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {alert.severity}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{alert.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(alert.date).toLocaleDateString()}
              </p>
            </div>
          ))}
          
          {alerts.length > 3 && (
            <p className="text-xs text-muted-foreground text-center">
              +{alerts.length - 3} more alerts
            </p>
          )}
        </div>
      )}
    </div>
  )
}