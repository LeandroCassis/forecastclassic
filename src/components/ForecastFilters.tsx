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
  
  // Temporary selections that will be applied when clicking outside
  const [tempSelections, setTempSelections] = useState<{
    fabrica: string[],
    codigo: string[],
    familia1: string[],
    familia2: string[]
  }>({
    fabrica: [],
    codigo: [],
    familia1: [],
    familia2: []
  });

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

      return {
        codigo: [...new Set(data.map(item => item.codigo))],
        fabrica: [...new Set(data.map(item => item.fabrica))],
        familia1: [...new Set(data.map(item => item.familia1))],
        familia2: [...new Set(data.map(item => item.familia2))]
      };
    }
  });

  const { data: filteredOptions, refetch: refetchFilteredOptions } = useQuery({
    queryKey: ['filtered-options', selectedFactory, selectedCode, selectedFamily1, selectedFamily2],
    queryFn: async () => {
      let query = supabase.from('produtos').select('codigo, fabrica, familia1, familia2');

      if (selectedFactory.length > 0) {
        query = query.in('fabrica', selectedFactory);
      }
      if (selectedCode.length > 0) {
        query = query.in('codigo', selectedCode);
      }
      if (selectedFamily1.length > 0) {
        query = query.in('familia1', selectedFamily1);
      }
      if (selectedFamily2.length > 0) {
        query = query.in('familia2', selectedFamily2);
      }

      const { data, error } = await query;
      if (error) throw error;

      return {
        fabrica: Array.from(new Set([...data.map(item => item.fabrica), ...selectedFactory])),
        codigo: Array.from(new Set([...data.map(item => item.codigo), ...selectedCode])),
        familia1: Array.from(new Set([...data.map(item => item.familia1), ...selectedFamily1])),
        familia2: Array.from(new Set([...data.map(item => item.familia2), ...selectedFamily2]))
      };
    },
    enabled: !!initialOptions
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.entries(dropdownRefs.current).forEach(([key, ref]) => {
        if (ref && !ref.contains(event.target as Node)) {
          // Apply the temporary selections when closing the dropdown
          if (dropdownStates[key as keyof typeof dropdownStates]) {
            switch (key) {
              case 'fabrica':
                setSelectedFactory(tempSelections.fabrica);
                onFilterChange('fabrica', tempSelections.fabrica);
                break;
              case 'codigo':
                setSelectedCode(tempSelections.codigo);
                onFilterChange('codigo', tempSelections.codigo);
                break;
              case 'familia1':
                setSelectedFamily1(tempSelections.familia1);
                onFilterChange('familia1', tempSelections.familia1);
                break;
              case 'familia2':
                setSelectedFamily2(tempSelections.familia2);
                onFilterChange('familia2', tempSelections.familia2);
                break;
            }
          }
          setDropdownStates(prev => ({ ...prev, [key]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [tempSelections, onFilterChange]);

  const handleMultiSelect = (
    value: string,
    currentSelected: string[],
    type: string,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    let newValues: string[];

    if (event.ctrlKey || event.metaKey) {
      if (currentSelected.includes(value)) {
        newValues = currentSelected.filter(v => v !== value);
      } else {
        newValues = [...currentSelected, value];
      }
    } else {
      if (currentSelected.includes(value)) {
        newValues = currentSelected.filter(v => v !== value);
      } else {
        newValues = [...currentSelected, value];
      }
    }

    // Update temporary selections instead of applying immediately
    setTempSelections(prev => ({
      ...prev,
      [type]: newValues
    }));
  };

  const handleClearAll = (
    type: string,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Clear both temporary and actual selections
    setTempSelections(prev => ({
      ...prev,
      [type]: []
    }));
    
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
    // When opening a dropdown, initialize its temporary selections with current selections
    if (!dropdownStates[key as keyof typeof dropdownStates]) {
      setTempSelections(prev => ({
        ...prev,
        [key]: getSelectedValuesForType(key)
      }));
    }
    
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
    selected: string[],
    filterKey: string
  ) => {
    const sortedOptions = [...options].sort((a, b) => a.localeCompare(b));
    const tempSelected = tempSelections[filterKey as keyof typeof tempSelections];

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
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="flex mb-2">
                <button
                  onClick={(e) => handleClearAll(filterKey, e)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Limpar Seleção
                </button>
              </div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {filterOptionsBySearch(sortedOptions, searchTerms[filterKey]).map((option) => (
                  <div
                    key={option}
                    className={`flex items-center justify-between p-1 hover:bg-gray-100 rounded cursor-pointer ${
                      tempSelected.includes(option) ? 'bg-gray-100' : ''
                    }`}
                    onClick={(e) => handleMultiSelect(option, tempSelected, filterKey, e)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={tempSelected.includes(option)}
                        className="pointer-events-none"
                      />
                      <span className="text-sm font-medium">
                        {option}
                        {tempSelected.includes(option) && (
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
          'Fábrica',
          (filteredOptions?.fabrica || initialOptions?.fabrica || []),
          selectedFactory,
          'fabrica'
        )}

        {renderFilterDropdown(
          'Cód Produto',
          filteredOptions?.codigo || initialOptions?.codigo || [],
          selectedCode,
          'codigo'
        )}

        {renderFilterDropdown(
          'Família 1',
          filteredOptions?.familia1 || initialOptions?.familia1 || [],
          selectedFamily1,
          'familia1'
        )}

        {renderFilterDropdown(
          'Família 2',
          filteredOptions?.familia2 || initialOptions?.familia2 || [],
          selectedFamily2,
          'familia2'
        )}
      </div>
    </div>
  );
};

export default ForecastFilters;
