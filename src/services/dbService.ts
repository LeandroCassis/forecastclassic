
import sql from 'mssql';

const config = {
  server: 'vesperttine-server.database.windows.net',
  database: 'FORECAST',
  user: 'vesperttine',
  password: '840722aA',
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

let pool: sql.ConnectionPool | null = null;

export const getDbPool = async (): Promise<sql.ConnectionPool> => {
  if (!pool) {
    try {
      pool = await new sql.ConnectionPool(config).connect();
      console.log('Connected to Azure SQL Database');
    } catch (err) {
      console.error('Database connection error:', err);
      throw err;
    }
  }
  return pool;
};

export const executeQuery = async (query: string, params: any[] = []): Promise<any> => {
  try {
    const pool = await getDbPool();
    const request = pool.request();
    
    // Add parameters if any
    params.forEach((param, index) => {
      request.input(`param${index}`, param);
    });
    
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
};
