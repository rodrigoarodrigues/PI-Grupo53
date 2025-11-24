import { db } from "../../index.js";
import { addressesTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import z from "zod";
import { createAddress } from "./createAddress.js";

export const updateAddressSchema = z.object({
  street: z.string().min(1, "Rua não pode estar vazia").optional(),
  number: z.string().min(1, "Número não pode estar vazio").optional(),
  city: z.string().min(1, "Cidade não pode estar vazia").optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  complement: z.string().nullable().optional(),
}).refine(
  (data) => Object.values(data).some(v => v !== undefined && v !== null),
  { message: "Pelo menos um campo deve ser fornecido" }
);

export type UpdateAddressType = z.infer<typeof updateAddressSchema>;

export async function updateAddress(
  userId: number,
  data: UpdateAddressType,
) {
  try {
    const idSchema = z.number().int().positive("ID de usuário deve ser um número positivo");
    const validatedUserId = idSchema.parse(userId);
    const validatedData = updateAddressSchema.parse(data);

    const addresses = await db
      .select()
      .from(addressesTable)
      .where(eq(addressesTable.userId, validatedUserId))
      .limit(1);

    if (addresses.length === 0) {
      if (!validatedData.street || !validatedData.number || !validatedData.city) {
        throw new Error("Para criar um novo endereço, rua, número e cidade são obrigatórios");
      }
      
      const newAddress = await createAddress({
        userId: validatedUserId,
        street: validatedData.street!,
        number: validatedData.number!,
        city: validatedData.city!,
        state: validatedData.state || 'SP',
        zipCode: validatedData.zipCode || '00000-000',
        isPrimary: true,
      });
      
      return newAddress;
    }

    const addressId = addresses[0].id;

    const addressData: any = { ...validatedData };
    if (addressData.zipCode) {
      addressData.zipCode = addressData.zipCode.replace(/\D/g, "");
    }
    if (addressData.state) {
      addressData.state = addressData.state.toUpperCase();
    }

    const updated = await db
      .update(addressesTable)
      .set(addressData)
      .where(eq(addressesTable.id, addressId))
      .returning();

    if (updated.length === 0) {
      return null;
    }

    return updated[0];
  } catch (error) {
    throw error;
  }
}

