import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface ForecastFiltersProps {
  onFilterChange: (filterType: string, values: string[]) => void;
}

const ForecastFilters: React.FC<ForecastFiltersProps> = ({ onFilterChange }) => {
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

  const { data: initialOptions } = useQuery({
    queryKey: ['initial-filter-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produtos')
        .select('codigo, fabrica, familia1, familia2');

      if (error) throw error;

      const options = {
        codigo: [...new Set(data.map(item => item.codigo))].filter(Boolean),
        fabrica: [...new Set(data.map(item => item.fabrica))].filter(Boolean),
        familia1: [...new Set(data.map(item => item.familia1))].filter(Boolean),
        familia2: [...new Set(data.map(item => item.familia2))].filter(Boolean)
      };

      // Inicializa as opções filtradas com os valores iniciais
      setFilteredOptions(options);
      return options;
    },
    staleTime: Infinity, // Mantém os dados em cache indefinidamente
    cacheTime: Infinity
  });

  // Substitua a query de filteredOptions por um estado local
  const [filteredOptions, setFilteredOptions] = useState<{
    codigo: string[];
    fabrica: string[];
    familia1: string[];
    familia2: string[];
  } | null>(null);

  // Atualize o useEffect para gerenciar as opções filtradas
  useEffect(() => {
    if (!initialOptions) return;

    const filterProducts = async () => {
      let query = supabase.from('produtos').select('codigo, fabrica, familia1, familia2');

      if (selectedFactory.length > 0) query = query.in('fabrica', selectedFactory);
      if (selectedCode.length > 0) query = query.in('codigo', selectedCode);
      if (selectedFamily1.length > 0) query = query.in('familia1', selectedFamily1);
      if (selectedFamily2.length > 0) query = query.in('familia2', selectedFamily2);

      const { data, error } = await query;
      if (error) return;

      const newOptions = {
        fabrica: Array.from(new Set([...data.map(item => item.fabrica), ...selectedFactory])).filter(Boolean),
        codigo: Array.from(new Set([...data.map(item => item.codigo), ...selectedCode])).filter(Boolean),
        familia1: Array.from(new Set([...data.map(item => item.familia1), ...selectedFamily1])).filter(Boolean),
        familia2: Array.from(new Set([...data.map(item => item.familia2), ...selectedFamily2])).filter(Boolean)
      };

      setFilteredOptions(newOptions);
    };

    filterProducts();
  }, [selectedFactory, selectedCode, selectedFamily1, selectedFamily2, initialOptions]);

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

  const handleMultiSelect = (
    value: string,
    type: string,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    let currentSelected: string[];
    let setSelected: React.Dispatch<React.SetStateAction<string[]>>;

    switch (type) {
      case 'fabrica':
        currentSelected = selectedFactory;
        setSelected = setSelectedFactory;
        break;
      case 'codigo':
        currentSelected = selectedCode;
        setSelected = setSelectedCode;
        break;
      case 'familia1':
        currentSelected = selectedFamily1;
        setSelected = setSelectedFamily1;
        break;
      case 'familia2':
        currentSelected = selectedFamily2;
        setSelected = setSelectedFamily2;
        break;
      default:
        return;
    }

    let newValues: string[];
    if (currentSelected.includes(value)) {
      newValues = currentSelected.filter(v => v !== value);
    } else {
      newValues = [...currentSelected, value];
    }

    setSelected(newValues);
    onFilterChange(type, newValues);
  };

  const handleClearAll = (
    type: string,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();
    
    switch (type) {
      case 'fabrica':
        setSelectedFactory([]);
        break;
      case 'codigo':
        setSelectedCode([]);
        break;
      case 'familia1':
        setSelectedFamily1([]);
        break;
      case 'familia2':
        setSelectedFamily2([]);
        break;
    }
    
    onFilterChange(type, []);
  };

  const toggleDropdown = (key: string) => {
    setDropdownStates(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof dropdownStates]
    }));
  };

  const getSelectedValuesForType = (type: string): string[] => {
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
  };

  const getOptionCount = (option: string, filterKey: string) => {
    const isAvailable = filteredOptions?.[filterKey]?.includes(option);
    return isAvailable ? 1 : 0;
  };

  const filterOptionsBySearch = (options: string[], searchTerm: string) => {
    if (!searchTerm) return options;
    const terms = searchTerm.toLowerCase().split(' ').filter(term => term.length > 0);
    return options.filter(option => 
      terms.every(term => option.toLowerCase().includes(term))
    );
  };

  const renderFilterDropdown = (
    label: string,
    options: string[],
    filterKey: string
  ) => {
    const selected = getSelectedValuesForType(filterKey);
    const availableOptions = filteredOptions?.[filterKey as keyof typeof filteredOptions] || initialOptions?.[filterKey as keyof typeof initialOptions] || [];
    const sortedOptions = [...new Set([...availableOptions, ...selected])].sort((a, b) => a.localeCompare(b));
    const hasSelectedItems = selected.length > 0;

    const getButtonText = () => {
      if (selected.length === 0) return label;
      if (selected.length === 1) return `${label}: ${selected[0]}`;
      return `${label} (${selected.length})`;
    };

    return (
      <div className="relative" ref={el => dropdownRefs.current[filterKey] = el}>
        <Button
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleDropdown(filterKey);
          }}
          className={`w-[180px] justify-between ${hasSelectedItems ? 'border-green-800 bg-green-50/50' : ''}`}
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
};

export default ForecastFilters;
