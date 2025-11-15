import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreateGameProps } from '@/data/games/createGame';
import { GetGameProps, getGames } from '@/data/games/getGames';
import { Link, Stack } from 'expo-router';
import { MoonStarIcon, StarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Image, type ImageStyle, View } from 'react-native';

const LOGO = {
  light: require('@/assets/images/react-native-reusables-light.png'),
  dark: require('@/assets/images/react-native-reusables-dark.png'),
};

const SCREEN_OPTIONS = {
  headerTitle: '',
  headerTransparent: true,
  headerRight: () => <ThemeToggle />,
};

const IMAGE_STYLE: ImageStyle = {
  height: 76,
  width: 76,
};

export default function Screen() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (game: CreateGameProps) => {
      const response = await fetch(`http://localhost:3000/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(game),
      });

      if (!response.ok) {
        throw new Error('Failed to create game');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      console.log('Game created successfully');
    },
    onError: () => {
      console.error('Failed to create game');
    },
  });

  const { colorScheme } = useColorScheme();
  const { isPending, error, data, isFetching } = getGames();

  if (isPending) {
    return (
      <>
        <Stack.Screen options={SCREEN_OPTIONS} />
        <View className="flex-1 items-center justify-center gap-8 p-4">
          <Text className="text-center text-xl">Loading...</Text>
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={SCREEN_OPTIONS} />
        <View className="flex-1 items-center justify-center gap-8 p-4">
          <Text className="text-center text-xl">Error: {error.message}</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <Button
        className="mx-auto mt-4 max-w-min p-4"
        onPress={() =>
          mutation.mutate({
            uuid: uuidv4(),
            title: uuidv4(),
            quantity: 1,
            imageUrl:
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnq0q5asnJAsOlbm3jArzIhL3NMZvMJH5sxw&s',
          })
        }>
        <Text>Create Game</Text>
      </Button>
      <View className="flex-1 flex-col items-center justify-center">
        <View className="scrollbar-hidden mx-auto h-[calc(100vh-100px)] w-full max-w-5xl overflow-y-scroll">
          <View
            className="grid justify-center gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 12rem))' }}>
            {data?.map((game: GetGameProps) => (
              <View
                key={game.id}
                className="flex w-48 flex-col items-center justify-between gap-4 rounded-md border border-border p-4">
                <Image
                  source={{ uri: game.imageUrl }}
                  className="aspect-square w-full rounded-md bg-gray-200 dark:bg-border"
                />
                <Text className="text-center text-xl">{game.title}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button
      onPressIn={toggleColorScheme}
      size="icon"
      variant="ghost"
      className="ios:size-9 rounded-full web:mx-4">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
    </Button>
  );
}
