import { db } from "../../index";
import { usersTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import z from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(1, "Nome não pode estar vazio").optional(),
  email: z.string().email("Email inválido").optional(),
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

    const updated = await db
      .update(usersTable)
      .set(validatedData)
      .where(eq(usersTable.id, validatedId))
      .returning();

    if (updated.length === 0) {
      console.warn(`⚠️  Usuário com ID ${validatedId} não encontrado`);
      return null;
    }

    console.log("✅ Usuário atualizado:", updated[0]);
    return updated[0];
  } catch (error) {
    console.error("❌ Erro ao atualizar usuário:", error);
    throw error;
  }
}
