import { Text } from '@/components/ui/text';
import { Stack, useRouter, Redirect } from 'expo-router';
import { View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { getGames, GetGameProps } from '@/data/games/getGames';
import { SearchAndFilters } from '@/components/games/SearchAndFilters';
import { GameGrid } from '@/components/games/GameGrid';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useMemo, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { getActiveRents, ActiveRentProps } from '@/data/rents/getActiveRents';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

export default function LibraryScreen() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isPending: gamesPending, error: gamesError, data: gamesData } = getGames();
  const { isPending: rentsPending, error: rentsError, data: activeRents, refetch: refetchRents } = getActiveRents(user?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const isPending = gamesPending || rentsPending;

  const filteredGames = useMemo(() => {
    if (gamesError || rentsError) return [];
    if (!gamesData || !Array.isArray(gamesData)) return [];
    if (!activeRents || !Array.isArray(activeRents)) return [];

    const rentedGameIds = activeRents
      .map((rent) => rent?.gameId)
      .filter((id): id is number => id !== null && id !== undefined);

    if (rentedGameIds.length === 0) return [];

    const rentedGameIdsNumbers = rentedGameIds.map(id => Number(id));
    let filtered = gamesData.filter((game) => {
      const gameId = typeof game.id === 'string' ? Number(game.id) : game.id;
      const isRented = gameId && rentedGameIdsNumbers.includes(gameId);
      return isRented;
    });
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((game) =>
        game.title.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((game, index) => index % 2 === 0);
    }

    return filtered;
  }, [gamesData, activeRents, searchQuery, selectedCategory, gamesError, rentsError]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (user?.id) {
      refetchRents();
    }
  }, [user?.id, refetchRents]);

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0a0c10]">
        <ActivityIndicator size="large" color="#6b8bff" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View className="flex-1 flex-row bg-[#0a0c10]">
        <Sidebar />

        <View className="flex-1">
          <LinearGradient
            colors={['#142235', '#0a0c10']}
            start={{ x: 0.5, y: 0.2 }}
            end={{ x: 0.5, y: 1 }}
            className="flex-1">
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}>
              <View className="px-8 pt-8 pb-4">
                <Text className="text-4xl font-bold text-white mb-2">
                  Minha Biblioteca
                </Text>
                {isPending ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="#6b8bff" />
                    <Text className="text-gray-400 text-sm ml-2">Carregando...</Text>
                  </View>
                ) : (
                  <Text className="text-gray-400 text-sm">
                    {filteredGames.length} {filteredGames.length === 1 ? 'jogo alugado' : 'jogos alugados'}
                  </Text>
                )}
              </View>

              {(gamesError || rentsError) && (
                <View className="px-8 mb-4">
                  {gamesError && (
                    <View className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-2">
                      <Text className="text-red-400 text-sm font-semibold mb-1">
                        Erro ao carregar biblioteca
                      </Text>
                      <Text className="text-red-300/80 text-xs">
                        {gamesError.message || 'Não foi possível carregar os jogos'}
                      </Text>
                    </View>
                  )}
                  {rentsError && (
                    <View className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                      <Text className="text-red-400 text-sm font-semibold mb-1">
                        Erro ao buscar aluguéis ativos
                      </Text>
                      <Text className="text-red-300/80 text-xs">
                        {rentsError.message || 'Não foi possível carregar os aluguéis'}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              <SearchAndFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                showFavoritesOnly={false}
                onToggleFavorites={() => {}}
              />
              {isPending ? (
                <View className="items-center justify-center py-12">
                  <ActivityIndicator size="large" color="#6b8bff" />
                  <Text className="text-gray-400 mt-4">Carregando jogos...</Text>
                </View>
              ) : filteredGames && Array.isArray(filteredGames) && filteredGames.length > 0 ? (
                <GameGrid 
                  games={filteredGames} 
                  isLibrary={true} 
                  activeRents={activeRents || []}
                  onRentReturned={async () => {
                    await queryClient.invalidateQueries({ 
                      queryKey: ['rents'],
                      exact: false 
                    });
                    
                    if (user?.id) {
                      await queryClient.refetchQueries({ 
                        queryKey: ['rents', 'active', user.id],
                        type: 'active'
                      });
                    }
                    
                    await refetchRents();
                  }}
                />
              ) : (
                <View className="items-center justify-center py-12 px-6">
                  <Text className="text-gray-400 text-lg text-center mb-4">
                    {gamesError || rentsError
                      ? 'Não foi possível carregar os dados. Tente novamente mais tarde.'
                      : (activeRents && Array.isArray(activeRents) && activeRents.length === 0) || !activeRents
                      ? 'Você ainda não alugou nenhum jogo.\nExplore o catálogo e alugue seus jogos favoritos!'
                      : searchQuery || selectedCategory
                      ? 'Nenhum jogo alugado encontrado com os filtros aplicados'
                      : 'Nenhum jogo alugado'}
                  </Text>
                  <Pressable
                    onPress={() => {
                      refetchRents();
                    }}
                    className="mt-4 bg-blue-500/20 border border-blue-500/40 rounded-lg px-4 py-2">
                    <Text className="text-blue-400 text-sm font-medium">Atualizar</Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </>
  );
}

