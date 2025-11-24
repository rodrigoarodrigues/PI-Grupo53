import { db } from '../../index.js';
import { rentsTable } from '../../db/schema.js';
import z from 'zod';

export const rentSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  gameId: z.number().int().positive(),
  rentalType: z.enum(["unitario", "assinatura"]),
  startDate: z.string(),
  endDate: z.string().nullable().optional(),
  returned: z.boolean().nullable().optional(),
});

export type RentType = z.infer<typeof rentSchema>;

export async function getRents(): Promise<RentType[]> {
  try {
    const rents = await db.select().from(rentsTable);
    
    // Otimização: usar safeParse para evitar exceptions desnecessárias
    const validatedRents = rents.map((rent) => {
      const result = rentSchema.safeParse(rent);
      return result.success ? result.data : rent as RentType;
    });
    
    return validatedRents;
  } catch (error) {
    throw error;
  }
}
