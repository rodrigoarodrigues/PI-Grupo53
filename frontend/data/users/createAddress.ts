import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface CreateAddressProps {
  userId: number;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string; // UF (2 caracteres)
  zipCode: string; // CEP (12345-678 ou 12345678)
  isPrimary?: boolean;
}

export interface CreateAddressResponse {
  id: number;
  userId: number;
  street: string;
  number: string;
  complement: string | null;
  city: string;
  state: string;
  zipCode: string;
  isPrimary: boolean;
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (address: CreateAddressProps): Promise<CreateAddressResponse> => {
      const response = await fetch('http://localhost:3000/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(address),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar endereço');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

