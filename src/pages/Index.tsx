import React, { useState } from 'react';
import ForecastTable from '@/components/ForecastTable';
import ForecastFilters from '@/components/ForecastFilters';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Index = () => {
  const [filters, setFilters] = useState({
    empresa: '',
    marca: '',
    fabrica: '',
    familia1: '',
    familia2: '',
    produto: '',
    tipo: '',
    ano: ''
  });

  const [showFilters, setShowFilters] = useState(true);

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    console.log('Filter updated:', { filterType, value });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-4">
      <div className="max-w-[95%] mx-auto space-y-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-700">Forecast e Vendas</h1>
              <p className="text-sm text-slate-500">Visualização e edição de previsões de vendas</p>
            </div>
            <Button
              variant="outline"
              onClick={toggleFilters}
              className="flex items-center gap-2"
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
        
        <div className="space-y-4">
          {filters.produto ? (
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-100">
              <h2 className="text-lg font-medium text-slate-700 mb-3">{filters.produto}</h2>
              <ForecastTable produto={filters.produto} />
            </div>
          ) : (
            <>
              <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-100">
                <h2 className="text-lg font-medium text-slate-700 mb-3">VIOLÃO 12323</h2>
                <ForecastTable produto="VIOLÃO 12323" />
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-100">
                <h2 className="text-lg font-medium text-slate-700 mb-3">VIOLÃO 344334</h2>
                <ForecastTable produto="VIOLÃO 344334" />
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-100">
                <h2 className="text-lg font-medium text-slate-700 mb-3">VIOLÃO TRTRTRR</h2>
                <ForecastTable produto="VIOLÃO TRTRTRR" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;