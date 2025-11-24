import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface UpdateUserProps {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  role?: 'admin' | 'cliente';
  birthDate?: string; // YYYY-MM-DD
  expirationDate?: string; // YYYY-MM-DD
}

export interface UpdateUserResponse {
  id: number;
  name: string;
  email: string;
  cpf: string | null;
  birthDate: string | null;
  expirationDate: string | null;
  subscriptionLimit: number;
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateUserProps }): Promise<UpdateUserResponse> => {
      const response = await fetch(`http://localhost:3000/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar usuário');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

