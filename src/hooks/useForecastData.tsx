import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

export const useForecastData = (produto: string) => {
  // Product data query
  const { data: productData } = useQuery({
    queryKey: ['product', produto],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produtos')
        .select('id')
        .eq('produto', produto)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  // Grupos query
  const { data: grupos } = useQuery({
    queryKey: ['grupos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grupos')
        .select('*')
        .order('ano')
        .order('id_tipo');
      
      if (error) throw error;
      return data;
    }
  });

  // Month configurations query
  const { data: monthConfigurations } = useQuery({
    queryKey: ['month_configurations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('month_configurations')
        .select('*')
        .order('ano')
        .order('mes');
      
      if (error) throw error;

      const configByYear: { [key: string]: { [key: string]: MonthConfiguration } } = {};
      data.forEach(config => {
        if (!configByYear[config.ano]) {
          configByYear[config.ano] = {};
        }
        configByYear[config.ano][config.mes] = {
          mes: config.mes,
          pct_atual: config.pct_atual,
          realizado: config.realizado
        };
      });
      
      return configByYear;
    }
  });

  // Forecast values query
  const { data: forecastValues } = useQuery({
    queryKey: ['forecast_values', productData?.id],
    queryFn: async () => {
      if (!productData?.id) return {};
      
      const { data, error } = await supabase
        .from('forecast_values')
        .select('*')
        .eq('produto_id', productData.id);
      
      if (error) throw error;
      
      const transformedData: { [key: string]: { [key: string]: number } } = {};
      
      data.forEach(row => {
        const key = `${row.ano}-${row.id_tipo}`;
        if (!transformedData[key]) {
          transformedData[key] = {};
        }
        transformedData[key][row.mes] = row.valor;
      });
      
      return transformedData;
    },
    enabled: !!productData?.id
  });

  return {
    productData,
    grupos,
    monthConfigurations,
    forecastValues
  };
};

export interface MonthConfiguration {
  mes: string;
  pct_atual: number;
  realizado: boolean;
}

export interface Grupo {
  ano: number;
  id_tipo: number;
  tipo: string;
}