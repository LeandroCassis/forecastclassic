import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Check, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

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

  const { data: filterOptions } = useQuery({
    queryKey: ['filter-options'],
    queryFn: async () => {
      console.log('Fetching filter options');
      const { data, error } = await supabase
        .from('produtos')
        .select('codigo, fabrica, familia1, familia2');

      if (error) {
        console.error('Error fetching filter options:', error);
        throw error;
      }

      const uniqueOptions = {
        codigo: ['Todos', ...new Set(data.map(item => item.codigo))],
        fabrica: ['Todos', ...new Set(data.map(item => item.fabrica))],
        familia1: ['Todos', ...new Set(data.map(item => item.familia1))],
        familia2: ['Todos', ...new Set(data.map(item => item.familia2))]
      };

      console.log('Filter options fetched:', uniqueOptions);
      return uniqueOptions;
    }
  });

  const { data: filteredOptions, refetch: refetchFilteredOptions } = useQuery({
    queryKey: ['filtered-options', selectedFactory, selectedCode, selectedFamily1, selectedFamily2],
    queryFn: async () => {
      let query = supabase.from('produtos').select('codigo, fabrica, familia1, familia2');

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

      if (error) {
        console.error('Error fetching filtered options:', error);
        throw error;
      }

      return {
        codigo: ['Todos', ...new Set(data.map(item => item.codigo))],
        fabrica: ['Todos', ...new Set(data.map(item => item.fabrica))],
        familia1: ['Todos', ...new Set(data.map(item => item.familia1))],
        familia2: ['Todos', ...new Set(data.map(item => item.familia2))]
      };
    },
    enabled: !!filterOptions
  });

  useEffect(() => {
    refetchFilteredOptions();
  }, [selectedFactory, selectedCode, selectedFamily1, selectedFamily2]);

  const handleMultiSelect = (value: string, currentSelected: string[], setter: (values: string[]) => void, type: string, options: string[]) => {
    let newValues: string[];
    
    if (value === 'Todos') {
      newValues = currentSelected.includes('Todos') ? [] : options;
    } else {
      if (currentSelected.includes('Todos')) {
        newValues = [value];
      } else {
        if (currentSelected.includes(value)) {
          newValues = currentSelected.filter(v => v !== value);
        } else {
          newValues = [...currentSelected, value];
          if (newValues.length === options.length - 1) {
            newValues = options;
          }
        }
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
    onSelect: (value: string) => void,
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
          {selected.length > 0 ? 
            (selected.includes('Todos') ? 'Todos' : `(${selected.length})`) 
            : ''}
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
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {filterOptionsBySearch(options, searchTerms[filterKey]).map((option) => (
                <div key={option} className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded">
                  <Checkbox
                    checked={selected.includes(option)}
                    onCheckedChange={() => onSelect(option)}
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
          (value) => handleMultiSelect(value, selectedYear, setSelectedYear, 'ano', ['Todos', '2024', '2025', '2026']),
          'year'
        )}

        {renderFilterDropdown(
          'Tipo',
          ['Todos', 'REAL', 'REVISÃO', 'ORÇAMENTO'],
          selectedType,
          (value) => handleMultiSelect(value, selectedType, setSelectedType, 'tipo', ['Todos', 'REAL', 'REVISÃO', 'ORÇAMENTO']),
          'type'
        )}

        {renderFilterDropdown(
          'Fábrica',
          filteredOptions?.fabrica || [],
          selectedFactory,
          (value) => handleMultiSelect(value, selectedFactory, setSelectedFactory, 'fabrica', filteredOptions?.fabrica || []),
          'fabrica'
        )}

        {renderFilterDropdown(
          'Cód Produto',
          filteredOptions?.codigo || [],
          selectedCode,
          (value) => handleMultiSelect(value, selectedCode, setSelectedCode, 'codigo', filteredOptions?.codigo || []),
          'codigo'
        )}

        {renderFilterDropdown(
          'Família 1',
          filteredOptions?.familia1 || [],
          selectedFamily1,
          (value) => handleMultiSelect(value, selectedFamily1, setSelectedFamily1, 'familia1', filteredOptions?.familia1 || []),
          'familia1'
        )}

        {renderFilterDropdown(
          'Família 2',
          filteredOptions?.familia2 || [],
          selectedFamily2,
          (value) => handleMultiSelect(value, selectedFamily2, setSelectedFamily2, 'familia2', filteredOptions?.familia2 || []),
          'familia2'
        )}

        <div className="flex flex-wrap gap-2">
          {[
            ...selectedYear.map(v => ({ value: v, type: 'ano', setter: setSelectedYear })),
            ...selectedType.map(v => ({ value: v, type: 'tipo', setter: setSelectedType })),
            ...selectedFactory.map(v => ({ value: v, type: 'fabrica', setter: setSelectedFactory })),
            ...selectedCode.map(v => ({ value: v, type: 'codigo', setter: setSelectedCode })),
            ...selectedFamily1.map(v => ({ value: v, type: 'familia1', setter: setSelectedFamily1 })),
            ...selectedFamily2.map(v => ({ value: v, type: 'familia2', setter: setSelectedFamily2 }))
          ].map(({ value, type, setter }) => (
            <Badge key={`${type}-${value}`} variant="secondary">
              {value}
              <Button
                variant="ghost"
                className="h-4 w-4 p-0 ml-2"
                onClick={() => handleMultiSelect(
                  value,
                  type === 'ano' ? selectedYear :
                  type === 'tipo' ? selectedType :
                  type === 'fabrica' ? selectedFactory :
                  type === 'codigo' ? selectedCode :
                  type === 'familia1' ? selectedFamily1 :
                  selectedFamily2,
                  setter,
                  type,
                  filteredOptions?.[type as keyof typeof filteredOptions] || []
                )}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForecastFilters;
