
import React from 'react';
import FilterComponent from '@/components/FilterComponent';

interface FilterSectionProps {
  filters: {
    marcas: string[];
    fabricas: string[];
    familia1: string[];
    familia2: string[];
    produtos: string[];
  };
  selectedMarcas: string[];
  selectedFabricas: string[];
  selectedFamilia1: string[];
  selectedFamilia2: string[];
  selectedProdutos: string[];
  setSelectedMarcas: (values: string[]) => void;
  setSelectedFabricas: (values: string[]) => void;
  setSelectedFamilia1: (values: string[]) => void;
  setSelectedFamilia2: (values: string[]) => void;
  setSelectedProdutos: (values: string[]) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  selectedMarcas,
  selectedFabricas,
  selectedFamilia1,
  selectedFamilia2,
  selectedProdutos,
  setSelectedMarcas,
  setSelectedFabricas,
  setSelectedFamilia1,
  setSelectedFamilia2,
  setSelectedProdutos
}) => {
  return (
    <div className="mt-6 grid grid-cols-5 gap-3">
      <FilterComponent 
        label="Marca" 
        options={filters.marcas} 
        selectedValues={selectedMarcas} 
        onSelectionChange={setSelectedMarcas} 
      />
      <FilterComponent 
        label="Fábrica" 
        options={filters.fabricas} 
        selectedValues={selectedFabricas} 
        onSelectionChange={setSelectedFabricas} 
      />
      <FilterComponent 
        label="Família 1" 
        options={filters.familia1} 
        selectedValues={selectedFamilia1} 
        onSelectionChange={setSelectedFamilia1} 
      />
      <FilterComponent 
        label="Família 2" 
        options={filters.familia2} 
        selectedValues={selectedFamilia2} 
        onSelectionChange={setSelectedFamilia2} 
      />
      <FilterComponent 
        label="Produto" 
        options={filters.produtos} 
        selectedValues={selectedProdutos} 
        onSelectionChange={setSelectedProdutos} 
      />
    </div>
  );
};

export default FilterSection;
