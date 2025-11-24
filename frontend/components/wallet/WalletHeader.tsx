import { View, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { WalletIcon, PlusIcon } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

interface WalletHeaderProps {
  onDepositPress: () => void;
}

export function WalletHeader({ onDepositPress }: WalletHeaderProps) {
  const { user } = useAuth();
  const wallet = user?.wallet || 0;

  return (
    <View className="flex-row items-center gap-3">
      {/* Botão Depositar */}
      <Pressable
        onPress={onDepositPress}
        className="overflow-hidden rounded-xl">
        <LinearGradient
          colors={['#10b981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}>
          <PlusIcon size={18} color="#fff" />
          <Text className="text-white font-bold text-sm">Depositar</Text>
        </LinearGradient>
      </Pressable>

      {/* Saldo */}
      <View className="overflow-hidden rounded-xl">
        <LinearGradient
          colors={['#1e293b', '#0f172a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            paddingHorizontal: 20,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            borderWidth: 1,
            borderColor: 'rgba(139, 92, 246, 0.3)',
          }}>
          <View className="bg-purple-500/20 rounded-full p-2">
            <WalletIcon size={20} color="#a78bfa" />
          </View>
          <View>
            <Text className="text-xs text-gray-400 font-medium mb-0.5">Saldo</Text>
            <Text
              className="text-lg font-extrabold"
              style={{
                color: '#a78bfa',
                textShadowColor: '#8b5cf6',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 8,
              }}>
              R$ {wallet.toFixed(2)}
            </Text>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

