import { db } from '../../index';
import { gamesTable } from '../../db/schema';
import z from 'zod';

export const gameSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(255),
  quantity: z.number().int().min(0),
  uuid: z.string().min(1), // Aceita qualquer string não-vazia
  imageUrl: z.string().url().optional().nullable(),
});

export type GameType = z.infer<typeof gameSchema>;

export async function getGames(): Promise<GameType[]> {
  try {
    const games = await db.select().from(gamesTable);
    
    // Valida com tratamento de erro individual
    const validated = games.map((game) => {
      try {
        return gameSchema.parse(game);
      } catch (error) {
        console.warn(`⚠️ Jogo com UUID inválido (ID: ${game.id}):`, game.uuid);
        // Retorna o jogo mesmo com UUID inválido
        return game as GameType;
      }
    });
    
    console.log(`✅ ${validated.length} jogos listados`);
    return validated;
  } catch (error) {
    console.error('❌ Erro ao listar jogos:', error);
    throw error;
  }
}
