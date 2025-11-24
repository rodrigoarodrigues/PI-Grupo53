import { useQuery } from '@tanstack/react-query';

export interface GameAvailabilityProps {
  available: boolean;
  availableQuantity: number;
  totalQuantity: number;
}

export function checkGameAvailability(gameId: number) {
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ['games', gameId, 'availability'],
    queryFn: async (): Promise<GameAvailabilityProps> => {
      const response = await fetch(`http://localhost:3000/games/${gameId}/availability`);
      if (!response.ok) {
        throw new Error('Erro ao verificar disponibilidade');
      }
      return response.json();
    },
    enabled: !!gameId,
  });

  return {
    isPending,
    error,
    data,
    isFetching,
  };
}


