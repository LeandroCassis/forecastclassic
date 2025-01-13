import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ForecastFiltersProps {
  onFilterChange: (filterType: string, values: string[]) => void;
}

const ForecastFilters: React.FC<ForecastFiltersProps> = ({ onFilterChange }) => {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedFactory, setSelectedFactory] = useState<string>('');
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [selectedFamily1, setSelectedFamily1] = useState<string>('');
  const [selectedFamily2, setSelectedFamily2] = useState<string>('');

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
        codigo: [...new Set(data.map(item => item.codigo))],
        fabrica: [...new Set(data.map(item => item.fabrica))],
        familia1: [...new Set(data.map(item => item.familia1))],
        familia2: [...new Set(data.map(item => item.familia2))]
      };

      console.log('Filter options fetched:', uniqueOptions);
      return uniqueOptions;
    }
  });

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    onFilterChange('ano', value ? [value] : []);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    onFilterChange('tipo', value ? [value] : []);
  };

  const handleFactoryChange = (value: string) => {
    setSelectedFactory(value);
    onFilterChange('fabrica', value ? [value] : []);
  };

  const handleCodeChange = (value: string) => {
    setSelectedCode(value);
    onFilterChange('codigo', value ? [value] : []);
  };

  const handleFamily1Change = (value: string) => {
    setSelectedFamily1(value);
    onFilterChange('familia1', value ? [value] : []);
  };

  const handleFamily2Change = (value: string) => {
    setSelectedFamily2(value);
    onFilterChange('familia2', value ? [value] : []);
  };

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg shadow-sm border border-slate-200">
      <Select value={selectedYear} onValueChange={handleYearChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="2024">2024</SelectItem>
          <SelectItem value="2025">2025</SelectItem>
          <SelectItem value="2026">2026</SelectItem>
        </SelectContent>
      </Select>

      <Select value={selectedType} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="REAL">REAL</SelectItem>
          <SelectItem value="REVISÃO">REVISÃO</SelectItem>
          <SelectItem value="ORÇAMENTO">ORÇAMENTO</SelectItem>
        </SelectContent>
      </Select>

      <Select value={selectedFactory} onValueChange={handleFactoryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Fábrica" />
        </SelectTrigger>
        <SelectContent>
          {filterOptions?.fabrica.map((fabrica) => (
            <SelectItem key={fabrica} value={fabrica}>{fabrica}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedCode} onValueChange={handleCodeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Cód Produto" />
        </SelectTrigger>
        <SelectContent>
          {filterOptions?.codigo.map((codigo) => (
            <SelectItem key={codigo} value={codigo}>{codigo}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedFamily1} onValueChange={handleFamily1Change}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Família 1" />
        </SelectTrigger>
        <SelectContent>
          {filterOptions?.familia1.map((familia) => (
            <SelectItem key={familia} value={familia}>{familia}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedFamily2} onValueChange={handleFamily2Change}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Família 2" />
        </SelectTrigger>
        <SelectContent>
          {filterOptions?.familia2.map((familia) => (
            <SelectItem key={familia} value={familia}>{familia}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ForecastFilters;