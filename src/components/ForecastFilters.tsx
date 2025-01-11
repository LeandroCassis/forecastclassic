import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ForecastFiltersProps {
  onFilterChange: (filterType: string, values: string[]) => void;
}

const ForecastFilters: React.FC<ForecastFiltersProps> = ({ onFilterChange }) => {
  const [openStates, setOpenStates] = useState<{ [key: string]: boolean }>({});
  const [selectedValues, setSelectedValues] = useState<{ [key: string]: string[] }>({});

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
    filterType: string, 
    options: { value: string; label: string }[]
  ) => {
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
          <ScrollArea className="h-[200px] p-2">
            <div className="space-y-2">
              {options.map((option) => (
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
      {renderFilterGroup('Empresa', 'empresa', [
        { value: 'empresa1', label: 'Empresa 1' },
        { value: 'empresa2', label: 'Empresa 2' },
      ])}

      {renderFilterGroup('Marca', 'marca', [
        { value: 'marca1', label: 'Marca 1' },
        { value: 'marca2', label: 'Marca 2' },
      ])}

      {renderFilterGroup('Fábrica', 'fabrica', [
        { value: 'fabrica1', label: 'Fábrica 1' },
        { value: 'fabrica2', label: 'Fábrica 2' },
      ])}

      {renderFilterGroup('Família 1', 'familia1', [
        { value: 'familia1_1', label: 'Família 1.1' },
        { value: 'familia1_2', label: 'Família 1.2' },
      ])}

      {renderFilterGroup('Família 2', 'familia2', [
        { value: 'familia2_1', label: 'Família 2.1' },
        { value: 'familia2_2', label: 'Família 2.2' },
      ])}

      {renderFilterGroup('Produto', 'produto', [
        { value: 'VIOLÃO 12323', label: 'VIOLÃO 12323' },
        { value: 'VIOLÃO 344334', label: 'VIOLÃO 344334' },
        { value: 'VIOLÃO TRTRTRR', label: 'VIOLÃO TRTRTRR' },
      ])}

      {renderFilterGroup('Tipo', 'tipo', [
        { value: 'REAL', label: 'REAL' },
        { value: 'REVISÃO', label: 'REVISÃO' },
        { value: 'ORÇAMENTO', label: 'ORÇAMENTO' },
      ])}

      {renderFilterGroup('Ano', 'ano', [
        { value: '2024', label: '2024' },
        { value: '2025', label: '2025' },
        { value: '2026', label: '2026' },
      ])}
    </div>
  );
};

export default ForecastFilters;