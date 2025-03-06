
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, shouldAutoRefresh } from '@/services/authService';
import { toast } from '@/hooks/use-toast';

// Use relative path for API calls to go through the proxy
const API_URL = '/api';

export const useForecastMutations = (productCodigo: string | undefined) => {
  const queryClient = useQueryClient();

  // Function to check if server is running
  const checkServerStatus = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/health`);
      if (!response.ok) return false;
      
      // Verify we got a proper JSON response, not HTML
      const text = await response.text();
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        return false;
      }
      
      try {
        JSON.parse(text);
        return true;
      } catch (e) {
        return false;
      }
    } catch (e) {
      return false;
    }
  };

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
      
      console.log('Updating forecast with user data:', {
        user: currentUser,
        productCodigo,
        ano,
        id_tipo,
        mes,
        valor
      });

      // Check server status first
      const isServerRunning = await checkServerStatus();
      
      if (!isServerRunning) {
        toast({
          title: "Servidor iniciando",
          description: "Aguarde enquanto o servidor é iniciado automaticamente...",
          variant: "default"
        });
        
        // Wait a moment for server to start (with backoff)
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Check server again after waiting
        const serverRunningAfterWait = await checkServerStatus();
        if (!serverRunningAfterWait) {
          if (shouldAutoRefresh()) {
            toast({
              title: "Recarregando página",
              description: "Servidor ainda não está pronto. Recarregando página...",
              variant: "default"
            });
            setTimeout(() => window.location.reload(), 2000);
          } else {
            toast({
              title: "Servidor não disponível",
              description: "O servidor não está respondendo após várias tentativas. Recarregue a página manualmente.",
              variant: "destructive"
            });
          }
          throw new Error('Server not running after waiting');
        }
      }

      try {
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
            username: currentUser.username,
            userFullName: currentUser.nome
          }),
        });

        if (!response.ok) {
          const responseText = await response.text();
          // Check if we got HTML instead of JSON (server not running)
          if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
            toast({
              title: "Servidor iniciando",
              description: "Aguarde enquanto o servidor é iniciado...",
              variant: "default"
            });
            throw new Error('Server is starting');
          }
          
          console.error('Server error response:', responseText);
          toast({
            title: "Erro ao atualizar valor",
            description: `Falha ao salvar dados: ${responseText}`,
            variant: "destructive"
          });
          throw new Error(`Network response was not ok: ${responseText}`);
        }
        
        // Verify JSON response
        const text = await response.text();
        let result;
        try {
          result = JSON.parse(text);
        } catch (e) {
          console.error('Invalid JSON response:', text);
          throw new Error('Invalid server response');
        }
        
        console.log('Update result:', result);
        toast({
          title: "Valor atualizado",
          description: "O valor foi salvo com sucesso",
          variant: "default"
        });
        return result;
      } catch (error) {
        if (error.message !== 'Server is starting') {
          console.error('Error updating forecast:', error);
          toast({
            title: "Erro de conexão",
            description: "Não foi possível conectar ao servidor. Servidor iniciando...",
            variant: "destructive"
          });
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast_values'] });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    }
  });

  return { updateMutation };
};
