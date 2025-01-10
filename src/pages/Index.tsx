import React from 'react';
import ForecastTable from '@/components/ForecastTable';

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-4">
      <div className="max-w-[95%] mx-auto space-y-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-slate-100">
          <h1 className="text-xl font-semibold text-slate-700">Forecast e Vendas</h1>
          <p className="text-sm text-slate-500">Visualização e edição de previsões de vendas</p>
        </div>
        
        <div className="space-y-4">
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
        </div>
      </div>
    </div>
  );
};

export default Index;