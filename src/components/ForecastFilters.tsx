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

  const { data: initialOptions, isLoading: initialLoading } = useQuery({
    queryKey: ['initial-filter-options'],
    queryFn: async () => {
      console.log('Fetching filter options');
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
      
      console.log('Filter options fetched:', options);
      return options;
    }
  });

  const { data: filteredOptions, refetch: refetchFilteredOptions } = useQuery({
    queryKey: ['filtered-options', selectedYear, selectedType, selectedFactory, selectedCode, selectedFamily1, selectedFamily2],
    queryFn: async () => {
      // Base query
      let baseQuery = supabase
        .from('produtos')
        .select('codigo, fabrica, familia1, familia2');

      // Criar objeto com os filtros ativos
      const activeFilters: Record<string, string[]> = {
        fabrica: selectedFactory.filter(f => f !== 'Todos'),
        codigo: selectedCode.filter(c => c !== 'Todos'),
        familia1: selectedFamily1.filter(f => f !== 'Todos'),
        familia2: selectedFamily2.filter(f => f !== 'Todos')
      };

      // Aplicar filtros ativos à query base
      Object.entries(activeFilters).forEach(([field, values]) => {
        if (values.length > 0) {
          baseQuery = baseQuery.in(field, values);
        }
      });

      // Executar query base para obter dados filtrados
      const { data: filteredData, error } = await baseQuery;
      if (error) throw error;

      // Construir opções filtradas
      const buildFilteredOptions = (data: any[]) => ({
        ano: ['Todos', '2024', '2025', '2026'],
        tipo: ['Todos', 'REAL', 'REVISÃO', 'ORÇAMENTO'],
        fabrica: ['Todos', ...new Set(data.map(item => item.fabrica))],
        codigo: ['Todos', ...new Set(data.map(item => item.codigo))],
        familia1: ['Todos', ...new Set(data.map(item => item.familia1))],
        familia2: ['Todos', ...new Set(data.map(item => item.familia2))]
      });

      // Criar queries separadas para cada filtro
      const getOptionsForField = async (field: string, excludeField: string) => {
        let query = supabase.from('produtos').select(field);
        
        // Aplicar todos os filtros ativos exceto o do campo atual
        Object.entries(activeFilters).forEach(([filterField, values]) => {
          if (values.length > 0 && filterField !== excludeField) {
            query = query.in(filterField, values);
          }
        });

        const { data } = await query;
        return ['Todos', ...new Set(data?.map(item => item[field]) || [])];
      };

      // Obter opções filtradas para cada campo
      const [fabricaOptions, codigoOptions, familia1Options, familia2Options] = await Promise.all([
        getOptionsForField('fabrica', 'fabrica'),
        getOptionsForField('codigo', 'codigo'),
        getOptionsForField('familia1', 'familia1'),
        getOptionsForField('familia2', 'familia2')
      ]);

      return {
        ano: ['Todos', '2024', '2025', '2026'],
        tipo: ['Todos', 'REAL', 'REVISÃO', 'ORÇAMENTO'],
        fabrica: fabricaOptions,
        codigo: codigoOptions,
        familia1: familia1Options,
        familia2: familia2Options
      };
    },
    enabled: !!initialOptions
  });

  useEffect(() => {
    if (refetchFilteredOptions) {
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
      if (event?.ctrlKey) {
        if (currentSelected.includes(value)) {
          newValues = currentSelected.filter(v => v !== value);
        } else {
          newValues = [...currentSelected, value];
        }
      } else {
        newValues = [value];
      }
    }
    
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

    // Se a opção está nas opções filtradas, conte-a
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

    return (
      <div className="relative" ref={el => dropdownRefs.current[filterKey] = el}>
        <Button
          variant="outline"
          onClick={() => toggleDropdown(filterKey)}
          className="w-[180px] justify-between"
        >
          {label}
          <span className="ml-2">
            {selected.length > 0 ? `(${selected.length})` : ''}
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
                  onClick={() => handleSelectAll(options, selected, onSelect, filterKey)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Selecionar Todos
                </button>
                <button
                  onClick={() => handleClearAll(selected, onSelect, filterKey)}
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
                      selected.includes(option) ? 'bg-gray-50' : ''
                    }`}
                    onClick={(e) => onSelect(option, e)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={selected.includes(option)}
                        className="pointer-events-none"
                      />
                      <span className="text-sm">{option}</span>
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
