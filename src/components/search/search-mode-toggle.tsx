import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useSearchStore } from '@/stores/search';
import { Search, Bot } from 'lucide-react';

export function SearchModeToggle() {
  const searchMode = useSearchStore(state => state.searchMode);
  
  const setSearchMode = useCallback((mode: 'traditional' | 'ai') => {
    useSearchStore.getState().setSearchMode(mode);
  }, []);

  return (
    <div className="flex items-center bg-muted rounded-lg p-1">
      <Button
        variant={searchMode === 'traditional' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setSearchMode('traditional')}
        className="h-8 px-3 text-xs"
      >
        <Search className="h-3 w-3 mr-1.5" />
        Traditional Results
      </Button>
      <Button
        variant={searchMode === 'ai' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setSearchMode('ai')}
        className="h-8 px-3 text-xs"
      >
        <Bot className="h-3 w-3 mr-1.5" />
        AI Assistant
      </Button>
    </div>
  );
}