import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ForecastData {
  ano: number;
  tipo: string;
  valores: { [key: string]: number };
}

interface ForecastTableProps {
  produto: string;
  anoFiltro?: string[];
  tipoFiltro?: string[];
}

const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

const ForecastTable: React.FC<ForecastTableProps> = ({ produto, anoFiltro, tipoFiltro }) => {
  const [data, setData] = useState<ForecastData[]>([
    {
      ano: 2024,
      tipo: 'REAL',
      valores: {
        JAN: 100, FEV: 150, MAR: 200, ABR: 180, MAI: 220, JUN: 240,
        JUL: 260, AGO: 280, SET: 300, OUT: 320, NOV: 340, DEZ: 360
      }
    },
    {
      ano: 2024,
      tipo: 'REVISÃO',
      valores: {
        JAN: 110, FEV: 160, MAR: 210, ABR: 190, MAI: 230, JUN: 250,
        JUL: 270, AGO: 290, SET: 310, OUT: 330, NOV: 350, DEZ: 370
      }
    },
    {
      ano: 2025,
      tipo: 'REVISÃO',
      valores: {
        JAN: 115, FEV: 165, MAR: 215, ABR: 195, MAI: 235, JUN: 255,
        JUL: 275, AGO: 295, SET: 315, OUT: 335, NOV: 355, DEZ: 375
      }
    },
    {
      ano: 2025,
      tipo: 'ORÇAMENTO',
      valores: {
        JAN: 120, FEV: 170, MAR: 220, ABR: 200, MAI: 240, JUN: 260,
        JUL: 280, AGO: 300, SET: 320, OUT: 340, NOV: 360, DEZ: 380
      }
    },
    {
      ano: 2026,
      tipo: 'REVISÃO',
      valores: {
        JAN: 125, FEV: 175, MAR: 225, ABR: 205, MAI: 245, JUN: 265,
        JUL: 285, AGO: 305, SET: 325, OUT: 345, NOV: 365, DEZ: 385
      }
    },
    {
      ano: 2026,
      tipo: 'ORÇAMENTO',
      valores: {
        JAN: 130, FEV: 180, MAR: 230, ABR: 210, MAI: 250, JUN: 270,
        JUL: 290, AGO: 310, SET: 330, OUT: 350, NOV: 370, DEZ: 390
      }
    }
  ]);

  const handleValueChange = (ano: number, tipo: string, month: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setData(prevData => prevData.map(row => {
      if (row.ano === ano && row.tipo === tipo) {
        return {
          ...row,
          valores: {
            ...row.valores,
            [month]: numericValue
          }
        };
      }
      return row;
    }));
    console.log('Value updated:', { ano, tipo, month, value });
  };

  const filteredData = data.filter(row => {
    if (anoFiltro && anoFiltro.length > 0 && !anoFiltro.includes(row.ano.toString())) {
      return false;
    }
    if (tipoFiltro && tipoFiltro.length > 0 && !tipoFiltro.includes(row.tipo)) {
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
          {filteredData.map((row, index) => {
            const isEditable = row.tipo === 'REVISÃO';
            const total = Object.values(row.valores).reduce((sum, val) => sum + val, 0);
            const isEvenRow = index % 2 === 0;
            
            return (
              <TableRow 
                key={`${row.ano}-${row.tipo}`}
                className={`
                  ${isEvenRow ? 'bg-table-row' : 'bg-table-altRow'}
                  hover:bg-slate-200 transition-colors
                `}
              >
                <TableCell className="font-medium text-left py-1 border-r border-table-border">{row.ano}</TableCell>
                <TableCell className="text-left py-1 border-r border-table-border">{row.tipo}</TableCell>
                {months.map(month => (
                  <TableCell key={month} className="text-right p-0 border-r border-table-border">
                    {isEditable ? (
                      <input
                        type="number"
                        value={row.valores[month]}
                        onChange={(e) => handleValueChange(row.ano, row.tipo, month, e.target.value)}
                        className="w-full h-full py-1 text-right bg-transparent border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none px-2"
                      />
                    ) : (
                      <div className="py-1 px-2">
                        {row.valores[month].toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </div>
                    )}
                  </TableCell>
                ))}
                <TableCell className="text-right font-semibold py-1 px-2">
                  {total.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
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