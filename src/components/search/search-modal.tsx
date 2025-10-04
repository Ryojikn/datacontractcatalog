import { useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useSearchStore } from '@/stores/search';
import { SearchBar } from './search-bar';
import { SearchModeToggle } from './search-mode-toggle';
import { SearchResults } from './search-results';
import { AIChat } from './ai-chat';
import { SearchFilters } from './search-filters';

export function SearchModal() {
  const isSearchOpen = useSearchStore(state => state.isSearchOpen);
  const searchMode = useSearchStore(state => state.searchMode);
  
  const closeSearch = useCallback(() => {
    useSearchStore.getState().closeSearch();
  }, []);

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      const { openSearch } = useSearchStore.getState();
      openSearch();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Dialog open={isSearchOpen} onOpenChange={(open) => !open && closeSearch()}>
      <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-0 gap-0" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="flex flex-col h-full" style={{ height: '100%', maxHeight: '80vh' }}>
          {/* Header with search bar and mode toggle */}
          <div className="flex-shrink-0 border-b border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Search Data Catalog</h2>
              <SearchModeToggle />
            </div>
            <SearchBar />
            {searchMode === 'traditional' && <SearchFilters />}
          </div>

          {/* Content area */}
          <div className="flex-1 min-h-0">
            {searchMode === 'traditional' ? (
              <SearchResults />
            ) : (
              <AIChat />
            )}
          </div>

          {/* Footer with keyboard shortcuts */}
          <div className="flex-shrink-0 border-t border-border px-4 py-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-4">
                <span>Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">Esc</kbd> to close</span>
                <span>Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">↑</kbd><kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">↓</kbd> to navigate</span>
              </div>
              <span>Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">⌘</kbd><kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">K</kbd> to search</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}