import {
  Modal,
  View,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { SelectOption } from '@/components/ui/select';
import { useState } from 'react';
import { createGame, CreateGameProps } from '@/data/games/createGame';
import { useQueryClient } from '@tanstack/react-query';
import {
  XIcon,
  Gamepad2Icon,
  ImageIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  UsersIcon,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CreateGameModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreateGameModal({ visible, onClose }: CreateGameModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateGameProps>({
    uuid: '',
    title: '',
    imageUrl: '',
    quantity: 0,
    description: '',
    platform: '',
    size: '',
    multiplayer: false,
    languages: '',
    price: 0,
  });

  const [multiplayerType, setMultiplayerType] = useState('');
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [showMultiplayerModal, setShowMultiplayerModal] = useState(false);
  const [showMultiplayerTypeModal, setShowMultiplayerTypeModal] = useState(false);

  const platformOptions: SelectOption[] = [
    { value: 'PS5', label: 'PlayStation 5' },
    { value: 'PS4', label: 'PlayStation 4' },
    { value: 'PS3', label: 'PlayStation 3' },
    { value: 'XBOX', label: 'Xbox' },
    { value: 'PC', label: 'PC' },
    { value: 'NINTENDO', label: 'Nintendo Switch' },
    { value: 'MultiPlataforma', label: 'MultiPlataforma' },
  ];

  const multiplayerOptions: SelectOption[] = [
    { value: 'true', label: 'Sim' },
    { value: 'false', label: 'Não' },
  ];

  const multiplayerTypeOptions: SelectOption[] = [
    { value: 'COOP', label: 'COOP' },
    { value: 'MOBA', label: 'MOBA' },
    { value: 'Single Player', label: 'Single Player' },
  ];

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const handleSubmit = async () => {
    // Validações
    if (!formData.title.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o título do jogo');
      return;
    }

    if (!formData.imageUrl.trim()) {
      Alert.alert('Erro', 'Por favor, preencha a URL da imagem');
      return;
    }

    if (formData.quantity < 0) {
      Alert.alert('Erro', 'A quantidade deve ser maior ou igual a zero');
      return;
    }

    // Gera UUID se não tiver
    if (!formData.uuid) {
      formData.uuid = generateUUID();
    }

    setIsSubmitting(true);

    try {
      await createGame({
        ...formData,
        multiplayer: formData.multiplayer ?? false,
      });

      // Limpa o formulário
      setFormData({
        uuid: '',
        title: '',
        imageUrl: '',
        quantity: 0,
        description: '',
        platform: '',
        size: '',
        multiplayer: false,
        languages: '',
        price: 0,
      });
      setMultiplayerType('');

      // Atualiza a lista de jogos
      queryClient.invalidateQueries({ queryKey: ['games'] });

      Alert.alert('Sucesso!', 'Jogo cadastrado com sucesso!');
      onClose();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao cadastrar jogo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/70 p-4">
        <View className="max-h-[90%] w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl">
          {/* Borda gradiente externa */}
          <LinearGradient
            colors={['#6b8bff', '#bc7cff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              padding: 2,
              borderRadius: 16,
            }}>
            <View className="rounded-xl bg-[#0a0c10]">
              {/* Header */}
              <View className="px-6 pb-4 pt-6">
                <View className="flex-row items-center justify-between">
                  <Text className="text-2xl font-bold text-white">Novo Jogo</Text>
                  <Pressable onPress={onClose} className="rounded-full bg-white/10 p-2">
                    <XIcon size={20} color="#fff" />
                  </Pressable>
                </View>
              </View>

              <ScrollView
                className="max-h-[70vh] px-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}>
                {/* Título do Jogo */}
                <View className="mb-4">
                  <Text className="mb-2 text-sm font-semibold text-white">
                    Titulo do Jogo <Text className="text-red-400">*</Text>
                  </Text>
                  <View className="flex-row items-center rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <Gamepad2Icon size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                    <TextInput
                      value={formData.title}
                      onChangeText={(text) => setFormData({ ...formData, title: text })}
                      placeholder="Digite o titulo do jogo"
                      placeholderTextColor="#9ca3af"
                      className="flex-1 text-base text-white"
                      style={{ color: '#fff' }}
                    />
                  </View>
                </View>

                {/* URL da Imagem */}
                <View className="mb-4">
                  <Text className="mb-2 text-sm font-semibold text-white">
                    URL da Imagem <Text className="text-red-400">*</Text>
                  </Text>
                  <View className="flex-row items-center rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <ImageIcon size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                    <TextInput
                      value={formData.imageUrl}
                      onChangeText={(text) => setFormData({ ...formData, imageUrl: text })}
                      placeholder="https://exemplo.com/imagem.jpg"
                      placeholderTextColor="#9ca3af"
                      className="flex-1 text-base text-white"
                      style={{ color: '#fff' }}
                    />
                  </View>
                </View>

                {/* Descrição */}
                <View className="mb-4">
                  <Text className="mb-2 text-sm font-semibold text-white">Descrição</Text>
                  <View className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <TextInput
                      value={formData.description}
                      onChangeText={(text) => setFormData({ ...formData, description: text })}
                      placeholder="Digite a descrição do jogo"
                      placeholderTextColor="#9ca3af"
                      multiline
                      numberOfLines={4}
                      className="text-base text-white"
                      style={{
                        color: '#fff',
                        textAlignVertical: 'top',
                        minHeight: 80,
                      }}
                    />
                  </View>
                </View>

                {/* Plataforma */}
                <View className="mb-4">
                  <Text className="mb-2 text-sm font-semibold text-white">Plataforma</Text>
                  <Pressable
                    onPress={() => setShowPlatformModal(true)}
                    className="flex-row items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <View className="flex-1 flex-row items-center">
                      <Gamepad2Icon size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                      <Text className={formData.platform ? 'text-white' : 'text-gray-400'}>
                        {formData.platform
                          ? platformOptions.find((p) => p.value === formData.platform)?.label
                          : 'Selecione a plataforma'}
                      </Text>
                    </View>
                    <ChevronRightIcon size={20} color="#9ca3af" />
                  </Pressable>
                </View>

                {/* Tamanho e Idioma - Dois campos lado a lado */}
                <View className="mb-4">
                  <View className="flex-row gap-3">
                    {/* Campo esquerdo - Tamanho */}
                    <View className="flex-1">
                      <Text className="mb-2 text-sm font-semibold text-white">Tamanho</Text>
                      <View className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                        <TextInput
                          value={formData.size}
                          onChangeText={(text) => setFormData({ ...formData, size: text })}
                          placeholder="Ex: 50 GB"
                          placeholderTextColor="#9ca3af"
                          className="text-base text-white"
                          style={{ color: '#fff' }}
                        />
                      </View>
                    </View>

                    {/* Campo direito - Idioma */}
                    <View className="flex-1">
                      <Text className="mb-2 text-sm font-semibold text-white">Idioma</Text>
                      <View className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                        <TextInput
                          value={formData.languages}
                          onChangeText={(text) => setFormData({ ...formData, languages: text })}
                          placeholder="Ex: PT-BR, EN"
                          placeholderTextColor="#9ca3af"
                          className="text-base text-white"
                          style={{ color: '#fff' }}
                        />
                      </View>
                    </View>
                  </View>
                </View>

                {/* Multiplayer - Dois campos lado a lado */}
                <View className="mb-4">
                  <Text className="mb-2 text-sm font-semibold text-white">Multiplayer</Text>
                  <View className="flex-row gap-3">
                    {/* Campo esquerdo - Sim/Não */}
                    <View className="flex-1">
                      <Pressable
                        onPress={() => setShowMultiplayerModal(true)}
                        className="flex-row items-center rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                        <UsersIcon size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                        <Text className="text-white">{formData.multiplayer ? 'Sim' : 'Não'}</Text>
                      </Pressable>
                    </View>

                    {/* Campo direito - Tipo (Ex: COOP) */}
                    <View className="flex-1">
                      <Pressable
                        onPress={() => setShowMultiplayerTypeModal(true)}
                        className="flex-row items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                        <Text className={multiplayerType ? 'text-white' : 'text-gray-400'}>
                          {multiplayerType || 'Ex: COOP'}
                        </Text>
                        <ChevronDownIcon size={20} color="#9ca3af" />
                      </Pressable>
                    </View>
                  </View>
                </View>

                {/* Quantidade e Preço - Dois campos lado a lado */}
                <View className="mb-4">
                  <View className="flex-row gap-3">
                    {/* Campo esquerdo - Quantidade */}
                    <View className="flex-1">
                      <Text className="mb-2 text-sm font-semibold text-white">
                        Quantidade <Text className="text-red-400">*</Text>
                      </Text>
                      <View className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                        <TextInput
                          value={formData.quantity.toString()}
                          onChangeText={(text) => {
                            const num = parseInt(text) || 0;
                            setFormData({ ...formData, quantity: num });
                          }}
                          placeholder="0"
                          placeholderTextColor="#9ca3af"
                          keyboardType="numeric"
                          className="text-base text-white"
                          style={{ color: '#fff' }}
                        />
                      </View>
                    </View>

                    {/* Campo direito - Preço */}
                    <View className="flex-1">
                      <Text className="mb-2 text-sm font-semibold text-white">Preço (R$)</Text>
                      <View className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                        <TextInput
                          value={formData.price?.toString() || '0'}
                          onChangeText={(text) => {
                            const num = parseFloat(text.replace(',', '.')) || 0;
                            setFormData({ ...formData, price: num });
                          }}
                          placeholder="0,00"
                          placeholderTextColor="#9ca3af"
                          keyboardType="decimal-pad"
                          className="text-base text-white"
                          style={{ color: '#fff' }}
                        />
                      </View>
                    </View>
                  </View>
                </View>

                {/* Botões */}
                <View className="mt-2 flex-row gap-3">
                  <Pressable
                    onPress={onClose}
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3.5">
                    <Text className="text-center font-semibold text-white">Cancelar</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 overflow-hidden rounded-xl py-3.5">
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
                      {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text className="text-center font-semibold text-white">Cadastrar</Text>
                      )}
                    </LinearGradient>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </LinearGradient>
        </View>

        {/* Modal de Seleção de Plataforma */}
        <Modal
          visible={showPlatformModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPlatformModal(false)}>
          <Pressable
            className="flex-1 items-center justify-center bg-black/70 p-4"
            onPress={() => setShowPlatformModal(false)}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View className="w-80 rounded-xl border border-white/10 bg-[#0a0c10] p-4">
                <Text className="mb-4 text-lg font-bold text-white">Selecione a Plataforma</Text>
                {platformOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      setFormData({ ...formData, platform: option.value });
                      setShowPlatformModal(false);
                    }}
                    className="border-b border-white/10 py-3 last:border-b-0">
                    <Text
                      className={
                        formData.platform === option.value
                          ? 'font-semibold text-blue-400'
                          : 'text-white'
                      }>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Modal de Seleção de Multiplayer Sim/Não */}
        <Modal
          visible={showMultiplayerModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMultiplayerModal(false)}>
          <Pressable
            className="flex-1 items-center justify-center bg-black/70 p-4"
            onPress={() => setShowMultiplayerModal(false)}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View className="w-80 rounded-xl border border-white/10 bg-[#0a0c10] p-4">
                <Text className="mb-4 text-lg font-bold text-white">Multiplayer</Text>
                {multiplayerOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      setFormData({ ...formData, multiplayer: option.value === 'true' });
                      setShowMultiplayerModal(false);
                    }}
                    className="border-b border-white/10 py-3 last:border-b-0">
                    <Text
                      className={
                        (formData.multiplayer ? 'true' : 'false') === option.value
                          ? 'font-semibold text-blue-400'
                          : 'text-white'
                      }>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Modal de Seleção de Tipo de Multiplayer */}
        <Modal
          visible={showMultiplayerTypeModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMultiplayerTypeModal(false)}>
          <Pressable
            className="flex-1 items-center justify-center bg-black/70 p-4"
            onPress={() => setShowMultiplayerTypeModal(false)}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View className="w-80 rounded-xl border border-white/10 bg-[#0a0c10] p-4">
                <Text className="mb-4 text-lg font-bold text-white">Tipo de Multiplayer</Text>
                {multiplayerTypeOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      setMultiplayerType(option.value);
                      setShowMultiplayerTypeModal(false);
                    }}
                    className="border-b border-white/10 py-3 last:border-b-0">
                    <Text
                      className={
                        multiplayerType === option.value
                          ? 'font-semibold text-blue-400'
                          : 'text-white'
                      }>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </Modal>
  );
}
