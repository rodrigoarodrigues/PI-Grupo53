import { db } from '../index';
import { rentsTable } from '../db/schema';

export async function createRent(rent: {
  userId: number;
  gameId: number;
  rentalType: string; // 'unitario' ou 'assinatura'
  startDate: string;
  endDate?: string;
}) {
  try {
    const inserted = await db.insert(rentsTable).values(rent).returning();
    console.log('Aluguel criado:', inserted[0]);
    return inserted[0];
  } catch (error) {
    console.error('❌ Erro ao criar aluguel:', error);
    throw error;
  }
}
