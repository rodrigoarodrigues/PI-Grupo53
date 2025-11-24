import { Text } from '@/components/ui/text';
import { View, Image, Pressable, Alert, ActivityIndicator, Platform } from 'react-native';
import { Link } from 'expo-router';
import { GetGameProps } from '@/data/games/getGames';
import { useDeleteGame } from '@/data/games/deleteGame';
import { useAuth } from '@/contexts/AuthContext';
import { TrashIcon } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';

interface GameCardProps {
  game: GetGameProps;
  showDeleteButton?: boolean;
  onDeleted?: () => void;
}

export function GameCard({ game, showDeleteButton = false, onDeleted }: GameCardProps) {
  const deleteGameMutation = useDeleteGame();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const executeDelete = async (gameId: number) => {
    try {
      await deleteGameMutation.mutateAsync(gameId);

      await new Promise(resolve => setTimeout(resolve, 300));

      await queryClient.invalidateQueries({ queryKey: ['games'] });
      await queryClient.refetchQueries({ queryKey: ['games'] });

      if (onDeleted) {
        onDeleted();
      }

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert(`"${game.title}" foi removido do catálogo com sucesso!`);
      } else {
        Alert.alert(
          'Jogo Removido',
          `"${game.title}" foi removido do catálogo com sucesso!`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || 'Erro ao remover jogo. Tente novamente.';
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert(`Erro ao Remover: ${errorMessage}`);
      } else {
        Alert.alert('Erro ao Remover', errorMessage);
      }
    }
  };

  const handleDelete = async () => {
    // Converter ID para número e validar
    let gameId: number;
    if (typeof game.id === 'string') {
      gameId = Number(game.id);
    } else {
      gameId = game.id;
    }
    
    // Validar se o ID é um número válido
    if (isNaN(gameId) || gameId <= 0 || !Number.isInteger(gameId)) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('ID do jogo inválido. Não é possível remover este jogo.');
      } else {
        Alert.alert('Erro', 'ID do jogo inválido. Não é possível remover este jogo.');
      }
      return;
    }

    // Para web, usar window.confirm; para mobile, usar Alert.alert
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const confirmed = window.confirm(
        `Tem certeza que deseja remover "${game.title}" do catálogo?\n\nEsta ação não pode ser desfeita.`
      );
      if (confirmed) {
        await executeDelete(gameId);
      }
    } else {
      Alert.alert(
        'Remover Jogo',
        `Tem certeza que deseja remover "${game.title}" do catálogo?\n\nEsta ação não pode ser desfeita.`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Remover',
            style: 'destructive',
            onPress: () => executeDelete(gameId),
          },
        ]
      );
    }
  };

  const shouldShowDeleteButton = isAdmin && showDeleteButton;

  return (
    <View className="relative bg-white/5 border border-white/10 rounded-xl shadow-lg overflow-hidden">
      <View className="relative w-full" style={{ height: 240 }}>
        {game.imageUrl ? (
          <Link
            href={{ pathname: '/games/[uuid]', params: { uuid: game.uuid } }}
            asChild>
            <Pressable style={{ width: '100%', height: '100%' }}>
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
            <Pressable style={{ width: '100%', height: '100%' }}>
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

      <View className="p-2.5">
        <Text 
          className="text-sm font-medium text-white mb-2.5" 
          numberOfLines={2}
          style={{ minHeight: 36 }}>
          {game.title}
        </Text>

        <View className="gap-2">
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

          {shouldShowDeleteButton && (
            <Pressable
              onPress={(e) => {
                if (e) {
                  e.stopPropagation?.();
                  e.preventDefault?.();
                }
                handleDelete();
              }}
              disabled={deleteGameMutation.isPending}
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
                    deleteGameMutation.isPending 
                      ? 'bg-red-500/30 border border-red-500/50' 
                      : pressed
                      ? 'bg-red-500/30 border border-red-500/50'
                      : 'bg-red-500/20 border border-red-500/40'
                  }`}
                  style={{ 
                    opacity: deleteGameMutation.isPending ? 0.6 : pressed ? 0.8 : 1,
                    zIndex: 10,
                  }}>
                  {deleteGameMutation.isPending ? (
                    <>
                      <ActivityIndicator size="small" color="#ef4444" />
                      <Text className="text-red-400 text-xs font-medium">
                        Removendo...
                      </Text>
                    </>
                  ) : (
                    <>
                      <TrashIcon size={14} color="#ef4444" />
                      <Text className="text-red-400 text-xs font-medium">
                        Remover Jogo
                      </Text>
                    </>
                  )}
                </View>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

