import { db } from "../../index.js";
import { usersTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function getUserWallet(userId: number) {
  try {
    const user = await db
      .select({
        id: usersTable.id,
        wallet: usersTable.wallet,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (user.length === 0) {
      throw new Error("Usuário não encontrado");
    }

    return {
      userId: user[0].id,
      wallet: parseFloat(user[0].wallet?.toString() || "0.00"),
    };
  } catch (error) {
    throw error;
  }
}

