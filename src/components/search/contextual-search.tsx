import { useState } from 'react';
import { Search, Filter, Bookmark, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSearchActions, useBookmarkActions, usePersonalizationActions } from '@/stores/search';
import type { SearchFilters } from '@/types';

interface ContextualSearchProps {
  context: 'domain' | 'contract' | 'product';
  contextId?: string;
  contextName?: string;
  placeholder?: string;
  prefilters?: SearchFilters;
  className?: string;
}

export function ContextualSearch({ 
  context, 
  contextId, 
  contextName,
  placeholder = "Search in this context...",
  prefilters = {},
  className = ""
}: ContextualSearchProps) {
  const [localQuery, setLocalQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const { executeSearch, setFilters, openSearch } = useSearchActions();
  const { addBookmark } = useBookmarkActions();
  const { trackUserInteraction } = usePersonalizationActions();

  const handleLocalSearch = () => {
    if (!localQuery.trim()) return;

    // Combine prefilters with context-specific filters
    const contextFilters: SearchFilters = {
      ...prefilters,
      ...(context === 'domain' && contextId ? { domains: [contextName || contextId] } : {}),
      ...(context === 'contract' && contextId ? { /* Add contract-specific filters */ } : {}),
      ...(context === 'product' && contextId ? { /* Add product-specific filters */ } : {})
    };

    setFilters(contextFilters);
    executeSearch(localQuery, contextFilters);
    openSearch();

    // Track user interaction
    trackUserInteraction({
      type: 'contextual_search',
      data: { context, contextId, query: localQuery }
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleLocalSearch();
    }
  };

  const handleBookmarkContext = () => {
    if (contextId && contextName) {
      addBookmark({
        id: contextId,
        type: context,
        title: contextName,
        description: `${context} context`,
        relevanceScore: 1.0,
        metadata: { [context]: contextName },
        actions: []
      }, `Bookmarked from ${context} page`, [context]);
    }
  };

  const getContextBadge = () => {
    switch (context) {
      case 'domain':
        return <Badge variant="outline" className="text-xs">Domain: {contextName}</Badge>;
      case 'contract':
        return <Badge variant="outline" className="text-xs">Contract: {contextName}</Badge>;
      case 'product':
        return <Badge variant="outline" className="text-xs">Product: {contextName}</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Context indicator */}
      {contextName && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getContextBadge()}
            <span className="text-sm text-muted-foreground">
              Search within this {context}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmarkContext}
              className="h-7 px-2"
            >
              <Bookmark className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
              className="h-7 px-2"
            >
              <Share className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Search input */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="px-3"
        >
          <Filter className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleLocalSearch}
          disabled={!localQuery.trim()}
          size="sm"
        >
          Search
        </Button>
      </div>

      {/* Quick actions */}
      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
        <span>Quick actions:</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setLocalQuery('quality score > 0.8');
            handleLocalSearch();
          }}
          className="h-6 px-2 text-xs"
        >
          High Quality
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setLocalQuery('status:published');
            handleLocalSearch();
          }}
          className="h-6 px-2 text-xs"
        >
          Published Only
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setLocalQuery('updated:last-week');
            handleLocalSearch();
          }}
          className="h-6 px-2 text-xs"
        >
          Recently Updated
        </Button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="border border-border rounded-lg p-3 bg-muted/50">
          <p className="text-sm font-medium mb-2">Context Filters</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(prefilters).map(([key, value]) => (
              <Badge key={key} variant="secondary" className="text-xs">
                {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}