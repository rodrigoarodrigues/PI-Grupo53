import { Text } from '@/components/ui/text';
import { View, Image, Pressable, Alert, ActivityIndicator, Platform } from 'react-native';
import { Link } from 'expo-router';
import { GetGameProps } from '@/data/games/getGames';
import { useReturnRent } from '@/data/rents/returnRent';
import { useQueryClient } from '@tanstack/react-query';
import { TrashIcon } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

interface LibraryGameCardProps {
  game: GetGameProps;
  rentId: number;
  onReturned?: () => void;
}

export function LibraryGameCard({ game, rentId, onReturned }: LibraryGameCardProps) {
  const returnRentMutation = useReturnRent();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const executeReturn = async () => {
    try {
      const result = await returnRentMutation.mutateAsync({
        rentId,
      });

      await new Promise(resolve => setTimeout(resolve, 500));

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

      if (onReturned) {
        onReturned();
      }

      await new Promise(resolve => setTimeout(resolve, 200));

      if (result.hasFine && result.daysOverdue > 0) {
        const message = `Jogo devolvido com sucesso!\n\nMulta por atraso: R$ ${parseFloat(result.fineAmount).toFixed(2)}\nDias de atraso: ${result.daysOverdue}`;
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert(message);
        } else {
          Alert.alert('Jogo Devolvido', message, [{ text: 'OK' }]);
        }
      } else {
        const message = `"${game.title}" foi removido da sua biblioteca com sucesso!`;
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert(message);
        } else {
          Alert.alert('Jogo Devolvido', message, [{ text: 'OK' }]);
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao devolver jogo';
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert(`Erro: ${errorMessage}`);
      } else {
        Alert.alert('Erro', errorMessage);
      }
    }
  };

  const handleReturn = () => {
    // Para web, usar window.confirm; para mobile, usar Alert.alert
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const confirmed = window.confirm(
        `Tem certeza que deseja devolver "${game.title}"?`
      );
      if (confirmed) {
        executeReturn();
      }
    } else {
      Alert.alert(
        'Devolver Jogo',
        `Tem certeza que deseja devolver "${game.title}"?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Devolver',
            style: 'destructive',
            onPress: () => executeReturn(),
          },
        ]
      );
    }
  };

  return (
    <View className="relative bg-white/5 border border-white/10 rounded-xl shadow-lg overflow-hidden">
      <View className="relative w-full" style={{ height: 240 }}>
        {game.imageUrl ? (
          <Link
            href={{ pathname: '/games/[uuid]', params: { uuid: game.uuid } }}
            asChild>
            <Pressable 
              style={{ width: '100%', height: '100%' }}
              hitSlop={{ top: 0, bottom: 0, left: 0, right: 0 }}>
              <Image
                source={{ uri: game.imageUrl }}
                style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
              />
            </Pressable>
          </Link>
        ) : (
          <Link
            href={{ pathname: '/games/[uuid]', params: { uuid: game.uuid } }}
            asChild>
            <Pressable 
              style={{ width: '100%', height: '100%' }}
              hitSlop={{ top: 0, bottom: 0, left: 0, right: 0 }}>
              <View className="flex-1 items-center justify-center bg-white/5">
                <Text className="text-6xl">🎮</Text>
              </View>
            </Pressable>
          </Link>
        )}
        
        <View className="absolute right-2 top-2 bg-black/60 px-2 py-0.5 rounded-full border border-white/20 z-10">
          <Text className="text-[10px] text-white font-semibold">
            {game.quantity} unid.
          </Text>
        </View>
      </View>

      <View className="p-2.5" style={{ zIndex: 1 }}>
        <Text 
          className="text-sm font-medium text-white mb-2.5" 
          numberOfLines={2}
          style={{ minHeight: 36 }}>
          {game.title}
        </Text>

        <View className="gap-2" style={{ zIndex: 2 }}>
          <Link
            href={{ pathname: '/games/[uuid]', params: { uuid: game.uuid } }}
            asChild>
            <Pressable>
              <View className="w-full py-2 bg-white/5 border border-white/10 rounded-lg">
                <Text className="text-center text-gray-300 text-xs font-medium">
                  Ver Detalhes
                </Text>
              </View>
            </Pressable>
          </Link>

          <Pressable
            onPress={(e) => {
              if (e) {
                e.stopPropagation?.();
                e.preventDefault?.();
              }
              handleReturn();
            }}
            disabled={returnRentMutation.isPending}
            style={{ 
              width: '100%',
              zIndex: 10,
              elevation: 10,
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            android_ripple={{ color: 'rgba(239, 68, 68, 0.2)' }}>
            {({ pressed }) => (
              <View 
                className={`w-full py-2.5 rounded-lg flex-row items-center justify-center gap-2 ${
                  returnRentMutation.isPending 
                    ? 'bg-red-500/30 border border-red-500/50' 
                    : pressed
                    ? 'bg-red-500/30 border border-red-500/50'
                    : 'bg-red-500/20 border border-red-500/40'
                }`}
                style={{ 
                  opacity: returnRentMutation.isPending ? 0.6 : pressed ? 0.8 : 1,
                  zIndex: 10,
                }}>
                {returnRentMutation.isPending ? (
                  <>
                    <ActivityIndicator size="small" color="#ef4444" />
                    <Text className="text-red-400 text-xs font-medium">
                      Devolvendo...
                    </Text>
                  </>
                ) : (
                  <>
                    <TrashIcon size={14} color="#ef4444" />
                    <Text className="text-red-400 text-xs font-medium">
                      Devolver Jogo
                    </Text>
                  </>
                )}
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

