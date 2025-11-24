import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface UpdateAddressProps {
  street?: string;
  number?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  complement?: string | null;
}

export interface UpdateAddressResponse {
  id: number;
  userId: number;
  street: string;
  number: string;
  complement: string | null;
  city: string;
  state: string;
  zipCode: string;
  isPrimary: boolean | null;
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: number; data: UpdateAddressProps }): Promise<UpdateAddressResponse> => {
      const response = await fetch(`http://localhost:3000/addresses/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar endereço');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

