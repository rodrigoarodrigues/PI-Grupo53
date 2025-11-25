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
  price?: number; // ⭐ Adicionado campo price
}

export function getGames() {
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/games');
      if (!response.ok) {
        throw new Error('Erro ao buscar jogos');
      }
      const games: GetGameProps[] = await response.json();
      
      // Garantir que price seja sempre number
      return games.map(game => ({
        ...game,
        price: typeof game.price === 'string' ? parseFloat(game.price) : (game.price || 0)
      }));
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos de cache
  });
  return {
    isPending,
    error,
    data,
    isFetching,
  };
}