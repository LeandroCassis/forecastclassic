import React, { useState } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ForecastTableRow } from './ForecastTableRow';
import { useForecastData } from '@/hooks/useForecastData';
import { useForecastMutations } from '@/hooks/useForecastMutations';
import { useToast } from '@/components/ui/use-toast';

interface ForecastTableProps {
  produto: string;
}

const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

const ForecastTable: React.FC<ForecastTableProps> = ({ produto }) => {
  const [localValues, setLocalValues] = useState<{ [key: string]: { [key: string]: number } }>({});
  const { productData, grupos, monthConfigurations, forecastValues, hasErrors } = useForecastData(produto);
  const { updateMutation } = useForecastMutations(productData?.id);
  const { toast } = useToast();

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

  const handleTotalChange = (ano: number, tipo: string, id_tipo: number, totalValue: string) => {
    console.log('handleTotalChange called with:', { ano, tipo, id_tipo, totalValue });
    
    const numericTotal = parseInt(totalValue) || 0;
    const yearConfig = monthConfigurations?.[ano] || {};
    
    if (!yearConfig) {
      console.log('No month configurations found for year:', ano);
      return;
    }

    // Calculate sum of realized months
    const key = `${ano}-${id_tipo}`;
    const realizedMonthsTotal = months.reduce((sum, month) => {
      if (yearConfig[month]?.realizado && forecastValues?.[key]?.[month]) {
        return sum + (forecastValues[key][month] || 0);
      }
      return sum;
    }, 0);

    console.log('Realized months total:', realizedMonthsTotal);

    // Calculate remaining amount to distribute
    const remainingTotal = numericTotal - realizedMonthsTotal;
    console.log('Remaining total to distribute:', remainingTotal);

    // Calculate sum of percentages for unrealized months
    const openMonthsPercentageSum = Object.values(yearConfig)
      .reduce((sum, config) => !config.realizado ? sum + config.pct_atual : sum, 0);

    console.log('Open months percentage sum:', openMonthsPercentageSum);

    // Distribute remaining total across unrealized months
    months.forEach(month => {
      const monthConfig = yearConfig[month];
      if (monthConfig && !monthConfig.realizado) {
        const adjustedPercentage = monthConfig.pct_atual / openMonthsPercentageSum;
        const newValue = Number((remainingTotal * adjustedPercentage).toFixed(1));
        
        console.log(`Setting value for ${month}:`, { adjustedPercentage, newValue });
        
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

  if (hasErrors) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load forecast data. Please try again later.",
    });
    return (
      <div className="flex items-center justify-center h-40 bg-white rounded-2xl">
        <div className="text-red-500">Error loading data. Please try again later.</div>
      </div>
    );
  }

  if (!grupos || !monthConfigurations) return (
    <div className="flex items-center justify-center h-40 bg-white rounded-2xl">
      <div className="text-slate-500">Carregando dados...</div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-green-600 to-blue-700 hover:from-blue-600 hover:to-blue-700">
              <TableHead className="text-white font-medium w-[100px] min-w-[100px] text-left py-3 border-r border-blue-500/30">ANO</TableHead>
              <TableHead className="text-white font-medium w-[120px] min-w-[120px] text-left py-3 border-r border-blue-500/30">TIPO</TableHead>
              {months.map(month => (
                <TableHead 
                  key={month} 
                  className="text-white font-medium w-[100px] min-w-[100px] text-right py-3 border-r border-blue-500/30"
                >
                  {month}
                </TableHead>
              ))}
              <TableHead className="text-white font-medium w-[120px] min-w-[120px] text-right py-3">TOTAL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grupos.map((grupo) => (
              <ForecastTableRow
                key={`${grupo.ano}-${grupo.id_tipo}`}
                ano={grupo.ano}
                tipo={grupo.tipo}
                id_tipo={grupo.id_tipo}
                yearConfig={monthConfigurations[grupo.ano] || {}}
                getValue={getValue}
                handleValueChange={handleValueChange}
                handleBlur={handleBlur}
                handleTotalChange={handleTotalChange}
                calculateTotal={calculateTotal}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ForecastTable;
