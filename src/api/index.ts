import express from 'express';
import sql from 'mssql';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/query', async (req, res) => {
  const { query, params, config } = req.body;
  
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    
    if (params) {
      params.forEach((param: any, index: number) => {
        request.input(`param${index}`, param);
      });
    }
    
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});