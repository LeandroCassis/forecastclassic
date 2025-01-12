import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

export const useForecastData = (produto: string) => {
  // Product data query
  const { data: productData, isError: productError } = useQuery({
    queryKey: ['product', produto],
    queryFn: async () => {
      console.log('Fetching product data for:', produto);
      const { data, error } = await supabase
        .from('produtos')
        .select('id')
        .eq('produto', produto)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching product:', error);
        throw error;
      }
      console.log('Product data fetched:', data);
      return data;
    }
  });

  // Grupos query
  const { data: grupos, isError: gruposError } = useQuery({
    queryKey: ['grupos'],
    queryFn: async () => {
      console.log('Fetching grupos');
      const { data, error } = await supabase
        .from('grupos')
        .select('*')
        .order('ano')
        .order('id_tipo');
      
      if (error) {
        console.error('Error fetching grupos:', error);
        throw error;
      }
      console.log('Grupos fetched:', data);
      return data;
    }
  });

  // Month configurations query
  const { data: monthConfigurations, isError: configError } = useQuery({
    queryKey: ['month_configurations'],
    queryFn: async () => {
      console.log('Fetching month configurations');
      const { data, error } = await supabase
        .from('month_configurations')
        .select('*')
        .order('ano')
        .order('mes');
      
      if (error) {
        console.error('Error fetching month configurations:', error);
        throw error;
      }

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
      
      console.log('Month configurations processed:', configByYear);
      return configByYear;
    }
  });

  // Forecast values query
  const { data: forecastValues, isError: forecastError } = useQuery({
    queryKey: ['forecast_values', productData?.id],
    queryFn: async () => {
      if (!productData?.id) {
        console.log('No product ID available yet, skipping forecast values fetch');
        return {};
      }
      
      console.log('Fetching forecast values for product ID:', productData.id);
      const { data, error } = await supabase
        .from('forecast_values')
        .select('*')
        .eq('produto_id', productData.id);
      
      if (error) {
        console.error('Error fetching forecast values:', error);
        throw error;
      }
      
      const transformedData: { [key: string]: { [key: string]: number } } = {};
      
      data.forEach(row => {
        const key = `${row.ano}-${row.id_tipo}`;
        if (!transformedData[key]) {
          transformedData[key] = {};
        }
        transformedData[key][row.mes] = row.valor;
      });
      
      console.log('Forecast values processed:', transformedData);
      return transformedData;
    },
    enabled: !!productData?.id
  });

  const hasErrors = productError || gruposError || configError || forecastError;

  return {
    productData,
    grupos,
    monthConfigurations,
    forecastValues,
    hasErrors
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