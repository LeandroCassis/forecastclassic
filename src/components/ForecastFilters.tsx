import React, { useState, useEffect } from 'react';
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
    queryKey: ['filtered-options', selectedFactory, selectedCode, selectedFamily1, selectedFamily2],
    queryFn: async () => {
      let query = supabase.from('produtos').select('codigo, fabrica, familia1, familia2');

      // Apply all filters except 'Todos'
      const filters = [
        { field: 'fabrica', values: selectedFactory },
        { field: 'codigo', values: selectedCode },
        { field: 'familia1', values: selectedFamily1 },
        { field: 'familia2', values: selectedFamily2 }
      ];

      filters.forEach(({ field, values }) => {
        if (values.length > 0 && !values.includes('Todos')) {
          query = query.in(field, values);
        }
      });

      const { data, error } = await query;
      if (error) throw error;

      return {
        codigo: ['Todos', ...new Set(data.map(item => item.codigo))],
        fabrica: ['Todos', ...new Set(data.map(item => item.fabrica))],
        familia1: ['Todos', ...new Set(data.map(item => item.familia1))],
        familia2: ['Todos', ...new Set(data.map(item => item.familia2))]
      };
    },
    enabled: !!initialOptions
  });

  useEffect(() => {
    if (refetchFilteredOptions) {
      refetchFilteredOptions();
    }
  }, [selectedFactory, selectedCode, selectedFamily1, selectedFamily2]);

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

  const filterOptionsBySearch = (options: string[], searchTerm: string) => {
    if (!searchTerm) return options;
    return options.filter(option => 
      option.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option === 'Todos'
    );
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
  ) => (
    <div className="relative">
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
            <div className="text-xs text-gray-500 mb-2">
              Segure CTRL para selecionar múltiplos itens
            </div>
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {filterOptionsBySearch(options, searchTerms[filterKey]).map((option) => (
                <div
                  key={option}
                  className={`flex items-center space-x-2 p-1 hover:bg-gray-100 rounded cursor-pointer ${
                    selected.includes(option) ? 'bg-gray-50' : ''
                  }`}
                  onClick={(e) => onSelect(option, e)}
                >
                  <Checkbox
                    checked={selected.includes(option)}
                    className="pointer-events-none"
                  />
                  <span className="text-sm">{option}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="flex flex-wrap gap-4">
        {renderFilterDropdown(
          'Ano',
          ['Todos', '2024', '2025', '2026'],
          selectedYear,
          (value, event) => handleMultiSelect(value, selectedYear, setSelectedYear, 'ano', ['Todos', '2024', '2025', '2026'], event),
          'year'
        )}

        {renderFilterDropdown(
          'Tipo',
          ['Todos', 'REAL', 'REVISÃO', 'ORÇAMENTO'],
          selectedType,
          (value, event) => handleMultiSelect(value, selectedType, setSelectedType, 'tipo', ['Todos', 'REAL', 'REVISÃO', 'ORÇAMENTO'], event),
          'type'
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