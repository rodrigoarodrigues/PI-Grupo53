import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectOption } from '@/components/ui/select';
import { Stack, useRouter, Redirect } from 'expo-router';
import { View, ScrollView, ActivityIndicator, Pressable, Modal, Alert, TextInput, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sidebar } from '@/components/layout/Sidebar';
import { getUsers, UserProps } from '@/data/users/getUsers';
import { useCreateUser } from '@/data/users/createUser';
import { useCreateAddress } from '@/data/users/createAddress';
import { useUpdateUser } from '@/data/users/updateUser';
import { useUpdateAddress } from '@/data/users/updateAddress';
import { useActivateUser, useDeactivateUser } from '@/data/users/toggleUserStatus';
import { useDeleteUser } from '@/data/users/deleteUser';
import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  UsersIcon, 
  UserIcon, 
  UserXIcon, 
  ShieldIcon,
  SearchIcon,
  PlusIcon,
  UserCircleIcon,
  XIcon,
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  MailIcon,
  LockIcon,
  PhoneIcon,
  CreditCardIcon,
  MapPinIcon,
  BuildingIcon,
  CalendarIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from 'lucide-react-native';

export default function UsersScreen() {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { isPending, error, data: users, refetch } = getUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    cpf: '',
    role: 'cliente' as 'admin' | 'cliente',
    street: '',
    number: '',
    city: '',
    birthDate: '',
    expirationDate: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showRoleModal, setShowRoleModal] = useState(false);
  
  const createUserMutation = useCreateUser();
  const createAddressMutation = useCreateAddress();
  const updateUserMutation = useUpdateUser();
  const updateAddressMutation = useUpdateAddress();
  const activateUserMutation = useActivateUser();
  const deactivateUserMutation = useDeactivateUser();
  const deleteUserMutation = useDeleteUser();

  const normalizedUsers = useMemo(() => {
    if (!users || !Array.isArray(users)) return [];
    
    return users
      .filter(user => user && typeof user === 'object')
      .map(user => ({
        ...user,
        phone: user?.phone || '',
        profile: user?.role === 'admin' ? 'admin' : 'user',
        status: user?.isActive === false ? 'inactive' as const : 'active' as const,
      }));
  }, [users]);

  const stats = useMemo(() => {
    if (!normalizedUsers || !Array.isArray(normalizedUsers)) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        admins: 0,
      };
    }

    const total = normalizedUsers.length;
    const active = normalizedUsers.filter(u => u?.isActive !== false && u?.isActive !== null).length;
    const inactive = normalizedUsers.filter(u => u?.isActive === false || u?.isActive === null).length;
    const admins = normalizedUsers.filter(u => u?.profile === 'admin').length;

    return { total, active, inactive, admins };
  }, [normalizedUsers]);

  const filteredUsers = useMemo(() => {
    if (!normalizedUsers || !Array.isArray(normalizedUsers)) return [];
    
    if (!searchQuery.trim()) return normalizedUsers;

    const query = searchQuery.toLowerCase().trim();
    return normalizedUsers.filter((user) => {
      if (!user) return false;
      const name = user.name?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';
      const phone = user.phone?.toLowerCase() || '';
      return name.includes(query) || email.includes(query) || phone.includes(query);
    });
  }, [normalizedUsers, searchQuery]);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.replace('/');
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0a0c10]">
        <ActivityIndicator size="large" color="#6b8bff" />
      </View>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Redirect href="/" />;
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) errors.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Email inválido';
    
    if (!isEditMode) {
      if (!formData.password.trim()) errors.password = 'Senha é obrigatória';
      else if (formData.password.length < 6) errors.password = 'Senha deve ter no mínimo 6 caracteres';
      if (!formData.phone.trim()) errors.phone = 'Telefone é obrigatório';
      if (!formData.cpf.trim()) errors.cpf = 'CPF é obrigatório';
      if (!formData.street.trim()) errors.street = 'Rua é obrigatória';
      if (!formData.number.trim()) errors.number = 'Número é obrigatório';
      if (!formData.city.trim()) errors.city = 'Cidade é obrigatória';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('Por favor, preencha todos os campos obrigatórios');
      } else {
        Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      }
      return;
    }

    try {
      const userData: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      if (formData.phone) {
        userData.phone = formData.phone.replace(/\D/g, '');
      }

      if (formData.cpf) {
        userData.cpf = formData.cpf.replace(/\D/g, '');
      }

      const userResponse = await createUserMutation.mutateAsync(userData);

      await createAddressMutation.mutateAsync({
        userId: userResponse.id,
        street: formData.street,
        number: formData.number,
        complement: undefined,
        city: formData.city,
        state: 'SP', // Valor padrão
        zipCode: '00000-000', // Valor padrão
        isPrimary: true,
      });

      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        cpf: '',
        role: 'cliente',
        street: '',
        number: '',
        city: '',
        birthDate: '',
        expirationDate: '',
      });
      setFormErrors({});
      
      setIsModalOpen(false);
      
      await refetch();
      
      setTimeout(() => {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert('Usuário cadastrado com sucesso!');
        } else {
          Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
        }
      }, 100);
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao cadastrar usuário';
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert(`Erro: ${errorMessage}`);
      } else {
        Alert.alert('Erro', errorMessage);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingUserId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      cpf: '',
      role: 'cliente',
      street: '',
      number: '',
      city: '',
      birthDate: '',
      expirationDate: '',
    });
    setFormErrors({});
  };

  const handleEditUser = async (user: any) => {
    setEditingUserId(user.id);
    setIsEditMode(true);
    
    let addressData = { street: '', number: '', city: '' };
    try {
      const addressResponse = await fetch(`http://localhost:3000/addresses/${user.id}`);
      if (addressResponse.ok) {
        const addresses = await addressResponse.json();
        const primaryAddr = Array.isArray(addresses) && addresses.length > 0 
          ? addresses.find((addr: any) => addr.isPrimary) || addresses[0]
          : null;
        if (primaryAddr) {
          addressData = {
            street: primaryAddr.street || '',
            number: primaryAddr.number || '',
            city: primaryAddr.city || '',
          };
        }
      }
    } catch (error) {
    }
    
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '', // Não preenche senha por segurança
      phone: user.phone || '',
      cpf: user.cpf || '',
      role: user.role || 'cliente',
      street: addressData.street,
      number: addressData.number,
      city: addressData.city,
      birthDate: '',
      expirationDate: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUserId) return;

    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) errors.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Email inválido';
    if (!formData.phone.trim()) errors.phone = 'Telefone é obrigatório';
    if (!formData.cpf.trim()) errors.cpf = 'CPF é obrigatório';
    if (!formData.street.trim()) errors.street = 'Rua é obrigatória';
    if (!formData.number.trim()) errors.number = 'Número é obrigatório';
    if (!formData.city.trim()) errors.city = 'Cidade é obrigatória';

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('Por favor, corrija os erros no formulário');
      } else {
        Alert.alert('Erro', 'Por favor, corrija os erros no formulário');
      }
      return;
    }

    try {
      await updateUserMutation.mutateAsync({
        id: editingUserId,
        data: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          cpf: formData.cpf,
          role: formData.role,
        },
      });

      await updateAddressMutation.mutateAsync({
        userId: editingUserId,
        data: {
          street: formData.street,
          number: formData.number,
          city: formData.city,
        },
      });

      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingUserId(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        cpf: '',
        role: 'cliente',
        street: '',
        number: '',
        city: '',
        birthDate: '',
        expirationDate: '',
      });
      setFormErrors({});
      await refetch();
      
      setTimeout(() => {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert('Usuário atualizado com sucesso!');
        } else {
          Alert.alert('Sucesso', 'Usuário atualizado com sucesso!');
        }
      }, 100);
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao atualizar usuário';
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert(`Erro: ${errorMessage}`);
      } else {
        Alert.alert('Erro', errorMessage);
      }
    }
  };

  const handleToggleUserStatus = async (userId: number, isActive: boolean) => {
    try {
      if (isActive) {
        await activateUserMutation.mutateAsync(userId);
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert('Usuário ativado com sucesso!');
        } else {
          Alert.alert('Sucesso', 'Usuário ativado com sucesso!');
        }
      } else {
        await deactivateUserMutation.mutateAsync(userId);
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert('Usuário inativado com sucesso!');
        } else {
          Alert.alert('Sucesso', 'Usuário inativado com sucesso!');
        }
      }
      await refetch();
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao alterar status do usuário';
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert(`Erro: ${errorMessage}`);
      } else {
        Alert.alert('Erro', errorMessage);
      }
    }
  };

  const executeDeleteUser = async (userId: number) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
      setTimeout(async () => {
        await refetch();
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert('Usuário deletado com sucesso!');
        } else {
          Alert.alert('Sucesso', 'Usuário deletado com sucesso!');
        }
      }, 100);
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || 'Erro ao deletar usuário';
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert(`Erro: ${errorMessage}`);
      } else {
        Alert.alert('Erro', errorMessage);
      }
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    // Para web, usar window.confirm; para mobile, usar Alert.alert
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const confirmed = window.confirm(
        `Tem certeza que deseja deletar o usuário "${userName}"? Esta ação não pode ser desfeita.`
      );
      if (confirmed) {
        await executeDeleteUser(userId);
      }
    } else {
      Alert.alert(
        'Confirmar exclusão',
        `Tem certeza que deseja deletar o usuário "${userName}"? Esta ação não pode ser desfeita.`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Deletar',
            style: 'destructive',
            onPress: () => executeDeleteUser(userId),
          },
        ]
      );
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View className="flex-1 flex-row bg-[#0a0c10]">
        <Sidebar />

        <View className="flex-1">
          <LinearGradient
            colors={['#142235', '#0a0c10']}
            start={{ x: 0.5, y: 0.2 }}
            end={{ x: 0.5, y: 1 }}
            className="flex-1">
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}>
              
              <View className="px-8 pt-8 pb-4">
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-2xl font-bold text-white">
                    Filtros e Busca
                  </Text>
                  <Pressable 
                    className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center"
                    onPress={() => setIsModalOpen(true)}>
                    <PlusIcon size={24} color="#fff" />
                  </Pressable>
                </View>

                <View className="flex-row flex-wrap gap-4 mb-6">
                  <View className="flex-1 min-w-[200px] bg-[#1a1f2e] rounded-lg p-4 border border-white/10">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="w-10 h-10 bg-purple-500/20 rounded-lg items-center justify-center">
                        <UsersIcon size={20} color="#a855f7" />
                      </View>
                    </View>
                    <Text className="text-3xl font-bold text-white mb-1">
                      {isPending ? '...' : stats.total}
                    </Text>
                    <Text className="text-gray-400 text-xs">
                      Total de usuários no sistema
                    </Text>
                  </View>

                  <View className="flex-1 min-w-[200px] bg-[#1a1f2e] rounded-lg p-4 border border-white/10">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="w-10 h-10 bg-teal-500/20 rounded-lg items-center justify-center">
                        <UserIcon size={20} color="#14b8a6" />
                      </View>
                    </View>
                    <Text className="text-3xl font-bold text-white mb-1">
                      {isPending ? '...' : stats.active}
                    </Text>
                    <Text className="text-gray-400 text-xs">
                      Usuarios ativos no sistema
                    </Text>
                  </View>

                  <View className="flex-1 min-w-[200px] bg-[#1a1f2e] rounded-lg p-4 border border-white/10">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="w-10 h-10 bg-red-500/20 rounded-lg items-center justify-center">
                        <UserXIcon size={20} color="#ef4444" />
                      </View>
                    </View>
                    <Text className="text-3xl font-bold text-white mb-1">
                      {isPending ? '...' : stats.inactive}
                    </Text>
                    <Text className="text-gray-400 text-xs">
                      Usuarios inativos no sistema
                    </Text>
                  </View>

                  <View className="flex-1 min-w-[200px] bg-[#1a1f2e] rounded-lg p-4 border border-white/10">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="w-10 h-10 bg-orange-500/20 rounded-lg items-center justify-center">
                        <ShieldIcon size={20} color="#f97316" />
                      </View>
                    </View>
                    <Text className="text-3xl font-bold text-white mb-1">
                      {isPending ? '...' : stats.admins}
                    </Text>
                    <Text className="text-gray-400 text-xs">
                      Administradores no sistema
                    </Text>
                  </View>
                </View>
              </View>

              <View className="px-8">
                <View className="flex-row items-center gap-2 mb-4">
                  <View className="w-8 h-8 bg-purple-500/20 rounded-lg items-center justify-center">
                    <UserCircleIcon size={16} color="#a855f7" />
                  </View>
                  <Text className="text-xl font-bold text-white">
                    Lista de Usuários
                  </Text>
                </View>
                <Text className="text-gray-400 text-sm mb-4">
                  Lista de usuários cadastrados no sistema
                </Text>

                <View className="mb-4">
                  <View className="flex-row items-center bg-[#1a1f2e] rounded-lg px-4 py-3 border border-white/10">
                    <SearchIcon size={20} color="#9ca3af" />
                    <Input
                      className="flex-1 ml-3 bg-transparent border-0 text-white"
                      placeholder="Buscar usuários..."
                      placeholderTextColor="#9ca3af"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                  </View>
                </View>

                {isPending ? (
                  <View className="items-center justify-center py-12">
                    <ActivityIndicator size="large" color="#6b8bff" />
                    <Text className="text-gray-400 mt-4">Carregando usuários...</Text>
                  </View>
                ) : error ? (
                  <View className="items-center justify-center py-12">
                    <Text className="text-red-400 text-lg mb-2">Erro ao carregar usuários</Text>
                    <Text className="text-gray-400">{error.message}</Text>
                  </View>
                ) : (
                  <View className="bg-[#1a1f2e] rounded-lg border border-white/10 overflow-hidden">
                    <View className="flex-row bg-[#0f1419] border-b border-white/10 px-4 py-3">
                      <View className="flex-1">
                        <Text className="text-gray-400 text-xs font-semibold uppercase">
                          NOME
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-400 text-xs font-semibold uppercase">
                          EMAIL
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-400 text-xs font-semibold uppercase">
                          TELEFONE
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-400 text-xs font-semibold uppercase">
                          CPF
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-400 text-xs font-semibold uppercase">
                          ENDEREÇO
                        </Text>
                      </View>
                      <View className="w-24">
                        <Text className="text-gray-400 text-xs font-semibold uppercase">
                          PERFIL
                        </Text>
                      </View>
                      <View className="w-24">
                        <Text className="text-gray-400 text-xs font-semibold uppercase">
                          STATUS
                        </Text>
                      </View>
                      <View className="w-32">
                        <Text className="text-gray-400 text-xs font-semibold uppercase">
                          AÇÕES
                        </Text>
                      </View>
                    </View>

                    {!filteredUsers || filteredUsers.length === 0 ? (
                      <View className="items-center justify-center py-12">
                        <Text className="text-gray-400">Nenhum usuário encontrado</Text>
                      </View>
                    ) : (
                      filteredUsers
                        .filter(user => user && user.id)
                        .map((user, index) => (
                          <View
                            key={user.id}
                            className={`flex-row items-center px-4 py-3 ${
                              index !== filteredUsers.length - 1 ? 'border-b border-white/5' : ''
                            }`}>
                            <View className="flex-1 flex-row items-center gap-3">
                              <View className="w-10 h-10 bg-blue-500/20 rounded-full items-center justify-center">
                                <UserIcon size={20} color="#3b82f6" />
                              </View>
                              <Text className="text-white text-sm flex-1" numberOfLines={1}>
                                {user?.name || '-'}
                              </Text>
                            </View>
                            <View className="flex-1">
                              <Text className="text-gray-300 text-sm" numberOfLines={1}>
                                {user?.email || '-'}
                              </Text>
                            </View>
                            <View className="flex-1">
                              <Text className="text-gray-300 text-sm">
                                {user?.phone || '-'}
                              </Text>
                            </View>
                            <View className="flex-1">
                              <Text className="text-gray-300 text-sm" numberOfLines={1}>
                                {user?.cpf || '-'}
                              </Text>
                            </View>
                            <View className="flex-1">
                              <Text className="text-gray-300 text-sm" numberOfLines={1}>
                                {user?.primaryAddress 
                                  ? `${user.primaryAddress.street}, ${user.primaryAddress.number} - ${user.primaryAddress.city}/${user.primaryAddress.state}`
                                  : '-'
                                }
                              </Text>
                            </View>
                            <View className="w-24">
                              <View className={`px-3 py-1 rounded-full ${
                                user?.profile === 'admin' 
                                  ? 'bg-orange-500/20' 
                                  : 'bg-gray-500/20'
                              }`}>
                                <Text className={`text-xs font-semibold text-center ${
                                  user?.profile === 'admin'
                                    ? 'text-orange-400'
                                    : 'text-gray-400'
                                }`}>
                                  {user?.profile === 'admin' ? 'ADMIN' : 'USER'}
                                </Text>
                              </View>
                            </View>
                            <View className="w-24">
                              <View className={`px-3 py-1 rounded-full ${
                                (user?.isActive === false || user?.isActive === null)
                                  ? 'bg-red-500/20'
                                  : 'bg-green-500/20'
                              }`}>
                                <Text className={`text-xs font-semibold text-center ${
                                  (user?.isActive === false || user?.isActive === null)
                                    ? 'text-red-400'
                                    : 'text-green-400'
                                }`}>
                                  {(user?.isActive === false || user?.isActive === null) ? 'INATIVO' : 'ATIVO'}
                                </Text>
                              </View>
                            </View>
                            <View className="w-32 flex-row items-center justify-center gap-1">
                              <Pressable
                                onPress={() => handleEditUser(user)}
                                style={({ pressed }) => ({
                                  opacity: pressed ? 0.7 : 1,
                                })}>
                                <View className="bg-blue-500/20 border border-blue-500/40 rounded-lg px-2 py-1.5">
                                  <EditIcon size={14} color="#3b82f6" />
                                </View>
                              </Pressable>
                              {(user?.isActive === false || user?.isActive === null) ? (
                                <Pressable
                                  onPress={() => handleToggleUserStatus(user.id, true)}
                                  style={({ pressed }) => ({
                                    opacity: pressed ? 0.7 : 1,
                                  })}
                                  disabled={activateUserMutation.isPending}>
                                  <View className="bg-green-500/20 border border-green-500/40 rounded-lg px-2 py-1.5">
                                    <CheckCircleIcon size={14} color="#10b981" />
                                  </View>
                                </Pressable>
                              ) : (
                                <Pressable
                                  onPress={() => handleToggleUserStatus(user.id, false)}
                                  style={({ pressed }) => ({
                                    opacity: pressed ? 0.7 : 1,
                                  })}
                                  disabled={deactivateUserMutation.isPending}>
                                  <View className="bg-orange-500/20 border border-orange-500/40 rounded-lg px-2 py-1.5">
                                    <XCircleIcon size={14} color="#f97316" />
                                  </View>
                                </Pressable>
                              )}
                              <Pressable
                                onPress={() => handleDeleteUser(user.id, user.name || '')}
                                style={({ pressed }) => ({
                                  opacity: pressed ? 0.7 : 1,
                                })}
                                disabled={deleteUserMutation.isPending}>
                                <View className="bg-red-500/20 border border-red-500/40 rounded-lg px-2 py-1.5">
                                  <TrashIcon size={14} color="#ef4444" />
                                </View>
                              </Pressable>
                            </View>
                          </View>
                        ))
                    )}
                  </View>
                )}

                {filteredUsers && Array.isArray(filteredUsers) && filteredUsers.length > 0 && (
                  <View className="mt-4">
                    <Text className="text-gray-400 text-sm text-center">
                      # de {filteredUsers.length} usuário{filteredUsers.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </LinearGradient>
        </View>
      </View>

      <Modal
        visible={isModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCloseModal}>
        <View 
          className="flex-1 bg-black/70 items-center justify-center"
          style={{ padding: 16 }}>
          <View 
            className="w-full rounded-2xl overflow-hidden shadow-2xl"
            style={{ 
              maxWidth: 600,
              maxHeight: '90%',
              width: '100%',
            }}>
            {/* Borda gradiente externa */}
            <LinearGradient
              colors={['#6b8bff', '#bc7cff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                padding: 2,
                borderRadius: 16,
                flex: 1,
                maxHeight: '100%',
              }}>
              <View 
                className="bg-[#0a0c10] rounded-xl"
                style={{ 
                  flex: 1,
                  maxHeight: '100%',
                }}>
                {/* Header - Fixo no topo */}
                <View className="px-6 pt-6 pb-4 flex-shrink-0">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-2xl font-bold text-white">
                      {isEditMode ? 'Editar Usuário' : 'Novo Usuário'}
                    </Text>
                    <Pressable
                      onPress={handleCloseModal}
                      className="bg-white/10 rounded-full p-2">
                      <XIcon size={20} color="#fff" />
                    </Pressable>
                  </View>
                </View>

                {/* Conteúdo scrollável */}
                <ScrollView
                  className="flex-1 px-6"
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={{ 
                    paddingBottom: 100,
                    flexGrow: 1,
                  }}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled={true}
                  bounces={false}>
                  
                  {/* Nome */}
                  <View className="mb-4">
                    <Text className="text-white font-semibold mb-2 text-sm">
                      Nome <Text className="text-red-400">*</Text>
                    </Text>
                    <View className="flex-row items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                      <UserIcon size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                      <TextInput
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                        placeholder="Digite o nome completo"
                        placeholderTextColor="#9ca3af"
                        className="flex-1 text-white text-base"
                        style={{ color: '#fff' }}
                      />
                    </View>
                    {formErrors.name && <Text className="text-red-400 text-xs mt-1">{formErrors.name}</Text>}
                  </View>

                  {/* Email */}
                  <View className="mb-4">
                    <Text className="text-white font-semibold mb-2 text-sm">
                      Email <Text className="text-red-400">*</Text>
                    </Text>
                    <View className="flex-row items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                      <MailIcon size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                      <TextInput
                        value={formData.email}
                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                        placeholder="exemplo@email.com"
                        placeholderTextColor="#9ca3af"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="flex-1 text-white text-base"
                        style={{ color: '#fff' }}
                      />
                    </View>
                    {formErrors.email && <Text className="text-red-400 text-xs mt-1">{formErrors.email}</Text>}
                  </View>

                  {/* Senha - Apenas no modo criação */}
                  {!isEditMode && (
                    <View className="mb-4">
                      <Text className="text-white font-semibold mb-2 text-sm">
                        Senha <Text className="text-red-400">*</Text>
                      </Text>
                      <View className="flex-row items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                        <LockIcon size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                        <TextInput
                          value={formData.password}
                          onChangeText={(text) => setFormData({ ...formData, password: text })}
                          placeholder="Digite a senha (mínimo 6 caracteres)"
                          placeholderTextColor="#9ca3af"
                          secureTextEntry
                          className="flex-1 text-white text-base"
                          style={{ color: '#fff' }}
                        />
                      </View>
                      {formErrors.password && <Text className="text-red-400 text-xs mt-1">{formErrors.password}</Text>}
                    </View>
                  )}

                  {/* Telefone */}
                  <View className="mb-4">
                    <Text className="text-white font-semibold mb-2 text-sm">
                      Telefone <Text className="text-red-400">*</Text>
                    </Text>
                    <View className="flex-row items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                      <PhoneIcon size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                      <TextInput
                        value={formData.phone}
                        onChangeText={(text) => setFormData({ ...formData, phone: text })}
                        placeholder="(11) 99999-9999"
                        placeholderTextColor="#9ca3af"
                        keyboardType="phone-pad"
                        className="flex-1 text-white text-base"
                        style={{ color: '#fff' }}
                      />
                    </View>
                    {formErrors.phone && <Text className="text-red-400 text-xs mt-1">{formErrors.phone}</Text>}
                  </View>

                  {/* CPF */}
                  <View className="mb-4">
                    <Text className="text-white font-semibold mb-2 text-sm">
                      CPF <Text className="text-red-400">*</Text>
                    </Text>
                    <View className="flex-row items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                      <CreditCardIcon size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                      <TextInput
                        value={formData.cpf}
                        onChangeText={(text) => setFormData({ ...formData, cpf: text })}
                        placeholder="000.000.000-00"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        className="flex-1 text-white text-base"
                        style={{ color: '#fff' }}
                      />
                    </View>
                    {formErrors.cpf && <Text className="text-red-400 text-xs mt-1">{formErrors.cpf}</Text>}
                  </View>

                  {/* Perfil */}
                  <View className="mb-4">
                    <Text className="text-white font-semibold mb-2 text-sm">
                      Perfil <Text className="text-red-400">*</Text>
                    </Text>
                    <Pressable
                      onPress={() => setShowRoleModal(true)}
                      className="flex-row items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                      <View className="flex-row items-center flex-1">
                        <ShieldIcon size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                        <Text className={formData.role ? 'text-white' : 'text-gray-400'}>
                          {formData.role === 'admin' ? 'Administrador' : formData.role === 'cliente' ? 'Cliente' : 'Selecione o perfil'}
                        </Text>
                      </View>
                      <ChevronRightIcon size={20} color="#9ca3af" />
                    </Pressable>
                  </View>

                  {/* Seção Endereço */}
                  <View className="mb-4">
                    <View className="flex-row items-center mb-4 mt-2">
                      <MapPinIcon size={18} color="#9ca3af" style={{ marginRight: 8 }} />
                      <Text className="text-white text-lg font-semibold">Endereço</Text>
                    </View>

                    {/* Rua */}
                    <View className="mb-4">
                      <Text className="text-white font-semibold mb-2 text-sm">
                        Rua <Text className="text-red-400">*</Text>
                      </Text>
                      <View className="flex-row items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                        <MapPinIcon size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                        <TextInput
                          value={formData.street}
                          onChangeText={(text) => setFormData({ ...formData, street: text })}
                          placeholder="Digite o nome da rua"
                          placeholderTextColor="#9ca3af"
                          className="flex-1 text-white text-base"
                          style={{ color: '#fff' }}
                        />
                      </View>
                      {formErrors.street && <Text className="text-red-400 text-xs mt-1">{formErrors.street}</Text>}
                    </View>

                    {/* Número */}
                    <View className="mb-4">
                      <Text className="text-white font-semibold mb-2 text-sm">
                        Número <Text className="text-red-400">*</Text>
                      </Text>
                      <View className="flex-row items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                        <BuildingIcon size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                        <TextInput
                          value={formData.number}
                          onChangeText={(text) => setFormData({ ...formData, number: text })}
                          placeholder="123"
                          placeholderTextColor="#9ca3af"
                          keyboardType="numeric"
                          className="flex-1 text-white text-base"
                          style={{ color: '#fff' }}
                        />
                      </View>
                      {formErrors.number && <Text className="text-red-400 text-xs mt-1">{formErrors.number}</Text>}
                    </View>

                    {/* Cidade */}
                    <View className="mb-6">
                      <Text className="text-white font-semibold mb-2 text-sm">
                        Cidade <Text className="text-red-400">*</Text>
                      </Text>
                      <View className="flex-row items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                        <BuildingIcon size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                        <TextInput
                          value={formData.city}
                          onChangeText={(text) => setFormData({ ...formData, city: text })}
                          placeholder="Digite a cidade"
                          placeholderTextColor="#9ca3af"
                          className="flex-1 text-white text-base"
                          style={{ color: '#fff' }}
                        />
                      </View>
                      {formErrors.city && <Text className="text-red-400 text-xs mt-1">{formErrors.city}</Text>}
                    </View>
                  </View>

                </ScrollView>

                {/* Botões - Fixo no rodapé */}
                <View className="px-6 pb-6 pt-4 flex-shrink-0 border-t border-white/10">
                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={handleCloseModal}
                      disabled={
                        isEditMode
                          ? updateUserMutation.isPending
                          : createUserMutation.isPending || createAddressMutation.isPending
                      }
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3.5">
                      <Text className="text-center text-white font-semibold">
                        Cancelar
                      </Text>
                    </Pressable>
                    
                    <Pressable
                      onPress={isEditMode ? handleUpdateUser : handleSubmit}
                      disabled={
                        isEditMode
                          ? updateUserMutation.isPending
                          : createUserMutation.isPending || createAddressMutation.isPending
                      }
                      className="flex-1 rounded-xl py-3.5 overflow-hidden">
                      <LinearGradient
                        colors={['#6b8bff', '#bc7cff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        {isEditMode ? (
                          updateUserMutation.isPending ? (
                            <ActivityIndicator color="#fff" />
                          ) : (
                            <Text className="text-center text-white font-semibold">
                              Atualizar
                            </Text>
                          )
                        ) : createUserMutation.isPending || createAddressMutation.isPending ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text className="text-center text-white font-semibold">
                            Cadastrar
                          </Text>
                        )}
                      </LinearGradient>
                    </Pressable>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Modal de Seleção de Perfil */}
          <Modal
            visible={showRoleModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowRoleModal(false)}>
            <Pressable 
              className="flex-1 bg-black/70 items-center justify-center p-4"
              onPress={() => setShowRoleModal(false)}>
              <Pressable onPress={(e) => e.stopPropagation()}>
                <View className="w-80 bg-[#0a0c10] rounded-xl border border-white/10 p-4">
                  <Text className="text-white font-bold text-lg mb-4">Selecione o Perfil</Text>
                  <Pressable
                    onPress={() => {
                      setFormData({ ...formData, role: 'cliente' });
                      setShowRoleModal(false);
                    }}
                    className="py-3 border-b border-white/10 last:border-b-0">
                    <Text className={formData.role === 'cliente' ? 'text-blue-400 font-semibold' : 'text-white'}>
                      Cliente
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setFormData({ ...formData, role: 'admin' });
                      setShowRoleModal(false);
                    }}
                    className="py-3 border-b border-white/10 last:border-b-0">
                    <Text className={formData.role === 'admin' ? 'text-blue-400 font-semibold' : 'text-white'}>
                      Administrador
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            </Pressable>
          </Modal>
        </View>
      </Modal>
    </>
  );
}

