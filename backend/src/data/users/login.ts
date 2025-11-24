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
  wallet: number;
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

    // Tratar wallet que pode não existir ainda ou ser null
    let walletValue = 0.00;
    try {
      if (user.wallet !== null && user.wallet !== undefined) {
        const walletStr = user.wallet.toString();
        walletValue = parseFloat(walletStr) || 0.00;
      }
    } catch (error) {
      console.warn('Erro ao processar wallet no login:', error);
      walletValue = 0.00;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: (user.role as 'admin' | 'cliente') || 'cliente',
      wallet: walletValue,
      message: 'Login realizado com sucesso',
    };
  } catch (error) {
    throw error;
  }
}

