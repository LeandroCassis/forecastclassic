import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

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
      console.log('Fetching initial filter options...');
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

      setFilteredOptions(options);
      return options;
    },
    gcTime: Infinity,
    staleTime: Infinity
  });

  const [filteredOptions, setFilteredOptions] = useState<{
    codigo: string[];
    fabrica: string[];
    familia1: string[];
    familia2: string[];
  } | null>(null);

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

  const handleMultiSelect = (value: string, type: string) => {
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

    const newValues = currentSelected.includes(value)
      ? currentSelected.filter(v => v !== value)
      : [...currentSelected, value];

    setSelected(newValues);
    onFilterChange(type, newValues);
  };

  const handleSelectAll = (type: string, options: string[]) => {
    let setSelected: React.Dispatch<React.SetStateAction<string[]>>;
    let currentSelected: string[];

    switch (type) {
      case 'fabrica':
        setSelected = setSelectedFactory;
        currentSelected = selectedFactory;
        break;
      case 'codigo':
        setSelected = setSelectedCode;
        currentSelected = selectedCode;
        break;
      case 'familia1':
        setSelected = setSelectedFamily1;
        currentSelected = selectedFamily1;
        break;
      case 'familia2':
        setSelected = setSelectedFamily2;
        currentSelected = selectedFamily2;
        break;
      default:
        return;
    }

    const newValues = currentSelected.length === options.length ? [] : options;
    setSelected(newValues);
    onFilterChange(type, newValues);
  };

  const renderFilterDropdown = (label: string, type: string) => {
    const options = filteredOptions?.[type as keyof typeof filteredOptions] || 
                   initialOptions?.[type as keyof typeof initialOptions] || [];
    const selected = type === 'fabrica' ? selectedFactory :
                    type === 'codigo' ? selectedCode :
                    type === 'familia1' ? selectedFamily1 : selectedFamily2;
    
    const filteredItems = options.filter(option => 
      option.toLowerCase().includes(searchTerms[type].toLowerCase())
    );

    return (
      <div className="relative" ref={el => dropdownRefs.current[type] = el}>
        <Button
          variant="outline"
          onClick={() => setDropdownStates(prev => ({ ...prev, [type]: !prev[type] }))}
          className={cn(
            "w-full justify-between",
            selected.length > 0 && "border-blue-500 bg-blue-50/50"
          )}
        >
          <span className="truncate">
            {selected.length > 0 
              ? `${label} (${selected.length})`
              : label}
          </span>
          {dropdownStates[type as keyof typeof dropdownStates] 
            ? <ChevronUp className="h-4 w-4" />
            : <ChevronDown className="h-4 w-4" />}
        </Button>

        {dropdownStates[type as keyof typeof dropdownStates] && (
          <div className="absolute z-50 w-[300px] mt-2 bg-white border rounded-lg shadow-lg">
            <div className="p-3">
              <div className="flex items-center space-x-2 mb-3">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Pesquisar..."
                  value={searchTerms[type]}
                  onChange={(e) => setSearchTerms(prev => ({
                    ...prev,
                    [type]: e.target.value
                  }))}
                  className="h-8"
                />
              </div>

              <div className="mb-2">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={selected.length === options.length}
                    onClick={() => handleSelectAll(type, options)}
                  />
                  <span className="text-sm">Selecionar Todos</span>
                </label>
              </div>

              <div className="max-h-[200px] overflow-y-auto space-y-1">
                {filteredItems.map((option) => (
                  <label
                    key={option}
                    className={cn(
                      "flex items-center space-x-2 p-1.5 rounded hover:bg-gray-50 cursor-pointer",
                      selected.includes(option) && "bg-blue-50"
                    )}
                  >
                    <Checkbox
                      checked={selected.includes(option)}
                      onClick={() => handleMultiSelect(option, type)}
                    />
                    <span className="text-sm">{option}</span>
                  </label>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderFilterDropdown('Fábrica', 'fabrica')}
        {renderFilterDropdown('Código', 'codigo')}
        {renderFilterDropdown('Família 1', 'familia1')}
        {renderFilterDropdown('Família 2', 'familia2')}
      </div>
    </div>
  );
};

export default ForecastFilters;