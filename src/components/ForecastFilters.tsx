import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface ForecastFiltersProps {
  onFilterChange: (filterType: string, values: string[]) => void;
}

const ForecastFilters: React.FC<ForecastFiltersProps> = React.memo(({ onFilterChange }) => {
  const [selectedFactory, setSelectedFactory] = useState<string[]>([]);
  const [selectedCode, setSelectedCode] = useState<string[]>([]);
  const [selectedFamily1, setSelectedFamily1] = useState<string[]>([]);
  const [selectedFamily2, setSelectedFamily2] = useState<string[]>([]);
  
  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({
    fabrica: '',
    codigo: '',
    familia1: '',
    familia2: '',
  });

  const [dropdownStates, setDropdownStates] = useState({
    fabrica: false,
    codigo: false,
    familia1: false,
    familia2: false
  });

  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Initial options query with infinite stale time to prevent re-fetches
  const { data: initialOptions } = useQuery({
    queryKey: ['initial-filter-options'],
    queryFn: async () => {
      console.log('Fetching initial filter options...');
      const { data, error } = await supabase
        .from('produtos')
        .select('codigo, fabrica, familia1, familia2');

      if (error) throw error;

      const uniqueOptions = {
        codigo: [...new Set(data.map(item => item.codigo))],
        fabrica: [...new Set(data.map(item => item.fabrica))],
        familia1: [...new Set(data.map(item => item.familia1))],
        familia2: [...new Set(data.map(item => item.familia2))]
      };
      
      console.log('Initial filter options fetched:', uniqueOptions);
      return uniqueOptions;
    },
    staleTime: Infinity,
    gcTime: Infinity
  });

  // Memoize the filtered options to prevent unnecessary re-renders
  const filteredOptions = useMemo(() => {
    if (!initialOptions) return null;

    const applyFilters = (options: typeof initialOptions) => {
      let result = { ...options };

      if (selectedFactory.length > 0) {
        result = {
          ...result,
          codigo: result.codigo.filter(code => 
            initialOptions.codigo.some(c => selectedFactory.includes(c))),
          familia1: result.familia1.filter(f1 => 
            initialOptions.familia1.some(f => selectedFactory.includes(f))),
          familia2: result.familia2.filter(f2 => 
            initialOptions.familia2.some(f => selectedFactory.includes(f)))
        };
      }

      if (selectedCode.length > 0) {
        result = {
          ...result,
          fabrica: result.fabrica.filter(fab => 
            initialOptions.fabrica.some(f => selectedCode.includes(f))),
          familia1: result.familia1.filter(f1 => 
            initialOptions.familia1.some(f => selectedCode.includes(f))),
          familia2: result.familia2.filter(f2 => 
            initialOptions.familia2.some(f => selectedCode.includes(f)))
        };
      }

      if (selectedFamily1.length > 0) {
        result = {
          ...result,
          fabrica: result.fabrica.filter(fab => 
            initialOptions.fabrica.some(f => selectedFamily1.includes(f))),
          codigo: result.codigo.filter(code => 
            initialOptions.codigo.some(c => selectedFamily1.includes(c))),
          familia2: result.familia2.filter(f2 => 
            initialOptions.familia2.some(f => selectedFamily1.includes(f)))
        };
      }

      if (selectedFamily2.length > 0) {
        result = {
          ...result,
          fabrica: result.fabrica.filter(fab => 
            initialOptions.fabrica.some(f => selectedFamily2.includes(f))),
          codigo: result.codigo.filter(code => 
            initialOptions.codigo.some(c => selectedFamily2.includes(c))),
          familia1: result.familia1.filter(f1 => 
            initialOptions.familia1.some(f => selectedFamily2.includes(f)))
        };
      }

      // Ensure selected values are always included in options
      result.fabrica = Array.from(new Set([...result.fabrica, ...selectedFactory]));
      result.codigo = Array.from(new Set([...result.codigo, ...selectedCode]));
      result.familia1 = Array.from(new Set([...result.familia1, ...selectedFamily1]));
      result.familia2 = Array.from(new Set([...result.familia2, ...selectedFamily2]));

      return result;
    };

    return applyFilters(initialOptions);
  }, [initialOptions, selectedFactory, selectedCode, selectedFamily1, selectedFamily2]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.entries(dropdownRefs.current).forEach(([key, ref]) => {
        if (ref && !ref.contains(event.target as Node)) {
          setDropdownStates(prev => ({ ...prev, [key]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMultiSelect = useCallback((
    value: string,
    type: string,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Handling multi-select:', { value, type });

    const updateSelection = (currentSelected: string[]) => {
      const newValues = currentSelected.includes(value)
        ? currentSelected.filter(v => v !== value)
        : [...currentSelected, value];
      console.log('Updated selection:', newValues);
      return newValues;
    };

    switch (type) {
      case 'fabrica':
        setSelectedFactory(prev => {
          const newValues = updateSelection(prev);
          onFilterChange(type, newValues);
          return newValues;
        });
        break;
      case 'codigo':
        setSelectedCode(prev => {
          const newValues = updateSelection(prev);
          onFilterChange(type, newValues);
          return newValues;
        });
        break;
      case 'familia1':
        setSelectedFamily1(prev => {
          const newValues = updateSelection(prev);
          onFilterChange(type, newValues);
          return newValues;
        });
        break;
      case 'familia2':
        setSelectedFamily2(prev => {
          const newValues = updateSelection(prev);
          onFilterChange(type, newValues);
          return newValues;
        });
        break;
    }
  }, [onFilterChange]);

  const handleClearAll = useCallback((
    type: string,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Clearing all selections for type:', type);
    
    switch (type) {
      case 'fabrica':
        setSelectedFactory([]);
        onFilterChange(type, []);
        break;
      case 'codigo':
        setSelectedCode([]);
        onFilterChange(type, []);
        break;
      case 'familia1':
        setSelectedFamily1([]);
        onFilterChange(type, []);
        break;
      case 'familia2':
        setSelectedFamily2([]);
        onFilterChange(type, []);
        break;
    }
  }, [onFilterChange]);

  const toggleDropdown = useCallback((key: string) => {
    setDropdownStates(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof dropdownStates]
    }));
  }, []);

  const getSelectedValuesForType = useCallback((type: string): string[] => {
    switch (type) {
      case 'fabrica':
        return selectedFactory;
      case 'codigo':
        return selectedCode;
      case 'familia1':
        return selectedFamily1;
      case 'familia2':
        return selectedFamily2;
      default:
        return [];
    }
  }, [selectedFactory, selectedCode, selectedFamily1, selectedFamily2]);

  const getButtonText = useCallback((label: string, selected: string[]) => {
    if (selected.length === 0) return label;
    if (selected.length === 1) return `${label}: ${selected[0]}`;
    return `${label} (${selected.length})`;
  }, []);

  const filterOptionsBySearch = useCallback((options: string[], searchTerm: string) => {
    if (!searchTerm) return options;
    const terms = searchTerm.toLowerCase().split(' ').filter(term => term.length > 0);
    return options.filter(option => 
      terms.every(term => option.toLowerCase().includes(term))
    );
  }, []);

  const renderFilterDropdown = useCallback((
    label: string,
    options: string[],
    filterKey: string
  ) => {
    const selected = getSelectedValuesForType(filterKey);
    const sortedOptions = useMemo(() => [...options].sort((a, b) => a.localeCompare(b)), [options]);
    const hasSelectedItems = selected.length > 0;

    return (
      <div className="relative" ref={el => dropdownRefs.current[filterKey] = el}>
        <Button
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleDropdown(filterKey);
          }}
          className={`w-[180px] justify-between ${hasSelectedItems ? 'border-green-800 bg-green-50/50 hover:bg-green-100/50' : ''}`}
        >
          <span className="truncate">
            {getButtonText(label, selected)}
          </span>
        </Button>
        {dropdownStates[filterKey as keyof typeof dropdownStates] && (
          <div className="absolute z-50 w-[250px] mt-2 bg-white border rounded-md shadow-lg">
            <div className="p-2">
              <div className="flex items-center space-x-2 mb-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Pesquisar..."
                  value={searchTerms[filterKey]}
                  onChange={(e) => setSearchTerms(prev => ({
                    ...prev,
                    [filterKey]: e.target.value
                  }))}
                  className="h-8"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="flex mb-2">
                <button
                  onClick={(e) => handleClearAll(filterKey, e)}
                  className="text-xs text-green-800 hover:text-green-900"
                >
                  Limpar Seleção
                </button>
              </div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {filterOptionsBySearch(sortedOptions, searchTerms[filterKey]).map((option) => (
                  <div
                    key={option}
                    className={`flex items-center justify-between p-1 hover:bg-gray-100 rounded cursor-pointer ${
                      selected.includes(option) ? 'bg-green-50' : ''
                    }`}
                    onClick={(e) => handleMultiSelect(option, filterKey, e)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={selected.includes(option)}
                        className="pointer-events-none"
                      />
                      <span className="text-sm font-medium">
                        {option}
                        {selected.includes(option) && (
                          <span className="ml-1 text-green-800">✓</span>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }, [
    dropdownStates,
    searchTerms,
    handleMultiSelect,
    handleClearAll,
    toggleDropdown,
    getSelectedValuesForType,
    filterOptionsBySearch,
    getButtonText
  ]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="flex flex-wrap gap-4">
        {renderFilterDropdown(
          'Fábrica',
          (filteredOptions?.fabrica || initialOptions?.fabrica || []),
          'fabrica'
        )}

        {renderFilterDropdown(
          'Cód Produto',
          filteredOptions?.codigo || initialOptions?.codigo || [],
          'codigo'
        )}

        {renderFilterDropdown(
          'Família 1',
          filteredOptions?.familia1 || initialOptions?.familia1 || [],
          'familia1'
        )}

        {renderFilterDropdown(
          'Família 2',
          filteredOptions?.familia2 || initialOptions?.familia2 || [],
          'familia2'
        )}
      </div>
    </div>
  );
});

ForecastFilters.displayName = 'ForecastFilters';

export default ForecastFilters;