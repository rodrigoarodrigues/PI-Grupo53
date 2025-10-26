import { db } from '../index';
import { rentsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function updateRent(
  id: number,
  data: Partial<{
    endDate: string;
    returned: boolean;
  }>
) {
  try {
    const updated = await db.update(rentsTable).set(data).where(eq(rentsTable.id, id)).returning();
    console.log('Aluguel atualizado:', updated[0]);
    return updated[0];
  } catch (error) {
    console.error('❌ Erro ao atualizar aluguel:', error);
    throw error;
  }
}
