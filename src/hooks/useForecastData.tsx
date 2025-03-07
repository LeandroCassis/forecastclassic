
import { useProductData } from './useProductData';
import { useGruposData } from './useGruposData';
import { useMonthConfigurationsData } from './useMonthConfigurationsData';
import { useForecastValuesData } from './useForecastValuesData';
import { MonthConfiguration, Grupo } from './useForecastTypes';

export const useForecastData = (produto: string) => {
  // Use our specialized hooks to fetch the data
  const { data: productData, isError: productError } = useProductData(produto);
  const { data: grupos, isError: gruposError } = useGruposData();
  const { data: monthConfigurations, isError: configError } = useMonthConfigurationsData();
  const { data: forecastValues, isError: forecastError } = useForecastValuesData(productData?.codigo);

  const hasErrors = productError || gruposError || configError || forecastError;

  return {
    productData,
    grupos,
    monthConfigurations,
    forecastValues,
    hasErrors
  };
};

// Re-export types for consumers
export { MonthConfiguration, Grupo };
