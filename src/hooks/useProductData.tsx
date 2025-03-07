
import { config } from '@/config/env';
import { useApiQuery } from './useApiQuery';
import { ProductData } from './useForecastTypes';

/**
 * Hook to fetch product data for a specific product
 */
export const useProductData = (produto: string) => {
  return useApiQuery<ProductData>(
    ['product', produto],
    `${config.API_URL}/produtos/${encodeURIComponent(produto)}`
  );
};
