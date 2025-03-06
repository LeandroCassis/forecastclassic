
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { shouldAutoRefresh } from '@/services/authService';

// Helper function to safely parse JSON with HTML detection
const safeJsonParse = async (response: Response) => {
  const text = await response.text();
  try {
    // Check if the response starts with HTML
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.error('Received HTML instead of JSON:', text.substring(0, 100));
      toast({
        title: "Servidor iniciando",
        description: "O servidor está iniciando. Por favor, aguarde alguns segundos.",
        variant: "default"
      });
      
      // Limited auto refresh based on counter
      if (shouldAutoRefresh()) {
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      } else {
        toast({
          title: "Limite de tentativas",
          description: "O servidor não respondeu após várias tentativas. Tente recarregar manualmente a página.",
          variant: "destructive"
        });
      }
      
      throw new Error('Servidor iniciando. Aguarde alguns segundos.');
    }
    return JSON.parse(text);
  } catch (error) {
    if (error.message === 'Servidor iniciando. Aguarde alguns segundos.') {
      throw error;
    }
    console.error('JSON parse error:', error, 'Response was:', text.substring(0, 200));
    throw error;
  }
};

export const useForecastData = (produto: string) => {
  // First, check if server is running
  const { data: serverStatus, isError: serverError } = useQuery({
    queryKey: ['server_health'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/health');
        if (!response.ok) throw new Error('Server not responding');
        return safeJsonParse(response);
      } catch (error) {
        console.error('Server health check failed:', error);
        // Limited auto refresh
        if (shouldAutoRefresh()) {
          setTimeout(() => window.location.reload(), 10000);
        }
        throw error;
      }
    },
    retry: 1,
    retryDelay: 3000
  });

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
    enabled: !serverError,
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
    enabled: !serverError,
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
    enabled: !serverError,
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
    enabled: !!productData?.codigo && !serverError,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1
  });

  const hasErrors = serverError || productError || gruposError || configError || forecastError;

  return {
    productData,
    grupos,
    monthConfigurations,
    forecastValues,
    hasErrors,
    serverStatus
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
