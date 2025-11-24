import { useQuery } from '@tanstack/react-query';

export interface AddressProps {
  id: number;
  userId: number;
  street: string;
  number: string;
  complement: string | null;
  city: string;
  state: string;
  zipCode: string;
  isPrimary: boolean | null;
}

export function getAddresses(userId: number) {
  const { isPending, error, data, refetch } = useQuery({
    queryKey: ['addresses', userId],
    queryFn: async (): Promise<AddressProps[]> => {
      try {
        const response = await fetch(`http://localhost:3000/addresses/${userId}`);
        if (!response.ok) {
          if (response.status === 404) {
            return [];
          }
          throw new Error('Erro ao buscar endereços');
        }
        const result = await response.json();
        return Array.isArray(result) ? result : [];
      } catch (error) {
        return [];
      }
    },
    enabled: !!userId, // Só busca se tiver userId
  });

  return {
    isPending,
    error,
    data,
    refetch,
  };
}

