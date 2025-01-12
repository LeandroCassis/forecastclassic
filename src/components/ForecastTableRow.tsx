import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { ForecastTableCell } from './ForecastTableCell';
import { MonthConfiguration } from '@/hooks/useForecastData';

const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

interface ForecastTableRowProps {
  ano: number;
  tipo: string;
  id_tipo: number;
  yearConfig: { [key: string]: MonthConfiguration };
  getValue: (ano: number, id_tipo: number, month: string) => number;
  handleValueChange: (ano: number, tipo: string, id_tipo: number, month: string, value: string) => void;
  handleBlur: (ano: number, tipo: string, id_tipo: number, month: string) => void;
  handleTotalChange: (ano: number, tipo: string, id_tipo: number, totalValue: string) => void;
  calculateTotal: (ano: number, id_tipo: number) => number;
}

export const ForecastTableRow: React.FC<ForecastTableRowProps> = ({
  ano,
  tipo,
  id_tipo,
  yearConfig,
  getValue,
  handleValueChange,
  handleBlur,
  handleTotalChange,
  calculateTotal
}) => {
  const isEditable = tipo === 'REVISÃO';
  const total = calculateTotal(ano, id_tipo);
  const displayTotal = total === 0 ? "-" : total.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <TableRow className="hover:bg-slate-50 transition-colors">
      <TableCell className="font-medium text-left py-2 border-r border-slate-200 bg-white">{ano}</TableCell>
      <TableCell className="text-left py-2 border-r border-slate-200 bg-white">{tipo}</TableCell>
      {months.map(month => {
        const isRealized = yearConfig[month]?.realizado;
        const shouldBeYellow = isRealized && tipo === 'REVISÃO';
        return (
          <ForecastTableCell
            key={month}
            isEditable={isEditable}
            isRealized={isRealized}
            shouldBeYellow={shouldBeYellow}
            value={getValue(ano, id_tipo, month)}
            onChange={(value) => handleValueChange(ano, tipo, id_tipo, month, value)}
            onBlur={() => handleBlur(ano, tipo, id_tipo, month)}
          />
        );
      })}
      <TableCell className="text-right p-0 bg-white">
        {isEditable ? (
          <input
            type="number"
            value={total}
            onChange={(e) => handleTotalChange(ano, tipo, id_tipo, e.target.value)}
            className="w-full h-full py-2 text-right bg-blue-50 border-0 focus:ring-2 focus:ring-blue-400 focus:outline-none px-3 font-medium transition-all"
          />
        ) : (
          <div className="py-2 px-3 font-medium">
            {displayTotal}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};