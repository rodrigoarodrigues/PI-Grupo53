import { Modal, View, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { XIcon, Gamepad2Icon, WalletIcon, CheckIcon, ArrowDownIcon } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getUserWallet } from '@/data/users/getUserWallet';

interface PurchaseConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  gameTitle: string;
  gamePrice: number;
  isProcessing?: boolean;
}

export function PurchaseConfirmModal({
  visible,
  onClose,
  onConfirm,
  gameTitle,
  gamePrice,
  isProcessing = false,
}: PurchaseConfirmModalProps) {
  const { user, refreshWallet } = useAuth();
  const [currentWallet, setCurrentWallet] = useState(user?.wallet || 0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Não renderizar se não houver preço
  if (gamePrice <= 0) {
    return null;
  }

  // Sincronizar com o saldo do contexto quando mudar
  useEffect(() => {
    if (user?.wallet !== undefined) {
      setCurrentWallet(user.wallet);
    }
  }, [user?.wallet]);

  // Atualizar saldo em tempo real quando o modal abrir
  useEffect(() => {
    if (visible && user) {
      // Carregar saldo imediatamente
      loadWallet();
      
      // Atualizar a cada 1.5 segundos enquanto o modal estiver aberto
      const interval = setInterval(() => {
        loadWallet();
      }, 1500);

      return () => clearInterval(interval);
    } else if (visible) {
      // Se o modal abrir mas não houver usuário, usar o saldo do contexto
      setCurrentWallet(user?.wallet || 0);
    }
  }, [visible, user]);

  const loadWallet = async () => {
    if (!user) {
      // Se não houver usuário, usar o saldo do contexto
      setCurrentWallet(user?.wallet || 0);
      return;
    }
    
    setIsLoadingBalance(true);
    try {
      const walletData = await getUserWallet(user.id);
      const newWalletValue = walletData.wallet;
      setCurrentWallet(newWalletValue);
      // Atualizar também no contexto para sincronizar
      refreshWallet();
    } catch (error) {
      console.error('Erro ao carregar saldo:', error);
      // Em caso de erro, usar o saldo do contexto
      setCurrentWallet(user?.wallet || 0);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const newBalance = currentWallet - gamePrice;
  const hasEnoughBalance = currentWallet >= gamePrice;
  const difference = gamePrice - currentWallet;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View className="flex-1 bg-black/80 items-center justify-center p-4">
        <View className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
          {/* Borda gradiente externa */}
          <LinearGradient
            colors={hasEnoughBalance ? ['#6b8bff', '#bc7cff'] : ['#ef4444', '#dc2626']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: 2,
              borderRadius: 16,
            }}>
            <View className="bg-[#0a0c10] rounded-xl">
              {/* Header */}
              <View className="px-6 pt-6 pb-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View className={`rounded-full p-3 ${hasEnoughBalance ? 'bg-purple-500/20' : 'bg-red-500/20'}`}>
                      <Gamepad2Icon
                        size={24}
                        color={hasEnoughBalance ? '#bc7cff' : '#ef4444'}
                      />
                    </View>
                    <View>
                      <Text className="text-2xl font-bold text-white">
                        Confirmar Compra
                      </Text>
                      <Text className="text-sm text-gray-400 mt-1">
                        {hasEnoughBalance ? 'Finalize sua compra' : 'Saldo insuficiente'}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={onClose}
                    disabled={isProcessing}
                    className="bg-white/10 rounded-full p-2">
                    <XIcon size={20} color="#fff" />
                  </Pressable>
                </View>
              </View>

              <View className="px-6 pb-6">
                {/* Informações do Jogo */}
                <View className="mb-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                  <Text className="text-xs text-gray-400 mb-1">Jogo</Text>
                  <Text className="text-lg font-bold text-white">{gameTitle}</Text>
                </View>

                {/* Preço */}
                <View className="mb-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                  <Text className="text-xs text-gray-400 mb-1">Preço</Text>
                  <Text
                    className="text-3xl font-extrabold"
                    style={{
                      color: '#bc7cff',
                      textShadowColor: '#8b5cf6',
                      textShadowOffset: { width: 0, height: 0 },
                      textShadowRadius: 10,
                    }}>
                    R$ {gamePrice.toFixed(2)}
                  </Text>
                </View>

                {/* Saldo Atual - Atualizado dinamicamente */}
                <View className="mb-4 p-4 border border-purple-500/20 rounded-xl overflow-hidden">
                  <LinearGradient
                    colors={['rgba(139, 92, 246, 0.1)', 'rgba(59, 130, 246, 0.1)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                  />
                  <View className="relative z-10">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text className="text-xs text-gray-400 font-medium">Saldo Atual</Text>
                        {isLoadingBalance && (
                          <ActivityIndicator size="small" color="#a78bfa" />
                        )}
                      </View>
                      <Text
                        className="text-2xl font-extrabold"
                        style={{
                          color: '#a78bfa',
                          textShadowColor: '#8b5cf6',
                          textShadowOffset: { width: 0, height: 0 },
                          textShadowRadius: 8,
                        }}>
                        R$ {currentWallet.toFixed(2)}
                      </Text>
                    </View>
                    <View className="bg-purple-500/20 rounded-full p-3">
                      <WalletIcon size={24} color="#a78bfa" />
                    </View>
                  </View>
                  </View>
                </View>

                {/* Subtração Visual Premium */}
                <View className="mb-4 p-4 border border-red-500/20 rounded-xl overflow-hidden">
                  <LinearGradient
                    colors={['rgba(239, 68, 68, 0.1)', 'rgba(249, 115, 22, 0.1)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                  />
                  <View className="relative z-10">
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-2">
                      <ArrowDownIcon size={16} color="#ef4444" />
                      <Text className="text-xs text-red-400 font-semibold">Subtração</Text>
                    </View>
                    <Text className="text-xl font-bold text-red-400">
                      - R$ {gamePrice.toFixed(2)}
                    </Text>
                  </View>
                  
                  {/* Linha divisória */}
                  <View className="h-px bg-red-500/30 my-3" />
                  
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-gray-300 font-semibold">Novo Saldo</Text>
                    <View className="flex-row items-center gap-2">
                      <Text
                        className={`text-2xl font-extrabold ${
                          hasEnoughBalance ? 'text-green-400' : 'text-red-400'
                        }`}
                        style={{
                          textShadowColor: hasEnoughBalance ? '#10b981' : '#ef4444',
                          textShadowOffset: { width: 0, height: 0 },
                          textShadowRadius: 8,
                        }}>
                        R$ {newBalance.toFixed(2)}
                      </Text>
                      {hasEnoughBalance && (
                        <View className="bg-green-500/20 rounded-full p-1">
                          <CheckIcon size={14} color="#10b981" />
                        </View>
                      )}
                    </View>
                  </View>
                  </View>
                </View>

                {/* Mensagem de Erro Premium */}
                {!hasEnoughBalance && (
                  <View className="mb-4 p-4 border border-red-500/30 rounded-xl overflow-hidden">
                    <LinearGradient
                      colors={['rgba(239, 68, 68, 0.1)', 'rgba(249, 115, 22, 0.1)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                      }}
                    />
                    <View className="relative z-10">
                    <View className="flex-row items-center justify-center gap-2 mb-2">
                      <Text className="text-2xl">⚠️</Text>
                      <Text className="text-sm text-red-400 text-center font-bold">
                        Saldo Insuficiente
                      </Text>
                    </View>
                    <Text className="text-xs text-red-300 text-center mb-2">
                      Você não possui saldo suficiente para completar esta compra
                    </Text>
                    <View className="bg-red-500/20 rounded-lg p-2 mt-2">
                      <Text className="text-xs text-red-200 text-center">
                        Faltam: <Text className="font-bold text-red-400">R$ {difference.toFixed(2)}</Text>
                      </Text>
                    </View>
                    </View>
                  </View>
                )}

                {/* Mensagem de Sucesso */}
                {hasEnoughBalance && (
                  <View className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <Text className="text-xs text-green-400 text-center font-medium">
                      ✓ Você possui saldo suficiente para esta compra
                    </Text>
                  </View>
                )}

                {/* Botões */}
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={onClose}
                    disabled={isProcessing}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3.5">
                    <Text className="text-center text-white font-semibold">
                      Cancelar
                    </Text>
                  </Pressable>
                  
                  <Pressable
                    onPress={onConfirm}
                    disabled={isProcessing || !hasEnoughBalance}
                    className="flex-1 rounded-xl py-3.5 overflow-hidden"
                    style={{ opacity: isProcessing || !hasEnoughBalance ? 0.6 : 1 }}>
                    <LinearGradient
                      colors={hasEnoughBalance ? ['#6b8bff', '#bc7cff'] : ['#6b7280', '#4b5563']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      {isProcessing ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <View className="flex-row items-center gap-2">
                          <CheckIcon size={18} color="#fff" />
                          <Text className="text-center text-white font-semibold">
                            Confirmar Compra
                          </Text>
                        </View>
                      )}
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

