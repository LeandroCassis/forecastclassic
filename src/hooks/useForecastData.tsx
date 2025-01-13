import { useQuery } from '@tanstack/react-query';
import { query } from '@/integrations/azure/client';

export const useForecastData = (produto: string) => {
  // Product data query
  const { data: productData, isError: productError } = useQuery({
    queryKey: ['product', produto],
    queryFn: async () => {
      console.log('Fetching product data for:', produto);
      try {
        const data = await query<{ id: string }>(
          'SELECT id FROM produtos WHERE produto = @param0',
          [produto]
        );
        
        if (!data.length) {
          console.log('No product found');
          return null;
        }
        console.log('Product data fetched:', data[0]);
        return data[0];
      } catch (error) {
        console.error('Exception in product fetch:', error);
        throw error;
      }
    },
    retry: 3
  });

  // Grupos query
  const { data: grupos, isError: gruposError } = useQuery({
    queryKey: ['grupos'],
    queryFn: async () => {
      console.log('Fetching grupos');
      try {
        const data = await query(
          'SELECT * FROM grupos ORDER BY ano, id_tipo'
        );
        console.log('Grupos fetched:', data);
        return data;
      } catch (error) {
        console.error('Exception in grupos fetch:', error);
        throw error;
      }
    },
    retry: 3
  });

  // Month configurations query
  const { data: monthConfigurations, isError: configError } = useQuery({
    queryKey: ['month_configurations'],
    queryFn: async () => {
      console.log('Fetching month configurations');
      try {
        const data = await query(
          'SELECT * FROM month_configurations ORDER BY ano, mes'
        );

        const configByYear: { [key: string]: { [key: string]: MonthConfiguration } } = {};
        data.forEach(config => {
          if (!configByYear[config.ano]) {
            configByYear[config.ano] = {};
          }
          configByYear[config.ano][config.mes] = {
            mes: config.mes,
            pct_atual: config.pct_atual,
            realizado: config.realizado === 1 // Convert bit to boolean
          };
        });
        
        console.log('Month configurations processed:', configByYear);
        return configByYear;
      } catch (error) {
        console.error('Exception in month configurations fetch:', error);
        throw error;
      }
    },
    retry: 3
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
      try {
        const data = await query(
          'SELECT * FROM forecast_values WHERE produto_id = @param0',
          [productData.id]
        );
        
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
      } catch (error) {
        console.error('Exception in forecast values fetch:', error);
        throw error;
      }
    },
    enabled: !!productData?.id,
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
}