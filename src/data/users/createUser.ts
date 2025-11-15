import { db } from "../../index";
import { usersTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import z from "zod";

export const createUserSchema = z.object({
  name: z.string().min(3, "Precisa ter no mínimo 3 caracteres"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD").optional(),
  email: z.string().email("Email inválido"),
  expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD").optional(),
});

export type createUserType = z.infer<typeof createUserSchema>;

export async function createUser(newUser: createUserType) {
  try {
    // Validação manual
    const validated = createUserSchema.parse(newUser);

    // 🔍 Verifica se o e-mail já existe
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, validated.email));

    if (existing.length > 0) {
      console.warn(
        `⚠️  Usuário com e-mail ${validated.email} já existe. Nenhum novo registro criado.`,
      );
      return null;
    }

    // 🧩 Cria novo usuário
    const userData: any = {
      name: validated.name,
      email: validated.email,
    };

    if (validated.birthDate) {
      userData.birthDate = validated.birthDate;
    }

    if (validated.expirationDate) {
      userData.expirationDate = validated.expirationDate;
    }

    const inserted = await db.insert(usersTable).values(userData).returning();
    console.log("✅ Usuário criado com sucesso!", inserted[0]);

    return inserted[0];
  } catch (error) {
    console.error("❌ Erro ao criar usuário:", error);
    throw error;
  }
}
