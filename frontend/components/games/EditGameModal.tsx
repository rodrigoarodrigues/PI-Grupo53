import { Modal, View, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectOption } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { updateGame, UpdateGameProps } from '@/data/games/updateGame';
import { useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GetGameProps } from '@/data/games/getGameFromId';

interface EditGameModalProps {
  visible: boolean;
  onClose: () => void;
  game: GetGameProps | null | undefined;
}

export function EditGameModal({ visible, onClose, game }: EditGameModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<UpdateGameProps>({
    imageUrl: '',
    platform: '',
    size: '',
    multiplayer: false,
    languages: '',
  });

  const platformOptions: SelectOption[] = [
    { value: 'PS5', label: 'PlayStation 5' },
    { value: 'PS4', label: 'PlayStation 4' },
    { value: 'PS3', label: 'PlayStation 3' },
    { value: 'XBOX', label: 'Xbox' },
    { value: 'PC', label: 'PC' },
    { value: 'NINTENDO', label: 'Nintendo Switch' },
  ];

  const multiplayerOptions: SelectOption[] = [
    { value: 'true', label: 'Sim' },
    { value: 'false', label: 'Não' },
  ];

  // Preenche o formulário quando o jogo é carregado
  useEffect(() => {
    if (game) {
      setFormData({
        imageUrl: game.imageUrl || '',
        platform: game.platform || '',
        size: game.size || '',
        multiplayer: game.multiplayer || false,
        languages: game.languages || '',
      });
    }
  }, [game]);

  const handleSubmit = async () => {
    if (!game || game.id === undefined || game.id === null) {
      Alert.alert('Erro', 'Jogo não encontrado');
      return;
    }

    const gameId = typeof game.id === 'string' ? Number(game.id) : game.id;
    if (isNaN(gameId) || gameId <= 0) {
      Alert.alert('Erro', 'ID do jogo inválido');
      return;
    }

    setIsSubmitting(true);

    try {
      await updateGame(gameId, {
        ...formData,
        multiplayer: formData.multiplayer ?? false,
      });

      // Atualiza a lista de jogos e o jogo específico
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['games', game.uuid] });

      Alert.alert('Sucesso!', 'Informações do jogo atualizadas com sucesso!');
      onClose();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao atualizar informações do jogo');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!game) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View className="flex-1 bg-black/70 items-center justify-center p-4">
        <View className="w-full max-w-2xl bg-[#0a0c10] rounded-2xl border border-white/10 shadow-2xl max-h-[90%]">
          <LinearGradient
            colors={['#6b8bff', '#bc7cff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-t-2xl p-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-white">
                Editar Informações
              </Text>
              <Pressable
                onPress={onClose}
                className="bg-white/20 rounded-full p-2">
                <XIcon size={20} color="#fff" />
              </Pressable>
            </View>
          </LinearGradient>

          <ScrollView
            className="flex-1 p-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}>
            <View className="mb-4">
              <Text className="text-white font-semibold mb-2">URL da Imagem</Text>
              <Input
                value={formData.imageUrl}
                onChangeText={(text) => setFormData({ ...formData, imageUrl: text })}
                placeholder="https://exemplo.com/imagem.jpg"
                className="bg-white/5 border-white/10 text-white"
              />
            </View>

            <View className="mb-4">
              <Text className="text-white font-semibold mb-2">Plataforma</Text>
              <Select
                options={platformOptions}
                value={formData.platform || undefined}
                onValueChange={(value) => setFormData({ ...formData, platform: value })}
                placeholder="Selecione a plataforma"
              />
            </View>

            <View className="mb-4">
              <Text className="text-white font-semibold mb-2">Tamanho</Text>
              <Input
                value={formData.size}
                onChangeText={(text) => setFormData({ ...formData, size: text })}
                placeholder="Ex: 48 GB"
                className="bg-white/5 border-white/10 text-white"
              />
            </View>

            <View className="mb-4">
              <Text className="text-white font-semibold mb-2">Multiplayer</Text>
              <Select
                options={multiplayerOptions}
                value={formData.multiplayer ? 'true' : 'false'}
                onValueChange={(value) => setFormData({ ...formData, multiplayer: value === 'true' })}
                placeholder="Selecione"
              />
            </View>

            <View className="mb-6">
              <Text className="text-white font-semibold mb-2">Idiomas</Text>
              <Input
                value={formData.languages}
                onChangeText={(text) => setFormData({ ...formData, languages: text })}
                placeholder="Ex: PT BR, EN, ES"
                className="bg-white/5 border-white/10 text-white"
              />
            </View>

            <View className="flex-row gap-3">
              <Button
                variant="outline"
                onPress={onClose}
                className="flex-1"
                disabled={isSubmitting}>
                <Text>Cancelar</Text>
              </Button>
              <Button
                onPress={handleSubmit}
                className="flex-1"
                disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold">Salvar</Text>
                )}
              </Button>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

