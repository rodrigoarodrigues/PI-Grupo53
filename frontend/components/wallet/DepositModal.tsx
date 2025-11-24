import { Modal, View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { XIcon, WalletIcon } from 'lucide-react-native';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { depositMoney } from '@/data/users/depositMoney';
import { AlertService } from '@/services/AlertService';
import { useQueryClient } from '@tanstack/react-query';

interface DepositModalProps {
  visible: boolean;
  onClose: () => void;
}

export function DepositModal({ visible, onClose }: DepositModalProps) {
  const { user, updateWallet, refreshWallet } = useAuth();
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleDeposit = async () => {
    if (!user) {
      AlertService.error('Erro', 'Usuário não autenticado');
      return;
    }

    // Limpar e validar o valor
    const cleanedAmount = amount.trim().replace(',', '.').replace(/[^\d.]/g, '');
    
    if (!cleanedAmount || cleanedAmount === '' || cleanedAmount === '.') {
      AlertService.error('Valor inválido', 'Por favor, insira um valor válido');
      return;
    }

    const depositAmount = parseFloat(cleanedAmount);
    
    if (isNaN(depositAmount) || depositAmount <= 0 || !isFinite(depositAmount)) {
      AlertService.error('Valor inválido', 'Por favor, insira um valor maior que zero');
      return;
    }

    // Garantir que o valor tenha no máximo 2 casas decimais
    const finalAmount = Math.round(depositAmount * 100) / 100;

    if (finalAmount <= 0) {
      AlertService.error('Valor inválido', 'O valor deve ser maior que zero');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await depositMoney({
        userId: user.id,
        amount: finalAmount,
      });

      // Atualizar saldo no contexto
      updateWallet(result.newBalance);
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['wallet', user.id] });
      
      AlertService.success(
        'Depósito realizado! 💰',
        `R$ ${finalAmount.toFixed(2)} foram adicionados à sua carteira.\n\nNovo saldo: R$ ${result.newBalance.toFixed(2)}`
      );

      setAmount('');
      onClose();
    } catch (error: any) {
      // Tratar erros de validação do backend
      let errorMessage = 'Erro ao depositar dinheiro';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.details && Array.isArray(error.details)) {
        // Se for erro de validação Zod
        const zodError = error.details.find((d: any) => d.path?.includes('amount'));
        if (zodError) {
          errorMessage = zodError.message || 'Valor inválido';
        }
      } else if (error.details && typeof error.details === 'string') {
        errorMessage = error.details;
      }
      
      AlertService.error('Erro ao depositar', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAmount = (text: string) => {
    // Remove tudo que não é número ou vírgula/ponto
    const cleaned = text.replace(/[^\d,.]/g, '');
    // Substitui vírgula por ponto
    const normalized = cleaned.replace(',', '.');
    // Permite apenas um ponto decimal
    const parts = normalized.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return normalized;
  };

  const currentWallet = user?.wallet || 0;
  const cleanedAmountForPreview = amount.trim().replace(',', '.').replace(/[^\d.]/g, '');
  const depositValue = cleanedAmountForPreview && cleanedAmountForPreview !== '.' 
    ? (parseFloat(cleanedAmountForPreview) || 0) 
    : 0;
  const newBalance = currentWallet + depositValue;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View className="flex-1 bg-black/80 items-center justify-center p-4">
        <View className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
          {/* Borda gradiente externa */}
          <LinearGradient
            colors={['#10b981', '#059669', '#047857']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: 2,
              borderRadius: 16,
            }}>
            <View className="bg-[#0a0c10] rounded-xl">
              {/* Header */}
              <View className="px-6 pt-6 pb-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View className="bg-green-500/20 rounded-full p-3">
                      <WalletIcon size={24} color="#10b981" />
                    </View>
                    <View>
                      <Text className="text-2xl font-bold text-white">
                        Depositar Dinheiro
                      </Text>
                      <Text className="text-sm text-gray-400 mt-1">
                        Adicione fundos à sua carteira
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={onClose}
                    className="bg-white/10 rounded-full p-2">
                    <XIcon size={20} color="#fff" />
                  </Pressable>
                </View>
              </View>

              <View className="px-6 pb-6">
                {/* Saldo Atual */}
                <View className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                  <Text className="text-xs text-gray-400 mb-1">Saldo Atual</Text>
                  <Text
                    className="text-3xl font-extrabold"
                    style={{
                      color: '#a78bfa',
                      textShadowColor: '#8b5cf6',
                      textShadowOffset: { width: 0, height: 0 },
                      textShadowRadius: 10,
                    }}>
                    R$ {currentWallet.toFixed(2)}
                  </Text>
                </View>

                {/* Campo de Valor */}
                <View className="mb-4">
                  <Text className="text-white font-semibold mb-2 text-sm">
                    Valor do Depósito
                  </Text>
                  <View className="bg-white/5 border border-white/10 rounded-xl px-4 py-4">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-2xl font-bold text-white">R$</Text>
                      <TextInput
                        value={amount}
                        onChangeText={(text) => setAmount(formatAmount(text))}
                        placeholder="0,00"
                        placeholderTextColor="#9ca3af"
                        keyboardType="decimal-pad"
                        className="flex-1 text-white text-2xl font-bold"
                        style={{ color: '#fff' }}
                      />
                    </View>
                  </View>
                </View>

                {/* Preview do Novo Saldo */}
                {depositValue > 0 && (
                  <View className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-xs text-green-400 mb-1">Novo Saldo</Text>
                        <Text className="text-xl font-bold text-green-400">
                          R$ {newBalance.toFixed(2)}
                        </Text>
                      </View>
                      <View className="bg-green-500/20 rounded-full p-2">
                        <Text className="text-green-400 font-bold text-sm">+{depositValue.toFixed(2)}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Botões */}
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={onClose}
                    disabled={isSubmitting}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3.5">
                    <Text className="text-center text-white font-semibold">
                      Cancelar
                    </Text>
                  </Pressable>
                  
                  <Pressable
                    onPress={handleDeposit}
                    disabled={isSubmitting || depositValue <= 0}
                    className="flex-1 rounded-xl py-3.5 overflow-hidden"
                    style={{ opacity: isSubmitting || depositValue <= 0 ? 0.6 : 1 }}>
                    <LinearGradient
                      colors={['#10b981', '#059669']}
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
                        <Text className="text-center text-white font-semibold">
                          Depositar
                        </Text>
                      )}
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

