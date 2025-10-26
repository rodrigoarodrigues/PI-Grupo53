import { db } from '../index';
import { gamesTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function updateGame(
  id: number,
  data: Partial<{ title: string; quantity: number; uuid: string }>
) {
  try {
    const updated = await db.update(gamesTable).set(data).where(eq(gamesTable.id, id)).returning();
    console.log('Jogo atualizado:', updated[0]);
    return updated[0];
  } catch (error) {
    console.error('❌ Erro ao atualizar jogo:', error);
    throw error;
  }
}
