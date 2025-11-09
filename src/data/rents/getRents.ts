import { db } from '../index';
import { rentsTable } from '../db/schema';

export async function getRents() {
  try {
    const rents = await db.select().from(rentsTable);
    return rents;
  } catch (error) {
    console.error('❌ Erro ao listar aluguéis:', error);
    throw error;
  }
}
