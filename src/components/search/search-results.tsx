import { useState, useCallback } from 'react';
import { useSearchStore } from '@/stores/search';
import { Loader2, ExternalLink, ShoppingCart, Eye, GitBranch, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cart';
import type { SearchResult } from '@/types';

export function SearchResults() {
  const results = useSearchStore(state => state.results);
  const isSearching = useSearchStore(state => state.isSearching);
  const searchError = useSearchStore(state => state.searchError);
  const currentQuery = useSearchStore(state => state.currentQuery);
  
  const trackResultClick = useCallback((queryId: string, resultId: string) => {
    useSearchStore.getState().trackResultClick(queryId, resultId);
  }, []);
  
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const navigate = useNavigate();
  const { addToCart } = useCartStore();

  // Filter results by type
  const filteredResults = results.filter(result => {
    if (activeTab === 'all') return true;
    return result.type === activeTab;
  });

  // Paginate results
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get result counts by type
  const resultCounts = {
    all: results.length,
    domain: results.filter(r => r.type === 'domain').length,
    contract: results.filter(r => r.type === 'contract').length,
    product: results.filter(r => r.type === 'product').length
  };

  const handleResultAction = (result: SearchResult, actionType: string) => {
    // Track the click
    trackResultClick('current_search', result.id);

    switch (actionType) {
      case 'navigate':
        // Close search modal and clear state before navigation
        useSearchStore.getState().closeSearch();
        
        if (result.type === 'domain') {
          navigate(`/domain/${result.id}`);
        } else if (result.type === 'contract') {
          navigate(`/contract/${result.id}`);
        } else if (result.type === 'product') {
          navigate(`/product/${result.id}`);
        }
        break;
      
      case 'cart':
        if (result.type === 'product') {
          // Create a mock DataProduct from search result
          const mockProduct = {
            id: result.id,
            name: result.title,
            dataContractId: result.id, // Use result.id as fallback
            configJson: {},
            github: {
              repoName: '',
              repoUrl: '',
              pagesUrl: ''
            },
            technology: result.metadata.technology,
            description: result.description
          };
          addToCart(mockProduct);
          // Toast temporarily disabled to prevent infinite loop
          console.log(`${result.title} has been added to your cart.`);
        }
        break;
      
      case 'preview':
        // TODO: Implement preview modal
        console.log("Preview functionality coming soon.");
        break;
    }
  };

  if (isSearching) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Searching...</span>
        </div>
      </div>
    );
  }

  if (searchError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-destructive">
          <p className="font-medium">Search Error</p>
          <p className="text-sm text-muted-foreground mt-1">{searchError}</p>
        </div>
      </div>
    );
  }

  if (!currentQuery) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground max-w-md">
          <div className="mb-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </div>
          <p className="font-medium">Start searching</p>
          <p className="text-sm mt-1">Enter a query to search domains, contracts, and data products</p>
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Try searching for:</p>
            <div className="flex flex-wrap gap-1 mt-2 justify-center">
              <Badge variant="outline" className="text-xs">fraud detection</Badge>
              <Badge variant="outline" className="text-xs">customer data</Badge>
              <Badge variant="outline" className="text-xs">credit cards</Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground max-w-md">
          <div className="mb-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </div>
          <p className="font-medium">No results found</p>
          <p className="text-sm mt-1">
            No data assets match your search for "{currentQuery}"
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <p className="font-medium">Try:</p>
            <ul className="text-left space-y-1">
              <li>• Using different keywords</li>
              <li>• Checking your spelling</li>
              <li>• Using broader search terms</li>
              <li>• Adjusting your filters</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with results count and tabs */}
      <div className="flex-shrink-0 border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Found {results.length} result{results.length !== 1 ? 's' : ''} for "{currentQuery}"
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="text-xs">
              All ({resultCounts.all})
            </TabsTrigger>
            <TabsTrigger value="domain" className="text-xs">
              Domains ({resultCounts.domain})
            </TabsTrigger>
            <TabsTrigger value="contract" className="text-xs">
              Contracts ({resultCounts.contract})
            </TabsTrigger>
            <TabsTrigger value="product" className="text-xs">
              Products ({resultCounts.product})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Results content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <Tabs value={activeTab}>
          <TabsContent value="all" className="p-4 mt-0">
            <SearchResultsList results={paginatedResults} onAction={handleResultAction} />
          </TabsContent>
          <TabsContent value="domain" className="p-4 mt-0">
            <SearchResultsList results={paginatedResults} onAction={handleResultAction} />
          </TabsContent>
          <TabsContent value="contract" className="p-4 mt-0">
            <SearchResultsList results={paginatedResults} onAction={handleResultAction} />
          </TabsContent>
          <TabsContent value="product" className="p-4 mt-0">
            <SearchResultsList results={paginatedResults} onAction={handleResultAction} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Pagination footer */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 border-t border-border p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredResults.length)} of {filteredResults.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-muted-foreground">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-8 h-8 p-0"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SearchResultsListProps {
  results: SearchResult[];
  onAction: (result: SearchResult, actionType: string) => void;
}

function SearchResultsList({ results, onAction }: SearchResultsListProps) {
  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'domain':
        return <GitBranch className="h-4 w-4" />;
      case 'contract':
        return <Star className="h-4 w-4" />;
      case 'product':
        return <ExternalLink className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'domain':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'contract':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'product':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (results.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>No results in this category</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map(result => (
        <div key={result.id} className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={`${getTypeColor(result.type)} text-xs`}>
                  <span className="flex items-center space-x-1">
                    {getTypeIcon(result.type)}
                    <span className="capitalize">{result.type}</span>
                  </span>
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {Math.round(result.relevanceScore * 100)}% match
                </div>
              </div>
              
              <h3 className="font-medium text-base mb-1 truncate">
                {result.highlightedFields?.name ? (
                  <span dangerouslySetInnerHTML={{ __html: result.highlightedFields.name }} />
                ) : (
                  result.title
                )}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {result.highlightedFields?.description ? (
                  <span dangerouslySetInnerHTML={{ __html: result.highlightedFields.description }} />
                ) : (
                  result.description
                )}
              </p>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {result.metadata.domain && (
                  <Badge variant="outline" className="text-xs">
                    Domain: {result.metadata.domain}
                  </Badge>
                )}
                {result.metadata.technology && (
                  <Badge variant="outline" className="text-xs">
                    Tech: {result.metadata.technology}
                  </Badge>
                )}
                {result.metadata.layer && (
                  <Badge variant="outline" className="text-xs">
                    Layer: {result.metadata.layer}
                  </Badge>
                )}
                {result.metadata.status && (
                  <Badge variant="outline" className="text-xs capitalize">
                    Status: {result.metadata.status}
                  </Badge>
                )}
                {result.metadata.qualityScore && (
                  <Badge variant="outline" className="text-xs">
                    Quality: {Math.round(result.metadata.qualityScore * 100)}%
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                {result.actions.map(action => (
                  <Button
                    key={action.id}
                    variant={action.primary ? "default" : "outline"}
                    size="sm"
                    onClick={() => onAction(result, action.type)}
                    className="text-xs h-7"
                  >
                    {action.type === 'navigate' && <Eye className="h-3 w-3 mr-1" />}
                    {action.type === 'cart' && <ShoppingCart className="h-3 w-3 mr-1" />}
                    {action.type === 'preview' && <ExternalLink className="h-3 w-3 mr-1" />}
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}