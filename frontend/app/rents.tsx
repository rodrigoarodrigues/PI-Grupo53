import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stack, useRouter, Redirect } from 'expo-router';
import { View, ScrollView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { getActiveRents } from '@/data/rents/getActiveRents';
import { useReturnRent } from '@/data/rents/returnRent';
import { getGames, GetGameProps } from '@/data/games/getGames';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CalendarIcon, 
  PackageIcon, 
  ClockIcon, 
  CheckCircleIcon,
  AlertTriangleIcon,
  GamepadIcon
} from 'lucide-react-native';

export default function RentsDashboardScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const { isPending, error, data: rents, refetch } = getActiveRents(user?.id);
  const { data: games } = getGames();
  const returnRentMutation = useReturnRent();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0a0c10]">
        <ActivityIndicator size="large" color="#6b8bff" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleReturn = async (rentId: number, gameTitle: string) => {
    Alert.alert(
      'Confirmar Devolução',
      `Deseja devolver "${gameTitle}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Devolver',
          onPress: async () => {
            try {
              const result = await returnRentMutation.mutateAsync({ rentId });
              if (result.hasFine) {
                Alert.alert(
                  'Devolução Processada',
                  `Jogo devolvido com sucesso!\n\nMulta por atraso: R$ ${parseFloat(result.fineAmount).toFixed(2)}\nDias de atraso: ${result.daysOverdue}`,
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert('Sucesso!', 'Jogo devolvido com sucesso!', [{ text: 'OK' }]);
              }
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Erro ao processar devolução');
            }
          },
        },
      ]
    );
  };

  const getGameTitle = (gameId: number) => {
    const game = games?.find((g: GetGameProps) => {
      const gId = typeof g.id === 'string' ? Number(g.id) : g.id;
      return gId === gameId;
    });
    return game?.title || `Jogo #${gameId}`;
  };

  const getDaysUntilReturn = (expectedReturnDate: string | null) => {
    if (!expectedReturnDate) return null;
    const today = new Date();
    const returnDate = new Date(expectedReturnDate);
    const diffTime = returnDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isOverdue = (expectedReturnDate: string | null) => {
    const days = getDaysUntilReturn(expectedReturnDate);
    return days !== null && days < 0;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Meus Aluguéis',
          headerStyle: {
            backgroundColor: '#0a0a0a',
          },
          headerTintColor: '#fff',
        }}
      />
      <ScrollView
        className="flex-1 bg-background"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        {isPending && (
          <View className="flex-1 items-center justify-center p-8">
            <ActivityIndicator size="large" color="#fff" />
            <Text className="mt-4 text-muted-foreground">Carregando aluguéis...</Text>
          </View>
        )}

        {error && (
          <View className="flex-1 items-center justify-center p-8">
            <AlertTriangleIcon size={48} color="#ef4444" />
            <Text className="mt-4 text-center text-xl text-destructive">
              Erro ao carregar aluguéis
            </Text>
            <Text className="mt-2 text-center text-muted-foreground">{error.message}</Text>
            <Button onPress={onRefresh} className="mt-4" variant="outline">
              <Text>Tentar Novamente</Text>
            </Button>
          </View>
        )}

        {!isPending && !error && (
          <View className="p-4 space-y-4">
            <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-0 shadow-xl">
              <CardContent className="pt-6">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-sm text-muted-foreground mb-1">Aluguéis Ativos</Text>
                    <Text className="text-4xl font-bold text-foreground">
                      {rents?.length || 0}
                    </Text>
                  </View>
                  <View className="bg-primary/20 p-4 rounded-full">
                    <GamepadIcon size={32} color="#fff" />
                  </View>
                </View>
              </CardContent>
            </Card>

            {!rents || rents.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="pt-6 items-center py-12">
                  <PackageIcon size={64} color="#6b7280" />
                  <Text className="mt-4 text-xl font-semibold text-center text-muted-foreground">
                    Nenhum aluguel ativo
                  </Text>
                  <Text className="mt-2 text-center text-muted-foreground">
                    Você ainda não possui jogos alugados
                  </Text>
                </CardContent>
              </Card>
            ) : (
              rents.map((rent) => {
                const gameTitle = getGameTitle(rent.gameId);
                const daysUntilReturn = getDaysUntilReturn(rent.expectedReturnDate);
                const overdue = isOverdue(rent.expectedReturnDate);
                const hasFine = rent.daysOverdue && rent.daysOverdue > 0;

                return (
                  <Card
                    key={rent.id}
                    className={`shadow-lg ${
                      overdue
                        ? 'border-l-4 border-l-destructive bg-destructive/5'
                        : 'border-l-4 border-l-primary'
                    }`}
                  >
                    <CardHeader>
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1">
                          <CardTitle className="text-xl mb-2">{gameTitle}</CardTitle>
                          <View className="flex-row items-center gap-2 mt-1">
                            <View
                              className={`px-3 py-1 rounded-full ${
                                rent.rentalType === 'assinatura'
                                  ? 'bg-blue-500/20'
                                  : 'bg-purple-500/20'
                              }`}
                            >
                              <Text
                                className={`text-xs font-semibold ${
                                  rent.rentalType === 'assinatura'
                                    ? 'text-blue-400'
                                    : 'text-purple-400'
                                }`}
                              >
                                {rent.rentalType === 'assinatura' ? '📱 Assinatura' : '🎮 Unitário'}
                              </Text>
                            </View>
                            {overdue && (
                              <View className="bg-destructive/20 px-3 py-1 rounded-full">
                                <Text className="text-xs font-semibold text-destructive">
                                  ⚠️ Atrasado
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <View className="space-y-2">
                        <View className="flex-row items-center gap-2">
                          <CalendarIcon size={16} color="#9ca3af" />
                          <Text className="text-sm text-muted-foreground">Início:</Text>
                          <Text className="text-sm font-medium text-foreground">
                            {new Date(rent.startDate).toLocaleDateString('pt-BR')}
                          </Text>
                        </View>
                        {rent.expectedReturnDate && (
                          <View className="flex-row items-center gap-2">
                            <ClockIcon size={16} color="#9ca3af" />
                            <Text className="text-sm text-muted-foreground">Devolução:</Text>
                            <Text
                              className={`text-sm font-medium ${
                                overdue ? 'text-destructive' : 'text-foreground'
                              }`}
                            >
                              {new Date(rent.expectedReturnDate).toLocaleDateString('pt-BR')}
                            </Text>
                            {daysUntilReturn !== null && (
                              <Text
                                className={`text-xs ml-2 ${
                                  overdue
                                    ? 'text-destructive font-semibold'
                                    : daysUntilReturn <= 3
                                    ? 'text-yellow-500'
                                    : 'text-muted-foreground'
                                }`}
                              >
                                ({overdue ? `${Math.abs(daysUntilReturn)} dias atrasado` : `${daysUntilReturn} dias restantes`})
                              </Text>
                            )}
                          </View>
                        )}
                      </View>

                      {hasFine && rent.fineAmount && (
                        <View className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                          <View className="flex-row items-center gap-2">
                            <AlertTriangleIcon size={18} color="#ef4444" />
                            <Text className="text-sm font-semibold text-destructive">
                              Multa por atraso: R$ {parseFloat(rent.fineAmount).toFixed(2)}
                            </Text>
                          </View>
                          <Text className="text-xs text-destructive/80 mt-1">
                            {rent.daysOverdue} dia{rent.daysOverdue !== 1 ? 's' : ''} de atraso
                          </Text>
                        </View>
                      )}

                      <Button
                        onPress={() => handleReturn(rent.id, gameTitle)}
                        disabled={returnRentMutation.isPending}
                        variant={overdue ? 'destructive' : 'default'}
                        className="w-full mt-2"
                      >
                        {returnRentMutation.isPending ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <>
                            <CheckCircleIcon size={20} color="#fff" />
                            <Text className="ml-2 font-semibold">Devolver Jogo</Text>
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </>
  );
}

