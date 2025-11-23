import { useQuery } from '@tanstack/react-query';

export interface GetGameProps {
  id: string;
  uuid: string;
  title: string;
  quantity: number;
  imageUrl: string;
}

export function getGameFromId(id: string) {
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ['games', id],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/games');
      const games = await response.json();
      // Try to find by uuid or id (string/number)
      return games.find((game: GetGameProps) => game.uuid === id || String(game.id) === String(id));
    },
    enabled: !!id,
  });
  return {
    isPending,
    error,
    data,
    isFetching,
  };
}
