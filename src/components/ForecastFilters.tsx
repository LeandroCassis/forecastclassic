import React, { useState, useEffect } from 'react';
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

interface ForecastFiltersProps {
  onFilterChange: (filterType: string, values: string[]) => void;
}

const ForecastFilters: React.FC<ForecastFiltersProps> = ({ onFilterChange }) => {
  const [openStates, setOpenStates] = useState<{ [key: string]: boolean }>({});
  const [selectedValues, setSelectedValues] = useState<{ [key: string]: string[] }>({});
  const [filterOptions, setFilterOptions] = useState<{ [key: string]: string[] }>({});

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const { data: produtos, error } = await supabase
          .from('produtos')
          .select('empresa, marca, fabrica, familia1, familia2, produto');

        if (error) throw error;

        const options: { [key: string]: Set<string> } = {
          empresa: new Set(),
          marca: new Set(),
          fabrica: new Set(),
          familia1: new Set(),
          familia2: new Set(),
          produto: new Set(),
        };

        produtos.forEach(produto => {
          options.empresa.add(produto.empresa);
          options.marca.add(produto.marca);
          options.fabrica.add(produto.fabrica);
          options.familia1.add(produto.familia1);
          options.familia2.add(produto.familia2);
          options.produto.add(produto.produto);
        });

        setFilterOptions({
          empresa: Array.from(options.empresa),
          marca: Array.from(options.marca),
          fabrica: Array.from(options.fabrica),
          familia1: Array.from(options.familia1),
          familia2: Array.from(options.familia2),
          produto: Array.from(options.produto),
        });
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

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

  const renderFilterGroup = (
    label: string, 
    filterType: string
  ) => {
    const options = filterOptions[filterType] || [];
    const selectedCount = selectedValues[filterType]?.length || 0;
    const allSelected = selectedCount === options.length;
    const someSelected = selectedCount > 0 && selectedCount < options.length;

    return (
      <Popover open={openStates[filterType]} onOpenChange={(open) => 
        setOpenStates(prev => ({ ...prev, [filterType]: open }))
      }>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between border-blue-200 bg-white hover:bg-blue-50/50 hover:border-blue-300 transition-all duration-300"
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