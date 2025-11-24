import { db } from '../../index.js';
import { rentsTable } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import z from 'zod';

export const deleteRentSchema = z.number().int().positive("ID deve ser um número positivo");

export type DeleteRentType = z.infer<typeof deleteRentSchema>;

export async function deleteRent(id: DeleteRentType) {
  try {
    const validatedId = deleteRentSchema.parse(id);

    const result = await db
      .delete(rentsTable)
      .where(eq(rentsTable.id, validatedId))
      .returning();

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    throw error;
  }
}
