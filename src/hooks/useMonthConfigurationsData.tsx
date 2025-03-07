
import { config } from '@/config/env';
import { useApiQuery } from './useApiQuery';
import { MonthConfiguration } from './useForecastTypes';

/**
 * Hook to fetch month configurations, which rarely changes
 */
export const useMonthConfigurationsData = () => {
  return useApiQuery(
    ['month_configurations'],
    `${config.API_URL}/month-configurations`,
    {
      select: (data: any[]) => {
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
      }
    }
  );
};
