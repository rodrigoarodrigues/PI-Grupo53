import { Modal, View, Pressable, Alert, ActivityIndicator } from 'react-native';
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

type FieldType = 'title' | 'imageUrl' | 'platform' | 'size' | 'multiplayer' | 'languages';

interface EditFieldModalProps {
  visible: boolean;
  onClose: () => void;
  game: GetGameProps | null | undefined;
  field: FieldType;
  fieldLabel: string;
}

export function EditFieldModal({ visible, onClose, game, field, fieldLabel }: EditFieldModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [value, setValue] = useState<string>('');

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

  // Preenche o valor quando o modal abre
  useEffect(() => {
    if (game && visible) {
      if (field === 'multiplayer') {
        setValue(game.multiplayer ? 'true' : 'false');
      } else if (field === 'title') {
        setValue(game.title || '');
      } else {
        setValue((game[field] as string) || '');
      }
    }
  }, [game, field, visible]);

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
      const updateData: UpdateGameProps = {};
      
      if (field === 'multiplayer') {
        updateData.multiplayer = value === 'true';
      } else {
        (updateData as any)[field] = value;
      }

      await updateGame(gameId, updateData);

      // Atualiza a lista de jogos e o jogo específico
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['games', game.uuid] });

      Alert.alert('Sucesso!', `${fieldLabel} atualizado com sucesso!`);
      onClose();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao atualizar informação');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!game) {
    return null;
  }

  const isSelectField = field === 'platform' || field === 'multiplayer';
  const options = field === 'platform' ? platformOptions : multiplayerOptions;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View className="flex-1 bg-black/70 items-center justify-center p-4">
        <View className="w-full max-w-md bg-[#0a0c10] rounded-2xl border border-white/10 shadow-2xl">
          <LinearGradient
            colors={['#6b8bff', '#bc7cff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-t-2xl p-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-white">
                Editar {fieldLabel}
              </Text>
              <Pressable
                onPress={onClose}
                className="bg-white/20 rounded-full p-2">
                <XIcon size={20} color="#fff" />
              </Pressable>
            </View>
          </LinearGradient>

          <View className="p-6">
            <View className="mb-6">
              <Text className="text-white font-semibold mb-3">{fieldLabel}</Text>
              {isSelectField ? (
                <Select
                  options={options}
                  value={value}
                  onValueChange={setValue}
                  placeholder={`Selecione ${fieldLabel.toLowerCase()}`}
                />
              ) : (
                <Input
                  value={value}
                  onChangeText={setValue}
                  placeholder={
                    field === 'title' ? 'Digite o título do jogo' :
                    field === 'imageUrl' ? 'https://exemplo.com/imagem.jpg' :
                    field === 'languages' ? 'Ex: PT BR, EN, ES' :
                    'Ex: 48 GB'
                  }
                  className="bg-white/5 border-white/10 text-white"
                  multiline={field === 'languages'}
                />
              )}
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
          </View>
        </View>
      </View>
    </Modal>
  );
}

