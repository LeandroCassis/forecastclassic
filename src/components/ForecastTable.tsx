import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ForecastData {
  ano: number;
  tipo: string;
  id_tipo: number;
  valores: { [key: string]: number };
}

interface ForecastTableProps {
  produto: string;
  anoFiltro?: string[];
  tipoFiltro?: string[];
}

interface Grupo {
  ano: number;
  id_tipo: number;
  tipo: string;
}

interface MonthConfiguration {
  mes: string;
  pct_atual: number;
  realizado: boolean;
}

const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

const ForecastTable: React.FC<ForecastTableProps> = ({ produto, anoFiltro, tipoFiltro }) => {
  const queryClient = useQueryClient();
  const [localValues, setLocalValues] = useState<{ [key: string]: { [key: string]: number } }>({});

  // Fetch product ID
  const { data: productData, error: productError } = useQuery({
    queryKey: ['product', produto],
    queryFn: async () => {
      console.log('Fetching product data for:', produto);
      const { data, error } = await supabase
        .from('produtos')
        .select('id')
        .eq('produto', produto)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching product:', error);
        throw error;
      }
      console.log('Product data:', data);
      return data;
    }
  });

  // Fetch all grupos
  const { data: grupos, error: gruposError } = useQuery({
    queryKey: ['grupos'],
    queryFn: async () => {
      console.log('Fetching grupos');
      const { data, error } = await supabase
        .from('grupos')
        .select('*')
        .order('ano')
        .order('id_tipo');
      
      if (error) {
        console.error('Error fetching grupos:', error);
        throw error;
      }
      console.log('Grupos data:', data);
      return data as Grupo[];
    }
  });

  // Fetch month configurations
  const { data: monthConfigurations, error: monthConfigError } = useQuery({
    queryKey: ['month_configurations'],
    queryFn: async () => {
      console.log('Fetching month configurations');
      const { data, error } = await supabase
        .from('month_configurations')
        .select('*')
        .order('ano')
        .order('mes');
      
      if (error) {
        console.error('Error fetching month configurations:', error);
        throw error;
      }
      
      const configByYear: { [key: string]: { [key: string]: MonthConfiguration } } = {};
      data.forEach(config => {
        if (!configByYear[config.ano]) {
          configByYear[config.ano] = {};
        }
        configByYear[config.ano][config.mes] = {
          mes: config.mes,
          pct_atual: config.pct_atual,
          realizado: config.realizado
        };
      });
      
      console.log('Month configurations:', configByYear);
      return configByYear;
    }
  });

  // Fetch forecast values
  const { data: forecastValues, error: forecastError } = useQuery({
    queryKey: ['forecast_values', productData?.id],
    queryFn: async () => {
      if (!productData?.id) {
        console.log('No product ID available yet');
        return {};
      }
      
      console.log('Fetching forecast values for product ID:', productData.id);
      const { data, error } = await supabase
        .from('forecast_values')
        .select('*')
        .eq('produto_id', productData.id);
      
      if (error) {
        console.error('Error fetching forecast values:', error);
        throw error;
      }
      
      const transformedData: { [key: string]: { [key: string]: number } } = {};
      
      data.forEach(row => {
        const key = `${row.ano}-${row.id_tipo}`;
        if (!transformedData[key]) {
          transformedData[key] = {};
        }
        transformedData[key][row.mes] = row.valor;
      });
      
      console.log('Transformed forecast values:', transformedData);
      return transformedData;
    },
    enabled: !!productData?.id
  });

  const updateMutation = useMutation({
    mutationFn: async ({ ano, tipo, id_tipo, mes, valor }: { ano: number, tipo: string, id_tipo: number, mes: string, valor: number }) => {
      if (!productData?.id) throw new Error('Product ID not found');

      const { error } = await supabase
        .from('forecast_values')
        .upsert(
          {
            produto_id: productData.id,
            ano,
            tipo,
            id_tipo,
            mes,
            valor
          },
          {
            onConflict: 'produto_id,ano,id_tipo,mes',
            ignoreDuplicates: false
          }
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast_values'] });
    }
  });

  const handleValueChange = (ano: number, tipo: string, id_tipo: number, month: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    const key = `${ano}-${id_tipo}`;
    
    setLocalValues(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [month]: numericValue
      }
    }));
  };

  const handleBlur = (ano: number, tipo: string, id_tipo: number, month: string) => {
    const key = `${ano}-${id_tipo}`;
    const value = localValues[key]?.[month];
    
    if (value !== undefined) {
      updateMutation.mutate({ ano, tipo, id_tipo, mes: month, valor: value });
    }
  };

  const calculateRealizedTotal = (ano: number, id_tipo: number) => {
    const yearConfig = monthConfigurations?.[ano] || {};
    const key = `${ano}-${id_tipo}`;
    
    return months.reduce((sum, month) => {
      if (yearConfig[month]?.realizado) {
        return sum + (getValue(ano, id_tipo, month) || 0);
      }
      return sum;
    }, 0);
  };

  const handleTotalChange = (ano: number, tipo: string, id_tipo: number, totalValue: string) => {
    const numericTotal = parseInt(totalValue) || 0;
    const yearConfig = monthConfigurations?.[ano] || {};
    
    if (!yearConfig) {
      console.log('No month configurations found for year:', ano);
      return;
    }

    // Calculate the minimum allowed total based on realized months
    const realizedTotal = calculateRealizedTotal(ano, id_tipo);
    
    // If the entered total is less than the realized total, use the realized total instead
    const effectiveTotal = Math.max(numericTotal, realizedTotal);
    
    const openMonthsPercentageSum = Object.values(yearConfig)
      .reduce((sum, config) => !config.realizado ? sum + config.pct_atual : sum, 0);

    months.forEach(month => {
      const monthConfig = yearConfig[month];
      if (monthConfig && !monthConfig.realizado) {
        const adjustedPercentage = monthConfig.pct_atual / openMonthsPercentageSum;
        const remainingTotal = effectiveTotal - realizedTotal;
        const newValue = Number((remainingTotal * adjustedPercentage).toFixed(1));
        
        const key = `${ano}-${id_tipo}`;
        setLocalValues(prev => ({
          ...prev,
          [key]: {
            ...(prev[key] || {}),
            [month]: newValue
          }
        }));
        
        updateMutation.mutate({ ano, tipo, id_tipo, mes: month, valor: newValue });
      }
    });
  };

  const getValue = (ano: number, id_tipo: number, month: string) => {
    const key = `${ano}-${id_tipo}`;
    return localValues[key]?.[month] ?? forecastValues?.[key]?.[month] ?? 0;
  };

  const calculateTotal = (ano: number, id_tipo: number) => {
    return Math.round(months.reduce((sum, month) => {
      return sum + (getValue(ano, id_tipo, month) || 0);
    }, 0));
  };

  // Show error states if any query fails
  if (productError || gruposError || monthConfigError || forecastError) {
    return (
      <div className="flex items-center justify-center h-40 bg-white rounded-2xl">
        <div className="text-red-500">Error loading data. Please try again later.</div>
      </div>
    );
  }

  // Show loading state if any query is still loading
  if (!grupos || !monthConfigurations) {
    return (
      <div className="flex items-center justify-center h-40 bg-white rounded-2xl">
        <div className="text-slate-500">Carregando dados...</div>
      </div>
    );
  }

  const filteredGrupos = grupos.filter(grupo => {
    if (anoFiltro && anoFiltro.length > 0 && !anoFiltro.includes(grupo.ano.toString())) {
      return false;
    }
    if (tipoFiltro && tipoFiltro.length > 0 && !tipoFiltro.includes(grupo.tipo)) {
      return false;
    }
    return true;
  });

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-700">
              <TableHead className="text-white font-medium w-[80px] text-left py-3 border-r border-blue-500/30">ANO</TableHead>
              <TableHead className="text-white font-medium w-[100px] text-left py-3 border-r border-blue-500/30">TIPO</TableHead>
              {months.map(month => (
                <TableHead key={month} className="text-white font-medium text-right py-3 border-r border-blue-500/30">{month}</TableHead>
              ))}
              <TableHead className="text-white font-medium text-right py-3">TOTAL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGrupos.map((grupo) => {
              const isEditable = grupo.tipo === 'REVISÃO';
              const total = calculateTotal(grupo.ano, grupo.id_tipo);
              const yearConfig = monthConfigurations[grupo.ano] || {};
              const realizedTotal = calculateRealizedTotal(grupo.ano, grupo.id_tipo);
              
              return (
                <TableRow 
                  key={`${grupo.ano}-${grupo.id_tipo}`}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <TableCell className="font-medium text-left py-2 border-r border-slate-200 bg-white">{grupo.ano}</TableCell>
                  <TableCell className="text-left py-2 border-r border-slate-200 bg-white">{grupo.tipo}</TableCell>
                  {months.map(month => {
                    const isRealized = yearConfig[month]?.realizado;
                    const shouldBeYellow = isRealized && grupo.tipo === 'REVISÃO';
                    return (
                      <TableCell 
                        key={month} 
                        className={`text-right p-0 border-r border-slate-200 
                          ${shouldBeYellow ? 'bg-yellow-50' : 'bg-white'}
                          ${isEditable && !isRealized ? 'bg-blue-50' : ''}
                        `}
                      >
                        {isEditable && !isRealized ? (
                          <input
                            type="number"
                            value={getValue(grupo.ano, grupo.id_tipo, month)}
                            onChange={(e) => handleValueChange(grupo.ano, grupo.tipo, grupo.id_tipo, month, e.target.value)}
                            onBlur={() => handleBlur(grupo.ano, grupo.tipo, grupo.id_tipo, month)}
                            className="w-full h-full py-2 text-right bg-transparent border-0 focus:ring-2 focus:ring-blue-400 focus:outline-none px-3 transition-all"
                          />
                        ) : (
                          <div className="py-2 px-3">
                            {getValue(grupo.ano, grupo.id_tipo, month).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right p-0 bg-white">
                    {isEditable ? (
                      <input
                        type="number"
                        value={total}
                        min={realizedTotal}
                        onChange={(e) => handleTotalChange(grupo.ano, grupo.tipo, grupo.id_tipo, e.target.value)}
                        className="w-full h-full py-2 text-right bg-blue-50 border-0 focus:ring-2 focus:ring-blue-400 focus:outline-none px-3 font-medium transition-all"
                      />
                    ) : (
                      <div className="py-2 px-3 font-medium">
                        {total.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ForecastTable;
