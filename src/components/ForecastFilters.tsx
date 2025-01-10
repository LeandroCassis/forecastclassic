import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface ForecastFiltersProps {
  onFilterChange: (filterType: string, values: string[]) => void;
}

const ForecastFilters: React.FC<ForecastFiltersProps> = ({ onFilterChange }) => {
  const handleCheckboxChange = (filterType: string, value: string, checked: boolean, allValues: string[]) => {
    if (value === 'all') {
      onFilterChange(filterType, checked ? allValues : []);
    } else {
      onFilterChange(filterType, checked ? [value] : []);
    }
  };

  const renderFilterGroup = (
    label: string, 
    filterType: string, 
    options: { value: string; label: string }[]
  ) => {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <div className="space-y-2 rounded-md border p-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={`${filterType}-all`}
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
          <div className="space-y-2">
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox 
                  id={`${filterType}-${option.value}`}
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
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm border border-slate-100">
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