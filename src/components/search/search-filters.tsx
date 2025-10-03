import { useState, useCallback } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useSearchStore } from '@/stores/search';
import type { SearchFilters as SearchFiltersType } from '@/types';

export function SearchFilters() {
  const activeFilters = useSearchStore(state => state.activeFilters);
  const [isOpen, setIsOpen] = useState(false);
  
  const setFilters = useCallback((filters: SearchFiltersType) => {
    useSearchStore.getState().setFilters(filters);
  }, []);
  
  const clearFilters = useCallback(() => {
    useSearchStore.getState().clearFilters();
  }, []);

  const domains = ['Cartões', 'Seguros', 'Consórcio', 'Investimentos'];
  const technologies = ['Databricks', 'Airflow', 'MLflow', 'Power BI', 'Tableau', 'Python'];
  const layers = ['Bronze', 'Silver', 'Gold', 'Model'] as const;
  const statuses = ['published', 'draft', 'archived'] as const;

  const updateFilter = (key: keyof SearchFiltersType, value: string, checked: boolean) => {
    const currentValues = activeFilters[key] as string[] || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);

    setFilters({
      ...activeFilters,
      [key]: newValues.length > 0 ? newValues : undefined
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).filter(value => 
      Array.isArray(value) ? value.length > 0 : value !== undefined
    ).length;
  };

  const getActiveFilterLabels = () => {
    const labels: string[] = [];
    
    if (activeFilters.domains?.length) {
      labels.push(...activeFilters.domains.map(d => `Domain: ${d}`));
    }
    if (activeFilters.technologies?.length) {
      labels.push(...activeFilters.technologies.map(t => `Tech: ${t}`));
    }
    if (activeFilters.layers?.length) {
      labels.push(...activeFilters.layers.map(l => `Layer: ${l}`));
    }
    if (activeFilters.statuses?.length) {
      labels.push(...activeFilters.statuses.map(s => `Status: ${s}`));
    }
    
    return labels;
  };

  const removeFilter = (label: string) => {
    const [type, value] = label.split(': ');
    const key = type.toLowerCase() === 'domain' ? 'domains' :
                type.toLowerCase() === 'tech' ? 'technologies' :
                type.toLowerCase() === 'layer' ? 'layers' :
                type.toLowerCase() === 'status' ? 'statuses' : null;
    
    if (key) {
      updateFilter(key as keyof SearchFiltersType, value, false);
    }
  };

  const activeCount = getActiveFilterCount();
  const activeLabels = getActiveFilterLabels();

  return (
    <div className="flex items-center space-x-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="h-3 w-3 mr-1.5" />
            Filters
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-xs">
                {activeCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Search Filters</h4>
              {activeCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearFilters();
                    setIsOpen(false);
                  }}
                  className="h-6 px-2 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Domains */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Domains</Label>
              <div className="space-y-2">
                {domains.map(domain => (
                  <div key={domain} className="flex items-center space-x-2">
                    <Checkbox
                      id={`domain-${domain}`}
                      checked={activeFilters.domains?.includes(domain) || false}
                      onCheckedChange={(checked) => 
                        updateFilter('domains', domain, checked as boolean)
                      }
                    />
                    <Label htmlFor={`domain-${domain}`} className="text-sm">
                      {domain}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Technologies */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Technologies</Label>
              <div className="space-y-2">
                {technologies.map(tech => (
                  <div key={tech} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tech-${tech}`}
                      checked={activeFilters.technologies?.includes(tech) || false}
                      onCheckedChange={(checked) => 
                        updateFilter('technologies', tech, checked as boolean)
                      }
                    />
                    <Label htmlFor={`tech-${tech}`} className="text-sm">
                      {tech}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Layers */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Data Layers</Label>
              <div className="space-y-2">
                {layers.map(layer => (
                  <div key={layer} className="flex items-center space-x-2">
                    <Checkbox
                      id={`layer-${layer}`}
                      checked={activeFilters.layers?.includes(layer) || false}
                      onCheckedChange={(checked) => 
                        updateFilter('layers', layer, checked as boolean)
                      }
                    />
                    <Label htmlFor={`layer-${layer}`} className="text-sm">
                      {layer}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Statuses */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <div className="space-y-2">
                {statuses.map(status => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={activeFilters.statuses?.includes(status) || false}
                      onCheckedChange={(checked) => 
                        updateFilter('statuses', status, checked as boolean)
                      }
                    />
                    <Label htmlFor={`status-${status}`} className="text-sm capitalize">
                      {status}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active filter badges */}
      {activeLabels.length > 0 && (
        <div className="flex items-center space-x-1 flex-wrap">
          {activeLabels.slice(0, 3).map(label => (
            <Badge
              key={label}
              variant="secondary"
              className="h-6 px-2 text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => removeFilter(label)}
            >
              {label}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {activeLabels.length > 3 && (
            <Badge variant="secondary" className="h-6 px-2 text-xs">
              +{activeLabels.length - 3} more
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}