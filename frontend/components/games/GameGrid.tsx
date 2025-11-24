import { View, ScrollView, useWindowDimensions } from 'react-native';
import { GameCard } from './GameCard';
import { LibraryGameCard } from './LibraryGameCard';
import { GetGameProps } from '@/data/games/getGames';
import { Text } from '@/components/ui/text';
import { ActiveRentProps } from '@/data/rents/getActiveRents';

interface GameGridProps {
  games: GetGameProps[];
  isLibrary?: boolean;
  activeRents?: ActiveRentProps[];
  onRentReturned?: () => void;
  showDeleteButton?: boolean;
  onGameDeleted?: () => void;
}

export function GameGrid({ games, isLibrary = false, activeRents = [], onRentReturned, showDeleteButton = false, onGameDeleted }: GameGridProps) {
  const { width } = useWindowDimensions();
  const padding = 32; // px-8 = 32px
  const gap = 16; // Reduzido para 16px
  const cardWidth = (width - padding * 2 - gap * 3) / 4; // 4 colunas com gaps
  const maxCardWidth = 200; // Limite máximo reduzido para 200px
  const finalCardWidth = Math.min(cardWidth, maxCardWidth);

  // Função para encontrar o rentId de um jogo
  const getRentIdForGame = (gameId: string | number): number | null => {
    const gameIdNum = typeof gameId === 'string' ? Number(gameId) : gameId;
    if (isNaN(gameIdNum) || gameIdNum <= 0) return null;
    const rent = activeRents.find(r => r.gameId === gameIdNum);
    return rent?.id || null;
  };

  return (
    <View className="px-8 mt-4">
      <View className="flex-row flex-wrap" style={{ marginHorizontal: -gap / 2 }}>
        {games.map((game) => {
          const rentId = isLibrary ? getRentIdForGame(game.id) : null;
          
          return (
            <View 
              key={game.uuid} 
              style={{ 
                width: finalCardWidth,
                marginHorizontal: gap / 2,
                marginBottom: gap,
              }}>
              {isLibrary && rentId ? (
                <LibraryGameCard game={game} rentId={rentId} onReturned={onRentReturned} />
              ) : (
                <GameCard 
                  game={game} 
                  showDeleteButton={showDeleteButton}
                  onDeleted={onGameDeleted}
                />
              )}
            </View>
          );
        })}
      </View>

      {games.length === 0 && (
        <View className="items-center justify-center py-12">
          <Text className="text-gray-400 text-lg">Nenhum jogo encontrado</Text>
        </View>
      )}
    </View>
  );
}

