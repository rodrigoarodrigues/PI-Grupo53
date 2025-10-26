import { db } from '../index';
import { gamesTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function deleteGame(id: number) {
  try {
    await db.delete(gamesTable).where(eq(gamesTable.id, id));
    console.log(`Jogo ${id} deletado`);
  } catch (error) {
    console.error('❌ Erro ao deletar jogo:', error);
    throw error;
  }
}
