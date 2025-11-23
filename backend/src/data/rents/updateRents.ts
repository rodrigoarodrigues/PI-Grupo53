import { db } from '../../index';
import { rentsTable } from '../../db/schema';
import { eq } from 'drizzle-orm';
import z from 'zod';

export const updateRentSchema = z.object({
  endDate: z.string().date("Deve ser uma data válida (YYYY-MM-DD)").optional(),
  returned: z.boolean().optional(),
}).refine(
  (data) => data.endDate !== undefined || data.returned !== undefined,
  { message: "Pelo menos um campo (endDate ou returned) deve ser fornecido" }
);

export type UpdateRentType = z.infer<typeof updateRentSchema>;

export async function updateRent(
  id: number,
  data: UpdateRentType
) {
  try {
    // Valida o ID
    const idSchema = z.number().int().positive("ID deve ser um número positivo");
    const validatedId = idSchema.parse(id);

    // Valida os dados de atualização
    const validatedData = updateRentSchema.parse(data);

    const updated = await db
      .update(rentsTable)
      .set(validatedData)
      .where(eq(rentsTable.id, validatedId))
      .returning();

    if (updated.length === 0) {
      console.warn(`⚠️  Aluguel com ID ${validatedId} não encontrado`);
      return null;
    }

    console.log('✅ Aluguel atualizado:', updated[0]);
    return updated[0];
  } catch (error) {
    console.error('❌ Erro ao atualizar aluguel:', error);
    throw error;
  }
}
