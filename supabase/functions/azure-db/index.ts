import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const sql = require('mssql')

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action } = await req.json()
    let result

    // Connect to Azure SQL Database
    await sql.connect(config)

    switch (action) {
      case 'getProdutos':
        result = await sql.query`
          SELECT produto, marca, fabrica, familia1, familia2 
          FROM produtos 
          ORDER BY produto
        `
        break
      // Add more cases for other queries
      default:
        throw new Error('Invalid action')
    }

    return new Response(
      JSON.stringify({ data: result.recordset }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  } finally {
    await sql.close()
  }
})