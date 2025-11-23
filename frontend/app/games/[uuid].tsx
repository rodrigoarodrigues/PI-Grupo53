import { Text } from '@/components/ui/text';
import { Stack, useLocalSearchParams } from 'expo-router';
import { View, Image, ActivityIndicator } from 'react-native';
import { getGameFromId } from '@/data/games/getGameFromId';

export default function GameDetailsScreen() {
  const { uuid } = useLocalSearchParams();

  if (!uuid) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-center text-xl text-red-500">Invalid game ID.</Text>
      </View>
    );
  }

  const { isPending, error, data } = getGameFromId(uuid as string);

  // Debug log to inspect the data shape
  console.log('Game data:', data);

  // Handle both array and object response
  const game = Array.isArray(data) ? data?.[0] : data;

  return (
    <>
      <Stack.Screen options={{ title: 'Game Details' }} />
      <View className="flex-1 items-center justify-center p-4">
        {isPending && <ActivityIndicator size="large" />}
        {error && (
          <Text className="text-center text-xl text-red-500">Error loading game details.</Text>
        )}
        {game && (
          <View className="items-center">
            <Image
              source={{ uri: game.imageUrl }}
              style={{ width: 200, height: 200, borderRadius: 16, marginBottom: 16 }}
            />
            <Text className="mb-2 text-center text-2xl font-bold">{game.title}</Text>
            <Text className="mb-2 text-center text-lg">UUID: {game.uuid}</Text>
            <Text className="mb-2 text-center text-lg">Quantity: {game.quantity}</Text>
            <Text className="mb-2 text-center text-lg">ID: {game.id}</Text>
          </View>
        )}
      </View>
    </>
  );
}
