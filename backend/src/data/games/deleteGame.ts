import { db } from '../../index';
import { gamesTable } from '../../db/schema';
import { eq } from 'drizzle-orm';
import z from 'zod';

export const deleteGameSchema = z.number().int().positive("ID deve ser um número positivo");
export type DeleteGameType = z.infer<typeof deleteGameSchema>;

export async function deleteGame(id: DeleteGameType) {
  try {
    const validatedId = deleteGameSchema.parse(id);

    await db.delete(gamesTable).where(eq(gamesTable.id, validatedId));
    console.log(`Jogo ${validatedId} deletado`);
  } catch (error) {
    console.error('❌ Erro ao deletar jogo:', error);
    throw error;
  }
}
