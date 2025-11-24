import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { Link } from 'expo-router';
import { Pressable } from 'react-native';
import { PackageIcon, UserPlusIcon } from 'lucide-react-native';
import { getActiveRents } from '@/data/rents/getActiveRents';
import { getGames } from '@/data/games/getGames';

export function Header() {
  const { data: activeRents } = getActiveRents();
  const { data: games } = getGames();

  return (
    <View className="flex-row items-center justify-between px-8 py-6">
      <Text
        className="text-5xl font-extrabold"
        style={{
          color: '#bc7cff',
          textShadowColor: '#6b8bff',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 25,
          letterSpacing: 2,
          fontWeight: '900',
        }}>
        SAKURA ARCADE
      </Text>

      <View className="flex-row gap-4 items-center">
        <View className="px-6 py-3 bg-white/5 rounded-xl border border-white/10">
          <Text className="text-sm text-gray-300 font-medium">Jogos Disponíveis</Text>
        </View>

        <View className="px-8 py-3 bg-white/5 rounded-xl border border-white/10">
          <Text className="text-3xl font-bold text-white">
            {games?.length || 0}
          </Text>
        </View>

        <Link href="/rents" asChild>
          <Pressable>
            <View className="px-4 py-3 bg-white/5 rounded-xl border border-white/10 flex-row items-center gap-2">
              <PackageIcon size={18} color="#60a5fa" />
              <Text className="text-xl font-bold text-white">
                {activeRents?.length || 0}
              </Text>
            </View>
          </Pressable>
        </Link>

        <Link href="/register" asChild>
          <Pressable>
            <View className="px-4 py-3 bg-white/5 rounded-xl border border-white/10 flex-row items-center gap-2">
              <UserPlusIcon size={18} color="#bc7cff" />
              <Text className="text-sm font-medium text-white">Cadastrar</Text>
            </View>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

