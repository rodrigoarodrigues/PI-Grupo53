import { Text } from '@/components/ui/text';
import { Stack, useLocalSearchParams, useRouter, Redirect } from 'expo-router';
import { View, Image, ActivityIndicator, ScrollView, Pressable, TextInput } from 'react-native';
import { getGameFromId } from '@/data/games/getGameFromId';
import { GameDetailsHeader } from '@/components/games/GameDetailsHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  PackageIcon, 
  DownloadIcon, 
  UsersIcon, 
  GlobeIcon,
  ArrowLeftIcon,
  EditIcon,
  CheckIcon,
  XIcon
} from 'lucide-react-native';
import { EditFieldModal } from '@/components/games/EditFieldModal';
import { PlayStationLogo } from '@/components/ui/playstation-logo';
import { useState, useEffect } from 'react';
import { useCreateRent } from '@/data/rents/createRent';
import { Alert, Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { updateGame } from '@/data/games/updateGame';

export default function GameDetailsScreen() {
  const { uuid } = useLocalSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, isClient, isAdmin, isLoading: authLoading } = useAuth();
  const [rentalType, setRentalType] = useState<'unitario' | 'assinatura'>('unitario');
  const [days, setDays] = useState<string>('7');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState('');
  const [isSavingDescription, setIsSavingDescription] = useState(false);
  const [editField, setEditField] = useState<'imageUrl' | 'platform' | 'size' | 'multiplayer' | 'languages' | null>(null);
  const createRentMutation = useCreateRent();
  const queryClient = useQueryClient();

  const { isPending, error, data } = getGameFromId(uuid as string);
  const game = Array.isArray(data) ? data?.[0] : data;
  const gameId = game?.id ? (typeof game.id === 'string' ? Number(game.id) : game.id) : 0;

  const gameDescription = game?.description || '';
  const gamePlatform = game?.platform || 'N/A';
  const gameSize = game?.size || 'N/A';
  const gameMultiplayer = game?.multiplayer ? 'Sim' : 'Não';
  const gameLanguages = game?.languages || 'N/A';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, authLoading]);

  // Sincronizar tempDescription quando o jogo for atualizado e não estiver editando
  useEffect(() => {
    if (!isEditingDescription && game) {
      setTempDescription(gameDescription);
    }
  }, [gameDescription, isEditingDescription]);

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

  const canRent = isClient || isAdmin;

  const handleSaveDescription = async () => {
    if (!game || !gameId || gameId <= 0) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('Erro: Jogo não encontrado');
      } else {
        Alert.alert('Erro', 'Jogo não encontrado');
      }
      return;
    }

    // Verificar se a descrição mudou
    if (tempDescription === gameDescription) {
      setIsEditingDescription(false);
      return;
    }

    setIsSavingDescription(true);

    try {
      await updateGame(gameId, {
        description: tempDescription,
      });

      // Invalidar queries para atualizar a UI
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['games', uuid] });

      setIsEditingDescription(false);

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('Descrição atualizada com sucesso!');
      } else {
        Alert.alert('Sucesso', 'Descrição atualizada com sucesso!');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao atualizar descrição';
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert(`Erro: ${errorMessage}`);
      } else {
        Alert.alert('Erro', errorMessage);
      }
      // Reverter para a descrição original em caso de erro
      setTempDescription(gameDescription);
    } finally {
      setIsSavingDescription(false);
    }
  };

  const handleCancelEdit = () => {
    setTempDescription(gameDescription);
    setIsEditingDescription(false);
  };

  const handleRent = async () => {
    if (!canRent) {
      Alert.alert('Erro', 'Apenas clientes podem alugar jogos');
      return;
    }

    if (!game || !gameId) {
      Alert.alert('Erro', 'Jogo não encontrado');
      return;
    }

    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    const userId = user.id;

    try {
      const result = await createRentMutation.mutateAsync({
        userId,
        gameId,
        rentalType,
        startDate: new Date().toISOString().split('T')[0],
        days: rentalType === 'unitario' ? Number(days) : undefined,
        paymentMethod: 'credit_card',
        forcePaymentSuccess: true,
      });

      if (result.payment.success) {
        queryClient.invalidateQueries({ queryKey: ['rents'] });
        queryClient.invalidateQueries({ queryKey: ['rents', 'active'] });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await queryClient.refetchQueries({ queryKey: ['rents', 'active', user.id] });
        
        Alert.alert(
          'Jogo alugado com sucesso! 🎮',
          `O jogo "${game.title}" foi adicionado à sua biblioteca!\n\nPreço: R$ ${result.price.toFixed(2)}`,
          [
            { text: 'Continuar', style: 'cancel' },
            {
              text: 'Ver Biblioteca',
              onPress: async () => {
                queryClient.invalidateQueries({ queryKey: ['rents'] });
                queryClient.invalidateQueries({ queryKey: ['rents', 'active'] });
                await queryClient.refetchQueries({ queryKey: ['rents', 'active', user.id] });
                router.push('/library');
              },
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao criar aluguel');
    }
  };

  if (!uuid) {
    return (
      <View className="flex-1 items-center justify-center p-4 bg-[#0a0c10]">
        <Text className="text-center text-xl text-red-500">Jogo não encontrado</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <LinearGradient
        colors={['#142235', '#0a0c10']}
        start={{ x: 0.5, y: 0.2 }}
        end={{ x: 0.5, y: 1 }}
        className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}>
          <View className="px-8 pt-6 pb-2">
            <Pressable
              onPress={() => router.back()}
              className="flex-row items-center gap-2">
              <View className="bg-white/5 border border-white/10 rounded-full p-2">
                <ArrowLeftIcon size={20} color="#9ca3af" />
              </View>
              <Text className="text-gray-300 font-medium">Voltar para lista</Text>
            </Pressable>
          </View>

          <GameDetailsHeader />

          {isPending && (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#6b8bff" />
              <Text className="text-gray-400 mt-4">Carregando detalhes...</Text>
            </View>
          )}

          {error && (
            <View className="flex-1 items-center justify-center py-20 px-4">
              <Text className="text-red-400 text-xl mb-2">Erro ao carregar jogo</Text>
              <Text className="text-gray-400">{error.message}</Text>
            </View>
          )}

          {game && (
            <View className="px-8 mt-4">
              <View className="flex-row gap-8 mb-8 flex-wrap">
                <View style={{ width: 280, minWidth: 280 }}>
                  <View className="relative rounded-xl overflow-hidden bg-white/5" style={{ height: 480 }}>
                    {game.imageUrl ? (
                      <Image
                        source={{ uri: game.imageUrl }}
                        className="w-full h-full"
                        style={{ resizeMode: 'cover' }}
                      />
                    ) : (
                      <View className="flex-1 items-center justify-center bg-white/5">
                        <Text className="text-8xl">🎮</Text>
                      </View>
                    )}
                    <Pressable
                      onPress={() => setEditField('imageUrl')}
                      className="absolute top-2 right-2 bg-black/60 rounded-full p-2">
                      <EditIcon size={18} color="#fff" />
                    </Pressable>
                  </View>
                </View>

                <View className="flex-1" style={{ minWidth: 400 }}>
                  <Text
                    className="text-5xl font-extrabold mb-4"
                    style={{
                      color: '#bc7cff',
                      textShadowColor: '#6b8bff',
                      textShadowOffset: { width: 0, height: 0 },
                      textShadowRadius: 20,
                      letterSpacing: 1,
                    }}>
                    {game.title}
                  </Text>

                  <View className="flex-row gap-6 mb-6">
                    <View className="flex-row items-center gap-2">
                      <PackageIcon size={20} color="#9ca3af" />
                      <Text className="text-white font-medium">{game.quantity} unid.</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <PlayStationLogo size={20} />
                      <Text className="text-white font-medium">{gamePlatform}</Text>
                    </View>
                  </View>

                  {canRent && (
                    <Pressable
                      onPress={handleRent}
                      disabled={createRentMutation.isPending}
                      className="mb-8">
                    <LinearGradient
                      colors={['#6b8bff', '#bc7cff']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        paddingVertical: 14,
                        paddingHorizontal: 32,
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        maxWidth: 350,
                      }}>
                      {createRentMutation.isPending ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text className="text-base font-bold text-white">
                          Alugar Jogo Agora
                        </Text>
                      )}
                    </LinearGradient>
                  </Pressable>
                  )}
                </View>
              </View>

              <View className="mb-8">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-2xl font-semibold text-white">Descrição</Text>
                  {!isEditingDescription ? (
                    <Pressable
                      onPress={() => {
                        setTempDescription(gameDescription);
                        setIsEditingDescription(true);
                      }}
                      className="flex-row items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                      <EditIcon size={16} color="#9ca3af" />
                      <Text className="text-gray-300 text-sm">Editar</Text>
                    </Pressable>
                  ) : (
                    <View className="flex-row items-center gap-2">
                      <Pressable
                        onPress={handleSaveDescription}
                        disabled={isSavingDescription}
                        className="flex-row items-center gap-2 bg-green-500/20 border border-green-500/40 rounded-lg px-3 py-2"
                        style={{ opacity: isSavingDescription ? 0.6 : 1 }}>
                        {isSavingDescription ? (
                          <>
                            <ActivityIndicator size="small" color="#10b981" />
                            <Text className="text-green-400 text-sm">Salvando...</Text>
                          </>
                        ) : (
                          <>
                            <CheckIcon size={16} color="#10b981" />
                            <Text className="text-green-400 text-sm">Salvar</Text>
                          </>
                        )}
                      </Pressable>
                      <Pressable
                        onPress={handleCancelEdit}
                        disabled={isSavingDescription}
                        className="flex-row items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2"
                        style={{ opacity: isSavingDescription ? 0.6 : 1 }}>
                        <XIcon size={16} color="#9ca3af" />
                        <Text className="text-gray-300 text-sm">Cancelar</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
                <View className="bg-white/5 border border-white/10 rounded-xl p-6">
                  {isEditingDescription ? (
                    <TextInput
                      value={tempDescription}
                      onChangeText={setTempDescription}
                      multiline
                      numberOfLines={6}
                      className="text-gray-300 leading-6"
                      style={{
                        textAlignVertical: 'top',
                        minHeight: 120,
                        color: '#d1d5db',
                      }}
                      placeholderTextColor="#9ca3af"
                    />
                  ) : (
                    <Text className="text-gray-300 leading-6">{gameDescription}</Text>
                  )}
                </View>
              </View>

              <View className="mb-8">
                <Text className="text-2xl font-semibold text-white mb-4">Informações</Text>
                <View className="flex-row flex-wrap gap-3">
                  <View className="bg-white/5 border border-white/10 rounded-xl p-3" style={{ flex: 1, minWidth: 160 }}>
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text className="text-xs text-gray-400">Plataforma</Text>
                      <Pressable
                        onPress={() => setEditField('platform')}
                        className="p-1">
                        <EditIcon size={14} color="#9ca3af" />
                      </Pressable>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <PlayStationLogo size={18} />
                      <Text className="text-white font-semibold text-base">{gamePlatform}</Text>
                    </View>
                  </View>

                  <View className="bg-white/5 border border-white/10 rounded-xl p-3" style={{ flex: 1, minWidth: 160 }}>
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text className="text-xs text-gray-400">Tamanho</Text>
                      <Pressable
                        onPress={() => setEditField('size')}
                        className="p-1">
                        <EditIcon size={14} color="#9ca3af" />
                      </Pressable>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <DownloadIcon size={18} color="#9ca3af" />
                      <Text className="text-white font-semibold text-base">{gameSize}</Text>
                    </View>
                  </View>

                  <View className="bg-white/5 border border-white/10 rounded-xl p-3" style={{ flex: 1, minWidth: 160 }}>
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text className="text-xs text-gray-400">Multiplayer</Text>
                      <Pressable
                        onPress={() => setEditField('multiplayer')}
                        className="p-1">
                        <EditIcon size={14} color="#9ca3af" />
                      </Pressable>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <UsersIcon size={18} color="#9ca3af" />
                      <Text className="text-white font-semibold text-base">{gameMultiplayer}</Text>
                    </View>
                  </View>

                  <View className="bg-white/5 border border-white/10 rounded-xl p-3" style={{ flex: 1, minWidth: 160 }}>
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text className="text-xs text-gray-400">Idiomas</Text>
                      <Pressable
                        onPress={() => setEditField('languages')}
                        className="p-1">
                        <EditIcon size={14} color="#9ca3af" />
                      </Pressable>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <GlobeIcon size={18} color="#9ca3af" />
                      <Text className="text-white font-semibold text-base">{gameLanguages}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
        {editField && (
          <EditFieldModal
            visible={!!editField}
            onClose={() => setEditField(null)}
            game={game}
            field={editField}
            fieldLabel={
              editField === 'imageUrl' ? 'Imagem' :
              editField === 'platform' ? 'Plataforma' :
              editField === 'size' ? 'Tamanho' :
              editField === 'multiplayer' ? 'Multiplayer' :
              'Idiomas'
            }
          />
        )}
      </LinearGradient>
    </>
  );
}
