import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ForecastFiltersProps {
  onFilterChange: (filterType: string, values: string[]) => void;
}

const ForecastFilters: React.FC<ForecastFiltersProps> = ({ onFilterChange }) => {
  // State for each filter (arrays for multi-select)
  const [selectedCodigos, setSelectedCodigos] = useState<string[]>([]);
  const [selectedEmpresas, setSelectedEmpresas] = useState<string[]>([]);
  const [selectedProdutos, setSelectedProdutos] = useState<string[]>([]);
  const [selectedMarcas, setSelectedMarcas] = useState<string[]>([]);
  const [selectedFabricas, setSelectedFabricas] = useState<string[]>([]);
  const [selectedFamilias1, setSelectedFamilias1] = useState<string[]>([]);
  const [selectedFamilias2, setSelectedFamilias2] = useState<string[]>([]);

  // Open state for each popover
  const [openStates, setOpenStates] = useState({
    codigo: false,
    empresa: false,
    produto: false,
    marca: false,
    fabrica: false,
    familia1: false,
    familia2: false,
  });

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
    staleTime: 30000,
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

    let filteredProducts = [...allProducts];

    // Apply cascading filters
    if (selectedCodigos.length > 0) {
      filteredProducts = filteredProducts.filter(p => selectedCodigos.includes(p.codigo));
    }
    if (selectedEmpresas.length > 0) {
      filteredProducts = filteredProducts.filter(p => selectedEmpresas.includes(p.empresa));
    }
    if (selectedProdutos.length > 0) {
      filteredProducts = filteredProducts.filter(p => selectedProdutos.includes(p.produto));
    }
    if (selectedMarcas.length > 0) {
      filteredProducts = filteredProducts.filter(p => selectedMarcas.includes(p.marca));
    }
    if (selectedFabricas.length > 0) {
      filteredProducts = filteredProducts.filter(p => selectedFabricas.includes(p.fabrica));
    }
    if (selectedFamilias1.length > 0) {
      filteredProducts = filteredProducts.filter(p => selectedFamilias1.includes(p.familia1));
    }
    if (selectedFamilias2.length > 0) {
      filteredProducts = filteredProducts.filter(p => selectedFamilias2.includes(p.familia2));
    }

    // Get unique values for each filter
    return {
      codigos: [...new Set(allProducts.map(p => p.codigo))].filter(Boolean).sort(),
      empresas: [...new Set(filteredProducts.map(p => p.empresa))].filter(Boolean).sort(),
      produtos: [...new Set(filteredProducts.map(p => p.produto))].filter(Boolean).sort(),
      marcas: [...new Set(filteredProducts.map(p => p.marca))].filter(Boolean).sort(),
      fabricas: [...new Set(filteredProducts.map(p => p.fabrica))].filter(Boolean).sort(),
      familias1: [...new Set(filteredProducts.map(p => p.familia1))].filter(Boolean).sort(),
      familias2: [...new Set(filteredProducts.map(p => p.familia2))].filter(Boolean).sort(),
    };
  }, [allProducts, selectedCodigos, selectedEmpresas, selectedProdutos, selectedMarcas, selectedFabricas, selectedFamilias1, selectedFamilias2]);

  const handleFilterChange = (filterType: string, value: string) => {
    let newValues: string[] = [];
    switch (filterType) {
      case 'codigo':
        newValues = selectedCodigos.includes(value)
          ? selectedCodigos.filter(item => item !== value)
          : [...selectedCodigos, value];
        setSelectedCodigos(newValues);
        break;
      case 'empresa':
        newValues = selectedEmpresas.includes(value)
          ? selectedEmpresas.filter(item => item !== value)
          : [...selectedEmpresas, value];
        setSelectedEmpresas(newValues);
        break;
      case 'produto':
        newValues = selectedProdutos.includes(value)
          ? selectedProdutos.filter(item => item !== value)
          : [...selectedProdutos, value];
        setSelectedProdutos(newValues);
        break;
      case 'marca':
        newValues = selectedMarcas.includes(value)
          ? selectedMarcas.filter(item => item !== value)
          : [...selectedMarcas, value];
        setSelectedMarcas(newValues);
        break;
      case 'fabrica':
        newValues = selectedFabricas.includes(value)
          ? selectedFabricas.filter(item => item !== value)
          : [...selectedFabricas, value];
        setSelectedFabricas(newValues);
        break;
      case 'familia1':
        newValues = selectedFamilias1.includes(value)
          ? selectedFamilias1.filter(item => item !== value)
          : [...selectedFamilias1, value];
        setSelectedFamilias1(newValues);
        break;
      case 'familia2':
        newValues = selectedFamilias2.includes(value)
          ? selectedFamilias2.filter(item => item !== value)
          : [...selectedFamilias2, value];
        setSelectedFamilias2(newValues);
        break;
    }
    onFilterChange(filterType, newValues);
  };

  const renderMultiSelect = (
    type: string,
    label: string,
    options: string[],
    selectedValues: string[],
  ) => (
    <Popover 
      open={openStates[type as keyof typeof openStates]}
      onOpenChange={(open) => setOpenStates(prev => ({ ...prev, [type]: open }))}
    >
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            openStates[type as keyof typeof openStates] && "ring-2 ring-ring ring-offset-2"
          )}
        >
          <span className="flex gap-1 flex-wrap">
            {selectedValues.length === 0 ? (
              label
            ) : (
              selectedValues.map(value => (
                <Badge 
                  key={value}
                  variant="secondary" 
                  className="mr-1 mb-1"
                >
                  {value}
                </Badge>
              ))
            )}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={`Buscar ${label.toLowerCase()}...`} />
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {(options || []).map((option) => (
              <CommandItem
                key={option}
                value={option}
                onSelect={() => handleFilterChange(type, option)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedValues.includes(option) ? "opacity-100" : "opacity-0"
                  )}
                />
                {option}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );

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
      {renderMultiSelect('codigo', 'Código', filterOptions.codigos, selectedCodigos)}
      {renderMultiSelect('empresa', 'Empresa', filterOptions.empresas, selectedEmpresas)}
      {renderMultiSelect('produto', 'Produto', filterOptions.produtos, selectedProdutos)}
      {renderMultiSelect('marca', 'Marca', filterOptions.marcas, selectedMarcas)}
      {renderMultiSelect('fabrica', 'Fábrica', filterOptions.fabricas, selectedFabricas)}
      {renderMultiSelect('familia1', 'Família 1', filterOptions.familias1, selectedFamilias1)}
      {renderMultiSelect('familia2', 'Família 2', filterOptions.familias2, selectedFamilias2)}
    </div>
  );
};

export default ForecastFilters;