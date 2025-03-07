
import { useQuery } from '@tanstack/react-query';
import { config } from '@/config/env';

export const useForecastData = (produto: string) => {
  // Product data query
  const { data: productData, isError: productError } = useQuery({
    queryKey: ['product', produto],
    queryFn: async () => {
      try {
        console.log('Fetching product details for:', produto);
        const response = await fetch(`${config.API_URL}/produtos/${encodeURIComponent(produto)}`);
        
        if (!response.ok) {
          console.error(`Error fetching product: ${response.status} ${response.statusText}`);
          throw new Error('Network response was not ok');
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error(`Invalid content type: ${contentType}`);
          throw new Error(`Expected JSON but got ${contentType}`);
        }
        
        const data = await response.json();
        console.log('Product details fetched:', data);
        return data;
      } catch (error) {
        console.error('Exception in product fetch:', error);
        throw error;
      }
    },
    staleTime: Infinity, // Data won't become stale
    gcTime: Infinity, // Keep in cache indefinitely
    retry: 1
  });

  // Grupos query - this data rarely changes
  const { data: grupos, isError: gruposError } = useQuery({
    queryKey: ['grupos'],
    queryFn: async () => {
      try {
        const response = await fetch(`${config.API_URL}/grupos`);
        
        if (!response.ok) {
          console.error(`Error fetching grupos: ${response.status} ${response.statusText}`);
          throw new Error('Network response was not ok');
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error(`Invalid content type: ${contentType}`);
          throw new Error(`Expected JSON but got ${contentType}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Exception in grupos fetch:', error);
        throw error;
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1
  });

  // Month configurations query - this data rarely changes
  const { data: monthConfigurations, isError: configError } = useQuery({
    queryKey: ['month_configurations'],
    queryFn: async () => {
      try {
        const response = await fetch(`${config.API_URL}/month-configurations`);
        
        if (!response.ok) {
          console.error(`Error fetching month configurations: ${response.status} ${response.statusText}`);
          throw new Error('Network response was not ok');
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error(`Invalid content type: ${contentType}`);
          throw new Error(`Expected JSON but got ${contentType}`);
        }
        
        const data = await response.json();
        const configByYear: { [key: string]: { [key: string]: MonthConfiguration } } = {};
        
        data.forEach((config: any) => {
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
      } catch (error) {
        console.error('Exception in month configurations fetch:', error);
        throw error;
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1
  });

  // Forecast values query
  const { data: forecastValues, isError: forecastError } = useQuery({
    queryKey: ['forecast_values', productData?.codigo],
    queryFn: async () => {
      if (!productData?.codigo) return {};
      
      try {
        const response = await fetch(`${config.API_URL}/forecast-values/${encodeURIComponent(productData.codigo)}`);
        
        if (!response.ok) {
          console.error(`Error fetching forecast values: ${response.status} ${response.statusText}`);
          throw new Error('Network response was not ok');
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error(`Invalid content type: ${contentType}`);
          throw new Error(`Expected JSON but got ${contentType}`);
        }
        
        const data = await response.json();
        
        const transformedData: { [key: string]: { [key: string]: number } } = {};
        data.forEach((row: any) => {
          const key = `${row.ano}-${row.id_tipo}`;
          if (!transformedData[key]) {
            transformedData[key] = {};
          }
          transformedData[key][row.mes] = row.valor;
        });
        
        return transformedData;
      } catch (error) {
        console.error('Exception in forecast values fetch:', error);
        throw error;
      }
    },
    enabled: !!productData?.codigo,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1
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
