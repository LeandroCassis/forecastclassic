import sql from 'mssql';

const config = {
  server: 'vesperttine-server.database.windows.net',
  database: 'VESPERTTINE',
  user: 'vesperttine',
  password: '840722aA',
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

let pool: sql.ConnectionPool | null = null;

export async function getConnection() {
  try {
    if (!pool) {
      pool = await new sql.ConnectionPool(config).connect();
      console.log('Connected to Azure SQL Database');
    }
    return pool;
  } catch (err) {
    console.error('Error connecting to Azure SQL:', err);
    throw err;
  }
}

export async function query<T>(queryString: string, params?: any[]): Promise<T[]> {
  const pool = await getConnection();
  try {
    const request = pool.request();
    if (params) {
      params.forEach((param, index) => {
        request.input(`param${index}`, param);
      });
    }
    const result = await request.query(queryString);
    return result.recordset;
  } catch (err) {
    console.error('Error executing query:', err);
    throw err;
  }
}