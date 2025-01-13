import { useMutation, useQueryClient } from '@tanstack/react-query';
import { query } from '@/services/api';

export const useForecastMutations = (productId: string | undefined) => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ ano, tipo, id_tipo, mes, valor }: { 
      ano: number, 
      tipo: string, 
      id_tipo: number, 
      mes: string, 
      valor: number 
    }) => {
      if (!productId) throw new Error('Product ID not found');

      const { error } = await query(
        `MERGE INTO forecast_values AS target
         USING (SELECT @param0 as produto_id, @param1 as ano, @param2 as tipo, 
                       @param3 as id_tipo, @param4 as mes, @param5 as valor) 
         AS source (produto_id, ano, tipo, id_tipo, mes, valor)
         ON target.produto_id = source.produto_id 
            AND target.ano = source.ano 
            AND target.id_tipo = source.id_tipo 
            AND target.mes = source.mes
         WHEN MATCHED THEN
           UPDATE SET valor = source.valor
         WHEN NOT MATCHED THEN
           INSERT (produto_id, ano, tipo, id_tipo, mes, valor)
           VALUES (source.produto_id, source.ano, source.tipo, 
                  source.id_tipo, source.mes, source.valor);`,
        [productId, ano, tipo, id_tipo, mes, valor]
      );

      if (error) throw new Error('Failed to update forecast value');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast_values'] });
    }
  });

  return { updateMutation };
};