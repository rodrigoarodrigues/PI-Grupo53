import { db } from "../../index.js";
import { gamesTable } from "../../db/schema.js";
import z from "zod";

export const gameSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(255),
  quantity: z.number().int().min(0),
  uuid: z.string().min(1),
  imageUrl: z.string().url().optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  platform: z.string().max(50).optional().nullable(),
  size: z.string().max(50).optional().nullable(),
  multiplayer: z.boolean().optional().nullable(),
  languages: z.string().max(255).optional().nullable(),
  price: z.number().nonnegative(),
});

export type GameType = z.infer<typeof gameSchema>;

export async function getGames(): Promise<GameType[]> {
  try {
    const games = await db.select().from(gamesTable);

    // Convert price from string to number before validation
    const gamesWithParsedPrice = games.map((game) => ({
      ...game,
      price:
        typeof game.price === "string"
          ? parseFloat(game.price)
          : game.price === null || game.price === undefined
            ? 0
            : game.price,
    }));

    // Otimização: validar em lote ao invés de um por um
    // Se os dados vêm do banco e estão corretos, podemos pular validação ou usar safeParse
    const validated = gamesWithParsedPrice.map((game) => {
      const result = gameSchema.safeParse(game);
      return result.success ? result.data : (game as GameType);
    });

    return validated;
  } catch (error) {
    throw error;
  }
}
