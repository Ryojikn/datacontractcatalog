import { useState, useEffect, useMemo } from 'react'
import { Clock, CheckCircle, XCircle, AlertCircle, Filter, ArrowUpDown, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui'
import { InlineError } from '@/components/error'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { mockDataService } from '@/services/mockDataService'
import type { DataProduct, ExecutionInfo, ExecutionStatus } from '@/types'

interface ExecutionsModuleProps {
  product: DataProduct
}

type SortField = 'date' | 'duration' | 'status'
type SortOrder = 'asc' | 'desc'
type StatusFilter = 'all' | ExecutionStatus

function getStatusIcon(status: ExecutionStatus) {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'failure':
      return <XCircle className="h-4 w-4 text-red-600" />
    case 'running':
      return <Clock className="h-4 w-4 text-yellow-600" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-600" />
  }
}

function getStatusBadgeVariant(status: ExecutionStatus) {
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

function formatDuration(seconds?: number): string {
  if (!seconds) return 'N/A'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${remainingSeconds}s`
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

function getDatabricksJobUrl(executionId: string): string {
  // Mock Databricks job URL - in real implementation this would be constructed from workspace URL
  return `https://databricks.com/jobs/runs/${executionId}`
}

export function ExecutionsModule({ product }: ExecutionsModuleProps) {
  const [executions, setExecutions] = useState<ExecutionInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const isOnline = useOnlineStatus()

  useEffect(() => {
    const fetchExecutions = async () => {
      try {
        setLoading(true)
        setError(null)
        const executionHistory = await mockDataService.getExecutionHistory(product.id)
        setExecutions(executionHistory)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load execution history')
      } finally {
        setLoading(false)
      }
    }

    fetchExecutions()
  }, [product.id])

  const handleRetry = () => {
    setError(null)
    const fetchExecutions = async () => {
      try {
        setLoading(true)
        const executionHistory = await mockDataService.getExecutionHistory(product.id)
        setExecutions(executionHistory)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load execution history')
      } finally {
        setLoading(false)
      }
    }
    fetchExecutions()
  }

  const filteredAndSortedExecutions = useMemo(() => {
    let filtered = executions

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(execution => execution.status === statusFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'duration':
          comparison = (a.duration || 0) - (b.duration || 0)
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [executions, statusFilter, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const statusCounts = useMemo(() => {
    return executions.reduce((acc, execution) => {
      acc[execution.status] = (acc[execution.status] || 0) + 1
      return acc
    }, {} as Record<ExecutionStatus, number>)
  }, [executions])

  if (loading) {
    return (
      <div className="border rounded-lg p-4 bg-card">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-muted-foreground animate-pulse" />
          <h3 className="font-semibold">Job Executions</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
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
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Job Executions</h3>
        </div>
        <InlineError 
          message={!isOnline ? "Sem conexão com a internet" : error}
          onRetry={handleRetry}
        />
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Job Executions</h3>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-1 rounded hover:bg-muted transition-colors"
          title="Toggle filters"
        >
          <Filter className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Filters and sorting */}
      {showFilters && (
        <div className="mb-4 p-3 bg-muted/30 rounded-md space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Status:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2 py-1 text-xs rounded ${
                statusFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
              }`}
            >
              All ({executions.length})
            </button>
            {(['success', 'failure', 'running'] as ExecutionStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2 py-1 text-xs rounded ${
                  statusFilter === status ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {status} ({statusCounts[status] || 0})
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Sort by:</span>
            {(['date', 'duration', 'status'] as SortField[]).map((field) => (
              <button
                key={field}
                onClick={() => handleSort(field)}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${
                  sortField === field ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {field}
                <ArrowUpDown className="h-3 w-3" />
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredAndSortedExecutions.length === 0 && (
        <div className="text-center py-6">
          <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">
            {statusFilter === 'all' ? 'No executions found' : `No ${statusFilter} executions found`}
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Job execution history will appear here once Databricks jobs are executed
          </p>
        </div>
      )}

      {filteredAndSortedExecutions.length > 0 && (
        <div className="space-y-3">
          {filteredAndSortedExecutions.slice(0, 3).map((execution) => (
            <div 
              key={execution.id} 
              className="flex items-start justify-between p-3 rounded-md border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(execution.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">
                      {execution.technology} Job
                    </p>
                    {execution.duration && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0">
                        {formatDuration(execution.duration)}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatRelativeTime(execution.date)}</span>
                    <span>•</span>
                    <span>{new Date(execution.date).toLocaleDateString()}</span>
                    <span>{new Date(execution.date).toLocaleTimeString()}</span>
                  </div>
                  
                  {execution.errorMessage && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border">
                      {execution.errorMessage}
                    </div>
                  )}
                  
                  {execution.logs && execution.status === 'success' && (
                    <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded border">
                      {execution.logs}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={getStatusBadgeVariant(execution.status)} className="text-xs">
                  {execution.status}
                </Badge>
                
                <a
                  href={getDatabricksJobUrl(execution.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded hover:bg-muted transition-colors"
                  title="View Databricks job run"
                >
                  <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </a>
              </div>
            </div>
          ))}
          
          {filteredAndSortedExecutions.length > 3 && (
            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                Showing 3 of {filteredAndSortedExecutions.length} executions
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}