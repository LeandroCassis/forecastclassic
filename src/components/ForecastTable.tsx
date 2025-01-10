import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ForecastData {
  ano: number;
  tipo: string;
  produto: string;
  valores: { [key: string]: number };
}

const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

const ForecastTable: React.FC<{ produto: string }> = ({ produto }) => {
  // Mock data - this would come from your database
  const [data, setData] = useState<ForecastData[]>([
    {
      ano: 2024,
      tipo: 'REAL',
      produto,
      valores: { JAN: 100, FEV: 200 }
    },
    {
      ano: 2025,
      tipo: 'REVISÃO',
      produto,
      valores: { JAN: 150, FEV: 250 }
    },
    {
      ano: 2025,
      tipo: 'ORÇAMENTO',
      produto,
      valores: { JAN: 120, FEV: 220 }
    }
  ]);

  const handleValueChange = (ano: number, tipo: string, month: string, value: string) => {
    if (tipo !== 'REVISÃO') return;

    const newData = data.map(row => {
      if (row.ano === ano && row.tipo === tipo) {
        return {
          ...row,
          valores: {
            ...row.valores,
            [month]: parseFloat(value) || 0
          }
        };
      }
      return row;
    });

    setData(newData);
    console.log('Value updated:', { ano, tipo, month, value });
  };

  return (
    <div className="rounded-md border border-table-border overflow-x-auto">
      <Table>
        <TableHeader className="bg-table-header">
          <TableRow>
            <TableHead className="text-white">ANO</TableHead>
            <TableHead className="text-white">TIPO</TableHead>
            {months.map(month => (
              <TableHead key={month} className="text-white">{month}</TableHead>
            ))}
            <TableHead className="text-white">TOTAL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => {
            const isEditable = row.tipo === 'REVISÃO';
            const total = Object.values(row.valores).reduce((sum, val) => sum + val, 0);
            
            return (
              <TableRow 
                key={`${row.ano}-${row.tipo}`}
                className={index % 2 === 0 ? 'bg-table-row' : 'bg-table-altRow'}
              >
                <TableCell className="font-medium">{row.ano}</TableCell>
                <TableCell>{row.tipo}</TableCell>
                {months.map(month => (
                  <TableCell key={month}>
                    {isEditable ? (
                      <input
                        type="number"
                        value={row.valores[month] || ''}
                        onChange={(e) => handleValueChange(row.ano, row.tipo, month, e.target.value)}
                        className="w-20 p-1 border rounded"
                      />
                    ) : (
                      row.valores[month] || '-'
                    )}
                  </TableCell>
                ))}
                <TableCell className="font-bold">{total}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ForecastTable;