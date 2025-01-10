import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ForecastFiltersProps {
  onFilterChange: (filterType: string, value: string) => void;
}

const ForecastFilters: React.FC<ForecastFiltersProps> = ({ onFilterChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm border border-slate-100">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Empresa</label>
        <Select onValueChange={(value) => onFilterChange('empresa', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="empresa1">Empresa 1</SelectItem>
            <SelectItem value="empresa2">Empresa 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Marca</label>
        <Select onValueChange={(value) => onFilterChange('marca', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="marca1">Marca 1</SelectItem>
            <SelectItem value="marca2">Marca 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Fábrica</label>
        <Select onValueChange={(value) => onFilterChange('fabrica', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a fábrica" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fabrica1">Fábrica 1</SelectItem>
            <SelectItem value="fabrica2">Fábrica 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Família 1</label>
        <Select onValueChange={(value) => onFilterChange('familia1', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a família 1" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="familia1_1">Família 1.1</SelectItem>
            <SelectItem value="familia1_2">Família 1.2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Família 2</label>
        <Select onValueChange={(value) => onFilterChange('familia2', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a família 2" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="familia2_1">Família 2.1</SelectItem>
            <SelectItem value="familia2_2">Família 2.2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Tipo</label>
        <Select onValueChange={(value) => onFilterChange('tipo', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="REAL">REAL</SelectItem>
            <SelectItem value="REVISÃO">REVISÃO</SelectItem>
            <SelectItem value="ORÇAMENTO">ORÇAMENTO</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Ano</label>
        <Select onValueChange={(value) => onFilterChange('ano', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o ano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2026">2026</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ForecastFilters;