import { db } from "../../index.js";
import { usersTable } from "../../db/schema.js";
import { eq, sql } from "drizzle-orm";
import z from "zod";

export const depositMoneySchema = z.object({
  userId: z.number().int().positive("ID do usuário deve ser um número positivo"),
  amount: z.number().positive("Valor deve ser positivo"),
});

export type DepositMoneyType = z.infer<typeof depositMoneySchema>;

export async function depositMoney(data: DepositMoneyType) {
  try {
    const validated = depositMoneySchema.parse(data);

    // Buscar usuário atual
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, validated.userId))
      .limit(1);

    if (user.length === 0) {
      throw new Error("Usuário não encontrado");
    }

    const currentWallet = parseFloat(user[0].wallet?.toString() || "0.00");
    const newWallet = currentWallet + validated.amount;

    // Atualizar carteira
    const updated = await db
      .update(usersTable)
      .set({ wallet: newWallet.toFixed(2) })
      .where(eq(usersTable.id, validated.userId))
      .returning();

    return {
      userId: validated.userId,
      previousBalance: currentWallet,
      amount: validated.amount,
      newBalance: newWallet,
      user: updated[0],
    };
  } catch (error) {
    throw error;
  }
}

