import { db } from "../../index.js";
import { usersTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import z from "zod";

export async function toggleUserStatus(id: number, isActive: boolean) {
  try {
    const idSchema = z.number().int().positive("ID deve ser um número positivo");
    const validatedId = idSchema.parse(id);

    const updated = await db
      .update(usersTable)
      .set({ isActive })
      .where(eq(usersTable.id, validatedId))
      .returning();

    if (updated.length === 0) {
      return null;
    }

    return updated[0];
  } catch (error) {
    throw error;
  }
}

