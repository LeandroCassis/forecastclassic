import React, { useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ForecastFiltersProps {
  onFilterChange: (filterType: string, value: string) => void;
}

const ForecastFilters: React.FC<ForecastFiltersProps> = ({ onFilterChange }) => {
  const [openStates, setOpenStates] = useState<{ [key: string]: boolean }>({});

  // Dados mockados - substituir por dados reais da API
  const filterOptions = {
    empresa: ["Empresa 1", "Empresa 2"],
    marca: ["Marca 1", "Marca 2"],
    fabrica: ["Fábrica 1", "Fábrica 2"],
    familia1: ["Família 1.1", "Família 1.2"],
    familia2: ["Família 2.1", "Família 2.2"],
    produto: ["VIOLÃO 12323", "VIOLÃO 344334", "VIOLÃO TRTRTRR"],
    tipo: ["REAL", "REVISÃO", "ORÇAMENTO"],
    ano: ["2024", "2025", "2026"]
  };

  const [selectedValues, setSelectedValues] = useState<{ [key: string]: string }>({});

  const handleSelect = (type: string, value: string) => {
    setSelectedValues(prev => ({ ...prev, [type]: value }));
    onFilterChange(type, value);
    setOpenStates(prev => ({ ...prev, [type]: false }));
  };

  const renderCombobox = (type: string, label: string, options: string[]) => {
    const isOpen = openStates[type] || false;
    const selectedValue = selectedValues[type] || "";

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <Popover open={isOpen} onOpenChange={(open) => setOpenStates(prev => ({ ...prev, [type]: open }))}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className="w-full justify-between text-left font-normal"
            >
              {selectedValue || `Selecione ${label.toLowerCase()}`}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder={`Pesquisar ${label.toLowerCase()}...`} />
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              <CommandGroup>
                {(options || []).map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => handleSelect(type, option)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValue === option ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm border border-slate-100">
      {renderCombobox("empresa", "Empresa", filterOptions.empresa)}
      {renderCombobox("marca", "Marca", filterOptions.marca)}
      {renderCombobox("fabrica", "Fábrica", filterOptions.fabrica)}
      {renderCombobox("familia1", "Família 1", filterOptions.familia1)}
      {renderCombobox("familia2", "Família 2", filterOptions.familia2)}
      {renderCombobox("produto", "Produto", filterOptions.produto)}
      {renderCombobox("tipo", "Tipo", filterOptions.tipo)}
      {renderCombobox("ano", "Ano", filterOptions.ano)}
    </div>
  );
};

export default ForecastFilters;