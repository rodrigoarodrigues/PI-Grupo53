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

export interface UserProps {
  id: number;
  name: string;
  email: string;
  birthDate: string | null;
  cpf: string | null;
  phone: string | null;
  role: 'admin' | 'cliente' | null;
  expirationDate: string | null;
  subscriptionLimit: number | null;
  isActive?: boolean | null;
  profile?: 'admin' | 'user';
  status?: 'active' | 'inactive';
  primaryAddress?: AddressProps | null;
}

export function getUsers() {
  const { isPending, error, data, isFetching, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<UserProps[]> => {
      try {
        const response = await fetch('http://localhost:3000/users');
        if (!response.ok) {
          if (response.status === 404) {
            return [];
          }
          throw new Error('Erro ao buscar usuários');
        }
        const result = await response.json();
        return Array.isArray(result) ? result : [];
      } catch (error) {
        return [];
      }
    },
    staleTime: 3 * 60 * 1000, // 3 minutos - usuários mudam com menos frequência
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
