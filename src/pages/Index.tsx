import React from 'react';
import ForecastTable from '@/components/ForecastTable';
import ProductHeader from '@/components/ProductHeader';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const Index = () => {
  const { data: produtos, isLoading } = useQuery({
    queryKey: ['produtos'],
    queryFn: async () => {
      console.log('Fetching produtos from Supabase...');
      const { data, error } = await supabase
        .from('produtos')
        .select('produto')
        .order('produto');
      
      if (error) {
        console.error('Error fetching produtos:', error);
        throw error;
      }
      
      console.log('Fetched produtos:', data);
      return data.map(p => p.produto);
    }
  });

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
        </div>
        
        <div className="space-y-8">
          {produtos?.map(produto => (
            <div key={produto} className="space-y-0 animate-fade-in">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">{produto}</h2>
              <ProductHeader produto={produto} />
              <ForecastTable produto={produto} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;