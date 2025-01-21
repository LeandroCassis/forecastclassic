import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { MultiSelect } from "react-multi-select-component";

interface ForecastFiltersProps {
  onFilterChange: (filterType: string, values: string[]) => void;
}

interface Option {
  label: string;
  value: string;
}

const ForecastFilters: React.FC<ForecastFiltersProps> = ({ onFilterChange }) => {
  const [selectedFactory, setSelectedFactory] = useState<Option[]>([]);
  const [selectedCode, setSelectedCode] = useState<Option[]>([]);
  const [selectedFamily1, setSelectedFamily1] = useState<Option[]>([]);
  const [selectedFamily2, setSelectedFamily2] = useState<Option[]>([]);

  const { data: initialOptions } = useQuery({
    queryKey: ['initial-filter-options'],
    queryFn: async () => {
      console.log('Fetching initial filter options...');
      const { data, error } = await supabase
        .from('produtos')
        .select('codigo, fabrica, familia1, familia2');

      if (error) throw error;

      const options = {
        codigo: [...new Set(data.map(item => item.codigo))].filter(Boolean),
        fabrica: [...new Set(data.map(item => item.fabrica))].filter(Boolean),
        familia1: [...new Set(data.map(item => item.familia1))].filter(Boolean),
        familia2: [...new Set(data.map(item => item.familia2))].filter(Boolean)
      };

      return options;
    },
    staleTime: Infinity,
    gcTime: Infinity
  });

  const convertToOptions = (values: string[]): Option[] => {
    return values.map(value => ({
      label: value,
      value: value
    }));
  };

  const handleSelectionChange = (selected: Option[], type: string) => {
    const values = selected.map(option => option.value);
    console.log(`${type} selection changed:`, values);
    
    switch (type) {
      case 'fabrica':
        setSelectedFactory(selected);
        break;
      case 'codigo':
        setSelectedCode(selected);
        break;
      case 'familia1':
        setSelectedFamily1(selected);
        break;
      case 'familia2':
        setSelectedFamily2(selected);
        break;
    }
    
    onFilterChange(type, values);
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fábrica
          </label>
          <MultiSelect
            options={convertToOptions(initialOptions?.fabrica || [])}
            value={selectedFactory}
            onChange={(selected) => handleSelectionChange(selected, 'fabrica')}
            labelledBy="Selecione a Fábrica"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Código do Produto
          </label>
          <MultiSelect
            options={convertToOptions(initialOptions?.codigo || [])}
            value={selectedCode}
            onChange={(selected) => handleSelectionChange(selected, 'codigo')}
            labelledBy="Selecione o Código"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Família 1
          </label>
          <MultiSelect
            options={convertToOptions(initialOptions?.familia1 || [])}
            value={selectedFamily1}
            onChange={(selected) => handleSelectionChange(selected, 'familia1')}
            labelledBy="Selecione a Família 1"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Família 2
          </label>
          <MultiSelect
            options={convertToOptions(initialOptions?.familia2 || [])}
            value={selectedFamily2}
            onChange={(selected) => handleSelectionChange(selected, 'familia2')}
            labelledBy="Selecione a Família 2"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ForecastFilters;