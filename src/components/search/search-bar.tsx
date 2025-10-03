import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchStore } from '@/stores/search';
import { SearchSuggestions } from './search-suggestions';

export function SearchBar() {
  const currentQuery = useSearchStore(state => state.currentQuery);
  const isSearching = useSearchStore(state => state.isSearching);
  const searchMode = useSearchStore(state => state.searchMode);
  const setQuery = useCallback((query: string) => {
    useSearchStore.getState().setQuery(query);
  }, []);
  
  const executeSearch = useCallback((query: string, filters?: any) => {
    return useSearchStore.getState().executeSearch(query, filters);
  }, []);
  
  const executeAISearch = useCallback((query: string) => {
    return useSearchStore.getState().executeAISearch(query);
  }, []);
  
  const clearResults = useCallback(() => {
    useSearchStore.getState().clearResults();
  }, []);
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(currentQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Sync input value with store
  useEffect(() => {
    setInputValue(currentQuery);
  }, [currentQuery]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setQuery(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSubmit = async (query?: string) => {
    const searchQuery = query || inputValue.trim();
    
    if (!searchQuery) return;

    setShowSuggestions(false);
    
    if (searchMode === 'traditional') {
      await executeSearch(searchQuery);
    } else {
      await executeAISearch(searchQuery);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    } else if (event.key === 'Escape') {
      setShowSuggestions(false);
      if (inputValue) {
        handleClear();
      }
    }
  };

  const handleClear = () => {
    setInputValue('');
    setQuery('');
    clearResults();
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setInputValue(suggestion);
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSubmit(suggestion);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={
            searchMode === 'traditional' 
              ? "Search contracts, products, domains..." 
              : "Ask me about your data catalog..."
          }
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(inputValue.length > 0)}
          className="pl-10 pr-20 h-12 text-base"
          disabled={isSearching}
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {isSearching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          
          {inputValue && !isSearching && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 w-8 p-0"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="default"
            size="sm"
            onClick={() => handleSubmit()}
            disabled={!inputValue.trim() || isSearching}
            className="h-8 px-3"
          >
            {searchMode === 'traditional' ? 'Search' : 'Ask'}
          </Button>
        </div>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && (
        <SearchSuggestions
          query={inputValue}
          onSelect={handleSuggestionSelect}
          onClose={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}