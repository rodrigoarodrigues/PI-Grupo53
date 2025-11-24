import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface CreateUserProps {
  name: string;
  email: string;
  password?: string;
  cpf?: string;
  phone?: string;
  role?: 'admin' | 'cliente';
  birthDate?: string; // YYYY-MM-DD
  expirationDate?: string; // YYYY-MM-DD
}

export interface CreateUserResponse {
  id: number;
  name: string;
  email: string;
  cpf: string | null;
  birthDate: string | null;
  expirationDate: string | null;
  subscriptionLimit: number;
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: CreateUserProps): Promise<CreateUserResponse> => {
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar usuário');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

