import { db } from '../../index.js';
import { rentsTable, gamesTable, usersTable } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import z from 'zod';
import { checkGameAvailability, canRentMoreGames } from '../../utils/stockChecker.js';
import { calculateRentalPrice } from '../../utils/priceCalculator.js';
import { processPaymentMock } from '../payments/createPayment.js';

export const createRentSchema = z.object({
  userId: z.number().int().positive("ID do usuário deve ser um número positivo"),
  gameId: z.number().int().positive("ID do jogo deve ser um número positivo"),
  rentalType: z.enum(["unitario", "assinatura"]),
  startDate: z.string().date("Deve ser uma data válida (YYYY-MM-DD)"),
  days: z.number().int().positive("Dias deve ser um número positivo").optional(),
  paymentMethod: z.enum(["credit_card", "pix", "debit_card"]).optional(),
  forcePaymentSuccess: z.boolean().optional().default(false),
}).refine((data) => {
  if (data.rentalType === "unitario" && !data.days) {
    return false;
  }
  return true;
}, { message: "Para aluguel unitário, é necessário informar o número de dias", path: ["days"] });

function calculateExpectedReturnDate(startDate: string, rentalType: "unitario" | "assinatura", days?: number): string {
  const start = new Date(startDate);
  if (rentalType === "unitario" && days) {
    const returnDate = new Date(start);
    returnDate.setDate(returnDate.getDate() + days);
    return returnDate.toISOString().split('T')[0];
  } else if (rentalType === "assinatura") {
    const returnDate = new Date(start);
    returnDate.setDate(returnDate.getDate() + 30);
    return returnDate.toISOString().split('T')[0];
  }
  throw new Error("Tipo de aluguel inválido ou dias não informados");
}

export type CreateRentType = z.infer<typeof createRentSchema>;

export async function createRent(rent: CreateRentType) {
  try {
    const validatedRent = createRentSchema.parse(rent);

    const game = await db
      .select()
      .from(gamesTable)
      .where(eq(gamesTable.id, validatedRent.gameId))
      .limit(1);

    if (game.length === 0) {
      throw new Error("Jogo não encontrado");
    }

    const gameData = game[0];
    const basePrice = parseFloat((gameData as any).basePrice || "10.00");

    const availability = await checkGameAvailability(validatedRent.gameId);
    if (!availability.available) {
      throw new Error(`Jogo não disponível. Total: ${availability.totalQuantity}, Alugados: ${availability.totalQuantity - availability.availableQuantity}`);
    }

    if (validatedRent.rentalType === "assinatura") {
      const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, validatedRent.userId))
        .limit(1);

      if (user.length === 0) {
        throw new Error("Usuário não encontrado");
      }

      const subscriptionLimit = user[0].subscriptionLimit || 3;
      const canRent = await canRentMoreGames(validatedRent.userId, subscriptionLimit);
      
      if (!canRent.canRent) {
        throw new Error(`Limite de jogos simultâneos atingido. Você tem ${canRent.currentRents} jogos alugados (limite: ${canRent.limit})`);
      }

      if (user[0].expirationDate) {
        const expirationDate = new Date(user[0].expirationDate);
        const today = new Date();
        if (expirationDate < today) {
          throw new Error("Assinatura expirada. Renove sua assinatura para continuar alugando.");
        }
      }
    }

    const days = validatedRent.days || (validatedRent.rentalType === "assinatura" ? 30 : undefined);
    if (!days && validatedRent.rentalType === "unitario") {
      throw new Error("Dias não informados para aluguel unitário");
    }

    const price = calculateRentalPrice({
      rentalType: validatedRent.rentalType,
      basePrice,
      days: days!,
    });

    const expectedReturnDate = calculateExpectedReturnDate(validatedRent.startDate, validatedRent.rentalType, days);
    
    const endDate = expectedReturnDate;

    const rentData = {
      userId: validatedRent.userId,
      gameId: validatedRent.gameId,
      rentalType: validatedRent.rentalType,
      startDate: validatedRent.startDate,
      endDate: endDate,
      expectedReturnDate: expectedReturnDate,
      returned: false,
    };

    const inserted = await db.insert(rentsTable).values(rentData).returning();
    const newRent = inserted[0];

    const payment = await processPaymentMock({
      userId: validatedRent.userId,
      rentId: newRent.id,
      amount: price,
      paymentMethod: validatedRent.paymentMethod,
    }, validatedRent.forcePaymentSuccess);

    if (!payment.success) {
      await db.delete(rentsTable).where(eq(rentsTable.id, newRent.id));
      throw new Error("Pagamento rejeitado. Aluguel não foi criado.");
    }

    return {
      rent: newRent,
      payment,
      price,
      expectedReturnDate,
    };
  } catch (error) {
    throw error;
  }
}
