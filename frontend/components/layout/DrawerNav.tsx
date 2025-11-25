import React, { useState } from 'react';
import { Modal, Pressable, View, Dimensions, Platform, Alert } from 'react-native';
import { usePathname, useRouter, Link } from 'expo-router';
import {
  HomeIcon,
  BookOpenIcon,
  UsersIcon,
  LogOutIcon,
  XIcon,
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/AuthContext';

// Helper to determine if we're on a small screen (mobile/tablet)
function useIsMobile() {
  const { width } = Dimensions.get('window');
  // You can adjust the breakpoint as needed
  return width < 768;
}

interface DrawerNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DrawerNav({ isOpen, onClose }: DrawerNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, isClient, logout } = useAuth();

  const handleLogout = async () => {
    onClose(); // Fecha o drawer antes
    
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

  const isMobile = useIsMobile();

  // Only render on mobile
  if (!isMobile) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <Pressable 
        style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.7)' 
        }}
        onPress={onClose}>
        <View 
          style={{ 
            width: 280,
            height: '100%',
            backgroundColor: '#0a0c10',
            borderRightWidth: 1,
            borderRightColor: 'rgba(255,255,255,0.1)',
          }}
          onStartShouldSetResponder={() => true}>
          
          {/* Header com botão fechar */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 16,
          }}>
            <View>
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
            
            <Pressable
              onPress={onClose}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
                padding: 8,
              }}>
              <XIcon size={20} color="#fff" />
            </Pressable>
          </View>

          {/* User Info */}
          {user && (
            <View style={{ 
              paddingHorizontal: 24, 
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255,255,255,0.1)',
            }}>
              <Text className="mb-1 font-semibold text-white">{user.name}</Text>
              <Text className="mb-2 text-xs text-gray-400">{user.email}</Text>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  alignSelf: 'flex-start',
                  backgroundColor: isAdmin ? 'rgba(255,140,0,0.12)' : 'rgba(96,165,250,0.12)',
                }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: 'bold',
                    color: isAdmin ? '#ff9800' : '#60a5fa',
                  }}>
                  {isAdmin ? 'ADMINISTRADOR' : 'CLIENTE'}
                </Text>
              </View>
            </View>
          )}

          {/* Navigation */}
          <View style={{ paddingHorizontal: 12, paddingTop: 16, flex: 1 }}>
            <DrawerNavItem
              href="/catalog"
              icon={<HomeIcon size={20} color={pathname === '/catalog' ? '#fff' : '#9ca3af'} />}
              label="Catálogo de Jogos"
              isActive={pathname === '/catalog'}
              onPress={onClose}
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
                onPress={onClose}
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
                onPress={onClose}
              />
            )}
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
        </View>
      </Pressable>
    </Modal>
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
              ? 'rgba(107,139,255,0.15)'
              : pressed
                ? 'rgba(255,255,255,0.04)'
                : 'transparent',
            borderLeftWidth: 3,
            borderLeftColor: isActive ? '#6b8bff' : 'transparent',
          },
        ]}>
        {icon}
        <Text
          style={{
            fontSize: 15,
            color: isActive ? '#fff' : '#9ca3af',
            fontWeight: isActive ? '600' : 'normal',
          }}>
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}
