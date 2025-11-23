import { db } from '../../index';
import { rentsTable } from '../../db/schema';
import { eq } from 'drizzle-orm';
import z from 'zod';

export const deleteRentSchema = z.number().int().positive("ID deve ser um número positivo");

export type DeleteRentType = z.infer<typeof deleteRentSchema>;

export async function deleteRent(id: DeleteRentType) {
  try {
    // Valida o ID
    const validatedId = deleteRentSchema.parse(id);

    const result = await db
      .delete(rentsTable)
      .where(eq(rentsTable.id, validatedId))
      .returning();

    if (result.length === 0) {
      console.warn(`⚠️  Aluguel com ID ${validatedId} não encontrado`);
      return null;
    }

    console.log(`✅ Aluguel ${validatedId} deletado`);
    return result[0];
  } catch (error) {
    console.error('❌ Erro ao deletar aluguel:', error);
    throw error;
  }
}
