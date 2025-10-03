import { useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchStore } from '@/stores/search';

interface SearchShortcutProps {
  placeholder?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export function SearchShortcut({ 
  placeholder = "Search data catalog...", 
  className = "",
  variant = "outline",
  size = "default"
}: SearchShortcutProps) {
  // Use direct store access to avoid hook recreation issues
  const openSearch = useCallback(() => {
    useSearchStore.getState().openSearch();
  }, []);

  // Handle global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        openSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={openSearch}
      className={`justify-start text-muted-foreground ${className}`}
    >
      <Search className="h-4 w-4 mr-2" />
      <span className="flex-1 text-left">{placeholder}</span>
      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}