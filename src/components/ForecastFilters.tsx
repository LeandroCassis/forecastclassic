import React, { useMemo, useState } from 'react';
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
  // State for each filter
  const [selectedCodigo, setSelectedCodigo] = useState<string>('');
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [selectedProduto, setSelectedProduto] = useState<string>('');
  const [selectedMarca, setSelectedMarca] = useState<string>('');
  const [selectedFabrica, setSelectedFabrica] = useState<string>('');
  const [selectedFamilia1, setSelectedFamilia1] = useState<string>('');
  const [selectedFamilia2, setSelectedFamilia2] = useState<string>('');

  // Fetch all products once with caching
  const { data: allProducts, isLoading } = useQuery({
    queryKey: ['produtos-all'],
    queryFn: async () => {
      console.log('Fetching all products...');
      const { data, error } = await supabase
        .from('produtos')
        .select('codigo, empresa, marca, fabrica, familia1, familia2, produto')
        .order('produto');
      
      if (error) throw error;
      console.log('All products fetched:', data);
      return data || [];
    },
    staleTime: 30000, // Cache for 30 seconds
  });

  // Memoized filter options based on current selections
  const filterOptions = useMemo(() => {
    if (!allProducts) return {
      codigos: [],
      empresas: [],
      produtos: [],
      marcas: [],
      fabricas: [],
      familias1: [],
      familias2: [],
    };

    let filteredProducts = allProducts;

    // Apply cascading filters
    if (selectedCodigo) {
      filteredProducts = filteredProducts.filter(p => p.codigo === selectedCodigo);
    }
    if (selectedEmpresa) {
      filteredProducts = filteredProducts.filter(p => p.empresa === selectedEmpresa);
    }
    if (selectedProduto) {
      filteredProducts = filteredProducts.filter(p => p.produto === selectedProduto);
    }
    if (selectedMarca) {
      filteredProducts = filteredProducts.filter(p => p.marca === selectedMarca);
    }
    if (selectedFabrica) {
      filteredProducts = filteredProducts.filter(p => p.fabrica === selectedFabrica);
    }
    if (selectedFamilia1) {
      filteredProducts = filteredProducts.filter(p => p.familia1 === selectedFamilia1);
    }
    if (selectedFamilia2) {
      filteredProducts = filteredProducts.filter(p => p.familia2 === selectedFamilia2);
    }

    // Get unique values for each filter
    return {
      codigos: [...new Set(allProducts.map(p => p.codigo))].sort(),
      empresas: [...new Set(filteredProducts.map(p => p.empresa))].sort(),
      produtos: [...new Set(filteredProducts.map(p => p.produto))].sort(),
      marcas: [...new Set(filteredProducts.map(p => p.marca))].sort(),
      fabricas: [...new Set(filteredProducts.map(p => p.fabrica))].sort(),
      familias1: [...new Set(filteredProducts.map(p => p.familia1))].sort(),
      familias2: [...new Set(filteredProducts.map(p => p.familia2))].sort(),
    };
  }, [allProducts, selectedCodigo, selectedEmpresa, selectedProduto, selectedMarca, selectedFabrica, selectedFamilia1, selectedFamilia2]);

  const handleFilterChange = (filterType: string, value: string) => {
    // Reset dependent filters when a parent filter changes
    switch (filterType) {
      case 'codigo':
        setSelectedCodigo(value);
        setSelectedEmpresa('');
        setSelectedProduto('');
        setSelectedMarca('');
        setSelectedFabrica('');
        setSelectedFamilia1('');
        setSelectedFamilia2('');
        break;
      case 'empresa':
        setSelectedEmpresa(value);
        setSelectedProduto('');
        setSelectedMarca('');
        setSelectedFabrica('');
        setSelectedFamilia1('');
        setSelectedFamilia2('');
        break;
      case 'produto':
        setSelectedProduto(value);
        setSelectedMarca('');
        setSelectedFabrica('');
        setSelectedFamilia1('');
        setSelectedFamilia2('');
        break;
      case 'marca':
        setSelectedMarca(value);
        setSelectedFabrica('');
        setSelectedFamilia1('');
        setSelectedFamilia2('');
        break;
      case 'fabrica':
        setSelectedFabrica(value);
        setSelectedFamilia1('');
        setSelectedFamilia2('');
        break;
      case 'familia1':
        setSelectedFamilia1(value);
        setSelectedFamilia2('');
        break;
      case 'familia2':
        setSelectedFamilia2(value);
        break;
    }

    // Notify parent component of filter changes
    onFilterChange(filterType, value ? [value] : []);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 p-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-blue-100/50 transition-all duration-300">
        <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
        <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
        <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
        <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
        <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
        <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
        <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-3 p-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-blue-100/50 transition-all duration-300">
      <Select
        value={selectedCodigo}
        onValueChange={(value) => handleFilterChange('codigo', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Código" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos</SelectItem>
          {filterOptions.codigos.map((codigo) => (
            <SelectItem key={codigo} value={codigo}>
              {codigo}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedEmpresa}
        onValueChange={(value) => handleFilterChange('empresa', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Empresa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todas</SelectItem>
          {filterOptions.empresas.map((empresa) => (
            <SelectItem key={empresa} value={empresa}>
              {empresa}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedProduto}
        onValueChange={(value) => handleFilterChange('produto', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Produto" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos</SelectItem>
          {filterOptions.produtos.map((produto) => (
            <SelectItem key={produto} value={produto}>
              {produto}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedMarca}
        onValueChange={(value) => handleFilterChange('marca', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Marca" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todas</SelectItem>
          {filterOptions.marcas.map((marca) => (
            <SelectItem key={marca} value={marca}>
              {marca}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedFabrica}
        onValueChange={(value) => handleFilterChange('fabrica', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Fábrica" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todas</SelectItem>
          {filterOptions.fabricas.map((fabrica) => (
            <SelectItem key={fabrica} value={fabrica}>
              {fabrica}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedFamilia1}
        onValueChange={(value) => handleFilterChange('familia1', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Família 1" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todas</SelectItem>
          {filterOptions.familias1.map((familia1) => (
            <SelectItem key={familia1} value={familia1}>
              {familia1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedFamilia2}
        onValueChange={(value) => handleFilterChange('familia2', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Família 2" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todas</SelectItem>
          {filterOptions.familias2.map((familia2) => (
            <SelectItem key={familia2} value={familia2}>
              {familia2}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ForecastFilters;