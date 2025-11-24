import { db } from '../../index.js';
import { usersTable, rentsTable } from '../../db/schema.js';
import { eq, and, sql } from 'drizzle-orm';

export async function getAdminFreeGamesInfo(userId: number) {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (user.length === 0) {
    throw new Error("Usuário não encontrado");
  }

  const userData = user[0];
  
  if (userData.role !== 'admin') {
    return null;
  }

  // Admin tem acesso ilimitado, então sempre retorna valores que indicam acesso total
  const activeRentsResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(rentsTable)
    .where(
      and(
        eq(rentsTable.userId, userId),
        eq(rentsTable.returned, false)
      )
    );

  const redeemed = activeRentsResult[0]?.count || 0;

  // Admin tem limite infinito, mas retornamos um número alto para compatibilidade
  const limit = 999999;

  return {
    limit,
    redeemed,
    remaining: Math.max(0, limit - redeemed),
  };
}

