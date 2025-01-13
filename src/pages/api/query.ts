import { NextApiRequest, NextApiResponse } from 'next';
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

async function getConnection() {
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query: queryString, params } = req.body;
    const pool = await getConnection();
    const request = pool.request();

    if (params) {
      params.forEach((param: any, index: number) => {
        request.input(`param${index}`, param);
      });
    }

    const result = await request.query(queryString);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}