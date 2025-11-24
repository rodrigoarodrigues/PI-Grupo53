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
import { SubscriptionModal } from '@/components/games/SubscriptionModal';
import { PlayStationLogo } from '@/components/ui/playstation-logo';
import { useState, useEffect, useMemo } from 'react';
import { useCreateRent } from '@/data/rents/createRent';
import { Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { updateGame } from '@/data/games/updateGame';
import { calculateRentalPrice } from '@/utils/priceCalculator';
import { getActiveRents } from '@/data/rents/getActiveRents';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlertService } from '@/services/AlertService';
import { PurchaseConfirmModal } from '@/components/wallet/PurchaseConfirmModal';

export default function GameDetailsScreen() {
  const { uuid } = useLocalSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, isClient, isAdmin, isLoading: authLoading } = useAuth();
  const [rentalType, setRentalType] = useState<'assinatura_full' | null>(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState('');
  const [isSavingDescription, setIsSavingDescription] = useState(false);
  const [editField, setEditField] = useState<'title' | 'imageUrl' | 'platform' | 'size' | 'multiplayer' | 'languages' | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [hasChosenSubscription, setHasChosenSubscription] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const createRentMutation = useCreateRent();
  const queryClient = useQueryClient();
  const { updateWallet, refreshWallet } = useAuth();

  // Verificar se é o primeiro acesso (apenas para clientes)
  useEffect(() => {
    const checkFirstAccess = async () => {
      if (!user || !isClient || isAdmin) return;
      
      try {
        const storage = Platform.OS === 'web' && typeof window !== 'undefined' && 'localStorage' in window
          ? {
              getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
              setItem: (key: string, value: string) => Promise.resolve(window.localStorage.setItem(key, value)),
            }
          : {
              getItem: (key: string) => AsyncStorage.getItem(key),
              setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
            };

        const subscriptionKey = `subscription_chosen_${user.id}`;
        const chosen = await storage.getItem(subscriptionKey);
        
        if (!chosen) {
          // Primeiro acesso - mostrar modal (mas não forçar escolha)
          setShowSubscriptionModal(true);
        } else {
          // Já escolheu - carregar escolha
          const subscriptionData = JSON.parse(chosen);
          if (subscriptionData.type === 'assinatura_full') {
            setRentalType('assinatura_full');
            setHasChosenSubscription(true);
          } else {
            // Sem assinatura (ou plano antigo removido)
            setRentalType(null);
            setHasChosenSubscription(true);
          }
        }
      } catch (error) {
        // Em caso de erro, mostrar modal
        setShowSubscriptionModal(true);
      }
    };

    if (isAuthenticated && isClient && !isAdmin && !authLoading) {
      checkFirstAccess();
    }
  }, [user, isAuthenticated, isClient, isAdmin, authLoading]);

  const handleSubscriptionSelect = async (type: 'assinatura_full') => {
    setRentalType(type);
    setShowSubscriptionModal(false);
    setHasChosenSubscription(true);

    // Salvar escolha
    try {
      const storage = Platform.OS === 'web' && typeof window !== 'undefined' && 'localStorage' in window
        ? {
            setItem: (key: string, value: string) => Promise.resolve(window.localStorage.setItem(key, value)),
          }
        : {
            setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
          };

      const subscriptionKey = `subscription_chosen_${user?.id}`;
      await storage.setItem(subscriptionKey, JSON.stringify({ type, date: new Date().toISOString() }));

      // Mostrar mensagem de sucesso para plano Full
      AlertService.success(
        '🎉 Assinatura Full Ativada!',
        'Assinado com sucesso! Você tem direito a 3 jogos grátis do catálogo!'
      );
    } catch (error) {
      console.error('Erro ao salvar escolha de assinatura:', error);
    }
  };

  const { isPending, error, data } = getGameFromId(uuid as string);
  const game = Array.isArray(data) ? data?.[0] : data;
  const gameId = game?.id ? (typeof game.id === 'string' ? Number(game.id) : game.id) : 0;

  // Buscar aluguéis ativos do usuário (para assinatura)
  const { data: activeRents } = getActiveRents(user?.id);
  const subscriptionRents = activeRents?.filter(rent => rent.rentalType === 'assinatura') || [];
  
  // Contar jogos grátis resgatados (apenas para Assinatura Full)
  const freeGamesCount = rentalType === 'assinatura_full' ? subscriptionRents.length : 0;
  const canRescueFreeGame = rentalType === 'assinatura_full' && freeGamesCount < 3;
  const hasSubscription = rentalType === 'assinatura_full';

  const gameDescription = game?.description || '';
  const gamePlatform = game?.platform || 'N/A';
  const gameSize = game?.size || 'N/A';
  const gameMultiplayer = game?.multiplayer ? 'Sim' : 'Não';
  const gameLanguages = game?.languages || 'N/A';

  // Calcular preço do aluguel - DEVE SER ANTES DOS EARLY RETURNS
  const basePrice = 10.0; // Preço base do jogo
  const subscriptionMonthlyPrice = 50.0; // Preço da assinatura mensal
  
  const gamePrice = parseFloat(game?.price?.toString() || "0.00");

  const rentalPrice = useMemo(() => {
    if (!game) return 0;
    
    // ============================================
    // LÓGICA PROFISSIONAL DE CÁLCULO DE PREÇO
    // ============================================
    // Prioridade: Preço do jogo cadastrado > Lógica de planos
    
    if (gamePrice > 0) {
      // JOGO COM PREÇO CADASTRADO
      if (rentalType === 'assinatura_full') {
        // Assinatura Full: 3 primeiros jogos são grátis
        if (freeGamesCount < 3) {
          // Ainda dentro dos 3 jogos grátis
          return 0;
        } else {
          // Já usou os 3 jogos grátis - cobrar o preço do jogo
          return gamePrice;
        }
      } else {
        // Sem assinatura: sempre cobra o preço do jogo
        return gamePrice;
      }
    } else {
      // JOGO SEM PREÇO CADASTRADO - Usar lógica antiga
      if (rentalType === 'assinatura_full') {
        // Assinatura Full: grátis até 3 jogos, depois paga valor cheio
        if (freeGamesCount >= 3) {
          return calculateRentalPrice({
            rentalType: 'unitario',
            basePrice,
            days: 30,
          });
        } else {
          return 0;
        }
      } else {
        // Sem assinatura: preço calculado baseado em dias
        return calculateRentalPrice({
          rentalType: 'unitario',
          basePrice,
          days: 30,
        });
      }
    }
    
    return 0;
  }, [rentalType, game, freeGamesCount, basePrice, subscriptionMonthlyPrice, gamePrice]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // Sincronizar tempDescription quando o jogo for atualizado e não estiver editando
  useEffect(() => {
    if (!isEditingDescription && game) {
      setTempDescription(gameDescription);
    }
  }, [gameDescription, isEditingDescription, game]);

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
      AlertService.error('Erro', 'Jogo não encontrado');
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
      AlertService.success('Sucesso', 'Descrição atualizada com sucesso!');
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao atualizar descrição';
      AlertService.error('Erro', errorMessage);
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
      AlertService.error('Erro', 'Apenas clientes podem alugar jogos');
      return;
    }

    if (!game || !gameId) {
      AlertService.error('Erro', 'Jogo não encontrado');
      return;
    }

    if (!user) {
      AlertService.error('Erro', 'Usuário não autenticado');
      return;
    }

    const userId = user.id;

    // Se houver valor a pagar (compra ou aluguel), mostrar modal de confirmação
    // Verificar rentalPrice calculado para saber se precisa pagar
    const priceToPay = rentalPrice > 0 ? rentalPrice : (gamePrice > 0 ? gamePrice : 0);
    
    if (priceToPay > 0 && !isAdmin) {
      setShowPurchaseModal(true);
      return;
    }

    // Admin: aluguel simplificado sem restrições
    if (isAdmin) {
      try {
        const result = await createRentMutation.mutateAsync({
          userId,
          gameId,
          rentalType: 'assinatura',
          startDate: new Date().toISOString().split('T')[0],
          days: undefined,
          paymentMethod: 'credit_card',
          forcePaymentSuccess: true,
        });

        if (result.payment.success) {
          queryClient.invalidateQueries({ queryKey: ['rents'] });
          queryClient.invalidateQueries({ queryKey: ['rents', 'active'] });
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
          await queryClient.refetchQueries({ queryKey: ['rents', 'active', user.id] });
          
          AlertService.success(
            'Jogo adicionado! 🎮',
            `O jogo "${game.title}" foi adicionado à sua biblioteca!`,
            () => {
              queryClient.invalidateQueries({ queryKey: ['rents'] });
              queryClient.invalidateQueries({ queryKey: ['rents', 'active'] });
              queryClient.refetchQueries({ queryKey: ['rents', 'active', user.id] });
              router.push('/library');
            }
          );
        }
      } catch (error: any) {
        AlertService.error('Erro', error.message || 'Erro ao adicionar jogo');
      }
      return;
    }

    // Cliente: lógica normal de assinatura (apenas para jogos sem preço/aluguel)
    // Converter tipos de assinatura para o formato do backend
    let backendRentalType: 'unitario' | 'assinatura' = 'unitario';
    let backendDays: number | undefined = 30;
    
    if (rentalType === 'assinatura_full') {
      // Assinatura Full: se já tem 3 jogos, paga unitário. Senão, é assinatura grátis
      if (freeGamesCount >= 3) {
        backendRentalType = 'unitario';
        backendDays = 30;
      } else {
        backendRentalType = 'assinatura';
        backendDays = undefined;
      }
    } else {
      // Sem assinatura: sempre unitário (paga valor cheio)
      backendRentalType = 'unitario';
      backendDays = 30;
    }

    try {
      const result = await createRentMutation.mutateAsync({
        userId,
        gameId,
        rentalType: backendRentalType,
        startDate: new Date().toISOString().split('T')[0],
        days: backendDays,
        paymentMethod: 'credit_card',
        forcePaymentSuccess: true,
      });

      if (result.payment.success) {
        // Atualizar saldo se houve cobrança
        if (result.price > 0) {
          const newBalance = (user.wallet || 0) - result.price;
          updateWallet(newBalance);
          await refreshWallet();
        }

        queryClient.invalidateQueries({ queryKey: ['rents'] });
        queryClient.invalidateQueries({ queryKey: ['rents', 'active'] });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await queryClient.refetchQueries({ queryKey: ['rents', 'active', user.id] });
        
        AlertService.success(
          'Jogo adicionado! 🎮',
          `O jogo "${game.title}" foi adicionado à sua biblioteca!${result.price > 0 ? `\n\nPreço: R$ ${result.price.toFixed(2)}` : '\n\nJogo grátis!'}`,
          () => {
            queryClient.invalidateQueries({ queryKey: ['rents'] });
            queryClient.invalidateQueries({ queryKey: ['rents', 'active'] });
            queryClient.refetchQueries({ queryKey: ['rents', 'active', user.id] });
            router.push('/library');
          }
        );
      }
    } catch (error: any) {
      AlertService.error('Erro', error.message || 'Erro ao criar aluguel');
    }
  };

  const handleConfirmPurchase = async () => {
    if (!game || !gameId || !user) return;

    const userId = user.id;

    // Converter tipos de assinatura para o formato do backend
    let backendRentalType: 'unitario' | 'assinatura' = 'unitario';
    let backendDays: number | undefined = 30;
    
    if (rentalType === 'assinatura_full') {
      // Assinatura Full: se já tem 3 jogos, paga unitário. Senão, é assinatura grátis
      if (freeGamesCount >= 3) {
        backendRentalType = 'unitario';
        backendDays = 30;
      } else {
        backendRentalType = 'assinatura';
        backendDays = undefined;
      }
    } else {
      // Sem assinatura: sempre unitário (paga valor cheio)
      backendRentalType = 'unitario';
      backendDays = 30;
    }

    try {
      const result = await createRentMutation.mutateAsync({
        userId,
        gameId,
        rentalType: backendRentalType,
        startDate: new Date().toISOString().split('T')[0],
        days: backendDays,
        paymentMethod: 'credit_card',
        forcePaymentSuccess: true,
      });

      if (result.payment.success) {
        // Atualizar saldo usando o valor retornado pelo backend (mais confiável)
        // O backend retorna newBalance que é o saldo atualizado após a subtração
        if (result.newBalance !== undefined) {
          updateWallet(result.newBalance);
        } else if (result.price > 0) {
          // Fallback: calcular localmente se o backend não retornar o novo saldo
          const newBalance = (user.wallet || 0) - result.price;
          updateWallet(newBalance);
        }
        
        // Buscar saldo atualizado do servidor para garantir sincronização total
        await refreshWallet();
        
        // Invalidar e atualizar queries de aluguéis e carteira
        queryClient.invalidateQueries({ queryKey: ['rents'] });
        queryClient.invalidateQueries({ queryKey: ['rents', 'active'] });
        queryClient.invalidateQueries({ queryKey: ['wallet', user.id] });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await queryClient.refetchQueries({ queryKey: ['rents', 'active', user.id] });
        
        // Mensagem de sucesso com informações detalhadas do backend
        const finalBalance = result.newBalance !== undefined 
          ? result.newBalance 
          : (result.price > 0 ? (user.wallet || 0) - result.price : user.wallet || 0);
        
        const successMessage = result.price > 0
          ? `O jogo "${game.title}" foi adicionado à sua biblioteca!\n\n💰 Preço pago: R$ ${result.price.toFixed(2)}\n💳 Novo saldo: R$ ${finalBalance.toFixed(2)}`
          : `O jogo "${game.title}" foi adicionado à sua biblioteca!\n\n🎁 Jogo grátis!`;
        
        // Fechar modal após sucesso
        setShowPurchaseModal(false);
        
        AlertService.success(
          'Compra realizada! 🎮',
          successMessage,
          () => {
            queryClient.invalidateQueries({ queryKey: ['rents'] });
            queryClient.invalidateQueries({ queryKey: ['rents', 'active'] });
            queryClient.refetchQueries({ queryKey: ['rents', 'active', user.id] });
            router.push('/library');
          }
        );
      }
    } catch (error: any) {
      // Em caso de erro, manter o modal aberto para o usuário ver o problema
      if (error.message?.includes('Saldo insuficiente')) {
        AlertService.error('Saldo insuficiente', error.message);
      } else {
        AlertService.error('Erro', error.message || 'Erro ao realizar compra');
      }
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
              onPress={() => router.push('/catalog')}
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
              <View className="flex-row gap-8 mb-8" style={{ alignItems: 'flex-start' }}>
                {/* Coluna Esquerda: Imagem */}
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
                    {isAdmin && (
                      <Pressable
                        onPress={() => setEditField('imageUrl')}
                        className="absolute top-2 right-2 bg-black/60 rounded-full p-2">
                        <EditIcon size={18} color="#fff" />
                      </Pressable>
                    )}
                  </View>
                </View>

                {/* Coluna Direita: Informações do Jogo e Seção de Aluguel */}
                <View className="flex-1" style={{ minWidth: 400 }}>
                  {/* Informações do Jogo */}
                  <View className="mb-4">
                    <View className="flex-row items-start" style={{ gap: 8 }}>
                      <Text
                        className="text-5xl font-extrabold"
                        style={{
                          color: '#bc7cff',
                          textShadowColor: '#6b8bff',
                          textShadowOffset: { width: 0, height: 0 },
                          textShadowRadius: 20,
                          letterSpacing: 1,
                          flexShrink: 1,
                        }}>
                        {game.title}
                      </Text>
                      {isAdmin && (
                        <Pressable
                          onPress={() => setEditField('title')}
                          className="bg-white/5 border border-white/10 rounded-full"
                          style={{ 
                            flexShrink: 0,
                            width: 32,
                            height: 32,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: 6,
                          }}>
                          <EditIcon size={14} color="#ffffff" />
                        </Pressable>
                      )}
                    </View>
                  </View>

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

                  {/* Seção de Aluguel */}
                  {canRent && (
                    <View style={{ width: 380, minWidth: 380 }}>
                      <View className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <Text className="text-lg font-semibold text-white mb-4">
                          {isAdmin ? 'Adicionar à Biblioteca' : gamePrice > 0 ? 'Alugar/Comprar Jogo' : 'Alugar Jogo'}
                        </Text>
                        
                        {/* Interface simplificada para Admin */}
                        {isAdmin ? (
                          <>
                            <View className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                              <Text className="text-xs text-green-400 font-semibold">
                                ✓ Acesso ilimitado - Sem restrições
                              </Text>
                            </View>
                            
                            <Pressable
                              onPress={handleRent}
                              disabled={createRentMutation.isPending}
                              className="mt-1">
                              <LinearGradient
                                colors={['#10b981', '#059669']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                  paddingVertical: 14,
                                  paddingHorizontal: 24,
                                  borderRadius: 10,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                {createRentMutation.isPending ? (
                                  <ActivityIndicator color="#fff" />
                                ) : (
                                  <Text className="text-sm font-bold text-white">
                                    Adicionar à Biblioteca
                                  </Text>
                                )}
                              </LinearGradient>
                            </Pressable>
                          </>
                        ) : gamePrice > 0 ? (
                          <>
                            {/* Interface de Jogo com Preço */}
                            {rentalType === 'assinatura_full' && freeGamesCount < 3 ? (
                              <>
                                {/* Assinatura Full - Jogo Grátis */}
                                <View className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                  <Text className="text-xs text-green-400 font-semibold mb-2">
                                    🎁 Jogo Grátis - Assinatura Full
                                  </Text>
                                  <Text className="text-sm text-green-300 mb-1">
                                    Você tem {3 - freeGamesCount} jogos grátis restantes
                                  </Text>
                                  <Text className="text-xs text-gray-400">
                                    Preço original: R$ {gamePrice.toFixed(2)} • Grátis para você!
                                  </Text>
                                </View>
                                
                                <Pressable
                                  onPress={handleRent}
                                  disabled={createRentMutation.isPending}
                                  className="mt-1">
                                  <LinearGradient
                                    colors={['#10b981', '#059669']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{
                                      paddingVertical: 14,
                                      paddingHorizontal: 24,
                                      borderRadius: 10,
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}>
                                    {createRentMutation.isPending ? (
                                      <ActivityIndicator color="#fff" />
                                    ) : (
                                      <Text className="text-sm font-bold text-white">
                                        Resgatar Grátis ({freeGamesCount + 1}/3)
                                      </Text>
                                    )}
                                  </LinearGradient>
                                </Pressable>
                              </>
                            ) : (
                              <>
                                {/* Jogo com Preço - Precisa Pagar */}
                                <View className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                  <Text className="text-xs text-purple-400 font-semibold mb-2">
                                    {rentalType === 'assinatura_full' && freeGamesCount >= 3 
                                      ? '💰 Aluguel - Após 3 jogos grátis'
                                      : '💰 Aluguel/Compra'}
                                  </Text>
                                  <Text className="text-sm font-bold text-white">
                                    Preço: R$ {gamePrice.toFixed(2)}
                                  </Text>
                                  {rentalType === 'assinatura_full' && freeGamesCount >= 3 && (
                                    <Text className="text-xs text-yellow-400 mt-1">
                                      ⚠️ Você já usou seus 3 jogos grátis
                                    </Text>
                                  )}
                                </View>
                                
                                <Pressable
                                  onPress={handleRent}
                                  disabled={createRentMutation.isPending}
                                  className="mt-1">
                                  <LinearGradient
                                    colors={['#6b8bff', '#bc7cff']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{
                                      paddingVertical: 14,
                                      paddingHorizontal: 24,
                                      borderRadius: 10,
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}>
                                    {createRentMutation.isPending ? (
                                      <ActivityIndicator color="#fff" />
                                    ) : (
                                      <Text className="text-sm font-bold text-white">
                                        Alugar/Comprar Agora
                                      </Text>
                                    )}
                                  </LinearGradient>
                                </Pressable>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            {/* Informações sobre Assinatura Full */}
                            {rentalType === 'assinatura_full' && (
                              <View className="mb-4 p-3 bg-[#bc7cff]/10 border border-[#bc7cff]/20 rounded-lg">
                                <View className="flex-row items-start gap-2 mb-2">
                                  <Text className="text-xs text-[#bc7cff] font-semibold flex-1">
                                    Acesso ao catálogo completo • 30 dias • Até 3 jogos grátis
                                  </Text>
                                </View>
                                <View className="flex-row flex-wrap gap-x-4 gap-y-1 items-center">
                                  <Text className="text-sm font-bold text-white">
                                    Jogos Grátis: {freeGamesCount}/3
                                  </Text>
                                  {freeGamesCount >= 3 && (
                                    <Text className="text-xs text-yellow-400 font-medium">
                                      ⚠️ Limite atingido - Próximos jogos serão cobrados unitariamente
                                    </Text>
                                  )}
                                  {freeGamesCount < 3 && (
                                    <Text className="text-xs text-green-400 font-medium">
                                      ✓ Você tem {3 - freeGamesCount} jogos grátis restantes
                                    </Text>
                                  )}
                                </View>
                              </View>
                            )}

                            {/* Informações sobre usuário sem assinatura */}
                            {!rentalType && (
                              <View className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <View className="flex-row items-start gap-2 mb-2">
                                  <Text className="text-xs text-yellow-400 font-semibold flex-1">
                                    Sem assinatura • Você paga o valor cheio de cada jogo
                                  </Text>
                                </View>
                                <View className="flex-row flex-wrap gap-x-4 gap-y-1">
                                  <Text className="text-xs text-gray-400">
                                    Assine o plano Full para ter 3 jogos grátis!
                                  </Text>
                                </View>
                              </View>
                            )}

                            {/* Botão para alterar plano */}
                            {hasChosenSubscription && (
                              <Pressable
                                onPress={() => setShowSubscriptionModal(true)}
                                className="mb-4">
                                <Text className="text-xs text-center text-[#bc7cff] underline">
                                  Alterar plano de assinatura
                                </Text>
                              </Pressable>
                            )}

                            {/* Preço Calculado */}
                            <View className="bg-white/5 border border-white/10 rounded-lg p-3 mb-4">
                              <View className="flex-row items-center justify-between">
                                <Text className="text-sm text-gray-300 font-medium">Preço Total</Text>
                                <Text className="text-2xl font-bold text-white">
                                  R$ {rentalPrice.toFixed(2)}
                                </Text>
                              </View>
                            {rentalType === 'assinatura_full' && freeGamesCount >= 3 && (
                              <Text className="text-xs text-yellow-400 mt-1">
                                ⚠️ Limite de jogos grátis atingido - Preço cheio aplicado
                              </Text>
                            )}
                            {rentalType === 'assinatura_full' && freeGamesCount < 3 && (
                              <Text className="text-xs text-green-400 mt-1">
                                ✓ Jogo grátis disponível ({freeGamesCount}/3 resgatados)
                              </Text>
                            )}
                            {!rentalType && (
                              <Text className="text-xs text-yellow-400 mt-1">
                                💰 Sem assinatura - Valor cheio será descontado da carteira
                              </Text>
                            )}
                            </View>

                            {/* Botão de Alugar/Resgatar */}
                            <Pressable
                              onPress={handleRent}
                              disabled={createRentMutation.isPending}
                              className="mt-1">
                              <LinearGradient
                                colors={canRescueFreeGame ? ['#10b981', '#059669'] : ['#6b8bff', '#bc7cff']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                  paddingVertical: 14,
                                  paddingHorizontal: 24,
                                  borderRadius: 10,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                {createRentMutation.isPending ? (
                                  <ActivityIndicator color="#fff" />
                                ) : (
                                  <View className="flex-row items-center gap-2">
                                    <Text className="text-sm font-bold text-white">
                                      {canRescueFreeGame ? 'Resgatar Jogo Grátis' : 'Alugar Jogo Agora'}
                                    </Text>
                                    {canRescueFreeGame && (
                                      <Text className="text-xs font-semibold text-white/80">
                                        ({freeGamesCount + 1}/3)
                                      </Text>
                                    )}
                                  </View>
                                )}
                              </LinearGradient>
                            </Pressable>
                          </>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              </View>

              <View className="mb-8" style={{ maxWidth: 1000 }}>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-2xl font-semibold text-white">Descrição</Text>
                  {isAdmin && (
                    <>
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
                    </>
                  )}
                </View>
                <View className="bg-white/5 border border-white/10 rounded-xl p-4">
                  {isEditingDescription ? (
                    <TextInput
                      value={tempDescription}
                      onChangeText={setTempDescription}
                      multiline
                      numberOfLines={4}
                      className="text-gray-300 leading-6"
                      style={{
                        textAlignVertical: 'top',
                        minHeight: 80,
                        color: '#d1d5db',
                      }}
                      placeholderTextColor="#9ca3af"
                    />
                  ) : (
                    <Text className="text-gray-300 leading-6">{gameDescription}</Text>
                  )}
                </View>
              </View>

              <View className="mb-8" style={{ maxWidth: 1000 }}>
                <Text className="text-2xl font-semibold text-white mb-4">Informações</Text>
                <View className="flex-row flex-wrap gap-3">
                  <View className="bg-white/5 border border-white/10 rounded-xl p-3" style={{ flex: 1, minWidth: 160 }}>
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text className="text-xs text-gray-400">Plataforma</Text>
                      {isAdmin && (
                        <Pressable
                          onPress={() => setEditField('platform')}
                          className="p-1">
                          <EditIcon size={14} color="#9ca3af" />
                        </Pressable>
                      )}
                    </View>
                    <View className="flex-row items-center gap-2">
                      <PlayStationLogo size={18} />
                      <Text className="text-white font-semibold text-base">{gamePlatform}</Text>
                    </View>
                  </View>

                  <View className="bg-white/5 border border-white/10 rounded-xl p-3" style={{ flex: 1, minWidth: 160 }}>
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text className="text-xs text-gray-400">Tamanho</Text>
                      {isAdmin && (
                        <Pressable
                          onPress={() => setEditField('size')}
                          className="p-1">
                          <EditIcon size={14} color="#9ca3af" />
                        </Pressable>
                      )}
                    </View>
                    <View className="flex-row items-center gap-2">
                      <DownloadIcon size={18} color="#9ca3af" />
                      <Text className="text-white font-semibold text-base">{gameSize}</Text>
                    </View>
                  </View>

                  <View className="bg-white/5 border border-white/10 rounded-xl p-3" style={{ flex: 1, minWidth: 160 }}>
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text className="text-xs text-gray-400">Multiplayer</Text>
                      {isAdmin && (
                        <Pressable
                          onPress={() => setEditField('multiplayer')}
                          className="p-1">
                          <EditIcon size={14} color="#9ca3af" />
                        </Pressable>
                      )}
                    </View>
                    <View className="flex-row items-center gap-2">
                      <UsersIcon size={18} color="#9ca3af" />
                      <Text className="text-white font-semibold text-base">{gameMultiplayer}</Text>
                    </View>
                  </View>

                  <View className="bg-white/5 border border-white/10 rounded-xl p-3" style={{ flex: 1, minWidth: 160 }}>
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text className="text-xs text-gray-400">Idiomas</Text>
                      {isAdmin && (
                        <Pressable
                          onPress={() => setEditField('languages')}
                          className="p-1">
                          <EditIcon size={14} color="#9ca3af" />
                        </Pressable>
                      )}
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
              editField === 'title' ? 'Título' :
              editField === 'imageUrl' ? 'Imagem' :
              editField === 'platform' ? 'Plataforma' :
              editField === 'size' ? 'Tamanho' :
              editField === 'multiplayer' ? 'Multiplayer' :
              'Idiomas'
            }
          />
        )}
        {canRent && !isAdmin && (
          <SubscriptionModal
            visible={showSubscriptionModal}
            onSelect={(type) => {
              handleSubscriptionSelect(type);
            }}
            onClose={() => {
              // Se fechar sem escolher, deixar sem assinatura (paga valor cheio)
              if (!hasChosenSubscription) {
                setRentalType(null);
                setHasChosenSubscription(true);
                // Salvar escolha de não ter assinatura
                const storage = Platform.OS === 'web' && typeof window !== 'undefined' && 'localStorage' in window
                  ? {
                      setItem: (key: string, value: string) => Promise.resolve(window.localStorage.setItem(key, value)),
                    }
                  : {
                      setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
                    };
                const subscriptionKey = `subscription_chosen_${user?.id}`;
                storage.setItem(subscriptionKey, JSON.stringify({ type: null, date: new Date().toISOString() }));
              }
              setShowSubscriptionModal(false);
            }}
          />
        )}
        {canRent && game && !isAdmin && (rentalPrice > 0 || gamePrice > 0) && (
          <PurchaseConfirmModal
            visible={showPurchaseModal}
            onClose={() => setShowPurchaseModal(false)}
            onConfirm={handleConfirmPurchase}
            gameTitle={game.title}
            gamePrice={rentalPrice > 0 ? rentalPrice : gamePrice}
            isProcessing={createRentMutation.isPending}
          />
        )}
      </LinearGradient>
    </>
  );
}
