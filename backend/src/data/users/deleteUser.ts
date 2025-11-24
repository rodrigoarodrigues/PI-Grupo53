import { db } from "../../index.js";
import { usersTable, addressesTable, rentsTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function deleteUser(id: number) {
  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    
    if (user.length === 0) {
      return { success: false, error: "Usuário não encontrado" };
    }

    await db.delete(addressesTable).where(eq(addressesTable.userId, id));
    
    await db.delete(rentsTable).where(eq(rentsTable.userId, id));
    
    const result = await db.delete(usersTable).where(eq(usersTable.id, id)).returning();
    
    if (result.length === 0) {
      return { success: false, error: "Erro ao deletar usuário" };
    }

    return { success: true, message: `Usuário ${id} deletado com sucesso` };
  } catch (error: any) {
    if (error?.code === '23503' || error?.message?.includes('foreign key')) {
      return { success: false, error: "Não é possível deletar usuário com aluguéis ou endereços ativos" };
    }
    
    return { success: false, error: error?.message || "Erro ao deletar usuário" };
  }
}
