
import { config } from '@/config/env';
import { useApiQuery } from './useApiQuery';
import { Grupo } from './useForecastTypes';

/**
 * Hook to fetch groups data, which rarely changes
 */
export const useGruposData = () => {
  return useApiQuery<Grupo[]>(
    ['grupos'],
    `${config.API_URL}/grupos`
  );
};
