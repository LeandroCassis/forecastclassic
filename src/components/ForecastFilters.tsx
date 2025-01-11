import React, { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';

interface ForecastFiltersProps {
  onFilterChange: (filterType: string, values: string[]) => void;
}

const ForecastFilters: React.FC<ForecastFiltersProps> = ({ onFilterChange }) => {
  const [openStates, setOpenStates] = useState<{ [key: string]: boolean }>({});
  const [selectedValues, setSelectedValues] = useState<{ [key: string]: string[] }>({});
  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({});

  // Fetch produtos data
  const { data: produtosData } = useQuery({
    queryKey: ['produtos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produtos')
        .select('empresa, marca, fabrica, familia1, familia2, produto')
        .order('empresa');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch grupos data
  const { data: gruposData } = useQuery({
    queryKey: ['grupos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grupos')
        .select('tipo, ano')
        .order('ano');
      
      if (error) throw error;
      return data;
    }
  });

  const getUniqueValues = (field: string): { value: string; label: string }[] => {
    if (!produtosData) return [];
    
    const uniqueSet = new Set(produtosData.map(item => item[field as keyof typeof item]));
    return Array.from(uniqueSet).map(value => ({
      value: value as string,
      label: value as string
    }));
  };

  const getGruposValues = (field: 'tipo' | 'ano'): { value: string; label: string }[] => {
    if (!gruposData) return [];
    
    const uniqueSet = new Set(gruposData.map(item => String(item[field])));
    return Array.from(uniqueSet).map(value => ({
      value: value,
      label: value
    }));
  };

  const handleCheckboxChange = (filterType: string, value: string, checked: boolean, allValues: string[]) => {
    let newValues: string[];
    
    if (value === 'all') {
      newValues = checked ? allValues : [];
    } else {
      const currentValues = selectedValues[filterType] || [];
      if (checked) {
        newValues = [...currentValues, value];
      } else {
        newValues = currentValues.filter(v => v !== value);
      }
    }
    
    setSelectedValues(prev => ({
      ...prev,
      [filterType]: newValues
    }));
    onFilterChange(filterType, newValues);
  };

  const handleSearchChange = (filterType: string, value: string) => {
    setSearchTerms(prev => ({
      ...prev,
      [filterType]: value.toLowerCase()
    }));
  };

  const filterOptions = (options: { value: string; label: string }[], filterType: string) => {
    const searchTerm = searchTerms[filterType] || '';
    return options.filter(option => 
      option.label.toLowerCase().includes(searchTerm)
    );
  };

  const renderFilterGroup = (
    label: string, 
    filterType: string, 
    options: { value: string; label: string }[]
  ) => {
    const selectedCount = selectedValues[filterType]?.length || 0;
    const filteredOptions = filterOptions(options, filterType);
    const allSelected = selectedCount === options.length;
    const someSelected = selectedCount > 0 && selectedCount < options.length;

    return (
      <Popover open={openStates[filterType]} onOpenChange={(open) => 
        setOpenStates(prev => ({ ...prev, [filterType]: open }))
      }>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between border-slate-200 bg-white hover:bg-slate-100"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-slate-900">{label}</span>
              {selectedCount > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                  {selectedCount}
                </span>
              )}
            </div>
            {openStates[filterType] ? (
              <ChevronUp className="h-4 w-4 opacity-50" />
            ) : (
              <ChevronDown className="h-4 w-4 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="start">
          <div className="p-2 border-b">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`${filterType}-all`}
                checked={allSelected}
                onCheckedChange={(checked) => 
                  handleCheckboxChange(
                    filterType, 
                    'all', 
                    checked as boolean, 
                    options.map(opt => opt.value)
                  )
                }
              />
              <label 
                htmlFor={`${filterType}-all`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Selecionar Todos
              </label>
            </div>
          </div>
          <div className="p-2 border-b">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-slate-500" />
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchTerms[filterType] || ''}
                onChange={(e) => handleSearchChange(filterType, e.target.value)}
                className="h-8"
              />
            </div>
          </div>
          <ScrollArea className="h-[200px] p-2">
            <div className="space-y-2">
              {filteredOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`${filterType}-${option.value}`}
                    checked={selectedValues[filterType]?.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange(filterType, option.value, checked as boolean, [])
                    }
                  />
                  <label 
                    htmlFor={`${filterType}-${option.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm border border-slate-100">
      {renderFilterGroup('Empresa', 'empresa', getUniqueValues('empresa'))}
      {renderFilterGroup('Marca', 'marca', getUniqueValues('marca'))}
      {renderFilterGroup('Fábrica', 'fabrica', getUniqueValues('fabrica'))}
      {renderFilterGroup('Família 1', 'familia1', getUniqueValues('familia1'))}
      {renderFilterGroup('Família 2', 'familia2', getUniqueValues('familia2'))}
      {renderFilterGroup('Produto', 'produto', getUniqueValues('produto'))}
      {renderFilterGroup('Tipo', 'tipo', getGruposValues('tipo'))}
      {renderFilterGroup('Ano', 'ano', getGruposValues('ano'))}
    </div>
  );
};

export default ForecastFilters;