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
  
  // Detectar se é mobile
  const isMobile = width < 768;
  
  // Configuração responsiva
  const padding = isMobile ? 16 : 32;
  const gap = isMobile ? 12 : 16;
  const columns = isMobile ? 2 : 4;
  
  // Calcular largura do card
  const availableWidth = width - padding * 2;
  const cardWidth = (availableWidth - gap * (columns - 1)) / columns;
  const maxCardWidth = isMobile ? 170 : 200;
  const finalCardWidth = Math.min(cardWidth, maxCardWidth);

  // Função para encontrar o rentId de um jogo
  const getRentIdForGame = (gameId: string | number): number | null => {
    const gameIdNum = typeof gameId === 'string' ? Number(gameId) : gameId;
    if (isNaN(gameIdNum) || gameIdNum <= 0) return null;
    const rent = activeRents.find(r => r.gameId === gameIdNum);
    return rent?.id || null;
  };

  return (
    <View style={{ 
      paddingHorizontal: padding, 
      marginTop: isMobile ? 8 : 16,
    }}>
      <View 
        style={{ 
          flexDirection: 'row', 
          flexWrap: 'wrap',
          justifyContent: isMobile ? 'center' : 'flex-start',
          marginHorizontal: -gap / 2, // Compensa o espaçamento lateral
        }}>
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
          <Text 
            className="text-gray-400"
            style={{ fontSize: isMobile ? 15 : 18 }}>
            Nenhum jogo encontrado
          </Text>
        </View>
      )}
    </View>
  );
}

