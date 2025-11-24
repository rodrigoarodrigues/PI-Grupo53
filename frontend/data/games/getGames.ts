import { useQuery } from '@tanstack/react-query';

export interface GetGameProps {
  id: number | string; // Aceita ambos os tipos (backend retorna number, JSON pode serializar como string)
  uuid: string;
  title: string;
  quantity: number;
  imageUrl: string;
  description?: string;
  platform?: string;
  size?: string;
  multiplayer?: boolean;
  languages?: string;
}

export function getGames() {
  const { isPending, error, data, isFetching, refetch } = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      try {
        const response = await fetch('http://localhost:3000/games');
        if (!response.ok) {
          if (response.status === 404) {
            return [];
          }
          throw new Error('Erro ao buscar jogos');
        }
        const result = await response.json();
        return Array.isArray(result) ? result : [];
      } catch (error) {
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos - jogos mudam com menos frequência
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
