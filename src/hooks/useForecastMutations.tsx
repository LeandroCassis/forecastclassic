
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser } from '@/services/authService';

const API_URL = 'http://localhost:3001/api';

export const useForecastMutations = (productCodigo: string | undefined) => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ ano, tipo, id_tipo, mes, valor }: { 
      ano: number, 
      tipo: string, 
      id_tipo: number, 
      mes: string, 
      valor: number 
    }) => {
      if (!productCodigo) throw new Error('Product code not found');
      
      // Get current user
      const currentUser = getCurrentUser();
      if (!currentUser) throw new Error('User not authenticated');

      const response = await fetch(`${API_URL}/forecast-values`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productCodigo,
          ano,
          id_tipo,
          mes,
          valor,
          userId: currentUser.id,
          username: currentUser.username
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast_values'] });
    }
  });

  return { updateMutation };
};
