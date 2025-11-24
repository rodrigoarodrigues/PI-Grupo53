import { useQuery } from '@tanstack/react-query';

export interface RentByUserProps {
  id: number;
  userId: number;
  gameId: number;
  rentalType: 'unitario' | 'assinatura';
  startDate: string;
  expectedReturnDate: string | null;
  returned: boolean;
  returnedDate: string | null;
  fineAmount: string | null;
  daysOverdue: number | null;
}

export function getRentsByUser(userId: number) {
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ['rents', 'user', userId],
    queryFn: async (): Promise<RentByUserProps[]> => {
      const response = await fetch(`http://localhost:3000/rents/user/${userId}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar aluguéis do usuário');
      }
      return response.json();
    },
    enabled: !!userId,
  });

  return {
    isPending,
    error,
    data,
    isFetching,
  };
}


