import React from 'react';
import { TableCell } from "@/components/ui/table";

interface ForecastTableCellProps {
  isEditable: boolean;
  isRealized: boolean;
  shouldBeYellow: boolean;
  value: number;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

export const ForecastTableCell: React.FC<ForecastTableCellProps> = ({
  isEditable,
  isRealized,
  shouldBeYellow,
  value,
  onChange,
  onBlur
}) => {
  return (
    <TableCell 
      className={`text-right p-0 border-r border-slate-200 w-[100px] min-w-[100px]
        ${shouldBeYellow ? 'bg-yellow-50' : 'bg-white'}
        ${isEditable && !isRealized ? 'bg-blue-50' : ''}
      `}
    >
      {isEditable && !isRealized ? (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          className="w-full h-full py-2 text-right bg-transparent border-0 focus:ring-2 focus:ring-blue-400 focus:outline-none px-3 transition-all"
        />
      ) : (
        <div className="py-2 px-3">
          {value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
        </div>
      )}
    </TableCell>
  );
};