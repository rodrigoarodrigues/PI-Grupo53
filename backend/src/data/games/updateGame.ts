import { db } from '../../index';
import { gamesTable } from '../../db/schema';
import { eq } from "drizzle-orm";
import z from "zod";

export const updateGameSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  quantity: z.number().int().min(0).optional(),
  uuid: z.string().uuid().optional(),
  imageUrl: z.string().url().optional().nullable(),
}).refine((data) => Object.values(data).some((v) => v !== undefined), {
  message: "Pelo menos um campo deve ser fornecido",
});

export type UpdateGameType = z.infer<typeof updateGameSchema>;

export async function updateGame(
  id: number,
  data: UpdateGameType,
) {
  try {
    // valida id e dados
    const idSchema = z.number().int().positive("ID deve ser um número positivo");
    const validatedId = idSchema.parse(id);
    const validatedData = updateGameSchema.parse(data);

    const updated = await db
      .update(gamesTable)
      .set(validatedData)
      .where(eq(gamesTable.id, validatedId))
      .returning();
    console.log("Jogo atualizado:", updated[0]);
    return updated[0];
  } catch (error) {
    console.error("❌ Erro ao atualizar jogo:", error);
    throw error;
  }
}
