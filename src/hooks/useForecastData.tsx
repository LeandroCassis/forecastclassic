
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

// Helper function to safely parse JSON
const safeJsonParse = async (response: Response) => {
  const text = await response.text();
  try {
    // Check if the response starts with HTML
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.error('Received HTML instead of JSON:', text.substring(0, 100));
      toast({
        title: "Erro de conexão",
        description: "O servidor parece não estar online. Por favor, verifique se 'npm start' foi executado para iniciar o servidor.",
        variant: "destructive"
      });
      throw new Error('Servidor não está online. Execute "npm start" para iniciar o servidor.');
    }
    return JSON.parse(text);
  } catch (error) {
    console.error('JSON parse error:', error, 'Response was:', text.substring(0, 200));
    throw error;
  }
};

export const useForecastData = (produto: string) => {
  // Product data query
  const { data: productData, isError: productError } = useQuery({
    queryKey: ['product', produto],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/produtos/${encodeURIComponent(produto)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return safeJsonParse(response);
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
        const response = await fetch('/api/grupos');
        if (!response.ok) throw new Error('Network response was not ok');
        return safeJsonParse(response);
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
        const response = await fetch('/api/month-configurations');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await safeJsonParse(response);
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
        const response = await fetch(`/api/forecast-values/${encodeURIComponent(productData.codigo)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await safeJsonParse(response);
        
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
