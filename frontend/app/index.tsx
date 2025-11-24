import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Stack, useRouter, Redirect } from 'expo-router';
import { View, Pressable, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { MailIcon, LockIcon, Gamepad2Icon } from 'lucide-react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  // Dados do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0a0c10]">
        <ActivityIndicator size="large" color="#6b8bff" />
      </View>
    );
  }

  // Se já estiver autenticado, redireciona para o catálogo
  // Mas isso só acontece se o usuário já tinha uma sessão ativa
  if (isAuthenticated) {
    return <Redirect href="/catalog" />;
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validação do email
    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    // Validação da senha
    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        // Redireciona para o catálogo após login
        router.replace('/catalog');
      } else {
        Alert.alert('Erro', 'Email ou senha incorretos');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <LinearGradient
        colors={['#0a0c10', '#142235', '#1a1f2e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1">
        <View className="flex-1 flex-row">
         
          <View className="flex-1 items-center justify-center px-12" style={{ minWidth: 350 }}>
            <View className="items-center">
             
              <View className="mb-6">
                <Text
                  className="text-6xl font-extrabold mb-2"
                  style={{
                    color: '#60a5fa',
                    textShadowColor: '#bc7cff',
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 25,
                    letterSpacing: 2,
                  }}>
                  SAKURA
                </Text>
                <Text
                  className="text-6xl font-extrabold"
                  style={{
                    color: '#bc7cff',
                    textShadowColor: '#6b8bff',
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 25,
                    letterSpacing: 2,
                  }}>
                  ARCADE
                </Text>
              </View>

             
              <Text className="text-white text-lg mb-8 text-center">
                Entre para um universo de jogos lendários
              </Text>

             
              <View className="bg-white/5 border border-white/10 rounded-full p-6">
                <Gamepad2Icon size={48} color="#60a5fa" />
              </View>
            </View>
          </View>

         
          <View className="flex-1 items-center justify-center px-12" style={{ minWidth: 350 }}>
            <View
              className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8"
              style={{
                shadowColor: '#60a5fa',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 10,
              }}>
             
              <Text className="text-3xl font-bold text-white mb-8 text-center">
                Entrar
              </Text>

             
              <View className="mb-6">
                <View className="flex-row items-center bg-white/5 border border-white/10 rounded-xl px-4 py-4 mb-2">
                  <MailIcon size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                  <Input
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="flex-1 bg-transparent border-0"
                    style={{ color: '#fff', fontSize: 16 }}
                  />
                </View>
                {errors.email && (
                  <Text className="text-red-400 text-xs mt-1">{errors.email}</Text>
                )}
              </View>

             
              <View className="mb-8">
                <View className="flex-row items-center bg-white/5 border border-white/10 rounded-xl px-4 py-4 mb-2">
                  <LockIcon size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                  <Input
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Senha"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    className="flex-1 bg-transparent border-0"
                    style={{ color: '#fff', fontSize: 16 }}
                  />
                </View>
                {errors.password && (
                  <Text className="text-red-400 text-xs mt-1">{errors.password}</Text>
                )}
              </View>

             
              <Pressable
                onPress={handleLogin}
                disabled={isLoading}
                className="w-full mb-6">
                <LinearGradient
                  colors={['#60a5fa', '#bc7cff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: '#60a5fa',
                  }}>
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-lg font-bold text-white">Entrar</Text>
                  )}
                </LinearGradient>
              </Pressable>

             
              <Pressable>
                <Link href="/register" asChild>
                  <Text className="text-center text-gray-400 text-sm">
                    Não tem uma conta? <Text className="text-blue-400">Criar Conta</Text>
                  </Text>
                </Link>
              </Pressable>
            </View>
          </View>
        </View>
      </LinearGradient>
    </>
  );
}
