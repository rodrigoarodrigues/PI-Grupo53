import { db } from "../../index";
import { gamesTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import z from "zod";

export const createGameSchema = z.object({
  title: z.string().min(1).max(255),
  quantity: z.number().int().min(0),
  uuid: z.string().uuid(),
  imageUrl: z.string().url().optional().nullable(),
});

export type CreateGameType = z.infer<typeof createGameSchema>;

export async function createGame(game: CreateGameType) {
  try {
    const validated = createGameSchema.parse(game);

    // Evita duplicar títulos
    const existing = await db
      .select()
      .from(gamesTable)
      .where(eq(gamesTable.title, validated.title));

    if (existing.length > 0) {
      console.warn(`⚠️ O jogo "${validated.title}" já está cadastrado.`);
      return null;
    }

    const inserted = await db.insert(gamesTable).values(validated).returning();
    console.log(" Jogo criado:", inserted[0]);
    return inserted[0];
  } catch (error) {
    console.error("❌ Erro ao criar jogo:", error);
    throw error;
  }
}
