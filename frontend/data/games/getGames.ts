import { useQuery } from '@tanstack/react-query';

export interface Game {
  id: string;
  uuid: string;
  title: string;
  quantity: number;
  imageUrl: string;
}

export function getGames() {
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/games');
      return await response.json();
    },
  });
  return {
    isPending,
    error,
    data,
    isFetching,
  };
}
