import { db } from '../../index.js';
import { rentsTable } from '../../db/schema.js';
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
    const idSchema = z.number().int().positive("ID deve ser um número positivo");
    const validatedId = idSchema.parse(id);

    const validatedData = updateRentSchema.parse(data);

    const updated = await db
      .update(rentsTable)
      .set(validatedData)
      .where(eq(rentsTable.id, validatedId))
      .returning();

    if (updated.length === 0) {
      return null;
    }

    return updated[0];
  } catch (error) {
    throw error;
  }
}
