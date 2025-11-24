import { useQuery } from '@tanstack/react-query';
import { UserProps } from './getUsers';

export function getUserById(userId: number) {
  const { isPending, error, data, isFetching, refetch } = useQuery({
    queryKey: ['users', userId],
    queryFn: async (): Promise<UserProps | null> => {
      try {
        const response = await fetch(`http://localhost:3000/users/${userId}`);
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error('Erro ao buscar usuário');
        }
        const result = await response.json();
        return result;
      } catch (error) {
        return null;
      }
    },
    enabled: !!userId && userId > 0,
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos de cache
  });

  return {
    isPending,
    error,
    data,
    isFetching,
    refetch,
  };
}

