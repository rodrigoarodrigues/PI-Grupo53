import { db } from '../index';
import { gamesTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function createGame(game: { title: string; quantity: number; uuid: string }) {
  try {
    // Evita duplicar títulos
    const existing = await db.select().from(gamesTable).where(eq(gamesTable.title, game.title));

    if (existing.length > 0) {
      console.warn(`⚠️ O jogo "${game.title}" já está cadastrado.`);
      return null;
    }

    const inserted = await db.insert(gamesTable).values(game).returning();
    console.log(' Jogo criado:', inserted[0]);
    return inserted[0];
  } catch (error) {
    console.error('❌ Erro ao criar jogo:', error);
    throw error;
  }
}
