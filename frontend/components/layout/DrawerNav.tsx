import React, { useState } from 'react';
import { View, Pressable, Platform, Modal, Dimensions } from 'react-native';
import { usePathname, useRouter, Link } from 'expo-router';
import {
  HomeIcon,
  BookOpenIcon,
  UsersIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/AuthContext';
import { Alert } from 'react-native';

// Helper to determine if we're on a small screen (mobile/tablet)
function useIsMobile() {
  const { width } = Dimensions.get('window');
  // You can adjust the breakpoint as needed
  return width < 768;
}

interface DrawerNavProps {
  // Optionally allow controlling open state from parent
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DrawerNav(props: DrawerNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, isClient, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const isMobile = useIsMobile();

  // Allow parent to control open state if desired
  const drawerOpen = props.open !== undefined ? props.open : open;
  const setDrawerOpen = props.onOpenChange || setOpen;

  const handleLogout = async () => {
    setDrawerOpen(false);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const confirmed = window.confirm('Deseja realmente sair?');
      if (confirmed) {
        await logout();
        router.replace('/' as any);
      }
    } else {
      Alert.alert('Sair', 'Deseja realmente sair?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/' as any);
          },
        },
      ]);
    }
  };

  // Only render on mobile
  if (!isMobile) return null;

  return (
    <>
      {/* Drawer Modal */}
      <Modal
        visible={drawerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setDrawerOpen(false)}>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            flexDirection: 'row',
          }}
          onPress={() => setDrawerOpen(false)}>
          <Pressable
            style={{
              width: '75%',
              maxWidth: 320,
              backgroundColor: '#0f1419',
              borderRightWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
              height: '100%',
              paddingTop: 0,
              justifyContent: 'space-between',
              elevation: 16,
            }}
            onPress={(e) => e.stopPropagation()}>
            <View>
              {/* Close Button */}
              <View style={{ alignItems: 'flex-end', padding: 16 }}>
                <Pressable
                  onPress={() => setDrawerOpen(false)}
                  hitSlop={12}
                  style={({ pressed }) => [
                    {
                      opacity: pressed ? 0.7 : 1,
                      backgroundColor: 'rgba(188,124,255,0.12)',
                      borderRadius: 999,
                      padding: 6,
                    },
                  ]}>
                  <XIcon size={22} color="#bc7cff" />
                </Pressable>
              </View>
              {/* Logo */}
              <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
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
              {/* User Info */}
              {user && (
                <View style={{ paddingHorizontal: 24, paddingBottom: 12 }}>
                  <Text className="mb-1 font-semibold text-white">{user.name}</Text>
                  <Text className="mb-1 text-xs text-gray-400">{user.email}</Text>
                  <View style={{ marginTop: 8 }}>
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 999,
                        alignSelf: 'flex-start',
                        backgroundColor: isAdmin ? 'rgba(255,140,0,0.12)' : 'rgba(96,165,250,0.12)',
                      }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: 'bold',
                          color: isAdmin ? '#ff9800' : '#60a5fa',
                        }}>
                        {isAdmin ? 'ADMINISTRADOR' : 'CLIENTE'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              {/* Navigation */}
              <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
                <DrawerNavItem
                  href="/catalog"
                  icon={<HomeIcon size={20} color={pathname === '/catalog' ? '#fff' : '#9ca3af'} />}
                  label="Catálogo de Jogos"
                  isActive={pathname === '/catalog'}
                  onPress={() => setDrawerOpen(false)}
                />
                {(isClient || isAdmin) && (
                  <DrawerNavItem
                    href="/library"
                    icon={
                      <BookOpenIcon
                        size={20}
                        color={pathname === '/library' ? '#fff' : '#9ca3af'}
                      />
                    }
                    label="Biblioteca"
                    isActive={pathname === '/library'}
                    onPress={() => setDrawerOpen(false)}
                  />
                )}
                {isAdmin && (
                  <DrawerNavItem
                    href="/users"
                    icon={
                      <UsersIcon size={20} color={pathname === '/users' ? '#fff' : '#9ca3af'} />
                    }
                    label="Usuários"
                    isActive={pathname === '/users'}
                    onPress={() => setDrawerOpen(false)}
                  />
                )}
              </View>
            </View>
            {/* Logout */}
            <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
              <Pressable
                onPress={handleLogout}
                hitSlop={10}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: 'rgba(239,68,68,0.10)',
                    borderWidth: 1,
                    borderColor: 'rgba(239,68,68,0.20)',
                  },
                ]}>
                <LogOutIcon size={20} color="#ef4444" />
                <Text className="text-base font-semibold text-red-400">Sair</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

interface DrawerNavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onPress?: () => void;
}

function DrawerNavItem({ href, icon, label, isActive, onPress }: DrawerNavItemProps) {
  return (
    <Link href={href as any} asChild>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 8,
            marginBottom: 6,
            backgroundColor: isActive
              ? 'rgba(255,255,255,0.08)'
              : pressed
                ? 'rgba(255,255,255,0.04)'
                : 'transparent',
          },
        ]}>
        {icon}
        <Text
          style={{
            fontSize: 16,
            color: isActive ? '#fff' : '#9ca3af',
            fontWeight: isActive ? 'bold' : 'normal',
          }}>
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}
