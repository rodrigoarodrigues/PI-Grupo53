import { db } from '../../index.js';
import { gamesTable } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import z from 'zod';
export const deleteGameSchema = z.number().int().positive("ID deve ser um número positivo");
export async function deleteGame(id) {
    try {
        const validatedId = deleteGameSchema.parse(id);
        await db.delete(gamesTable).where(eq(gamesTable.id, validatedId));
    }
    catch (error) {
        throw error;
    }
}
