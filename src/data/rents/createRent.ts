import { db } from '../../index';
import { rentsTable } from '../../db/schema';
import z from 'zod';

export const createRentSchema = z.object({
  userId: z.number().int().positive("ID do usuário deve ser um número positivo"),
  gameId: z.number().int().positive("ID do jogo deve ser um número positivo"),
  rentalType: z.enum(["unitario", "assinatura"]),
  startDate: z.string().date("Deve ser uma data válida (YYYY-MM-DD)"),
  endDate: z.string().date("Deve ser uma data válida (YYYY-MM-DD)").nullable().optional(),
}).refine(
  (data) => !data.endDate || new Date(data.endDate) > new Date(data.startDate),
  { message: "Data de término deve ser posterior à data de início", path: ["endDate"] }
);

export type CreateRentType = z.infer<typeof createRentSchema>;

export async function createRent(rent: CreateRentType) {
  try {
    const validatedRent = createRentSchema.parse(rent);

    const rentData = {
      userId: validatedRent.userId,
      gameId: validatedRent.gameId,
      rentalType: validatedRent.rentalType,
      startDate: validatedRent.startDate,
      ...(validatedRent.endDate && { endDate: validatedRent.endDate }),
    };

    const inserted = await db.insert(rentsTable).values(rentData).returning();
    console.log("✅ Aluguel criado:", inserted[0]);
    return inserted[0];
  } catch (error) {
    console.error("❌ Erro ao criar aluguel:", error);
    throw error;
  }
}
