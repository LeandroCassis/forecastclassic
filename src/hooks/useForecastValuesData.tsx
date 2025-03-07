
import { config } from '@/config/env';
import { useApiQuery } from './useApiQuery';
import { ForecastValuesMap } from './useForecastTypes';

/**
 * Hook to fetch forecast values for a specific product
 */
export const useForecastValuesData = (productCode: string | undefined) => {
  return useApiQuery<any[], ForecastValuesMap>(
    ['forecast_values', productCode],
    `${config.API_URL}/forecast-values/${encodeURIComponent(productCode || '')}`,
    {
      enabled: !!productCode,
      select: (data: any[]) => {
        const transformedData: ForecastValuesMap = {};
        data.forEach((row: any) => {
          const key = `${row.ano}-${row.id_tipo}`;
          if (!transformedData[key]) {
            transformedData[key] = {};
          }
          transformedData[key][row.mes] = row.valor;
        });
        
        return transformedData;
      }
    }
  );
};
