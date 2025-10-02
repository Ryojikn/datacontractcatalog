import { useState, useEffect, useMemo } from 'react'
import { AlertTriangle, CheckCircle, XCircle, AlertCircle, ExternalLink, Shield, TrendingUp, Filter } from 'lucide-react'
import { Badge } from '@/components/ui'
import { mockDataService } from '@/services/mockDataService'
import type { DataProduct, QualityAlert, QualitySeverity } from '@/types'

interface QualityMonitorModuleProps {
  product: DataProduct
}

type AlertFilter = 'all' | 'active' | 'resolved'
type SeverityFilter = 'all' | QualitySeverity

function getSeverityIcon(severity: QualitySeverity) {
  switch (severity) {
    case 'critical':
      return <XCircle className="h-4 w-4 text-red-600" />
    case 'high':
      return <AlertTriangle className="h-4 w-4 text-orange-600" />
    case 'medium':
      return <AlertCircle className="h-4 w-4 text-yellow-600" />
    case 'low':
      return <Shield className="h-4 w-4 text-blue-600" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-600" />
  }
}

function getSeverityBadgeVariant(severity: QualitySeverity) {
  switch (severity) {
    case 'critical':
      return 'destructive'
    case 'high':
      return 'secondary' // Orange-ish
    case 'medium':
      return 'outline' // Yellow-ish
    case 'low':
      return 'default' // Blue-ish
    default:
      return 'outline'
  }
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    return `${diffInMinutes}m ago`
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }
}

function getQualityReportUrl(productId: string, alertId: string): string {
  // Mock quality report URL - in real implementation this would be constructed from monitoring system
  return `https://quality-monitor.banco.com/products/${productId}/alerts/${alertId}/report`
}

function getOverallQualityStatus(alerts: QualityAlert[]): { status: 'healthy' | 'warning' | 'critical', message: string } {
  const activeAlerts = alerts.filter(alert => !alert.resolved)
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical')
  const highAlerts = activeAlerts.filter(alert => alert.severity === 'high')
  
  if (criticalAlerts.length > 0) {
    return {
      status: 'critical',
      message: `${criticalAlerts.length} critical alert${criticalAlerts.length > 1 ? 's' : ''} require immediate attention`
    }
  } else if (highAlerts.length > 0) {
    return {
      status: 'warning',
      message: `${highAlerts.length} high severity alert${highAlerts.length > 1 ? 's' : ''} detected`
    }
  } else if (activeAlerts.length > 0) {
    return {
      status: 'warning',
      message: `${activeAlerts.length} active alert${activeAlerts.length > 1 ? 's' : ''} being monitored`
    }
  } else {
    return {
      status: 'healthy',
      message: 'All quality checks passing'
    }
  }
}

export function QualityMonitorModule({ product }: QualityMonitorModuleProps) {
  const [alerts, setAlerts] = useState<QualityAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alertFilter, setAlertFilter] = useState<AlertFilter>('all')
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchQualityAlerts = async () => {
      try {
        setLoading(true)
        setError(null)
        const qualityAlerts = await mockDataService.getQualityAlerts(product.id)
        setAlerts(qualityAlerts)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quality alerts')
      } finally {
        setLoading(false)
      }
    }

    fetchQualityAlerts()
  }, [product.id])

  const filteredAlerts = useMemo(() => {
    let filtered = alerts

    // Apply alert status filter
    if (alertFilter === 'active') {
      filtered = filtered.filter(alert => !alert.resolved)
    } else if (alertFilter === 'resolved') {
      filtered = filtered.filter(alert => alert.resolved)
    }

    // Apply severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severityFilter)
    }

    // Sort by date (most recent first) and severity (critical first)
    return filtered.sort((a, b) => {
      // First sort by resolution status (active alerts first)
      if (a.resolved !== b.resolved) {
        return a.resolved ? 1 : -1
      }
      
      // Then by severity
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity]
      if (severityDiff !== 0) return severityDiff
      
      // Finally by date (most recent first)
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [alerts, alertFilter, severityFilter])

  const qualityStatus = useMemo(() => getOverallQualityStatus(alerts), [alerts])
  
  const alertCounts = useMemo(() => {
    const active = alerts.filter(alert => !alert.resolved)
    const resolved = alerts.filter(alert => alert.resolved)
    const severityCounts = alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1
      return acc
    }, {} as Record<QualitySeverity, number>)
    
    return { active: active.length, resolved: resolved.length, total: alerts.length, severityCounts }
  }, [alerts])

  if (loading) {
    return (
      <div className="border rounded-lg p-4 bg-card">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-muted-foreground animate-pulse" />
          <h3 className="font-semibold">Quality Monitoring</h3>
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border rounded-lg p-4 bg-card">
        <div className="flex items-center gap-2 mb-4">
          <XCircle className="h-4 w-4 text-red-600" />
          <h3 className="font-semibold">Quality Monitoring</h3>
        </div>
        <div className="text-center py-6">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Quality Monitoring</h3>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-1 rounded hover:bg-muted transition-colors"
          title="Toggle filters"
        >
          <Filter className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Overall Status */}
      <div className={`mb-4 p-3 rounded-md border ${
        qualityStatus.status === 'healthy' ? 'bg-green-50 border-green-200' :
        qualityStatus.status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
        'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          {qualityStatus.status === 'healthy' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : qualityStatus.status === 'warning' ? (
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          <span className={`text-sm font-medium ${
            qualityStatus.status === 'healthy' ? 'text-green-800' :
            qualityStatus.status === 'warning' ? 'text-yellow-800' :
            'text-red-800'
          }`}>
            {qualityStatus.status === 'healthy' ? 'Healthy' :
             qualityStatus.status === 'warning' ? 'Warning' : 'Critical'}
          </span>
        </div>
        <p className={`text-xs ${
          qualityStatus.status === 'healthy' ? 'text-green-700' :
          qualityStatus.status === 'warning' ? 'text-yellow-700' :
          'text-red-700'
        }`}>
          {qualityStatus.message}
        </p>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-4 p-3 bg-muted/30 rounded-md space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Status:</span>
            <button
              onClick={() => setAlertFilter('all')}
              className={`px-2 py-1 text-xs rounded ${
                alertFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
              }`}
            >
              All ({alertCounts.total})
            </button>
            <button
              onClick={() => setAlertFilter('active')}
              className={`px-2 py-1 text-xs rounded ${
                alertFilter === 'active' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Active ({alertCounts.active})
            </button>
            <button
              onClick={() => setAlertFilter('resolved')}
              className={`px-2 py-1 text-xs rounded ${
                alertFilter === 'resolved' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Resolved ({alertCounts.resolved})
            </button>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Severity:</span>
            <button
              onClick={() => setSeverityFilter('all')}
              className={`px-2 py-1 text-xs rounded ${
                severityFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
              }`}
            >
              All
            </button>
            {(['critical', 'high', 'medium', 'low'] as QualitySeverity[]).map((severity) => (
              <button
                key={severity}
                onClick={() => setSeverityFilter(severity)}
                className={`px-2 py-1 text-xs rounded ${
                  severityFilter === severity ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {severity} ({alertCounts.severityCounts[severity] || 0})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Alerts List */}
      {filteredAlerts.length === 0 && (
        <div className="text-center py-6">
          <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">
            {alertFilter === 'all' ? 'No quality alerts found' : 
             alertFilter === 'active' ? 'No active alerts' : 'No resolved alerts'}
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Quality monitoring alerts will appear here when data quality rules are violated
          </p>
        </div>
      )}

      {filteredAlerts.length > 0 && (
        <div className="space-y-3">
          {filteredAlerts.slice(0, 3).map((alert) => (
            <div 
              key={alert.id} 
              className={`p-3 rounded-md border transition-colors ${
                alert.resolved 
                  ? 'bg-muted/30 border-muted' 
                  : 'bg-muted/30 hover:bg-muted/50 border-muted'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <div className="flex-shrink-0 mt-0.5">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-medium text-sm truncate ${
                        alert.resolved ? 'text-muted-foreground' : ''
                      }`}>
                        {alert.ruleName}
                      </p>
                      {alert.resolved && (
                        <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                    
                    <p className={`text-xs mb-2 ${
                      alert.resolved ? 'text-muted-foreground' : 'text-foreground'
                    }`}>
                      {alert.message}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatRelativeTime(alert.date)}</span>
                      <span>•</span>
                      <span>{new Date(alert.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={getSeverityBadgeVariant(alert.severity)} className="text-xs">
                    {alert.severity}
                  </Badge>
                  
                  <a
                    href={getQualityReportUrl(product.id, alert.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded hover:bg-muted transition-colors"
                    title="View detailed quality report"
                  >
                    <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </a>
                </div>
              </div>
            </div>
          ))}
          
          {filteredAlerts.length > 3 && (
            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                Showing 3 of {filteredAlerts.length} alerts
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quality Trends Link */}
      {alerts.length > 0 && (
        <div className="mt-4 pt-3 border-t">
          <a
            href={`https://quality-monitor.banco.com/products/${product.id}/trends`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <TrendingUp className="h-3 w-3" />
            View quality trends and historical reports
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  )
}