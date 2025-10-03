import { useEffect, useState } from 'react';
import { Clock, TrendingUp, Search, Hash } from 'lucide-react';
import { useSearchStore } from '@/stores/search';
import type { SearchSuggestion } from '@/types';

interface SearchSuggestionsProps {
  query: string;
  onSelect: (suggestion: string) => void;
  onClose: () => void;
}

export function SearchSuggestions({ query, onSelect, onClose }: SearchSuggestionsProps) {
  const getSuggestions = useSearchStore(state => state.getSuggestions);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    const results = getSuggestions(query);
    setSuggestions(results);
    setSelectedIndex(-1);
  }, [query, getSuggestions]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
      } else if (event.key === 'Enter' && selectedIndex >= 0) {
        event.preventDefault();
        onSelect(suggestions[selectedIndex].text);
      } else if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [suggestions, selectedIndex, onSelect, onClose]);

  if (suggestions.length === 0) {
    return null;
  }

  const getIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'popular':
        return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
      case 'autocomplete':
        return <Search className="h-4 w-4 text-muted-foreground" />;
      case 'related':
        return <Hash className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getCategoryLabel = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return 'Recent';
      case 'popular':
        return 'Popular';
      case 'autocomplete':
        return 'Suggestions';
      case 'related':
        return 'Related';
      default:
        return '';
    }
  };

  // Group suggestions by type
  const groupedSuggestions = suggestions.reduce((groups, suggestion) => {
    const type = suggestion.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(suggestion);
    return groups;
  }, {} as Record<string, SearchSuggestion[]>);

  let currentIndex = 0;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
      {Object.entries(groupedSuggestions).map(([type, typeSuggestions]) => (
        <div key={type} className="py-2">
          {typeSuggestions.length > 0 && (
            <div className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {getCategoryLabel(type as SearchSuggestion['type'])}
            </div>
          )}
          {typeSuggestions.map((suggestion) => {
            const isSelected = currentIndex === selectedIndex;
            const itemIndex = currentIndex++;
            
            return (
              <button
                key={suggestion.id}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors ${
                  isSelected ? 'bg-accent text-accent-foreground' : ''
                }`}
                onClick={() => onSelect(suggestion.text)}
                onMouseEnter={() => setSelectedIndex(itemIndex)}
              >
                {getIcon(suggestion.type)}
                <span className="flex-1 truncate">{suggestion.text}</span>
                {suggestion.category && (
                  <span className="text-xs text-muted-foreground capitalize">
                    {suggestion.category}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
      
      {suggestions.length === 0 && query && (
        <div className="px-3 py-4 text-center text-muted-foreground text-sm">
          No suggestions found
        </div>
      )}
    </div>
  );
}