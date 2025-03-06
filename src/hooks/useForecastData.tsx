
import { useQuery } from '@tanstack/react-query';
import { toast } from "@/hooks/use-toast";

export const useForecastData = (produto: string) => {
  // Product data query
  const { data: productData, isError: productError } = useQuery({
    queryKey: ['product', produto],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/produtos/${encodeURIComponent(produto)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        // Check if response is HTML
        const contentType = response.headers.get('content-type') || '';
        const text = await response.text();
        const isHtml = text.trim().startsWith('<!DOCTYPE') || 
                      text.trim().startsWith('<html') || 
                      contentType.includes('text/html');
        
        if (isHtml) {
          console.error('Received HTML instead of JSON for product data');
          throw new Error('Invalid response format (HTML)');
        }
        
        return JSON.parse(text);
      } catch (error) {
        console.error('Exception in product fetch:', error);
        toast({
          title: "Erro ao carregar produto",
          description: `${error}`,
          variant: "destructive"
        });
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
        
        // Check if response is HTML
        const contentType = response.headers.get('content-type') || '';
        const text = await response.text();
        const isHtml = text.trim().startsWith('<!DOCTYPE') || 
                      text.trim().startsWith('<html') || 
                      contentType.includes('text/html');
        
        if (isHtml) {
          console.error('Received HTML instead of JSON for grupos data');
          throw new Error('Invalid response format (HTML)');
        }
        
        return JSON.parse(text);
      } catch (error) {
        console.error('Exception in grupos fetch:', error);
        toast({
          title: "Erro ao carregar grupos",
          description: `${error}`,
          variant: "destructive"
        });
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
        
        // Check if response is HTML
        const contentType = response.headers.get('content-type') || '';
        const text = await response.text();
        const isHtml = text.trim().startsWith('<!DOCTYPE') || 
                      text.trim().startsWith('<html') || 
                      contentType.includes('text/html');
        
        if (isHtml) {
          console.error('Received HTML instead of JSON for month configurations');
          throw new Error('Invalid response format (HTML)');
        }
        
        const data = JSON.parse(text);
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
        toast({
          title: "Erro ao carregar configurações de meses",
          description: `${error}`,
          variant: "destructive"
        });
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
        
        // Check if response is HTML
        const contentType = response.headers.get('content-type') || '';
        const text = await response.text();
        const isHtml = text.trim().startsWith('<!DOCTYPE') || 
                      text.trim().startsWith('<html') || 
                      contentType.includes('text/html');
        
        if (isHtml) {
          console.error('Received HTML instead of JSON for forecast values');
          throw new Error('Invalid response format (HTML)');
        }
        
        const data = JSON.parse(text);
        
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
        toast({
          title: "Erro ao carregar valores de forecast",
          description: `${error}`,
          variant: "destructive"
        });
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
