import { db } from '../index';
import { gamesTable } from '../db/schema';

export async function getGames() {
  try {
    const games = await db.select().from(gamesTable);
    return games;
  } catch (error) {
    console.error('❌ Erro ao listar jogos:', error);
    throw error;
  }
}
