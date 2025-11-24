import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface CreateRentProps {
  userId: number;
  gameId: number;
  rentalType: 'unitario' | 'assinatura';
  startDate: string; // YYYY-MM-DD
  days?: number; // Para aluguel unitário
  paymentMethod?: 'credit_card' | 'pix' | 'debit_card';
  forcePaymentSuccess?: boolean; // Para testes
}

export interface CreateRentResponse {
  rent: {
    id: number;
    userId: number;
    gameId: number;
    rentalType: 'unitario' | 'assinatura';
    startDate: string;
    expectedReturnDate: string;
    returned: boolean;
  };
  payment: {
    id: number;
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    transactionId: string;
    success: boolean;
    message: string;
  };
  price: number;
  expectedReturnDate: string;
  previousBalance?: number;
  newBalance?: number;
  amountDeducted?: number;
}

export function useCreateRent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rent: CreateRentProps): Promise<CreateRentResponse> => {
      const response = await fetch('http://localhost:3000/rents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rent),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar aluguel');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rents'] });
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

