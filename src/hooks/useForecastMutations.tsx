
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';

export const useForecastMutations = (productCodigo: string | undefined) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const updateMutation = useMutation({
    mutationFn: async ({ ano, tipo, id_tipo, mes, valor }: { 
      ano: number, 
      tipo: string, 
      id_tipo: number, 
      mes: string, 
      valor: number 
    }) => {
      if (!productCodigo) throw new Error('Product code not found');
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('forecast_values')
        .upsert(
          {
            produto_codigo: productCodigo,
            ano,
            id_tipo,
            mes,
            valor,
            user_id: user.id,
            updated_by: user.user_metadata?.name || user.email
          },
          {
            onConflict: 'produto_codigo,ano,id_tipo,mes',
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
