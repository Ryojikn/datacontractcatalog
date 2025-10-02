import { Badge } from '@/components/ui'
import type { QualityRule, QualitySeverity } from '@/types'

interface QualityRulesModuleProps {
  qualityRules: QualityRule[]
}

export function QualityRulesModule({ qualityRules }: QualityRulesModuleProps) {
  const getSeverityBadgeVariant = (severity: QualitySeverity) => {
    switch (severity) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'warning'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getSeverityIcon = (severity: QualitySeverity) => {
    switch (severity) {
      case 'critical':
        return '🔴'
      case 'high':
        return '🟠'
      case 'medium':
        return '🟡'
      case 'low':
        return '🔵'
      default:
        return '⚪'
    }
  }

  const getRuleTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'format_validation':
        return '📝'
      case 'range_validation':
        return '📊'
      case 'completeness':
        return '✅'
      case 'uniqueness':
        return '🔑'
      case 'consistency':
        return '🔄'
      case 'accuracy':
        return '🎯'
      default:
        return '📋'
    }
  }

  const formatLastExecuted = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Less than 1 hour ago'
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
      } else {
        return date.toLocaleDateString()
      }
    }
  }

  const groupRulesBySeverity = (rules: QualityRule[]) => {
    const groups = {
      critical: [] as QualityRule[],
      high: [] as QualityRule[],
      medium: [] as QualityRule[],
      low: [] as QualityRule[]
    }
    
    rules.forEach(rule => {
      groups[rule.severity].push(rule)
    })
    
    return groups
  }

  const ruleGroups = groupRulesBySeverity(qualityRules)
  const enabledRules = qualityRules.filter(rule => rule.enabled)
  const disabledRules = qualityRules.filter(rule => !rule.enabled)

  return (
    <div className="border rounded-lg p-6 bg-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Quality Rules</h2>
        {qualityRules.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {qualityRules.length} rule{qualityRules.length > 1 ? 's' : ''}
            </Badge>
            {enabledRules.length > 0 && (
              <Badge variant="success">
                {enabledRules.length} active
              </Badge>
            )}
            {disabledRules.length > 0 && (
              <Badge variant="secondary">
                {disabledRules.length} disabled
              </Badge>
            )}
          </div>
        )}
      </div>
      
      {qualityRules.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm mb-1">No quality rules defined for this contract</p>
          <p className="text-muted-foreground text-xs">
            Quality rules help ensure data integrity and compliance
          </p>
        </div>
      )}

      {qualityRules.length > 0 && (
        <div className="space-y-6">
          {/* Critical Rules First */}
          {ruleGroups.critical.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-destructive mb-3 flex items-center gap-2">
                🔴 Critical Rules ({ruleGroups.critical.length})
              </h3>
              <div className="space-y-4">
                {ruleGroups.critical.map((rule) => (
                  <QualityRuleCard key={rule.id} rule={rule} />
                ))}
              </div>
            </div>
          )}

          {/* High Severity Rules */}
          {ruleGroups.high.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-orange-600 mb-3 flex items-center gap-2">
                🟠 High Priority Rules ({ruleGroups.high.length})
              </h3>
              <div className="space-y-4">
                {ruleGroups.high.map((rule) => (
                  <QualityRuleCard key={rule.id} rule={rule} />
                ))}
              </div>
            </div>
          )}

          {/* Medium and Low Severity Rules */}
          {(ruleGroups.medium.length > 0 || ruleGroups.low.length > 0) && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                📋 Other Rules ({ruleGroups.medium.length + ruleGroups.low.length})
              </h3>
              <div className="space-y-4">
                {[...ruleGroups.medium, ...ruleGroups.low].map((rule) => (
                  <QualityRuleCard key={rule.id} rule={rule} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  function QualityRuleCard({ rule }: { rule: QualityRule }) {
    return (
      <div className={`border rounded-lg p-4 transition-colors ${
        rule.enabled 
          ? 'bg-card hover:bg-muted/30' 
          : 'bg-muted/20 border-dashed opacity-75'
      }`}>
        {/* Header with title, status, and severity in a horizontal layout */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-lg" title={`${rule.type} rule`}>
              {getRuleTypeIcon(rule.type)}
            </span>
            <div className="flex-1">
              <h4 className="font-medium text-base flex items-center gap-2">
                {rule.name}
                {!rule.enabled && (
                  <span className="text-xs text-muted-foreground">(Disabled)</span>
                )}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="font-medium">Type:</span>
                <span className="capitalize">{rule.type.replace('_', ' ')}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="font-medium">Status:</span>
                <span className={rule.enabled ? 'text-green-600' : 'text-muted-foreground'}>
                  {rule.enabled ? 'Active' : 'Inactive'}
                </span>
              </span>
              {rule.lastExecuted && (
                <span className="flex items-center gap-1">
                  <span className="font-medium">Last run:</span>
                  <span title={new Date(rule.lastExecuted).toLocaleString()}>
                    {formatLastExecuted(rule.lastExecuted)}
                  </span>
                </span>
              )}
            </div>
            <Badge variant={getSeverityBadgeVariant(rule.severity)} className="shrink-0">
              {getSeverityIcon(rule.severity)} {rule.severity.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Description and Rule in a two-column layout for better horizontal space usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {rule.description}
            </p>
          </div>
          <div className="bg-muted/30 rounded-md p-3">
            <div className="flex items-start gap-2">
              <span className="text-xs text-muted-foreground font-medium shrink-0 mt-0.5">
                RULE:
              </span>
              <code className="text-xs font-mono bg-background px-2 py-1 rounded border flex-1 break-all">
                {rule.rule}
              </code>
            </div>
          </div>
        </div>
      </div>
    )
  }
}