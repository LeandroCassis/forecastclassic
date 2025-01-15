import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Check, Search } from "lucide-react";

interface ForecastFiltersProps {
  onFilterChange: (filterType: string, values: string[]) => void;
}

const ForecastFilters: React.FC<ForecastFiltersProps> = ({ onFilterChange }) => {
  const [selectedYear, setSelectedYear] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [selectedFactory, setSelectedFactory] = useState<string[]>([]);
  const [selectedCode, setSelectedCode] = useState<string[]>([]);
  const [selectedFamily1, setSelectedFamily1] = useState<string[]>([]);
  const [selectedFamily2, setSelectedFamily2] = useState<string[]>([]);
  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({
    year: '',
    type: '',
    fabrica: '',
    codigo: '',
    familia1: '',
    familia2: '',
  });

  const [dropdownStates, setDropdownStates] = useState({
    year: false,
    type: false,
    fabrica: false,
    codigo: false,
    familia1: false,
    familia2: false
  });

  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Query para buscar opções iniciais
  const { data: initialOptions } = useQuery({
    queryKey: ['initial-filter-options'],
    queryFn: async () => {
      console.log('Fetching initial filter options');
      const { data, error } = await supabase
        .from('produtos')
        .select('codigo, fabrica, familia1, familia2');

      if (error) throw error;

      const options = {
        codigo: ['Todos', ...new Set(data.map(item => item.codigo))],
        fabrica: ['Todos', ...new Set(data.map(item => item.fabrica))],
        familia1: ['Todos', ...new Set(data.map(item => item.familia1))],
        familia2: ['Todos', ...new Set(data.map(item => item.familia2))]
      };
      
      console.log('Initial filter options fetched:', options);
      return options;
    }
  });

  // Query para buscar opções filtradas baseadas nas seleções atuais
  const { data: filteredOptions, refetch: refetchFilteredOptions } = useQuery({
    queryKey: ['filtered-options', selectedYear, selectedType, selectedFactory, selectedCode, selectedFamily1, selectedFamily2],
    queryFn: async () => {
      console.log('Fetching filtered options with current selections:', {
        selectedFactory,
        selectedCode,
        selectedFamily1,
        selectedFamily2
      });

      let query = supabase.from('produtos').select('codigo, fabrica, familia1, familia2');

      // Aplicar filtros ativos
      if (selectedFactory.length > 0 && !selectedFactory.includes('Todos')) {
        query = query.in('fabrica', selectedFactory);
      }
      if (selectedCode.length > 0 && !selectedCode.includes('Todos')) {
        query = query.in('codigo', selectedCode);
      }
      if (selectedFamily1.length > 0 && !selectedFamily1.includes('Todos')) {
        query = query.in('familia1', selectedFamily1);
      }
      if (selectedFamily2.length > 0 && !selectedFamily2.includes('Todos')) {
        query = query.in('familia2', selectedFamily2);
      }

      const { data, error } = await query;
      if (error) throw error;

      return {
        ano: ['Todos', '2024', '2025', '2026'],
        tipo: ['Todos', 'REAL', 'REVISÃO', 'ORÇAMENTO'],
        fabrica: ['Todos', ...new Set([...selectedFactory.filter(f => f !== 'Todos'), ...new Set(data.map(item => item.fabrica))])],
        codigo: ['Todos', ...new Set([...selectedCode.filter(c => c !== 'Todos'), ...new Set(data.map(item => item.codigo))])],
        familia1: ['Todos', ...new Set([...selectedFamily1.filter(f => f !== 'Todos'), ...new Set(data.map(item => item.familia1))])],
        familia2: ['Todos', ...new Set([...selectedFamily2.filter(f => f !== 'Todos'), ...new Set(data.map(item => item.familia2))])]
      };
    },
    enabled: !!initialOptions
  });

  useEffect(() => {
    if (refetchFilteredOptions) {
      console.log('Refetching filtered options due to selection change');
      refetchFilteredOptions();
    }
  }, [selectedYear, selectedType, selectedFactory, selectedCode, selectedFamily1, selectedFamily2]);

  const handleMultiSelect = (
    value: string,
    currentSelected: string[],
    setter: (values: string[]) => void,
    type: string,
    options: string[],
    event?: React.MouseEvent
  ) => {
    let newValues: string[];
    
    if (value === 'Todos') {
      newValues = currentSelected.includes('Todos') ? [] : options;
    } else {
      if (event?.ctrlKey || event?.metaKey) {
        if (currentSelected.includes(value)) {
          newValues = currentSelected.filter(v => v !== value && v !== 'Todos');
        } else {
          newValues = [...currentSelected.filter(v => v !== 'Todos'), value];
        }
      } else {
        if (currentSelected.includes(value)) {
          newValues = currentSelected.length === 1 ? [] : [value];
        } else {
          newValues = [value];
        }
      }
    }
    
    console.log(`Updating ${type} selection:`, newValues);
    setter(newValues);
    onFilterChange(type, newValues);
  };

  const getOptionCount = (option: string, filterKey: string) => {
    if (option === 'Todos') return 0;
    
    const activeFilters = {
      fabrica: selectedFactory,
      codigo: selectedCode,
      familia1: selectedFamily1,
      familia2: selectedFamily2
    };

    const isAvailable = filteredOptions?.[filterKey]?.includes(option);
    return isAvailable ? 1 : 0;
  };

  const filterOptionsBySearch = (options: string[], searchTerm: string) => {
    if (!searchTerm) return options;
    const terms = searchTerm.toLowerCase().split(' ').filter(term => term.length > 0);
    return options.filter(option => 
      terms.every(term => option.toLowerCase().includes(term)) ||
      option === 'Todos'
    );
  };

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

  const handleSelectAll = (
    options: string[],
    setter: (values: string[]) => void,
    type: string
  ) => {
    const newValues = options.filter(opt => opt !== 'Todos');
    setter(newValues);
    onFilterChange(type, newValues);
  };

  const handleClearAll = (
    setter: (values: string[]) => void,
    type: string
  ) => {
    setter([]);
    onFilterChange(type, []);
  };

  const toggleDropdown = (key: string) => {
    setDropdownStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderFilterDropdown = (
    label: string,
    options: string[],
    selected: string[],
    onSelect: (value: string, event: React.MouseEvent) => void,
    filterKey: string
  ) => {
    const sortedOptions = [...options].sort((a, b) => {
      if (a === 'Todos') return -1;
      if (b === 'Todos') return 1;
      return a.localeCompare(b);
    });

    const getButtonText = () => {
      if (selected.length === 0) return label;
      if (selected.length === 1) return `${label}: ${selected[0]}`;
      return `${label} (${selected.length})`;
    };

    return (
      <div className="relative" ref={el => dropdownRefs.current[filterKey] = el}>
        <Button
          variant="outline"
          onClick={() => toggleDropdown(filterKey)}
          className="w-[180px] justify-between"
        >
          <span className="truncate">
            {getButtonText()}
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
                />
              </div>
              <div className="flex justify-between mb-2 text-xs">
                <button
                  onClick={() => handleSelectAll(options, selected, onSelect)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Selecionar Todos
                </button>
                <button
                  onClick={() => handleClearAll(selected, onSelect)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Limpar Seleção
                </button>
              </div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {filterOptionsBySearch(sortedOptions, searchTerms[filterKey]).map((option) => (
                  <div
                    key={option}
                    className={`flex items-center justify-between p-1 hover:bg-gray-100 rounded cursor-pointer ${
                      selected.includes(option) ? 'bg-gray-100' : ''
                    }`}
                    onClick={(e) => onSelect(option, e)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={selected.includes(option)}
                        className="pointer-events-none"
                      />
                      <span className="text-sm font-medium">
                        {option}
                        {selected.includes(option) && (
                          <span className="ml-1 text-blue-600">✓</span>
                        )}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      ({getOptionCount(option, filterKey)})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="flex flex-wrap gap-4">
        {renderFilterDropdown(
          'Ano',
          filteredOptions?.ano || ['Todos', '2024', '2025', '2026'],
          selectedYear,
          (value, event) => handleMultiSelect(value, selectedYear, setSelectedYear, 'ano', filteredOptions?.ano || ['Todos', '2024', '2025', '2026'], event),
          'ano'
        )}

        {renderFilterDropdown(
          'Tipo',
          filteredOptions?.tipo || ['Todos', 'REAL', 'REVISÃO', 'ORÇAMENTO'],
          selectedType,
          (value, event) => handleMultiSelect(value, selectedType, setSelectedType, 'tipo', filteredOptions?.tipo || ['Todos', 'REAL', 'REVISÃO', 'ORÇAMENTO'], event),
          'tipo'
        )}

        {renderFilterDropdown(
          'Fábrica',
          (filteredOptions?.fabrica || initialOptions?.fabrica || []),
          selectedFactory,
          (value, event) => handleMultiSelect(
            value, 
            selectedFactory, 
            setSelectedFactory, 
            'fabrica', 
            filteredOptions?.fabrica || initialOptions?.fabrica || [],
            event
          ),
          'fabrica'
        )}

        {renderFilterDropdown(
          'Cód Produto',
          filteredOptions?.codigo || initialOptions?.codigo || [],
          selectedCode,
          (value, event) => handleMultiSelect(
            value, 
            selectedCode, 
            setSelectedCode, 
            'codigo', 
            filteredOptions?.codigo || initialOptions?.codigo || [],
            event
          ),
          'codigo'
        )}

        {renderFilterDropdown(
          'Família 1',
          filteredOptions?.familia1 || initialOptions?.familia1 || [],
          selectedFamily1,
          (value, event) => handleMultiSelect(
            value, 
            selectedFamily1, 
            setSelectedFamily1, 
            'familia1', 
            filteredOptions?.familia1 || initialOptions?.familia1 || [],
            event
          ),
          'familia1'
        )}

        {renderFilterDropdown(
          'Família 2',
          filteredOptions?.familia2 || initialOptions?.familia2 || [],
          selectedFamily2,
          (value, event) => handleMultiSelect(
            value, 
            selectedFamily2, 
            setSelectedFamily2, 
            'familia2', 
            filteredOptions?.familia2 || initialOptions?.familia2 || [],
            event
          ),
          'familia2'
        )}
      </div>
    </div>
  );
};

export default ForecastFilters;