
// Simple Express server to handle API requests
import express from 'express';
import cors from 'cors';
import mssql from 'mssql';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Database configuration
const config = {
    server: 'vesperttine-server.database.windows.net',
    database: 'VESPERTTINE',
    user: 'vesperttine',
    password: '840722aA',
    options: {
        encrypt: true,
        trustServerCertificate: false,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool = null;

async function getConnection() {
    if (!pool) {
        try {
            pool = await new mssql.ConnectionPool(config).connect();
            console.log('Successfully connected to database');
        } catch (err) {
            console.error('Database connection error:', err);
            throw err;
        }
    }
    return pool;
}

async function query(queryString, params) {
    const connection = await getConnection();
    try {
        const request = connection.request();
        if (params) {
            params.forEach((param, index) => {
                request.input(`p${index}`, param);
            });
        }
        const result = await request.query(queryString);
        return result.recordset;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Get product by name
app.get('/api/produtos/:produto', async (req, res) => {
    try {
        const data = await query(
            'SELECT * FROM produtos WHERE produto = @p0',
            [req.params.produto]
        );
        res.json(data[0]);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all produtos for filtering
app.get('/api/produtos', async (req, res) => {
    try {
        console.log('Fetching produtos from Azure SQL...');
        const data = await query(
            'SELECT codigo, produto, empresa, fabrica, familia1, familia2, marca FROM produtos'
        );
        console.log(`Found ${data.length} produtos`);
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all grupos
app.get('/api/grupos', async (req, res) => {
    try {
        const data = await query(
            'SELECT ano, id_tipo, tipo, code FROM grupos ORDER BY ano, id_tipo'
        );
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get month configurations
app.get('/api/month-configurations', async (req, res) => {
    try {
        const data = await query(
            'SELECT * FROM month_configurations ORDER BY ano, mes'
        );
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get forecast values by product code
app.get('/api/forecast-values/:productCode', async (req, res) => {
    try {
        const data = await query(
            'SELECT * FROM forecast_values WHERE produto_codigo = @p0',
            [req.params.productCode]
        );
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update forecast value
app.post('/api/forecast-values', async (req, res) => {
    try {
        const { productCodigo, ano, id_tipo, mes, valor } = req.body;
        await query(
            `MERGE INTO forecast_values AS target
             USING (VALUES (@p0, @p1, @p2, @p3, @p4)) 
             AS source (produto_codigo, ano, id_tipo, mes, valor)
             ON target.produto_codigo = source.produto_codigo 
             AND target.ano = source.ano 
             AND target.id_tipo = source.id_tipo 
             AND target.mes = source.mes
             WHEN MATCHED THEN
               UPDATE SET valor = source.valor
             WHEN NOT MATCHED THEN
               INSERT (produto_codigo, ano, id_tipo, mes, valor)
               VALUES (source.produto_codigo, source.ano, source.id_tipo, source.mes, source.valor);`,
            [productCodigo, ano, id_tipo, mes, valor]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
