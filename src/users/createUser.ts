import { db } from "../index";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import z from "zod";

export const UserSchema = z.object({
  name: z.string("Nome inválido").min(3, "Precisa ter 3 no minimo caracteres"),
  birthDate: z.string("Data de nascimento inválida").optional(),
  email: z.string().email("Email inválido"),
  expirationDate: z.string("Data de expiração inválida").optional(),
});

export type newUser = z.infer<typeof UserSchema>;

export async function createUser(newUser: newUser) {
  try {
    // 🔍 Verifica se o e-mail já existe
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, newUser.email));

    if (existing.length > 0) {
      console.warn(
        `⚠️  Usuário com e-mail ${newUser.email} já existe. Nenhum novo registro criado.`,
      );
      return;
    }

    // 🧩 Cria novo usuário
    const inserted = await db.insert(usersTable).values(newUser).returning();
    console.log("✅ Usuário criado com sucesso!", inserted[0]);

    return inserted[0];
  } catch (error) {
    console.error("❌ Erro ao criar usuário:", error);
    throw error;
  }
}
