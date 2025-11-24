import { db } from "../../index.js";
import { rentsTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import z from "zod";

export const rentSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  gameId: z.number().int().positive(),
  rentalType: z.enum(["unitario", "assinatura"]),
  startDate: z.string(),
  endDate: z.string().nullable().optional(),
  expectedReturnDate: z.string().nullable().optional(),
  returned: z.boolean().nullable().optional(),
  returnedDate: z.string().nullable().optional(),
  fineAmount: z.string().nullable().optional(),
  daysOverdue: z.number().nullable().optional(),
});

export type RentType = z.infer<typeof rentSchema>;

export async function getRentsByUser(userId: number): Promise<RentType[]> {
  try {
    const rents = await db
      .select()
      .from(rentsTable)
      .where(eq(rentsTable.userId, userId));

    // Otimização: usar safeParse para evitar exceptions desnecessárias
    return rents.map((rent) => {
      const result = rentSchema.safeParse(rent);
      return result.success ? result.data : rent as RentType;
    });
  } catch (error) {
    throw error;
  }
}

