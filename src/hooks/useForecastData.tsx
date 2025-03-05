
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

export const useForecastData = (produto: string) => {
  // Product data query with proper caching
  const { data: productData, isError: productError } = useQuery({
    queryKey: ['product', produto],
    queryFn: async () => {
      console.log('Fetching product data for:', produto);
      try {
        const { data, error } = await supabase
          .from('produtos')
          .select('codigo')
          .eq('produto', produto)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching product:', error);
          throw error;
        }
        console.log('Product data fetched:', data);
        return data;
      } catch (error) {
        console.error('Exception in product fetch:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 3
  });

  // Grupos query with longer cache time since this rarely changes
  const { data: grupos, isError: gruposError } = useQuery({
    queryKey: ['grupos'],
    queryFn: async () => {
      console.log('Fetching grupos');
      try {
        const { data, error } = await supabase
          .from('grupos')
          .select('ano, id_tipo, tipo, code')
          .order('ano')
          .order('id_tipo');
        
        if (error) {
          console.error('Error fetching grupos:', error);
          throw error;
        }
        console.log('Grupos fetched:', data);
        return data;
      } catch (error) {
        console.error('Exception in grupos fetch:', error);
        throw error;
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour cache
    retry: 3
  });

  // Month configurations query with longer cache
  const { data: monthConfigurations, isError: configError } = useQuery({
    queryKey: ['month_configurations'],
    queryFn: async () => {
      console.log('Fetching month configurations');
      try {
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
      } catch (error) {
        console.error('Exception in month configurations fetch:', error);
        throw error;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes cache
    retry: 3
  });

  // Forecast values query specific to the product
  const { data: forecastValues, isError: forecastError } = useQuery({
    queryKey: ['forecast_values', productData?.codigo],
    queryFn: async () => {
      if (!productData?.codigo) {
        console.log('No product codigo available yet, skipping forecast values fetch');
        return {};
      }
      
      console.log('Fetching forecast values for product codigo:', productData.codigo);
      try {
        const { data, error } = await supabase
          .from('forecast_values')
          .select('*')
          .eq('produto_codigo', productData.codigo);
        
        if (error) {
          console.error('Error fetching forecast values:', error);
          throw error;
        }
        
        const transformedData: { [key: string]: { [key: string]: number } } = {};
        
        data.forEach(row => {
          // Join with grupos table info using ano and id_tipo
          const key = `${row.ano}-${row.id_tipo}`;
          if (!transformedData[key]) {
            transformedData[key] = {};
          }
          transformedData[key][row.mes] = row.valor;
        });
        
        console.log('Forecast values processed:', transformedData);
        return transformedData;
      } catch (error) {
        console.error('Exception in forecast values fetch:', error);
        throw error;
      }
    },
    enabled: !!productData?.codigo,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 3
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
  code: string;
}
