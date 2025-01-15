import React, { useState } from 'react';
import ForecastTable from '@/components/ForecastTable';
import ForecastFilters from '@/components/ForecastFilters';
import ProductHeader from '@/components/ProductHeader';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface Filters {
  ano: string[];
  tipo: string[];
  fabrica: string[];
  codigo: string[];
  familia1: string[];
  familia2: string[];
  produtos: string[];
}

const Index = () => {
  const [filters, setFilters] = useState<Filters>({
    ano: [],
    tipo: [],
    fabrica: [],
    codigo: [],
    familia1: [],
    familia2: [],
    produtos: []
  });

  const [showFilters, setShowFilters] = useState(true);

  const { data: produtos, isLoading } = useQuery({
    queryKey: ['produtos', filters],
    queryFn: async () => {
      console.log('Fetching produtos from Supabase...');
      let query = supabase
        .from('produtos')
        .select('produto');

      if (filters.fabrica.length > 0) {
        query = query.in('fabrica', filters.fabrica);
      }
      if (filters.codigo.length > 0) {
        query = query.in('codigo', filters.codigo);
      }
      if (filters.familia1.length > 0) {
        query = query.in('familia1', filters.familia1);
      }
      if (filters.familia2.length > 0) {
        query = query.in('familia2', filters.familia2);
      }

      query = query.order('produto');
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching produtos:', error);
        throw error;
      }
      
      console.log('Fetched produtos:', data);
      return data.map(p => p.produto);
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
        {/* Static header section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-blue-100/50 p-8 mb-6">
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
              className={`flex items-center gap-2 rounded-xl border-blue-200 ${showFilters ? 'bg-blue-50/50' : ''}`}
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
        
        {/* Static filters section */}
        {showFilters && (
          <div className="mb-6">
            <ForecastFilters onFilterChange={handleFilterChange} />
          </div>
        )}
        
        {/* Animated products section */}
        <div className="space-y-8">
          {produtos?.map(produto => (
            <div key={produto} className="space-y-0 animate-fade-in">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">{produto}</h2>
              <ProductHeader produto={produto} />
              <ForecastTable 
                produto={produto} 
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

export default Index;