import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as mssql from 'https://deno.land/x/mssql@v3.0.1/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action } = await req.json()
    
    // Configure SQL connection
    const config = {
      server: 'vesperttine-server.database.windows.net',
      database: 'VESPERTTINE',
      user: 'vesperttine',
      password: '840722aA',
      options: {
        encrypt: true,
        trustServerCertificate: false
      }
    }

    // Connect to database
    console.log('Connecting to Azure SQL Database...')
    await mssql.connect(config)
    
    let result
    
    switch (action) {
      case 'getProdutos':
        console.log('Executing getProdutos query...')
        result = await mssql.query`
          SELECT produto, marca, fabrica, familia1, familia2 
          FROM produtos 
          ORDER BY produto
        `
        break
      default:
        throw new Error('Invalid action')
    }

    console.log('Query executed successfully')
    await mssql.close()

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