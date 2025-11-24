import { db } from "../index.js";
import { gamesTable, rentsTable } from "../db/schema.js";
import { eq, and, sql } from "drizzle-orm";
export async function checkGameAvailability(gameId) {
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
        .select({ count: sql `count(*)::int` })
        .from(rentsTable)
        .where(and(eq(rentsTable.gameId, gameId), eq(rentsTable.returned, false)));
    const rentedQuantity = activeRentsResult[0]?.count || 0;
    const availableQuantity = totalQuantity - rentedQuantity;
    return {
        available: availableQuantity > 0,
        availableQuantity,
        totalQuantity,
    };
}
export async function canRentMoreGames(userId, subscriptionLimit = 3) {
    // Otimização: usar COUNT ao invés de SELECT * para melhor performance
    const activeRentsResult = await db
        .select({ count: sql `count(*)::int` })
        .from(rentsTable)
        .where(and(eq(rentsTable.userId, userId), eq(rentsTable.returned, false), eq(rentsTable.rentalType, "assinatura")));
    const currentRents = activeRentsResult[0]?.count || 0;
    return {
        canRent: currentRents < subscriptionLimit,
        currentRents,
        limit: subscriptionLimit,
    };
}
