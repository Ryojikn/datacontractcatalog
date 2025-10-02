import { ExternalLink, CheckCircle, XCircle, Clock, GitBranch } from 'lucide-react'
import { Badge } from '@/components/ui'
import type { DataProduct } from '@/types'

interface DeploymentsModuleProps {
  product: DataProduct
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'failure':
      return <XCircle className="h-4 w-4 text-red-600" />
    case 'running':
      return <Clock className="h-4 w-4 text-yellow-600" />
    default:
      return <Clock className="h-4 w-4 text-gray-600" />
  }
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'success':
      return 'default' // Green variant
    case 'failure':
      return 'destructive' // Red variant
    case 'running':
      return 'secondary' // Yellow/gray variant
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

function getGitHubActionsUrl(repoUrl: string, runId: string): string {
  // Convert repo URL to GitHub Actions run URL
  // Example: https://github.com/owner/repo -> https://github.com/owner/repo/actions/runs/runId
  return `${repoUrl}/actions/runs/${runId}`
}

export function DeploymentsModule({ product }: DeploymentsModuleProps) {
  const deployments = product.deployments || []
  const sortedDeployments = [...deployments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5) // Show only the 5 most recent deployments

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">Recent Deployments</h3>
      </div>
      
      {sortedDeployments.length === 0 && (
        <div className="text-center py-6">
          <GitBranch className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">No deployments found</p>
          <p className="text-muted-foreground text-xs mt-1">
            Deployments will appear here once GitHub Actions runs are executed
          </p>
        </div>
      )}

      {sortedDeployments.length > 0 && (
        <div className="space-y-3">
          {sortedDeployments.map((deployment) => (
            <div 
              key={deployment.id} 
              className="flex items-start justify-between p-3 rounded-md border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(deployment.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">
                      {deployment.environment}
                    </p>
                    {deployment.version && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0">
                        {deployment.version}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatRelativeTime(deployment.date)}</span>
                    {deployment.deployedBy && (
                      <>
                        <span>•</span>
                        <span>by {deployment.deployedBy}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={getStatusBadgeVariant(deployment.status)} className="text-xs">
                  {deployment.status}
                </Badge>
                
                {deployment.githubRunId && (
                  <a
                    href={getGitHubActionsUrl(product.github.repoUrl, deployment.githubRunId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded hover:bg-muted transition-colors"
                    title="View GitHub Actions run"
                  >
                    <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </a>
                )}
              </div>
            </div>
          ))}
          
          {deployments.length > 5 && (
            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                Showing 5 of {deployments.length} deployments
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}