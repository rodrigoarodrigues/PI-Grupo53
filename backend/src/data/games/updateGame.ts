import { db } from "../../index.js";
import { gamesTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import z from "zod";

export const updateGameSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    quantity: z.number().int().min(0).optional(),
    uuid: z.string().uuid().optional(),
    imageUrl: z.string().url().optional().nullable(),
    description: z.string().max(2000).optional().nullable(),
    platform: z.string().max(50).optional().nullable(),
    size: z.string().max(50).optional().nullable(),
    multiplayer: z.boolean().optional().nullable(),
    languages: z.string().max(255).optional().nullable(),
    price: z.number().nonnegative().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "Pelo menos um campo deve ser fornecido",
  });

export type UpdateGameType = z.infer<typeof updateGameSchema>;

export async function updateGame(id: number, data: UpdateGameType) {
  try {
    const idSchema = z
      .number()
      .int()
      .positive("ID deve ser um número positivo");
    const validatedId = idSchema.parse(id);
    const validatedData = updateGameSchema.parse(data);

    // Convert price to string for DB if present, and omit undefined fields
    const dbData = Object.fromEntries(
      Object.entries(validatedData).flatMap(([key, value]) => {
        if (key === "price" && value !== undefined) {
          return [["price", String(value)]];
        }
        if (value !== undefined) {
          return [[key, value]];
        }
        return [];
      }),
    );

    const updated = await db
      .update(gamesTable)
      .set(dbData)
      .where(eq(gamesTable.id, validatedId))
      .returning();
    if (updated[0]) {
      return {
        ...updated[0],
        price:
          typeof updated[0].price === "string"
            ? parseFloat(updated[0].price)
            : updated[0].price === null || updated[0].price === undefined
              ? 0
              : updated[0].price,
      };
    }
    return updated[0];
  } catch (error) {
    throw error;
  }
}
