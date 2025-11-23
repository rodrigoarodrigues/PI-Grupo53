import { db } from "../../index";
import { usersTable } from "../../db/schema";
import { eq } from "drizzle-orm";

export async function deleteUser(id: number) {
  try {
    await db.delete(usersTable).where(eq(usersTable.id, id));
    console.log(`Usuário ${id} removido.`);
  } catch (error) {
    console.error("❌ Erro ao deletar usuário:", error);
  }
}
