import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ForecastTable from '@/components/ForecastTable';
import ForecastFilters from '@/components/ForecastFilters';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Produto {
  produto: string;
  marca: string;
  fabrica: string;
  familia1: string;
  familia2: string;
}

interface Filters {
  empresa: string[];
  marca: string[];
  fabrica: string[];
  familia1: string[];
  familia2: string[];
  produto: string[];
  tipo: string[];
  ano: string[];
}

const getFilteredProducts = (produtos: Produto[] | null, filters: Filters) => {
  if (!produtos) return [];
  
  return produtos.filter(produto => {
    if (filters.marca.length > 0 && !filters.marca.includes(produto.marca)) return false;
    if (filters.fabrica.length > 0 && !filters.fabrica.includes(produto.fabrica)) return false;
    if (filters.familia1.length > 0 && !filters.familia1.includes(produto.familia1)) return false;
    if (filters.familia2.length > 0 && !filters.familia2.includes(produto.familia2)) return false;
    if (filters.produto.length > 0 && !filters.produto.includes(produto.produto)) return false;
    return true;
  });
};

const IndexContent = () => {
  const [filters, setFilters] = useState<Filters>({
    empresa: [],
    marca: [],
    fabrica: [],
    familia1: [],
    familia2: [],
    produto: [],
    tipo: [],
    ano: []
  });

  const [showFilters, setShowFilters] = useState(true);

  const { data: produtos, isLoading } = useQuery({
    queryKey: ['produtos'],
    queryFn: async () => {
      console.log('Fetching produtos from Azure...');
      const { data, error } = await supabase.functions.invoke('azure-db', {
        body: { action: 'getProdutos' }
      });
      
      if (error) {
        console.error('Error fetching produtos:', error);
        throw error;
      }
      
      console.log('Fetched produtos:', data);
      return data as Produto[];
    }
  });

  const handleFilterChange = (filterType: keyof Filters, values: string[]) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: values
    }));
    console.log('Filter updated:', { filterType, values });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const filteredProducts = getFilteredProducts(produtos, filters);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-[95%] mx-auto py-8">
          <div className="flex items-center justify-center h-40">
            <div className="text-blue-600 animate-pulse">Carregando produtos...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-[95%] mx-auto py-8 space-y-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-blue-100/50 p-8 transition-all duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Forecast e Vendas
              </h1>
              <p className="text-slate-500 mt-2">
                Visualização e edição de previsões de vendas
              </p>
            </div>
            <Button
              variant="outline"
              onClick={toggleFilters}
              className="flex items-center gap-2 rounded-xl border-blue-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300"
            >
              {showFilters ? (
                <>
                  Ocultar Filtros
                  <ChevronUp className="h-4 w-4 text-blue-500" />
                </>
              ) : (
                <>
                  Exibir Filtros
                  <ChevronDown className="h-4 w-4 text-blue-500" />
                </>
              )}
            </Button>
          </div>
        </div>
        
        {showFilters && <ForecastFilters onFilterChange={handleFilterChange} />}
        
        <div className="space-y-8">
          {filteredProducts.map(produto => (
            <div 
              key={produto.produto}
              className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-blue-100/50 transition-all duration-300 hover:shadow-xl"
            >
              <h2 className="text-2xl font-semibold text-blue-900 mb-6">{produto.produto}</h2>
              <ForecastTable 
                produto={produto.produto}
                anoFiltro={filters.ano}
                tipoFiltro={filters.tipo}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <IndexContent />
    </QueryClientProvider>
  );
};

export default Index;