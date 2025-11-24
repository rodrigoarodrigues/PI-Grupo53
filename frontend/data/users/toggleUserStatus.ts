import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface ToggleUserStatusResponse {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<ToggleUserStatusResponse> => {
      const response = await fetch(`http://localhost:3000/users/${id}/activate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao ativar usuário');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<ToggleUserStatusResponse> => {
      const response = await fetch(`http://localhost:3000/users/${id}/deactivate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao inativar usuário');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}


