
export interface MonthConfiguration {
  mes: string;
  pct_atual: number;
  realizado: boolean;
}

export interface Grupo {
  ano: number;
  id_tipo: number;
  tipo: string;
  code: string;
}

export interface ProductData {
  codigo: string;
  produto: string;
  marca: string;
  fabrica: string;
  familia1: string;
  familia2: string;
  empresa: string;
}

export interface ForecastValue {
  ano: number;
  id_tipo: number;
  mes: string;
  valor: number;
}

export interface MonthConfigurationsMap {
  [key: string]: { [key: string]: MonthConfiguration };
}

export interface ForecastValuesMap {
  [key: string]: { [key: string]: number };
}
