// Simple Express server to handle API requests
import express from 'express';
import cors from 'cors';
import mssql from 'mssql';
import crypto from 'crypto';

const app = express();
const port = 3005;

app.use(cors());
app.use(express.json());

// Database configuration
const config = {
    server: 'vesperttine-server.database.windows.net',
    database: 'FORECAST',  // Alterado de VESPERTTINE para FORECAST
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
    try {
        if (!pool) {
            console.log('Connecting to Azure SQL Database...');
            pool = await new mssql.ConnectionPool(config).connect();
            console.log('Successfully connected to Azure SQL Database');
        }
        return pool;
    } catch (err) {
        console.error('Database connection error:', err);
        throw err;
    }
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
        console.log('Executing query:', queryString, 'with params:', params);
        const result = await request.query(queryString);
        return result.recordset;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Check if users table exists, create it if not
async function initializeDatabase() {
    try {
        // Verificar se a tabela usuarios existe
        const usersTableResult = await query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = 'usuarios'
        `);
        
        if (usersTableResult.length === 0) {
            // Criar a tabela usuarios apenas se ela não existir
            await query(`
                CREATE TABLE usuarios (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    username NVARCHAR(100) NOT NULL UNIQUE,
                    password_hash NVARCHAR(255) NOT NULL,
                    nome NVARCHAR(100),
                    role NVARCHAR(50) DEFAULT 'user',
                    created_at DATETIME DEFAULT GETDATE(),
                    last_login DATETIME
                )
            `);
            
            // Criar usuário admin apenas se a tabela acabou de ser criada
            await query(`
                INSERT INTO usuarios (username, password_hash, nome, role)
                VALUES (@p0, @p1, @p2, @p3)
            `, ['admin', 'admin', 'Administrador', 'admin']);
            
            console.log('Created users table and admin user');
        }
        
        // Verificar usuários atuais
        const testResult = await query('SELECT * FROM usuarios');
        console.log('Current users in database:', testResult);

        // Check if forecast_values_log table exists
        const logTableResult = await query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = 'forecast_values_log'
        `);
        
        if (logTableResult.length === 0) {
            // Create forecast_values_log table
            await query(`
                CREATE TABLE forecast_values_log (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    produto_codigo VARCHAR(50) NOT NULL,
                    ano INT NOT NULL,
                    id_tipo INT NOT NULL,
                    mes VARCHAR(3) NOT NULL,
                    valor_anterior DECIMAL(18,2),
                    valor_novo DECIMAL(18,2) NOT NULL,
                    user_id INT,
                    username VARCHAR(100),
                    user_fullname VARCHAR(100),
                    modified_at DATETIME DEFAULT GETDATE()
                )
            `);
            
            console.log('Created forecast_values_log table');
        }
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// Initialize database on server start
initializeDatabase()
    .catch(console.error);

// Authentication endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('=== Login attempt ===');
        console.log('Username:', username);
        console.log('Password:', password);
        
        if (!username || !password) {
            console.log('Missing username or password');
            return res.status(400).json({ error: 'Username and password are required' });
        }
        
        // Query the users table
        const users = await query(
            'SELECT * FROM usuarios WHERE username = @p0',
            [username]
        );
        
        console.log('Found users:', users);
        
        if (users.length === 0) {
            console.log('No user found with username:', username);
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }
        
        const user = users[0];
        console.log('Found user:', {
            id: user.id,
            username: user.username,
            password_hash: user.password_hash,
            role: user.role
        });
        
        // Comparação da senha em texto plano
        if (String(password).trim() !== String(user.password_hash).trim()) {
            console.log('Password mismatch');
            console.log('Received:', password);
            console.log('Expected:', user.password_hash);
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }
        
        console.log('Login successful');
        
        // Update last login time
        await query(
            'UPDATE usuarios SET last_login = GETDATE() WHERE id = @p0',
            [user.id]
        );
        
        const userData = {
            id: user.id,
            username: user.username,
            nome: user.nome,
            role: user.role
        };
        
        console.log('Sending user data:', userData);
        res.json(userData);
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

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
        const { productCodigo, ano, id_tipo, mes, valor, userId, username, userFullName } = req.body;
        
        console.log('Updating forecast value:', {
            productCodigo, ano, id_tipo, mes, valor, userId, username, userFullName
        });
        
        // Get the current value before updating
        const currentValues = await query(
            'SELECT valor FROM forecast_values WHERE produto_codigo = @p0 AND ano = @p1 AND id_tipo = @p2 AND mes = @p3',
            [productCodigo, ano, id_tipo, mes]
        );
        
        const valorAnterior = currentValues.length > 0 ? currentValues[0].valor : null;
        
        console.log('Previous value:', valorAnterior);
        
        // Format the current date/time in SQL Server format
        const currentDateTime = new Date().toISOString();
        
        // Update or insert the forecast value with user data and timestamp
        await query(
            `MERGE INTO forecast_values AS target
             USING (VALUES (@p0, @p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8)) 
             AS source (produto_codigo, ano, id_tipo, mes, valor, user_id, username, user_fullname, modified_at)
             ON target.produto_codigo = source.produto_codigo 
             AND target.ano = source.ano 
             AND target.id_tipo = source.id_tipo 
             AND target.mes = source.mes
             WHEN MATCHED THEN
               UPDATE SET 
                  valor = source.valor,
                  user_id = source.user_id,
                  username = source.username,
                  user_fullname = source.user_fullname,
                  modified_at = source.modified_at
             WHEN NOT MATCHED THEN
               INSERT (produto_codigo, ano, id_tipo, mes, valor, user_id, username, user_fullname, modified_at)
               VALUES (source.produto_codigo, source.ano, source.id_tipo, source.mes, source.valor, 
                       source.user_id, source.username, source.user_fullname, source.modified_at);`,
            [productCodigo, ano, id_tipo, mes, valor, userId || null, username || null, userFullName || null, currentDateTime]
        );
        
        // Log the change
        await query(
            `INSERT INTO forecast_values_log 
             (produto_codigo, ano, id_tipo, mes, valor_anterior, valor_novo, user_id, username, user_fullname, modified_at)
             VALUES (@p0, @p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9)`,
            [productCodigo, ano, id_tipo, mes, valorAnterior, valor, userId || null, username || null, userFullName || null, currentDateTime]
        );
        
        console.log('Successfully updated forecast value and logged the change');
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating forecast value:', error);
        res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
});

// Get change history for a product
app.get('/api/forecast-values-history/:productCode', async (req, res) => {
    try {
        const logs = await query(
            `SELECT l.*, u.nome as user_name 
             FROM forecast_values_log l
             LEFT JOIN usuarios u ON l.user_id = u.id
             WHERE produto_codigo = @p0
             ORDER BY modified_at DESC`,
            [req.params.productCode]
        );
        res.json(logs);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
