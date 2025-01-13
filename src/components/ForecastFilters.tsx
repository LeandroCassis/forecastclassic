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
import { X } from "lucide-react";

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

  const { data: filterOptions } = useQuery({
    queryKey: ['filter-options'],
    queryFn: async () => {
      console.log('Fetching filter options');
      const { data, error } = await supabase
        .from('produtos')
        .select('codigo, fabrica, familia1, familia2')
        .order('codigo');

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

  useEffect(() => {
    // Apply cascading filters
    const applyFilters = async () => {
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

      const { data } = await query;
      
      // Update available options based on current selection
      if (data) {
        const filteredProducts = data.map(p => p.produto);
        onFilterChange('produtos', filteredProducts);
      }
    };

    applyFilters();
  }, [selectedFactory, selectedCode, selectedFamily1, selectedFamily2]);

  const handleYearChange = (value: string) => {
    const newValues = value === 'Todos' 
      ? [] 
      : selectedYear.includes(value)
        ? selectedYear.filter(v => v !== value)
        : [...selectedYear, value];
    setSelectedYear(newValues);
    onFilterChange('ano', newValues);
  };

  const handleTypeChange = (value: string) => {
    const newValues = value === 'Todos'
      ? []
      : selectedType.includes(value)
        ? selectedType.filter(v => v !== value)
        : [...selectedType, value];
    setSelectedType(newValues);
    onFilterChange('tipo', newValues);
  };

  const handleFactoryChange = (value: string) => {
    const newValues = value === 'Todos'
      ? []
      : selectedFactory.includes(value)
        ? selectedFactory.filter(v => v !== value)
        : [...selectedFactory, value];
    setSelectedFactory(newValues);
    onFilterChange('fabrica', newValues);
  };

  const handleCodeChange = (value: string) => {
    const newValues = value === 'Todos'
      ? []
      : selectedCode.includes(value)
        ? selectedCode.filter(v => v !== value)
        : [...selectedCode, value];
    setSelectedCode(newValues);
    onFilterChange('codigo', newValues);
  };

  const handleFamily1Change = (value: string) => {
    const newValues = value === 'Todos'
      ? []
      : selectedFamily1.includes(value)
        ? selectedFamily1.filter(v => v !== value)
        : [...selectedFamily1, value];
    setSelectedFamily1(newValues);
    onFilterChange('familia1', newValues);
  };

  const handleFamily2Change = (value: string) => {
    const newValues = value === 'Todos'
      ? []
      : selectedFamily2.includes(value)
        ? selectedFamily2.filter(v => v !== value)
        : [...selectedFamily2, value];
    setSelectedFamily2(newValues);
    onFilterChange('familia2', newValues);
  };

  const renderSelectedBadges = (
    selected: string[],
    onRemove: (value: string) => void
  ) => {
    return selected.map((value) => (
      <Badge
        key={value}
        variant="secondary"
        className="mr-1 mb-1"
      >
        {value}
        <Button
          variant="ghost"
          className="h-4 w-4 p-0 ml-2"
          onClick={() => onRemove(value)}
        >
          <X className="h-3 w-3" />
        </Button>
      </Badge>
    ));
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="flex flex-wrap gap-4">
        <div className="space-y-2">
          <Select value={selectedYear[0] || ''} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex flex-wrap">
            {renderSelectedBadges(selectedYear, handleYearChange)}
          </div>
        </div>

        <div className="space-y-2">
          <Select value={selectedType[0] || ''} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="REAL">REAL</SelectItem>
              <SelectItem value="REVISÃO">REVISÃO</SelectItem>
              <SelectItem value="ORÇAMENTO">ORÇAMENTO</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex flex-wrap">
            {renderSelectedBadges(selectedType, handleTypeChange)}
          </div>
        </div>

        <div className="space-y-2">
          <Select value={selectedFactory[0] || ''} onValueChange={handleFactoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Fábrica" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions?.fabrica.map((fabrica) => (
                <SelectItem key={fabrica} value={fabrica}>{fabrica}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap">
            {renderSelectedBadges(selectedFactory, handleFactoryChange)}
          </div>
        </div>

        <div className="space-y-2">
          <Select value={selectedCode[0] || ''} onValueChange={handleCodeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Cód Produto" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions?.codigo.map((codigo) => (
                <SelectItem key={codigo} value={codigo}>{codigo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap">
            {renderSelectedBadges(selectedCode, handleCodeChange)}
          </div>
        </div>

        <div className="space-y-2">
          <Select value={selectedFamily1[0] || ''} onValueChange={handleFamily1Change}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Família 1" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions?.familia1.map((familia) => (
                <SelectItem key={familia} value={familia}>{familia}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap">
            {renderSelectedBadges(selectedFamily1, handleFamily1Change)}
          </div>
        </div>

        <div className="space-y-2">
          <Select value={selectedFamily2[0] || ''} onValueChange={handleFamily2Change}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Família 2" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions?.familia2.map((familia) => (
                <SelectItem key={familia} value={familia}>{familia}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap">
            {renderSelectedBadges(selectedFamily2, handleFamily2Change)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastFilters;