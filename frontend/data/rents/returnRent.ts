import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface ReturnRentResponse {
  id: number;
  returned: boolean;
  returnedDate: string;
  daysOverdue: number;
  fineAmount: string;
  hasFine: boolean;
}

export function useReturnRent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rentId,
      returnedDate,
    }: {
      rentId: number;
      returnedDate?: string;
    }): Promise<ReturnRentResponse> => {
      const response = await fetch(`http://localhost:3000/rents/${rentId}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ returnedDate }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao processar devolução');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rents'] });
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

