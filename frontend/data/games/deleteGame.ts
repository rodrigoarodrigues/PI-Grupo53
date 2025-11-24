import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeleteGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameId: number): Promise<void> => {
      const response = await fetch(`http://localhost:3000/games/${gameId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = 'Erro ao remover jogo';
        try {
          const error = await response.json();
          errorMessage = error.error || error.message || errorMessage;
        } catch {
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Tentar ler resposta JSON, mas não falhar se não houver
      await response.json().catch(() => null);
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

