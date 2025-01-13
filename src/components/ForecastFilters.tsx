import React, { useState, useMemo } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';

interface ForecastFiltersProps {
  onFilterChange: (filterType: string, values: string[]) => void;
}

const ForecastFilters: React.FC<ForecastFiltersProps> = ({ onFilterChange }) => {
  const [openStates, setOpenStates] = useState<{ [key: string]: boolean }>({});
  const [selectedValues, setSelectedValues] = useState<{ [key: string]: string[] }>({});

  // Fetch all products once with caching
  const { data: allProducts, isLoading } = useQuery({
    queryKey: ['produtos-all'],
    queryFn: async () => {
      console.log('Fetching all products...');
      const { data, error } = await supabase
        .from('produtos')
        .select('empresa, marca, fabrica, familia1, familia2, produto')
        .order('produto');
      
      if (error) throw error;
      console.log('All products fetched:', data);
      return data;
    },
    staleTime: 30000, // Cache for 30 seconds
  });

  // Calculate available options based on current selections
  const filterOptions = useMemo(() => {
    if (!allProducts) return {};

    let filteredProducts = allProducts;

    // Apply filters sequentially based on selected values
    const filterTypes = ['empresa', 'marca', 'fabrica', 'familia1', 'familia2', 'produto'];
    
    filterTypes.forEach(filterType => {
      if (selectedValues[filterType]?.length) {
        filteredProducts = filteredProducts.filter(p => 
          selectedValues[filterType].includes(p[filterType])
        );
      }
    });

    // Extract unique values for each filter from filtered products
    return {
      empresa: Array.from(new Set(filteredProducts.map(p => p.empresa))).sort(),
      marca: Array.from(new Set(filteredProducts.map(p => p.marca))).sort(),
      fabrica: Array.from(new Set(filteredProducts.map(p => p.fabrica))).sort(),
      familia1: Array.from(new Set(filteredProducts.map(p => p.familia1))).sort(),
      familia2: Array.from(new Set(filteredProducts.map(p => p.familia2))).sort(),
      produto: Array.from(new Set(filteredProducts.map(p => p.produto))).sort(),
      tipo: ['ORÇAMENTO', 'REAL', 'REVISÃO', 'PO', 'SI'].sort(),
      ano: ['2024', '2025', '2026'].sort(),
    };
  }, [allProducts, selectedValues]);

  const handleCheckboxChange = (filterType: string, value: string, checked: boolean, allValues: string[]) => {
    console.log('Checkbox changed:', { filterType, value, checked });
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

  const renderFilterGroup = (
    label: string, 
    filterType: string
  ) => {
    const options = filterOptions[filterType] || [];
    const selectedCount = selectedValues[filterType]?.length || 0;
    const allSelected = selectedCount === options.length && options.length > 0;
    const someSelected = selectedCount > 0 && selectedCount < options.length;

    return (
      <Popover 
        open={openStates[filterType]} 
        onOpenChange={(open) => setOpenStates(prev => ({ ...prev, [filterType]: open }))}
      >
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className={`w-full justify-between border-blue-200 hover:bg-blue-50/50 hover:border-blue-300 transition-all duration-300
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'bg-white'}`}
            disabled={isLoading}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-blue-900">{label}</span>
              {selectedCount > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {selectedCount}
                </span>
              )}
            </div>
            {openStates[filterType] ? (
              <ChevronUp className="h-4 w-4 text-blue-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-blue-500" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0 border-blue-200 shadow-lg" align="start">
          <div className="p-2 border-b border-blue-100">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`${filterType}-all`}
                checked={allSelected}
                onCheckedChange={(checked) => 
                  handleCheckboxChange(
                    filterType, 
                    'all', 
                    checked as boolean, 
                    options
                  )
                }
              />
              <label 
                htmlFor={`${filterType}-all`}
                className="text-sm font-medium leading-none text-blue-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Selecionar Todos
              </label>
            </div>
          </div>
          <ScrollArea className="h-[200px] p-2">
            <div className="space-y-2">
              {options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`${filterType}-${option}`}
                    checked={selectedValues[filterType]?.includes(option)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange(filterType, option, checked as boolean, [])
                    }
                  />
                  <label 
                    htmlFor={`${filterType}-${option}`}
                    className="text-sm font-medium leading-none text-slate-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option}
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
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 p-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-blue-100/50 transition-all duration-300">
      {renderFilterGroup('Empresa', 'empresa')}
      {renderFilterGroup('Marca', 'marca')}
      {renderFilterGroup('Fábrica', 'fabrica')}
      {renderFilterGroup('Família 1', 'familia1')}
      {renderFilterGroup('Família 2', 'familia2')}
      {renderFilterGroup('Produto', 'produto')}
      {renderFilterGroup('Tipo', 'tipo')}
      {renderFilterGroup('Ano', 'ano')}
    </div>
  );
};

export default ForecastFilters;