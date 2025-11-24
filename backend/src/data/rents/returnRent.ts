import { db } from "../../index.js";
import { rentsTable, gamesTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { calculateFine } from "../../utils/priceCalculator.js";

export async function returnRent(rentId: number, returnedDate?: string) {
  try {
    const rent = await db
      .select()
      .from(rentsTable)
      .where(eq(rentsTable.id, rentId))
      .limit(1);

    if (rent.length === 0) {
      throw new Error("Aluguel não encontrado");
    }

    const rentData = rent[0];

    if (rentData.returned) {
      throw new Error("Este jogo já foi devolvido");
    }

    const returnDate = returnedDate || new Date().toISOString().split("T")[0];
    const returnDateObj = new Date(returnDate);

    let daysOverdue = 0;
    let fineAmount = 0;

    if (rentData.expectedReturnDate) {
      const expectedReturn = new Date(rentData.expectedReturnDate);
      const diffTime = returnDateObj.getTime() - expectedReturn.getTime();
      daysOverdue = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    if (daysOverdue > 0 && rentData.gameId) {
      const game = await db
        .select()
        .from(gamesTable)
        .where(eq(gamesTable.id, rentData.gameId))
        .limit(1);

      if (game.length > 0) {
        const basePrice = parseFloat((game[0] as any).basePrice || "10.00");
        fineAmount = calculateFine(daysOverdue, basePrice);
      }
    }

    const updated = await db
      .update(rentsTable)
      .set({
        returned: true,
        returnedDate: returnDate,
        daysOverdue,
        fineAmount: fineAmount.toString(),
      })
      .where(eq(rentsTable.id, rentId))
      .returning();

    return {
      ...updated[0],
      daysOverdue,
      fineAmount,
      hasFine: daysOverdue > 0,
    };
  } catch (error) {
    throw error;
  }
}

