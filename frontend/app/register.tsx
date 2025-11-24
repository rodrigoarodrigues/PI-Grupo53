import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Stack, useRouter, Link } from 'expo-router';
import { View, ScrollView, Pressable, Alert, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useCreateUser } from '@/data/users/createUser';
import { ArrowLeftIcon, UserIcon, MailIcon, LockIcon, CheckIcon, Gamepad2Icon } from 'lucide-react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const createUserMutation = useCreateUser();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Nome deve ter no mínimo 3 caracteres';
    }

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Erro', 'Por favor, corrija os erros no formulário');
      return;
    }

    try {
      const userResult = await createUserMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        cpf: '', // CPF opcional neste formulário simplificado
        birthDate: undefined,
        expirationDate: undefined,
      });

      if (!userResult || !userResult.id) {
        throw new Error('Erro ao criar usuário');
      }

      Alert.alert(
        'Sucesso!',
        'Conta criada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao criar conta');
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
                Criar Conta
              </Text>

              <View className="mb-6">
                <View className="flex-row items-center bg-white/5 border border-white/10 rounded-xl px-4 py-4 mb-2">
                  <UserIcon size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                  <Input
                    value={name}
                    onChangeText={setName}
                    placeholder="Nome completo"
                    placeholderTextColor="#9ca3af"
                    className="flex-1 bg-transparent border-0"
                    style={{ color: '#fff', fontSize: 16 }}
                  />
                </View>
                {errors.name && (
                  <Text className="text-red-400 text-xs mt-1">{errors.name}</Text>
                )}
              </View>

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

              <View className="mb-6">
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

              <View className="mb-8">
                <View className="flex-row items-center bg-white/5 border border-white/10 rounded-xl px-4 py-4 mb-2">
                  <CheckIcon size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                  <Input
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirmar senha"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    className="flex-1 bg-transparent border-0"
                    style={{ color: '#fff', fontSize: 16 }}
                  />
                </View>
                {errors.confirmPassword && (
                  <Text className="text-red-400 text-xs mt-1">{errors.confirmPassword}</Text>
                )}
              </View>

              <Pressable
                onPress={handleSubmit}
                disabled={createUserMutation.isPending}
                className="w-full">
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
                  {createUserMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-lg font-bold text-white">Criar Conta</Text>
                  )}
                </LinearGradient>
              </Pressable>

              <Pressable>
                <Link href="/" asChild>
                  <Text className="text-center text-gray-400 text-sm">
                    Já tem uma conta? <Text className="text-blue-400">Entrar</Text>
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
