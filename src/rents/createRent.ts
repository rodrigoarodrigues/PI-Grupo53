import { db } from "../index";
import { rentsTable } from "../db/schema";

export async function createRent(rent: {
  userId: number;
  gameId: number;
  rentalType: "unitario" | "assinatura";
  startDate: string;
  endDate?: string;
}) {
  try {
    const rentData: any = {
      userId: rent.userId,
      gameId: rent.gameId,
      rentalType: rent.rentalType,
      startDate: rent.startDate,
    };

    if (rent.endDate) {
      rentData.endDate = rent.endDate;
    }

    const inserted = await db.insert(rentsTable).values(rentData).returning();
    console.log("Aluguel criado:", inserted[0]);
    return inserted[0];
  } catch (error) {
    console.error("❌ Erro ao criar aluguel:", error);
    throw error;
  }
}
