import '@/global.css';
import '../suppress-warnings';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { AuthProvider } from '@/contexts/AuthContext';

export {
  ErrorBoundary,
} from 'expo-router';

// Otimização: Configurar QueryClient com cache e staleTime para melhor performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos - dados considerados frescos
      gcTime: 10 * 60 * 1000, // 10 minutos - tempo de garbage collection (antes era cacheTime)
      refetchOnWindowFocus: false, // Não refetch ao focar na janela
      retry: 1, // Reduzir tentativas de retry
    },
  },
});
export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FavoritesProvider>
          <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Stack />
            <PortalHost />
          </ThemeProvider>
        </FavoritesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
