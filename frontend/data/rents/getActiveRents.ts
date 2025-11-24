import { useQuery } from '@tanstack/react-query';

export interface ActiveRentProps {
  id: number;
  userId: number;
  gameId: number;
  rentalType: 'unitario' | 'assinatura';
  startDate: string;
  expectedReturnDate: string | null;
  returned: boolean;
  fineAmount: string | null;
  daysOverdue: number | null;
}

export function getActiveRents(userId?: number) {
  const { isPending, error, data, isFetching, refetch } = useQuery({
    queryKey: ['rents', 'active', userId],
    queryFn: async (): Promise<ActiveRentProps[]> => {
      try {
        const response = await fetch('http://localhost:3000/rents/active');
        if (!response.ok) {
          if (response.status === 404) {
            return [];
          }
          throw new Error('Erro ao buscar aluguéis ativos');
        }
        const result = await response.json();
        let rents = Array.isArray(result) ? result : [];
        
        if (userId) {
          rents = rents.filter((rent: ActiveRentProps) => {
            return rent.userId === userId;
          });
        }
        
        return rents;
      } catch (error) {
        return [];
      }
    },
    enabled: userId !== undefined && userId !== null,
    staleTime: 1 * 60 * 1000, // 1 minuto - aluguéis podem mudar mais frequentemente
    gcTime: 3 * 60 * 1000, // 3 minutos de cache
  });

  return {
    isPending,
    error,
    data,
    isFetching,
    refetch,
  };
}

