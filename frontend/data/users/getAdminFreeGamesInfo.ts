import { useQuery } from '@tanstack/react-query';

export interface AdminFreeGamesInfo {
  limit: number;
  redeemed: number;
  remaining: number;
}

export function getAdminFreeGamesInfo(userId?: number) {
  const { isPending, error, data, isFetching, refetch } = useQuery({
    queryKey: ['adminFreeGamesInfo', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      try {
        const response = await fetch(`http://localhost:3000/users/${userId}/free-games-info`);
        if (!response.ok) {
          if (response.status === 403) {
            return null; // Não é admin
          }
          throw new Error('Erro ao buscar informações de jogos grátis');
        }
        const result = await response.json();
        return result as AdminFreeGamesInfo;
      } catch (error) {
        return null;
      }
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 2 * 60 * 1000, // 2 minutos de cache
  });
  return {
    isPending,
    error,
    data,
    isFetching,
    refetch,
  };
}

