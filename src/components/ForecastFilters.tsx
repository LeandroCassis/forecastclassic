import React, { useState } from 'react';
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

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    onFilterChange('ano', value ? [value] : []);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    onFilterChange('tipo', value ? [value] : []);
  };

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg shadow-sm border border-slate-200">
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
    </div>
  );
};

export default ForecastFilters;