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

    // Buscar usuário para verificar se é admin
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, validatedRent.userId))
      .limit(1);

    if (user.length === 0) {
      throw new Error("Usuário não encontrado");
    }

    const isAdmin = user[0].role === 'admin';

    const game = await db
      .select()
      .from(gamesTable)
      .where(eq(gamesTable.id, validatedRent.gameId))
      .limit(1);

    if (game.length === 0) {
      throw new Error("Jogo não encontrado");
    }

    const gameData = game[0];
    const gamePrice = parseFloat(gameData.price?.toString() || "0.00");
    const basePrice = parseFloat((gameData as any).basePrice || "10.00");

    // Admin pode alugar sem verificar disponibilidade
    if (!isAdmin) {
      const availability = await checkGameAvailability(validatedRent.gameId);
      if (!availability.available) {
        throw new Error(`Jogo não disponível. Total: ${availability.totalQuantity}, Alugados: ${availability.totalQuantity - availability.availableQuantity}`);
      }
    }

    let subscriptionLimit = 3;
    let currentRentsCount = 0;
    
    // Admin pode alugar sem verificar limites de assinatura
    if (!isAdmin && validatedRent.rentalType === "assinatura") {
      subscriptionLimit = user[0].subscriptionLimit || 3;
      const canRent = await canRentMoreGames(validatedRent.userId, subscriptionLimit);
      currentRentsCount = canRent.currentRents;
      
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

    // ============================================
    // LÓGICA PROFISSIONAL DE CÁLCULO DE PREÇO
    // ============================================
    // Prioridade: Preço do jogo cadastrado > Lógica de planos
    // Admin sempre paga R$ 0,00 (acesso ilimitado)
    
    let price = 0;
    
    if (isAdmin) {
      // Admin: acesso gratuito e ilimitado
      price = 0;
    } else if (gamePrice > 0) {
      // ============================================
      // JOGO COM PREÇO CADASTRADO (COMPRA/ALUGUEL REAL)
      // ============================================
      
      if (validatedRent.rentalType === "assinatura") {
        // ASSINATURA: Respeitar os 3 jogos grátis da Assinatura Full
        if (subscriptionLimit === 3) {
          // Assinatura Full: 3 primeiros jogos são grátis
          if (currentRentsCount < 3) {
            // Ainda dentro dos 3 jogos grátis - não cobrar
            price = 0;
          } else {
            // Já usou os 3 jogos grátis - cobrar o preço do jogo
            price = gamePrice;
          }
        } else {
          // Outros limites ou sem assinatura: cobrar o preço do jogo
          price = gamePrice;
        }
      } else {
        // ALUGUEL UNITÁRIO (sem assinatura): sempre cobra o preço do jogo
        price = gamePrice;
      }
    } else {
      // ============================================
      // JOGO SEM PREÇO CADASTRADO (SISTEMA ANTIGO)
      // ============================================
      // Usar lógica de assinatura tradicional
      
      if (validatedRent.rentalType === "assinatura") {
        if (subscriptionLimit === 3 && currentRentsCount < 3) {
          // Assinatura Full: grátis até 3 jogos
          price = 0;
        } else if (subscriptionLimit === 3 && currentRentsCount >= 3) {
          // Assinatura Full: após 3 jogos, cobra valor cheio
          price = calculateRentalPrice({
            rentalType: "unitario",
            basePrice,
            days: 30,
          });
        } else {
          // Sem assinatura ou outros limites: preço calculado baseado em dias
          price = calculateRentalPrice({
            rentalType: "unitario",
            basePrice,
            days: 30,
          });
        }
      } else {
        // Aluguel unitário (sem assinatura): calcular baseado em dias
        price = calculateRentalPrice({
          rentalType: validatedRent.rentalType,
          basePrice,
          days: days!,
        });
      }
    }

    // Verificar saldo do usuário (exceto admin)
    if (!isAdmin && price > 0) {
      const currentWallet = parseFloat(user[0].wallet?.toString() || "0.00");
      if (currentWallet < price) {
        throw new Error(`Saldo insuficiente. Você tem R$ ${currentWallet.toFixed(2)} e precisa de R$ ${price.toFixed(2)}`);
      }
    }

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

    // Salvar saldo anterior para possível reversão
    const previousWallet = parseFloat(user[0].wallet?.toString() || "0.00");
    let newWallet = previousWallet;

    // Subtrair do saldo do usuário (exceto admin) ANTES de processar o pagamento
    // Isso garante que o saldo seja subtraído de forma atômica e confiável
    if (!isAdmin && price > 0) {
      newWallet = previousWallet - price;
      
      // Atualizar saldo no banco de dados de forma atômica
      const updatedUser = await db
        .update(usersTable)
        .set({ wallet: newWallet.toFixed(2) })
        .where(eq(usersTable.id, validatedRent.userId))
        .returning();
      
      // Verificar se a atualização foi bem-sucedida
      if (updatedUser.length === 0) {
        throw new Error("Erro ao atualizar saldo do usuário");
      }
      
      // Atualizar referência do usuário com novo saldo
      user[0] = updatedUser[0];
    }

    // Se o preço for 0 (jogo grátis), não criar pagamento no banco
    let payment: any;
    if (price === 0) {
      // Pagamento grátis - não precisa criar registro de pagamento
      payment = {
        id: 0,
        userId: validatedRent.userId,
        rentId: newRent.id,
        amount: "0.00",
        status: "paid",
        paymentMethod: validatedRent.paymentMethod || "credit_card",
        transactionId: "FREE_GAME",
        createdAt: new Date(),
        paidAt: new Date(),
        success: true,
        message: "Jogo grátis - sem pagamento necessário",
      };
    } else {
      // Admin sempre tem pagamento aprovado automaticamente
      payment = await processPaymentMock({
        userId: validatedRent.userId,
        rentId: newRent.id,
        amount: price,
        paymentMethod: validatedRent.paymentMethod,
      }, isAdmin || validatedRent.forcePaymentSuccess);

      if (!payment.success) {
        // Reverter subtração do saldo em caso de erro
        if (!isAdmin && price > 0) {
          await db
            .update(usersTable)
            .set({ wallet: previousWallet.toFixed(2) })
            .where(eq(usersTable.id, validatedRent.userId));
        }
        await db.delete(rentsTable).where(eq(rentsTable.id, newRent.id));
        throw new Error("Pagamento rejeitado. Aluguel não foi criado.");
      }
    }

    // Buscar saldo atualizado do usuário para retornar na resposta
    const finalUser = await db
      .select({ wallet: usersTable.wallet })
      .from(usersTable)
      .where(eq(usersTable.id, validatedRent.userId))
      .limit(1);

    const finalWallet = parseFloat(finalUser[0]?.wallet?.toString() || "0.00");

    return {
      rent: newRent,
      payment,
      price,
      expectedReturnDate,
      previousBalance: previousWallet,
      newBalance: finalWallet,
      amountDeducted: price > 0 && !isAdmin ? price : 0,
    };
  } catch (error) {
    throw error;
  }
}
