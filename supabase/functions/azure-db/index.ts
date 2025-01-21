import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { sql } from 'npm:mssql@11.0.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action } = await req.json()
    
    // Configure SQL Server connection
    const config = {
      user: 'vesperttine',
      password: '840722aA',
      server: 'vesperttine-server.database.windows.net',
      database: 'VESPERTTINE',
      options: {
        encrypt: true,
        trustServerCertificate: false
      }
    }

    console.log('Connecting to Azure SQL Database...')
    const pool = await sql.connect(config)
    
    let result
    
    switch (action) {
      case 'getProdutos':
        console.log('Executing getProdutos query...')
        result = await pool.request().query(`
          SELECT produto, marca, fabrica, familia1, familia2 
          FROM produtos 
          ORDER BY produto
        `)
        break
      default:
        throw new Error('Invalid action')
    }

    console.log('Query executed successfully:', result)
    await pool.close()

    return new Response(
      JSON.stringify({ data: result.recordset }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})