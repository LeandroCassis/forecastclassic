import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ForecastTable from '@/components/ForecastTable';
import ForecastFilters from '@/components/ForecastFilters';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

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

const queryClient = new QueryClient();

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

  const handleFilterChange = (filterType: string, values: string[]) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: values
    }));
    console.log('Filter updated:', { filterType, values });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const produtos = ['VIOLÃO 12323', 'VIOLÃO 344334', 'VIOLÃO TRTRTRR'];

  const shouldShowProduct = (produto: string) => {
    if (filters.produto.length > 0 && !filters.produto.includes(produto)) {
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-6">
      <div className="max-w-[95%] mx-auto space-y-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Forecast e Vendas</h1>
              <p className="text-sm text-slate-500 mt-1">Visualização e edição de previsões de vendas</p>
            </div>
            <Button
              variant="outline"
              onClick={toggleFilters}
              className="flex items-center gap-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              {showFilters ? (
                <>
                  Ocultar Filtros
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Exibir Filtros
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
        
        {showFilters && <ForecastFilters onFilterChange={handleFilterChange} />}
        
        <div className="space-y-6">
          {filters.produto.length > 0 ? (
            <>
              {filters.produto.map(produto => (
                <div key={produto} className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-100">
                  <h2 className="text-xl font-medium text-slate-800 mb-4">{produto}</h2>
                  <ForecastTable 
                    produto={produto} 
                    anoFiltro={filters.ano}
                    tipoFiltro={filters.tipo}
                  />
                </div>
              ))}
            </>
          ) : (
            <>
              {produtos.map(produto => shouldShowProduct(produto) && (
                <div key={produto} className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-100">
                  <h2 className="text-xl font-medium text-slate-800 mb-4">{produto}</h2>
                  <ForecastTable 
                    produto={produto} 
                    anoFiltro={filters.ano}
                    tipoFiltro={filters.tipo}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <IndexContent />
    </QueryClientProvider>
  );
};

export default Index;