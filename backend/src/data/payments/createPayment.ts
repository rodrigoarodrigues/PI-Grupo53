import { db } from "../../index.js";
import { paymentsTable } from "../../db/schema.js";
import z from "zod";

export const createPaymentSchema = z.object({
  userId: z.number().int().positive("ID do usuário deve ser um número positivo"),
  rentId: z.number().int().positive("ID do aluguel deve ser um número positivo").optional(),
  amount: z.number().positive("Valor deve ser positivo"),
  paymentMethod: z.enum(["credit_card", "pix", "debit_card"]).optional(),
});

export type CreatePaymentType = z.infer<typeof createPaymentSchema>;

function generateTransactionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `MOCK_${timestamp}_${random}`;
}

export async function createPayment(payment: CreatePaymentType) {
  try {
    const validated = createPaymentSchema.parse(payment);

    const transactionId = generateTransactionId();

    const success = Math.random() > 0.1;
    const status = success ? "paid" : "failed";

    const paymentData = {
      userId: validated.userId,
      rentId: validated.rentId || null,
      amount: validated.amount.toString(),
      status: status as "pending" | "paid" | "failed" | "refunded",
      paymentMethod: validated.paymentMethod || "credit_card",
      transactionId,
      paidAt: success ? new Date() : null,
    };

    const inserted = await db.insert(paymentsTable).values(paymentData).returning();

    return {
      ...inserted[0],
      success,
      message: success
        ? "Pagamento aprovado com sucesso"
        : "Pagamento rejeitado (simulação para testes)",
    };
  } catch (error) {
    throw error;
  }
}

export async function processPaymentMock(
  payment: CreatePaymentType,
  forceSuccess: boolean = false
) {
  const validated = createPaymentSchema.parse(payment);
  const transactionId = generateTransactionId();

  const success = forceSuccess || Math.random() > 0.1;
  const status = success ? "paid" : "failed";

  const paymentData = {
    userId: validated.userId,
    rentId: validated.rentId || null,
    amount: validated.amount.toString(),
    status: status as "pending" | "paid" | "failed" | "refunded",
    paymentMethod: validated.paymentMethod || "credit_card",
    transactionId,
    paidAt: success ? new Date() : null,
  };

  const inserted = await db.insert(paymentsTable).values(paymentData).returning();

  return {
    ...inserted[0],
    success,
    message: success
      ? "Pagamento aprovado com sucesso"
      : "Pagamento rejeitado (simulação para testes)",
  };
}

