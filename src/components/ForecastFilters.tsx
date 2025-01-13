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
import { X, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);

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

  const handleMultiSelect = (value: string, currentSelected: string[], setter: (values: string[]) => void, type: string) => {
    let newValues: string[];
    
    if (value === 'Todos') {
      newValues = currentSelected.includes('Todos') ? [] : ['Todos'];
    } else {
      if (currentSelected.includes('Todos')) {
        newValues = [value];
      } else {
        newValues = currentSelected.includes(value)
          ? currentSelected.filter(v => v !== value)
          : [...currentSelected, value];
      }
    }
    
    setter(newValues);
    onFilterChange(type, newValues);
  };

  const renderFilterDropdown = (
    label: string,
    options: string[],
    selected: string[],
    onSelect: (value: string) => void,
    isOpen: boolean,
    setIsOpen: (open: boolean) => void
  ) => (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-[180px] justify-between"
      >
        {label}
        <span className="ml-2">{selected.length > 0 ? `(${selected.length})` : ''}</span>
      </Button>
      {isOpen && (
        <div className="absolute z-50 w-[200px] mt-2 bg-white border rounded-md shadow-lg">
          <div className="p-2 space-y-1">
            {options.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  checked={selected.includes(option)}
                  onCheckedChange={() => onSelect(option)}
                />
                <span>{option}</span>
              </div>
            ))}
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
          ['2024', '2025', '2026'],
          selectedYear,
          (value) => handleMultiSelect(value, selectedYear, setSelectedYear, 'ano'),
          isYearOpen,
          setIsYearOpen
        )}

        {renderFilterDropdown(
          'Tipo',
          ['REAL', 'REVISÃO', 'ORÇAMENTO'],
          selectedType,
          (value) => handleMultiSelect(value, selectedType, setSelectedType, 'tipo'),
          isTypeOpen,
          setIsTypeOpen
        )}

        <div className="space-y-2">
          <Select
            value={selectedFactory[0] || ''}
            onValueChange={(value) => handleMultiSelect(value, selectedFactory, setSelectedFactory, 'fabrica')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Fábrica" />
            </SelectTrigger>
            <SelectContent>
              {filteredOptions?.fabrica.map((fabrica) => (
                <SelectItem key={fabrica} value={fabrica}>
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedFactory.includes(fabrica)}
                      className="mr-2"
                    />
                    {fabrica}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap">
            {selectedFactory.map((value) => (
              <Badge key={value} variant="secondary" className="mr-1 mb-1">
                {value}
                <Button
                  variant="ghost"
                  className="h-4 w-4 p-0 ml-2"
                  onClick={() => handleMultiSelect(value, selectedFactory, setSelectedFactory, 'fabrica')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Select
            value={selectedCode[0] || ''}
            onValueChange={(value) => handleMultiSelect(value, selectedCode, setSelectedCode, 'codigo')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Cód Produto" />
            </SelectTrigger>
            <SelectContent>
              {filteredOptions?.codigo.map((codigo) => (
                <SelectItem key={codigo} value={codigo}>
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedCode.includes(codigo)}
                      className="mr-2"
                    />
                    {codigo}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap">
            {selectedCode.map((value) => (
              <Badge key={value} variant="secondary" className="mr-1 mb-1">
                {value}
                <Button
                  variant="ghost"
                  className="h-4 w-4 p-0 ml-2"
                  onClick={() => handleMultiSelect(value, selectedCode, setSelectedCode, 'codigo')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Select
            value={selectedFamily1[0] || ''}
            onValueChange={(value) => handleMultiSelect(value, selectedFamily1, setSelectedFamily1, 'familia1')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Família 1" />
            </SelectTrigger>
            <SelectContent>
              {filteredOptions?.familia1.map((familia) => (
                <SelectItem key={familia} value={familia}>
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedFamily1.includes(familia)}
                      className="mr-2"
                    />
                    {familia}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap">
            {selectedFamily1.map((value) => (
              <Badge key={value} variant="secondary" className="mr-1 mb-1">
                {value}
                <Button
                  variant="ghost"
                  className="h-4 w-4 p-0 ml-2"
                  onClick={() => handleMultiSelect(value, selectedFamily1, setSelectedFamily1, 'familia1')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Select
            value={selectedFamily2[0] || ''}
            onValueChange={(value) => handleMultiSelect(value, selectedFamily2, setSelectedFamily2, 'familia2')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Família 2" />
            </SelectTrigger>
            <SelectContent>
              {filteredOptions?.familia2.map((familia) => (
                <SelectItem key={familia} value={familia}>
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedFamily2.includes(familia)}
                      className="mr-2"
                    />
                    {familia}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap">
            {selectedFamily2.map((value) => (
              <Badge key={value} variant="secondary" className="mr-1 mb-1">
                {value}
                <Button
                  variant="ghost"
                  className="h-4 w-4 p-0 ml-2"
                  onClick={() => handleMultiSelect(value, selectedFamily2, setSelectedFamily2, 'familia2')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastFilters;
