import { db } from "../index";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";

export async function updateUser(
  id: number,
  data: {
    name?: string;
    email?: string;
    birthDate?: string;
    expirationDate?: string;
  },
) {
  try {
    const updated = await db
      .update(usersTable)
      .set(data)
      .where(eq(usersTable.id, id))
      .returning();
    console.log("Usuário atualizado:", updated[0]);
    return updated[0];
  } catch (error) {
    console.error("❌ Erro ao atualizar usuário:", error);
    throw error;
  }
}
