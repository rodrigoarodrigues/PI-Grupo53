import { Text } from '@/components/ui/text';
import { View, Pressable, Platform } from 'react-native';
import { Link, usePathname, useRouter } from 'expo-router';
import { BookOpenIcon, HomeIcon, UsersIcon, LogOutIcon } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Alert } from 'react-native';

interface SidebarItemProps {
  href: '/catalog' | '/library' | '/users';
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

function SidebarItem({ href, icon, label, isActive }: SidebarItemProps) {
  return (
    <Link href={href as any} asChild>
      <Pressable>
        <View
          className={`flex-row items-center gap-3 px-4 py-3 rounded-lg mb-2 ${
            isActive ? 'bg-white/10' : 'bg-transparent'
          }`}>
          {icon}
          <Text className={`text-base ${isActive ? 'text-white font-semibold' : 'text-gray-400'}`}>
            {label}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, isClient, logout } = useAuth();

  const handleLogout = async () => {
    // Para web, usa confirm nativo; para mobile, usa Alert
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const confirmed = window.confirm('Deseja realmente sair?');
      if (confirmed) {
        await logout();
        router.replace('/' as any);
      }
    } else {
      Alert.alert(
        'Sair',
        'Deseja realmente sair?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: async () => {
              await logout();
              router.replace('/' as any);
            },
          },
        ]
      );
    }
  };

  return (
    <View className="w-64 bg-[#0f1419] border-r border-white/10 h-full flex-col justify-between">
      <View>
        <View className="px-6 py-8 border-b border-white/10">
          <Text
            className="text-2xl font-extrabold"
            style={{
              color: '#60a5fa',
              textShadowColor: '#bc7cff',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 15,
              letterSpacing: 1,
            }}>
            SAKURA
          </Text>
          <Text
            className="text-2xl font-extrabold"
            style={{
              color: '#bc7cff',
              textShadowColor: '#6b8bff',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 15,
              letterSpacing: 1,
            }}>
            ARCADE
          </Text>
        </View>

        {user && (
          <View className="px-6 py-4 border-b border-white/10">
            <Text className="text-white font-semibold mb-1">{user.name}</Text>
            <Text className="text-gray-400 text-xs mb-1">{user.email}</Text>
            <View className="mt-2">
              <View className={`px-2 py-1 rounded-full inline-block ${
                isAdmin ? 'bg-orange-500/20' : 'bg-blue-500/20'
              }`}>
                <Text className={`text-xs font-semibold ${
                  isAdmin ? 'text-orange-400' : 'text-blue-400'
                }`}>
                  {isAdmin ? 'ADMINISTRADOR' : 'CLIENTE'}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className="px-4 py-6">
          <SidebarItem
            href="/catalog"
            icon={<HomeIcon size={20} color={pathname === '/catalog' ? '#fff' : '#9ca3af'} />}
            label="Catálogo de Jogos"
            isActive={pathname === '/catalog'}
          />
          {(isClient || isAdmin) && (
            <SidebarItem
              href="/library"
              icon={<BookOpenIcon size={20} color={pathname === '/library' ? '#fff' : '#9ca3af'} />}
              label="Biblioteca"
              isActive={pathname === '/library'}
            />
          )}
          {isAdmin && (
            <SidebarItem
              href="/users"
              icon={<UsersIcon size={20} color={pathname === '/users' ? '#fff' : '#9ca3af'} />}
              label="Usuários"
              isActive={pathname === '/users'}
            />
          )}
        </View>
      </View>

      <View className="px-4 pb-6" style={{ zIndex: 10 }}>
        <Pressable 
          onPress={handleLogout}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.7 : 1,
              cursor: 'pointer',
            },
            Platform.OS === 'web' && { cursor: 'pointer' }
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={false}>
          {({ pressed }) => (
            <View 
              className="flex-row items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20"
              style={{
                backgroundColor: pressed ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
              }}>
              <LogOutIcon size={20} color="#ef4444" />
              <Text className="text-red-400 text-base font-semibold">Sair</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

