import { db } from "../../index.js";
import { usersTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import z from "zod";

export const createUserSchema = z.object({
  name: z.string().min(3, "Precisa ter no mínimo 3 caracteres"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD").optional(),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional(),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(["admin", "cliente"]).optional().default("cliente"),
  expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD").optional(),
});

export type createUserType = z.infer<typeof createUserSchema>;

export async function createUser(newUser: createUserType) {
  try {
    const validated = createUserSchema.parse(newUser);

    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, validated.email));

    if (existing.length > 0) {
      return null;
    }

    const userData: any = {
      name: validated.name,
      email: validated.email,
      role: validated.role || "cliente",
    };

    if (validated.password) {
      userData.password = validated.password;
    }

    if (validated.cpf) {
      userData.cpf = validated.cpf.replace(/\D/g, '');
    }

    if (validated.phone) {
      userData.phone = validated.phone.replace(/\D/g, '');
    }

    if (validated.birthDate) {
      userData.birthDate = validated.birthDate;
    }

    if (validated.expirationDate) {
      userData.expirationDate = validated.expirationDate;
    }

    const inserted = await db.insert(usersTable).values(userData).returning();

    return inserted[0];
  } catch (error) {
    throw error;
  }
}
