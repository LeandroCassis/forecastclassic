import React, { useState, useMemo } from 'react';
import ForecastTable from '@/components/ForecastTable';
import ProductHeader from '@/components/ProductHeader';
import FilterComponent from '@/components/FilterComponent';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface Produto {
  produto: string;
  marca: string;
  fabrica: string;
  familia1: string;
  familia2: string;
}

const Index = () => {
  const [selectedMarcas, setSelectedMarcas] = useState<string[]>([]);
  const [selectedFabricas, setSelectedFabricas] = useState<string[]>([]);
  const [selectedFamilia1, setSelectedFamilia1] = useState<string[]>([]);
  const [selectedFamilia2, setSelectedFamilia2] = useState<string[]>([]);
  const [selectedProdutos, setSelectedProdutos] = useState<string[]>([]);

  const { data: produtos, isLoading } = useQuery({
    queryKey: ['produtos'],
    queryFn: async () => {
      console.log('Fetching produtos from Supabase...');
      const { data, error } = await supabase
        .from('produtos')
        .select('produto, marca, fabrica, familia1, familia2');
      
      if (error) {
        console.error('Error fetching produtos:', error);
        throw error;
      }
      
      console.log('Fetched produtos:', data);
      return data as Produto[];
    }
  });

  const getFilteredProducts = (
    allProducts: Produto[] | null,
    marcas: string[],
    fabricas: string[],
    familia1: string[],
    familia2: string[],
    produtos: string[]
  ) => {
    if (!allProducts) return [];
    
    return allProducts.filter(produto => {
      const matchesMarca = marcas.length === 0 || marcas.includes(produto.marca);
      const matchesFabrica = fabricas.length === 0 || fabricas.includes(produto.fabrica);
      const matchesFamilia1 = familia1.length === 0 || familia1.includes(produto.familia1);
      const matchesFamilia2 = familia2.length === 0 || familia2.includes(produto.familia2);
      const matchesProduto = produtos.length === 0 || produtos.includes(produto.produto);

      return matchesMarca && matchesFabrica && matchesFamilia1 && matchesFamilia2 && matchesProduto;
    });
  };

  const filteredProdutos = useMemo(() => {
    return getFilteredProducts(
      produtos,
      selectedMarcas,
      selectedFabricas,
      selectedFamilia1,
      selectedFamilia2,
      selectedProdutos
    );
  }, [produtos, selectedMarcas, selectedFabricas, selectedFamilia1, selectedFamilia2, selectedProdutos]);

  // Calculate available options for each filter based on other selections
  const filters = useMemo(() => {
    if (!produtos) return {
      marcas: [],
      fabricas: [],
      familia1: [],
      familia2: [],
      produtos: []
    };

    // Filter products based on current selections
    const filteredForMarcas = getFilteredProducts(produtos, [], selectedFabricas, selectedFamilia1, selectedFamilia2, selectedProdutos);
    const filteredForFabricas = getFilteredProducts(produtos, selectedMarcas, [], selectedFamilia1, selectedFamilia2, selectedProdutos);
    const filteredForFamilia1 = getFilteredProducts(produtos, selectedMarcas, selectedFabricas, [], selectedFamilia2, selectedProdutos);
    const filteredForFamilia2 = getFilteredProducts(produtos, selectedMarcas, selectedFabricas, selectedFamilia1, [], selectedProdutos);
    const filteredForProdutos = getFilteredProducts(produtos, selectedMarcas, selectedFabricas, selectedFamilia1, selectedFamilia2, []);

    return {
      marcas: [...new Set(filteredForMarcas.map(p => p.marca))],
      fabricas: [...new Set(filteredForFabricas.map(p => p.fabrica))],
      familia1: [...new Set(filteredForFamilia1.map(p => p.familia1))],
      familia2: [...new Set(filteredForFamilia2.map(p => p.familia2))],
      produtos: [...new Set(filteredForProdutos.map(p => p.produto))]
    };
  }, [produtos, selectedMarcas, selectedFabricas, selectedFamilia1, selectedFamilia2, selectedProdutos]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-[95%] mx-auto py-8">
          <div className="flex items-center justify-center h-40">
            <div className="text-blue-600">Carregando produtos...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-[95%] mx-auto py-8">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-blue-100/50 p-8 mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Forecast e Vendas
            </h1>
            <p className="text-slate-500 mt-2">
              Visualização e edição de previsões de vendas
            </p>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-4">
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
        </div>
        
        <div className="space-y-8">
          {filteredProdutos.map(produto => (
            <div key={produto.produto} className="space-y-0 animate-fade-in">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">{produto.produto}</h2>
              <ProductHeader produto={produto.produto} />
              <ForecastTable produto={produto.produto} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;