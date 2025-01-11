import React from 'react';
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

const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

// Add closed months configuration
const closedMonths: { [key: string]: { [key: string]: boolean } } = {
  '2025': {
    'JAN': true, 'FEV': true, 'MAR': true, 'ABR': false, 'MAI': false, 'JUN': false,
    'JUL': false, 'AGO': false, 'SET': false, 'OUT': false, 'NOV': false, 'DEZ': false
  },
  '2026': {
    'JAN': false, 'FEV': false, 'MAR': false, 'ABR': false, 'MAI': false, 'JUN': false,
    'JUL': false, 'AGO': false, 'SET': false, 'OUT': false, 'NOV': false, 'DEZ': false
  }
};

// Distribution percentages for open months
const distributionPercentages: { [key: string]: { [key: string]: number } } = {
  '2025': {
    'JAN': 0.06, 'FEV': 0.07, 'MAR': 0.08, 'ABR': 0.07, 'MAI': 0.19, 'JUN': 0.07,
    'JUL': 0.08, 'AGO': 0.08, 'SET': 0.08, 'OUT': 0.09, 'NOV': 0.08, 'DEZ': 0.05
  },
  '2026': {
    'JAN': 0.06, 'FEV': 0.07, 'MAR': 0.08, 'ABR': 0.07, 'MAI': 0.19, 'JUN': 0.07,
    'JUL': 0.08, 'AGO': 0.08, 'SET': 0.08, 'OUT': 0.09, 'NOV': 0.08, 'DEZ': 0.05
  }
};

const ForecastTable: React.FC<ForecastTableProps> = ({ produto, anoFiltro, tipoFiltro }) => {
  const queryClient = useQueryClient();

  // Fetch product ID based on produto name
  const { data: productData } = useQuery({
    queryKey: ['product', produto],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produtos')
        .select('id')
        .eq('produto', produto)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch all grupos
  const { data: grupos } = useQuery({
    queryKey: ['grupos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grupos')
        .select('*')
        .order('ano')
        .order('id_tipo');
      
      if (error) throw error;
      return data as Grupo[];
    }
  });

  // Fetch forecast values
  const { data: forecastValues } = useQuery({
    queryKey: ['forecast_values', productData?.id],
    queryFn: async () => {
      if (!productData?.id) return {};
      
      const { data, error } = await supabase
        .from('forecast_values')
        .select('*')
        .eq('produto_id', productData.id);
      
      if (error) throw error;
      
      // Transform the data into the format we need
      const transformedData: { [key: string]: { [key: string]: number } } = {};
      
      data.forEach(row => {
        const key = `${row.ano}-${row.id_tipo}`;
        if (!transformedData[key]) {
          transformedData[key] = {};
        }
        transformedData[key][row.mes] = row.valor;
      });
      
      return transformedData;
    },
    enabled: !!productData?.id
  });

  // Update mutation
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

      if (error) {
        console.error('Error updating forecast value:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast_values'] });
    }
  });

  const handleValueChange = (ano: number, tipo: string, id_tipo: number, month: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    updateMutation.mutate({ ano, tipo, id_tipo, mes: month, valor: numericValue });
    console.log('Value updated:', { ano, tipo, id_tipo, month, value });
  };

  const handleTotalChange = (ano: number, tipo: string, id_tipo: number, totalValue: string) => {
    const numericTotal = parseInt(totalValue) || 0;
    const yearClosedMonths = closedMonths[ano.toString()];
    const yearPercentages = distributionPercentages[ano.toString()];
    
    if (!yearPercentages) {
      console.log('No distribution percentages found for year:', ano);
      return;
    }

    // Calculate open months percentage sum and distribute values
    const openMonthsPercentageSum = Object.entries(yearClosedMonths)
      .reduce((sum, [month, isClosed]) => !isClosed ? sum + yearPercentages[month] : sum, 0);

    months.forEach(month => {
      if (!yearClosedMonths[month]) {
        const adjustedPercentage = yearPercentages[month] / openMonthsPercentageSum;
        const key = `${ano}-${id_tipo}`;
        const closedMonthsTotal = Object.entries(yearClosedMonths)
          .reduce((sum, [m, isClosed]) => {
            if (isClosed && forecastValues && forecastValues[key] && forecastValues[key][m]) {
              return sum + (forecastValues[key][m] || 0);
            }
            return sum;
          }, 0);
        
        const remainingTotal = numericTotal - closedMonthsTotal;
        const newValue = Number((remainingTotal * adjustedPercentage).toFixed(1));
        updateMutation.mutate({ ano, tipo, id_tipo, mes: month, valor: newValue });
      }
    });
    
    console.log('Total updated and distributed:', { ano, tipo, id_tipo, totalValue: numericTotal });
  };

  if (!grupos) return <div>Loading...</div>;

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
    <div className="rounded-md border border-table-border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-table-header hover:bg-table-header">
            <TableHead className="text-white font-semibold w-[80px] text-left py-1 border-r border-table-border">ANO</TableHead>
            <TableHead className="text-white font-semibold w-[100px] text-left py-1 border-r border-table-border">TIPO</TableHead>
            {months.map(month => (
              <TableHead key={month} className="text-white font-semibold text-right py-1 border-r border-table-border">{month}</TableHead>
            ))}
            <TableHead className="text-white font-semibold text-right py-1">TOTAL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredGrupos.map((grupo, index) => {
            const isEditable = grupo.tipo === 'REVISÃO';
            const key = `${grupo.ano}-${grupo.id_tipo}`;
            const valores = forecastValues?.[key] || {};
            const total = Object.values(valores).reduce((sum: number, val: number) => sum + (val || 0), 0);
            const isEvenRow = index % 2 === 0;
            
            return (
              <TableRow 
                key={key}
                className={`
                  ${isEvenRow ? 'bg-table-row' : 'bg-table-altRow'}
                  hover:bg-slate-200 transition-colors
                `}
              >
                <TableCell className="font-medium text-left py-1 border-r border-table-border">{grupo.ano}</TableCell>
                <TableCell className="text-left py-1 border-r border-table-border">{grupo.tipo}</TableCell>
                {months.map(month => (
                  <TableCell key={month} className="text-right p-0 border-r border-table-border">
                    {isEditable ? (
                      <input
                        type="number"
                        value={valores[month] || 0}
                        onChange={(e) => handleValueChange(grupo.ano, grupo.tipo, grupo.id_tipo, month, e.target.value)}
                        className="w-full h-full py-1 text-right bg-transparent border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none px-2"
                      />
                    ) : (
                      <div className="py-1 px-2">
                        {(valores[month] || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </div>
                    )}
                  </TableCell>
                ))}
                <TableCell className="text-right p-0">
                  {isEditable ? (
                    <input
                      type="number"
                      value={total}
                      onChange={(e) => handleTotalChange(grupo.ano, grupo.tipo, grupo.id_tipo, e.target.value)}
                      className="w-full h-full py-1 text-right bg-transparent border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none px-2 font-semibold"
                    />
                  ) : (
                    <div className="py-1 px-2 font-semibold">
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
  );
};

export default ForecastTable;