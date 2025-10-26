import { db } from '../index';
import { rentsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function deleteRent(id: number) {
  try {
    await db.delete(rentsTable).where(eq(rentsTable.id, id));
    console.log(`Aluguel ${id} deletado`);
  } catch (error) {
    console.error('❌ Erro ao deletar aluguel:', error);
    throw error;
  }
}
