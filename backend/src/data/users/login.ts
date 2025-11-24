import { db } from "../../index.js";
import { usersTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import z from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginType = z.infer<typeof loginSchema>;

export interface LoginResponse {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'cliente';
  message: string;
}

export async function login(credentials: LoginType): Promise<LoginResponse | null> {
  try {
    const validated = loginSchema.parse(credentials);

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, validated.email))
      .limit(1);

    if (users.length === 0) {
      return null;
    }

    const user = users[0];

    if (user.password !== validated.password) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: (user.role as 'admin' | 'cliente') || 'cliente',
      message: 'Login realizado com sucesso',
    };
  } catch (error) {
    throw error;
  }
}

