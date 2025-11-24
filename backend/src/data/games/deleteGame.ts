import { db } from '../../index.js';
import { gamesTable, rentsTable, paymentsTable } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import z from 'zod';

export const deleteGameSchema = z.number().int().positive("ID deve ser um número positivo");
export type DeleteGameType = z.infer<typeof deleteGameSchema>;

export async function deleteGame(id: DeleteGameType) {
  try {
    const validatedId = deleteGameSchema.parse(id);
    
    // Verificar se o jogo existe
    const game = await db
      .select()
      .from(gamesTable)
      .where(eq(gamesTable.id, validatedId))
      .limit(1);
    
    if (game.length === 0) {
      return { success: false, error: "Jogo não encontrado" };
    }
    
    // Buscar todos os aluguéis associados ao jogo
    const rents = await db
      .select()
      .from(rentsTable)
      .where(eq(rentsTable.gameId, validatedId));
    
    // Para cada aluguel, deletar os pagamentos associados
    if (rents.length > 0) {
      const rentIds = rents.map(rent => rent.id);
      
      // Deletar todos os pagamentos associados aos aluguéis deste jogo
      for (const rentId of rentIds) {
        await db.delete(paymentsTable).where(eq(paymentsTable.rentId, rentId));
      }
      
      // Deletar todos os aluguéis do jogo
      await db.delete(rentsTable).where(eq(rentsTable.gameId, validatedId));
    }
    
    // Deletar o jogo
    const result = await db
      .delete(gamesTable)
      .where(eq(gamesTable.id, validatedId))
      .returning();
    
    if (result.length === 0) {
      return { success: false, error: "Erro ao deletar jogo" };
    }
    
    return { 
      success: true, 
      message: `Jogo "${result[0].title}" deletado com sucesso. ${rents.length} aluguel(is) e seus pagamentos também foram removidos.` 
    };
  } catch (error: any) {
    // Tratar erros de validação Zod
    if (error instanceof z.ZodError) {
      return { success: false, error: "ID inválido" };
    }
    
    return { success: false, error: error?.message || "Erro ao deletar jogo" };
  }
}
