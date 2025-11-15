import { db } from '../../index';
import { gamesTable } from '../../db/schema';
import z from 'zod';

export const gameSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(255),
  quantity: z.number().int().min(0),
  uuid: z.string().uuid(),
  imageUrl: z.string().url().optional().nullable(),
});

export type GameType = z.infer<typeof gameSchema>;

export async function getGames(): Promise<GameType[]> {
  try {
    const games = await db.select().from(gamesTable);
    const validated = games.map((g) => gameSchema.parse(g));
    return validated;
  } catch (error) {
    console.error('❌ Erro ao listar jogos:', error);
    throw error;
  }
}
