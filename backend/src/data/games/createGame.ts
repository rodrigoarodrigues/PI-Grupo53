import { db } from "../../index.js";
import { gamesTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import z from "zod";

export const createGameSchema = z.object({
  title: z.string().min(1).max(255),
  quantity: z.number().int().min(0),
  uuid: z.string().uuid(),
  imageUrl: z.string().url().optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  platform: z.string().max(50).optional().nullable(),
  size: z.string().max(50).optional().nullable(),
  multiplayer: z.boolean().optional().default(false),
  languages: z.string().max(255).optional().nullable(),
});

export type CreateGameType = z.infer<typeof createGameSchema>;

export async function createGame(game: CreateGameType) {
  try {
    const validated = createGameSchema.parse(game);

    const existing = await db
      .select()
      .from(gamesTable)
      .where(eq(gamesTable.title, validated.title));

    if (existing.length > 0) {
      return null;
    }

    const inserted = await db.insert(gamesTable).values(validated).returning();
    return inserted[0];
  } catch (error) {
    throw error;
  }
}
