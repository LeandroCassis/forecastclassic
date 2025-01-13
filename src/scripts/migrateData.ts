import { supabase } from '@/integrations/supabase/client';
import { query } from '@/integrations/azure/client';

async function migrateData() {
  try {
    // Migrate produtos
    const { data: produtos, error: produtosError } = await supabase
      .from('produtos')
      .select('*');
    
    if (produtosError) throw produtosError;
    
    for (const produto of produtos) {
      await query(
        `INSERT INTO produtos (id, codigo, empresa, marca, fabrica, familia1, 
                             familia2, produto, preco_venda, fob, indice, 
                             data_atualizacao_fob, created_at, updated_at)
         VALUES (@param0, @param1, @param2, @param3, @param4, @param5, 
                 @param6, @param7, @param8, @param9, @param10, @param11, 
                 @param12, @param13)`,
        [produto.id, produto.codigo, produto.empresa, produto.marca, 
         produto.fabrica, produto.familia1, produto.familia2, produto.produto,
         produto.preco_venda, produto.fob, produto.indice, 
         produto.data_atualizacao_fob, produto.created_at, produto.updated_at]
      );
    }

    // Migrate grupos
    const { data: grupos, error: gruposError } = await supabase
      .from('grupos')
      .select('*');
    
    if (gruposError) throw gruposError;
    
    for (const grupo of grupos) {
      await query(
        `INSERT INTO grupos (ano, id_tipo, tipo, created_at)
         VALUES (@param0, @param1, @param2, @param3)`,
        [grupo.ano, grupo.id_tipo, grupo.tipo, grupo.created_at]
      );
    }

    // Migrate month_configurations
    const { data: configs, error: configsError } = await supabase
      .from('month_configurations')
      .select('*');
    
    if (configsError) throw configsError;
    
    for (const config of configs) {
      await query(
        `INSERT INTO month_configurations (id, data, mes, pct_geral, ano, 
                                         pct_atual, realizado, created_at, 
                                         updated_at)
         VALUES (@param0, @param1, @param2, @param3, @param4, @param5, 
                 @param6, @param7, @param8)`,
        [config.id, config.data, config.mes, config.pct_geral, config.ano,
         config.pct_atual, config.realizado ? 1 : 0, config.created_at, 
         config.updated_at]
      );
    }

    // Migrate forecast_values
    const { data: forecasts, error: forecastsError } = await supabase
      .from('forecast_values')
      .select('*');
    
    if (forecastsError) throw forecastsError;
    
    for (const forecast of forecasts) {
      await query(
        `INSERT INTO forecast_values (id, produto_id, ano, tipo, mes, valor, 
                                    data_registro, id_tipo)
         VALUES (@param0, @param1, @param2, @param3, @param4, @param5, 
                 @param6, @param7)`,
        [forecast.id, forecast.produto_id, forecast.ano, forecast.tipo,
         forecast.mes, forecast.valor, forecast.data_registro, forecast.id_tipo]
      );
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

export { migrateData };