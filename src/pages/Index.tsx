import React from 'react';
import ForecastTable from '@/components/ForecastTable';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[95%] mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Forecast e Vendas</h1>
          <p className="text-gray-500">Visualização e edição de previsões de vendas</p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">VIOLÃO 12323</h2>
            <ForecastTable produto="VIOLÃO 12323" />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">VIOLÃO 344334</h2>
            <ForecastTable produto="VIOLÃO 344334" />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">VIOLÃO TRTRTRR</h2>
            <ForecastTable produto="VIOLÃO TRTRTRR" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;