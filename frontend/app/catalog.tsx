import { Text } from '@/components/ui/text';
import { Stack, useRouter, Redirect } from 'expo-router';
import { View, ScrollView, ActivityIndicator, Pressable, Platform, useWindowDimensions } from 'react-native';
import { getGames, GetGameProps } from '@/data/games/getGames';
import { SearchAndFilters } from '@/components/games/SearchAndFilters';
import { GameGrid } from '@/components/games/GameGrid';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useMemo, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { DrawerNav } from '@/components/layout/DrawerNav';
import { useAuth } from '@/contexts/AuthContext';
import { CreateGameModal } from '@/components/games/CreateGameModal';
import { PlusIcon, MenuIcon } from 'lucide-react-native';
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Detectar se é mobile
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

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
      <View className="flex-1 bg-[#0a0c10]" style={{ flexDirection: isMobile ? 'column' : 'row' }}>
        {/* Sidebar apenas para desktop */}
        {!isMobile && <Sidebar />}
        
        {/* DrawerNav para mobile */}
        {isMobile && (
          <DrawerNav 
            isOpen={isDrawerOpen} 
            onClose={() => setIsDrawerOpen(false)} 
          />
        )}

        <View className="flex-1 relative">
          <LinearGradient
            colors={['#142235', '#0a0c10']}
            start={{ x: 0.5, y: 0.2 }}
            end={{ x: 0.5, y: 1 }}
            className="flex-1">
            
            {/* Menu Hamburguer - Mobile apenas */}
            {isMobile && (
              <View 
                style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  zIndex: 20,
                }}>
                <Pressable
                  onPress={() => setIsDrawerOpen(true)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 8,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  }}>
                  <MenuIcon size={24} color="#fff" />
                </Pressable>
              </View>
            )}
            
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}>
              
              {/* Header Section com Wallet */}
              <View style={{ 
                paddingHorizontal: isMobile ? 16 : 32, 
                paddingTop: isMobile ? 70 : 24, // Espaço maior no mobile para o menu hamburguer
                marginBottom: isMobile ? 16 : 20
              }}>
                {/* Wallet Header - Mobile: Centralizado no topo */}
                {isMobile ? (
                  <View className="items-center mb-6">
                    <WalletHeader onDepositPress={() => setShowDepositModal(true)} />
                  </View>
                ) : (
                  <View 
                    style={{
                      position: 'absolute',
                      top: 24,
                      right: 32,
                      zIndex: 10,
                    }}>
                    <WalletHeader onDepositPress={() => setShowDepositModal(true)} />
                  </View>
                )}

                {/* Botão Novo Jogo (apenas admin) */}
                {isAdmin && (
                  <View className="mb-4">
                    <Pressable onPress={() => setIsCreateModalVisible(true)}>
                      <LinearGradient
                        colors={['#6b8bff', '#bc7cff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingHorizontal: isMobile ? 16 : 20,
                          paddingVertical: isMobile ? 10 : 12,
                          borderRadius: 8,
                          width: isMobile ? '100%' : 'auto',
                          alignSelf: isMobile ? 'stretch' : 'flex-start',
                        }}>
                        <PlusIcon size={isMobile ? 18 : 20} color="#fff" />
                        <Text 
                          className="text-white font-semibold ml-2" 
                          style={{ fontSize: isMobile ? 14 : 16 }}>
                          Novo Jogo
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                )}
                
                {/* Título */}
                <View className="mb-4">
                  <Text 
                    className="font-bold text-white"
                    style={{ fontSize: isMobile ? 22 : 28 }}>
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
              
              {/* Container centralizado para os jogos */}
              <View style={{ 
                alignItems: 'center', 
                width: '100%',
              }}>
                {filteredGames && filteredGames.length > 0 ? (
                  <View style={{ 
                    width: '100%',
                    maxWidth: isMobile ? width : 1200, // Largura máxima para desktop
                  }}>
                    <GameGrid 
                      games={filteredGames} 
                      showDeleteButton={isAdmin}
                      onGameDeleted={async () => {
                        await queryClient.invalidateQueries({ queryKey: ['games'] });
                        await refetchGames();
                      }}
                    />
                  </View>
                ) : (
                  <View className="items-center justify-center py-12 px-6">
                    <Text 
                      className="text-gray-400 text-center"
                      style={{ fontSize: isMobile ? 15 : 18 }}>
                      {searchQuery || selectedCategory
                        ? 'Nenhum jogo encontrado com os filtros aplicados'
                        : 'Nenhum jogo disponível'}
                    </Text>
                  </View>
                )}
              </View>
              
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

