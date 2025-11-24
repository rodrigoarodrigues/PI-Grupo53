import { db } from "../../index.js";
import { addressesTable, usersTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import z from "zod";

export const createAddressSchema = z.object({
  userId: z.number().int().positive("ID do usuário deve ser um número positivo"),
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().length(2, "Estado deve ter 2 caracteres (UF)"),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido (formato: 12345-678)"),
  isPrimary: z.boolean().optional().default(false),
});

export type CreateAddressType = z.infer<typeof createAddressSchema>;

export async function createAddress(address: CreateAddressType) {
  try {
    const validated = createAddressSchema.parse(address);

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, validated.userId))
      .limit(1);

    if (user.length === 0) {
      throw new Error("Usuário não encontrado");
    }

    if (validated.isPrimary) {
      await db
        .update(addressesTable)
        .set({ isPrimary: false })
        .where(eq(addressesTable.userId, validated.userId));
    }

    const cleanZipCode = validated.zipCode.replace(/\D/g, "");

    const addressData = {
      userId: validated.userId,
      street: validated.street,
      number: validated.number,
      complement: validated.complement || null,
      city: validated.city,
      state: validated.state.toUpperCase(),
      zipCode: cleanZipCode,
      isPrimary: validated.isPrimary,
    };

    const inserted = await db.insert(addressesTable).values(addressData).returning();

    return inserted[0];
  } catch (error) {
    throw error;
  }
}

