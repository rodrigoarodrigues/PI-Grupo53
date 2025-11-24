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

export function getGameFromId(id: string) {
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ['games', id],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/games');
      const games = await response.json();
      return games.find((game: GetGameProps) => game.uuid === id || String(game.id) === String(id));
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos - detalhes de jogo mudam raramente
    gcTime: 10 * 60 * 1000, // 10 minutos de cache
  });
  return {
    isPending,
    error,
    data,
    isFetching,
  };
}
