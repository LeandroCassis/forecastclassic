import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

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

      const { error } = await supabase
        .from('forecast_values')
        .upsert(
          {
            produto_id: productId,
            ano,
            tipo,
            id_tipo,
            mes,
            valor
          },
          {
            onConflict: 'produto_id,ano,id_tipo,mes',
            ignoreDuplicates: false
          }
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast_values'] });
    }
  });

  return { updateMutation };
};