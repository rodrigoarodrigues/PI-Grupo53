import { db } from '../../index';
import { rentsTable } from '../../db/schema';
import z from 'zod';

// Schema para validar um aluguel retornado do banco
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
    
    // Valida cada aluguel retornado
    const validatedRents = rents.map((rent) => rentSchema.parse(rent));
    
    console.log(`✅ ${validatedRents.length} aluguéis listados`);
    return validatedRents;
  } catch (error) {
    console.error('❌ Erro ao listar aluguéis:', error);
    throw error;
  }
}
