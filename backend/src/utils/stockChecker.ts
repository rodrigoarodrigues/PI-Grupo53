import { db } from "../index.js";
import { gamesTable, rentsTable } from "../db/schema.js";
import { eq, and, isNull, or, sql } from "drizzle-orm";

export async function checkGameAvailability(gameId: number): Promise<{
  available: boolean;
  availableQuantity: number;
  totalQuantity: number;
}> {
  const game = await db
    .select()
    .from(gamesTable)
    .where(eq(gamesTable.id, gameId))
    .limit(1);

  if (game.length === 0) {
    return {
      available: false,
      availableQuantity: 0,
      totalQuantity: 0,
    };
  }

  const totalQuantity = game[0].quantity;

  // Otimização: usar COUNT ao invés de SELECT * para melhor performance
  const activeRentsResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(rentsTable)
    .where(
      and(
        eq(rentsTable.gameId, gameId),
        eq(rentsTable.returned, false)
      )
    );

  const rentedQuantity = activeRentsResult[0]?.count || 0;
  const availableQuantity = totalQuantity - rentedQuantity;

  return {
    available: availableQuantity > 0,
    availableQuantity,
    totalQuantity,
  };
}

export async function canRentMoreGames(
  userId: number,
  subscriptionLimit: number = 3
): Promise<{
  canRent: boolean;
  currentRents: number;
  limit: number;
}> {
  // Otimização: usar COUNT ao invés de SELECT * para melhor performance
  const activeRentsResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(rentsTable)
    .where(
      and(
        eq(rentsTable.userId, userId),
        eq(rentsTable.returned, false),
        eq(rentsTable.rentalType, "assinatura")
      )
    );

  const currentRents = activeRentsResult[0]?.count || 0;

  return {
    canRent: currentRents < subscriptionLimit,
    currentRents,
    limit: subscriptionLimit,
  };
}

