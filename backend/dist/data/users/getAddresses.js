import { db } from "../../index.js";
import { addressesTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import z from "zod";
export const addressSchema = z.object({
    id: z.number().int().positive(),
    userId: z.number().int().positive(),
    street: z.string(),
    number: z.string(),
    complement: z.string().nullable().optional(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    isPrimary: z.boolean().nullable().optional(),
});
export async function getAddresses(userId) {
    try {
        const addresses = await db
            .select()
            .from(addressesTable)
            .where(eq(addressesTable.userId, userId));
        return addresses.map((addr) => addressSchema.parse(addr));
    }
    catch (error) {
        throw error;
    }
}
