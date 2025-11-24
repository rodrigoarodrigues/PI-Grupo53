import { db } from "../../index.js";
import { usersTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import z from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(1, "Nome não pode estar vazio").optional(),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  role: z.enum(["admin", "cliente"]).optional(),
  birthDate: z.string().date("Deve ser uma data válida (YYYY-MM-DD)").optional(),
  expirationDate: z.string().date("Deve ser uma data válida (YYYY-MM-DD)").optional(),
}).refine(
  (data) => Object.values(data).some(v => v !== undefined),
  { message: "Pelo menos um campo deve ser fornecido" }
);

export type UpdateUserType = z.infer<typeof updateUserSchema>;

export async function updateUser(
  id: number,
  data: UpdateUserType,
) {
  try {
    const idSchema = z.number().int().positive("ID deve ser um número positivo");
    const validatedId = idSchema.parse(id);
    const validatedData = updateUserSchema.parse(data);

    const userData: any = { ...validatedData };
    if (userData.phone) {
      userData.phone = userData.phone.replace(/\D/g, '');
    }
    if (userData.cpf) {
      userData.cpf = userData.cpf.replace(/\D/g, '');
    }

    const updated = await db
      .update(usersTable)
      .set(userData)
      .where(eq(usersTable.id, validatedId))
      .returning();

    if (updated.length === 0) {
      return null;
    }

    return updated[0];
  } catch (error) {
    throw error;
  }
}
