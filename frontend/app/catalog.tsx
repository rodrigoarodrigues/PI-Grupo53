import { Text } from '@/components/ui/text';
import { Stack, useRouter, Redirect } from 'expo-router';
import { View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { getGames, GetGameProps } from '@/data/games/getGames';
import { SearchAndFilters } from '@/components/games/SearchAndFilters';
import { GameGrid } from '@/components/games/GameGrid';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useMemo, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { CreateGameModal } from '@/components/games/CreateGameModal';
import { PlusIcon } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { WalletHeader } from '@/components/wallet/WalletHeader';
import { DepositModal } from '@/components/wallet/DepositModal';

export default function CatalogScreen() {
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isPending, error, data, refetch: refetchGames } = getGames();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const filteredGames = useMemo(() => {
    if (!data) return [];

    let filtered = [...data];

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
  }, [data, searchQuery, selectedCategory]);

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

  if (isPending) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <View
          className="flex-1 items-center justify-center"
          style={{
            backgroundColor: '#0a0c10',
          }}>
          <ActivityIndicator size="large" color="#6b8bff" />
          <Text className="text-gray-400 mt-4">Carregando catálogo...</Text>
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <View
          className="flex-1 items-center justify-center p-4"
          style={{
            backgroundColor: '#0a0c10',
          }}>
          <Text className="text-red-400 text-xl mb-2">Erro ao carregar jogos</Text>
          <Text className="text-gray-400">{error.message}</Text>
        </View>
      </>
    );
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
              <View className="px-8 pt-6">
                {/* Botões Novo Jogo e Depositar - Lado a lado */}
                <View className="flex-row items-center justify-between mb-4">
                  {isAdmin && (
                    <Pressable onPress={() => setIsCreateModalVisible(true)}>
                      <LinearGradient
                        colors={['#6b8bff', '#bc7cff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="flex-row items-center px-4 py-2 rounded-lg">
                        <PlusIcon size={20} color="#fff" />
                        <Text className="text-white font-semibold ml-2">Novo Jogo</Text>
                      </LinearGradient>
                    </Pressable>
                  )}
                  <WalletHeader onDepositPress={() => setShowDepositModal(true)} />
                </View>
                
                <View className="mb-4">
                  <Text className="text-2xl font-semibold text-white">
                    Catálogo de Jogos
                  </Text>
                </View>
              </View>
              <SearchAndFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                showFavoritesOnly={false}
                onToggleFavorites={() => {}}
              />
              {filteredGames && filteredGames.length > 0 ? (
                <GameGrid 
                  games={filteredGames} 
                  showDeleteButton={isAdmin}
                  onGameDeleted={async () => {
                    await queryClient.invalidateQueries({ queryKey: ['games'] });
                    await refetchGames();
                  }}
                />
              ) : (
                <View className="items-center justify-center py-12 px-6">
                  <Text className="text-gray-400 text-lg">
                    {searchQuery || selectedCategory
                      ? 'Nenhum jogo encontrado com os filtros aplicados'
                      : 'Nenhum jogo disponível'}
                  </Text>
                </View>
              )}
              <CreateGameModal
                visible={isCreateModalVisible}
                onClose={() => setIsCreateModalVisible(false)}
              />
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
      <DepositModal
        visible={showDepositModal}
        onClose={() => setShowDepositModal(false)}
      />
    </>
  );
}

