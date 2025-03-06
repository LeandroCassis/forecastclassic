
// Simple Express server to handle API requests
import express from 'express';
import cors from 'cors';
import mssql from 'mssql';
import crypto from 'crypto';

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

// Check if users table exists, create it if not
async function initializeDatabase() {
    try {
        // Check if users table exists
        const tablesResult = await query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = 'usuarios'
        `);
        
        if (tablesResult.length === 0) {
            // Create users table
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
            
            // Create default admin user
            const adminPassword = 'admin';
            const adminPasswordHash = crypto
                .createHash('sha256')
                .update(adminPassword)
                .digest('hex');
                
            await query(`
                INSERT INTO usuarios (username, password_hash, nome, role)
                VALUES (@p0, @p1, @p2, @p3)
            `, ['admin', adminPasswordHash, 'Administrador', 'admin']);
            
            console.log('Created users table and admin user');
        }
        
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
                    modified_at DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (produto_codigo) REFERENCES produtos(codigo)
                )
            `);
            
            console.log('Created forecast_values_log table');
        }
        
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// Initialize database on server start
initializeDatabase().catch(console.error);

// Authentication endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        
        // Hash the password for comparison
        const hashedPassword = crypto
            .createHash('sha256')
            .update(password)
            .digest('hex');
        
        // Query the users table
        const users = await query(
            'SELECT id, username, nome, role FROM usuarios WHERE username = @p0 AND password_hash = @p1',
            [username, hashedPassword]
        );
        
        // Fallback to admin/admin if database connection fails
        if (users.length === 0) {
            if (username === 'admin' && password === 'admin') {
                // Update last login time
                await query(
                    'UPDATE usuarios SET last_login = GETDATE() WHERE username = @p0',
                    [username]
                ).catch(err => console.error('Error updating last login:', err));
                
                return res.json({
                    id: 1,
                    username: 'admin',
                    name: 'Administrador',
                    role: 'admin'
                });
            }
            
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }
        
        const user = users[0];
        
        // Update last login time
        await query(
            'UPDATE usuarios SET last_login = GETDATE() WHERE id = @p0',
            [user.id]
        ).catch(err => console.error('Error updating last login:', err));
        
        const userData = {
            id: user.id,
            username: user.username,
            name: user.nome || user.username,
            role: user.role || 'user'
        };
        
        res.json(userData);
    } catch (error) {
        console.error('Login error:', error);
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
        const { productCodigo, ano, id_tipo, mes, valor, userId, username } = req.body;
        
        // Get the current value before updating
        const currentValues = await query(
            'SELECT valor FROM forecast_values WHERE produto_codigo = @p0 AND ano = @p1 AND id_tipo = @p2 AND mes = @p3',
            [productCodigo, ano, id_tipo, mes]
        );
        
        const valorAnterior = currentValues.length > 0 ? currentValues[0].valor : null;
        
        // Update or insert the forecast value
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
        
        // Log the change
        await query(
            `INSERT INTO forecast_values_log 
             (produto_codigo, ano, id_tipo, mes, valor_anterior, valor_novo, user_id, username, modified_at)
             VALUES (@p0, @p1, @p2, @p3, @p4, @p5, @p6, @p7, GETDATE())`,
            [productCodigo, ano, id_tipo, mes, valorAnterior, valor, userId || null, username || null]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
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
