import React, { useState, useMemo } from 'react';
import ForecastTable from '@/components/ForecastTable';
import ProductHeader from '@/components/ProductHeader';
import FilterComponent from '@/components/FilterComponent';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

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
      return data;
    }
  });

  const filters = useMemo(() => {
    if (!produtos) return {
      marcas: [],
      fabricas: [],
      familia1: [],
      familia2: [],
      produtos: []
    };

    return {
      marcas: [...new Set(produtos.map(p => p.marca))],
      fabricas: [...new Set(produtos.map(p => p.fabrica))],
      familia1: [...new Set(produtos.map(p => p.familia1))],
      familia2: [...new Set(produtos.map(p => p.familia2))],
      produtos: [...new Set(produtos.map(p => p.produto))]
    };
  }, [produtos]);

  const filteredProdutos = useMemo(() => {
    if (!produtos) return [];
    
    return produtos.filter(produto => {
      const matchesMarca = selectedMarcas.length === 0 || selectedMarcas.includes(produto.marca);
      const matchesFabrica = selectedFabricas.length === 0 || selectedFabricas.includes(produto.fabrica);
      const matchesFamilia1 = selectedFamilia1.length === 0 || selectedFamilia1.includes(produto.familia1);
      const matchesFamilia2 = selectedFamilia2.length === 0 || selectedFamilia2.includes(produto.familia2);
      const matchesProduto = selectedProdutos.length === 0 || selectedProdutos.includes(produto.produto);

      return matchesMarca && matchesFabrica && matchesFamilia1 && matchesFamilia2 && matchesProduto;
    });
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