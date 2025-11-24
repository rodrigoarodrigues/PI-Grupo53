import React from 'react';
import { Modal, View, Pressable, Animated, Dimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { XIcon, Sparkles, Crown } from 'lucide-react-native';

interface SubscriptionModalProps {
  visible: boolean;
  onSelect: (type: 'assinatura_full') => void;
  onClose?: () => void;
}

const { width } = Dimensions.get('window');

export function SubscriptionModal({ visible, onSelect, onClose }: SubscriptionModalProps) {
  const [scaleAnim] = React.useState(new Animated.Value(0));
  const [selectedType, setSelectedType] = React.useState<'assinatura_full' | null>(null);

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const handleSelect = (type: 'assinatura_full') => {
    setSelectedType(type);
  };

  const handleConfirm = () => {
    if (selectedType) {
      onSelect(selectedType);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View className="flex-1 bg-black/80 items-center justify-center p-4">
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            width: width - 32,
            maxWidth: 500,
          }}>
          <LinearGradient
            colors={['#1a1f2e', '#0f1419', '#0a0c10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-3xl overflow-hidden border border-white/10">
            {/* Header */}
            <View className="relative p-6 pb-4">
              <LinearGradient
                colors={['#6b8bff', '#bc7cff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="absolute inset-0 opacity-10"
              />
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-3">
                  <LinearGradient
                    colors={['#6b8bff', '#bc7cff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="p-3 rounded-2xl">
                    <Crown size={24} color="#fff" />
                  </LinearGradient>
                  <View>
                    <Text className="text-2xl font-bold text-white">
                      Escolha seu Plano
                    </Text>
                    <Text className="text-sm text-gray-400 mt-1">
                      Selecione a melhor opção para você
                    </Text>
                  </View>
                </View>
                {onClose && (
                  <Pressable
                    onPress={onClose}
                    className="bg-white/5 rounded-full p-2">
                    <XIcon size={20} color="#9ca3af" />
                  </Pressable>
                )}
              </View>
            </View>

            {/* Content */}
            <View className="px-6 pb-6">
              <View className="flex-col gap-4">
                {/* Assinatura Full */}
                <Pressable
                  onPress={() => handleSelect('assinatura_full')}
                  className="relative overflow-hidden rounded-2xl border-2"
                  style={{
                    borderColor: selectedType === 'assinatura_full' ? '#bc7cff' : 'rgba(255, 255, 255, 0.1)',
                  }}>
                  <LinearGradient
                    colors={
                      selectedType === 'assinatura_full'
                        ? ['rgba(107, 139, 255, 0.15)', 'rgba(188, 124, 255, 0.15)']
                        : ['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.03)']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="p-5">
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-2">
                          <Sparkles
                            size={20}
                            color={selectedType === 'assinatura_full' ? '#bc7cff' : '#9ca3af'}
                          />
                          <Text className="text-lg font-bold text-white">
                            Assinatura Full
                          </Text>
                          {selectedType === 'assinatura_full' && (
                            <View className="bg-[#bc7cff]/20 px-2 py-0.5 rounded-full">
                              <Text className="text-xs font-semibold text-[#bc7cff]">
                                Popular
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-sm text-gray-400 leading-5 mb-3">
                          Acesso completo ao catálogo
                        </Text>
                      </View>
                    </View>

                    <View className="mb-4" style={{ gap: 8 }}>
                      <View className="flex-row items-center" style={{ gap: 8 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#bc7cff' }} />
                        <Text className="text-sm text-gray-300 flex-1">
                          Até <Text className="font-bold text-white">3 jogos grátis</Text>
                        </Text>
                      </View>
                      <View className="flex-row items-center" style={{ gap: 8 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#bc7cff' }} />
                        <Text className="text-sm text-gray-300 flex-1">
                          Depois de 3 jogos, paga valor cheio
                        </Text>
                      </View>
                      <View className="flex-row items-center" style={{ gap: 8 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#bc7cff' }} />
                        <Text className="text-sm text-gray-300 flex-1">
                          Acesso por 30 dias
                        </Text>
                      </View>
                    </View>

                    <View className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <Text className="text-xs text-gray-400 text-center mb-1">
                        Primeiros 3 jogos
                      </Text>
                      <Text className="text-2xl font-bold text-white text-center">
                        R$ 150,00
                      </Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              </View>

              <Text className="text-xs text-gray-500 text-center mt-6">
                Sem assinatura, você paga o valor cheio de cada jogo
              </Text>

              {/* Botão Selecionar */}
              <View className="flex-row gap-3 mt-6">
                {onClose && (
                  <Pressable
                    onPress={onClose}
                    className="flex-1">
                    <View
                      style={{
                        paddingVertical: 16,
                        paddingHorizontal: 24,
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      }}>
                      <Text className="text-base font-bold text-gray-300">
                        Continuar sem assinatura
                      </Text>
                    </View>
                  </Pressable>
                )}
                <Pressable
                  onPress={handleConfirm}
                  disabled={!selectedType}
                  className={selectedType ? "flex-1" : "flex-1"}>
                  <LinearGradient
                    colors={selectedType ? ['#6b8bff', '#bc7cff'] : ['#4b5563', '#4b5563']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      paddingVertical: 16,
                      paddingHorizontal: 24,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: selectedType ? 1 : 0.5,
                    }}>
                    <Text className="text-base font-bold text-white">
                      {selectedType ? 'Selecionar Plano' : 'Selecione um plano'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

