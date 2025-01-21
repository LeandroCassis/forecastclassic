import sql from 'mssql';

const config = {
  user: 'vesperttine',
  password: '840722aA',
  server: 'vesperttine-server.database.windows.net',
  database: 'VESPERTTINE',
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

let pool: sql.ConnectionPool | null = null;

export async function getConnection() {
  try {
    if (!pool) {
      console.log('Creating new connection pool...');
      pool = await new sql.ConnectionPool(config).connect();
      console.log('Connection pool created successfully');
    }
    return pool;
  } catch (err) {
    console.error('Error creating connection pool:', err);
    throw err;
  }
}

export async function closeConnection() {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('Connection pool closed successfully');
    }
  } catch (err) {
    console.error('Error closing connection pool:', err);
    throw err;
  }
}

// Produtos queries
export async function getProdutos() {
  try {
    console.log('Fetching produtos from Azure SQL...');
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT produto, marca, fabrica, familia1, familia2 
      FROM produtos 
      ORDER BY produto
    `);
    console.log('Fetched produtos:', result.recordset);
    return result.recordset;
  } catch (err) {
    console.error('Error fetching produtos:', err);
    throw err;
  }
}

// Add more query functions as needed