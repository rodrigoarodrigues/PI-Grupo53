import { app } from "../index.js";
import {
  createUser,
  type createUserType,
  createUserSchema,
} from "../data/users/createUser.js";
import { deleteUser } from "../data/users/deleteUser.js";
import { updateUser } from "../data/users/updateUsers.js";
import { getUsers } from "../data/users/getUsers.js";
import { login } from "../data/users/login.js";
import { toggleUserStatus } from "../data/users/toggleUserStatus.js";
import { depositMoney } from "../data/users/depositMoney.js";
import { getUserWallet } from "../data/users/getUserWallet.js";
import z from "zod";

export function getUsersRoutes() {
  app.post("/auth/login", async (c) => {
    try {
      const body = await c.req.json();
      const result = await login(body);

      if (!result) {
        c.status(401);
        return c.json({ error: "Email ou senha incorretos" });
      }

      return c.json(result);
    } catch (error: any) {
      console.error('Erro no login:', error);
      c.status(400);
      return c.json({
        error: "Erro ao fazer login",
        details: error instanceof z.ZodError ? error.issues : error?.message || "Formato inválido",
      });
    }
  });

  app.get("/users", async (c) => c.json(await getUsers()));

  app.put("/users/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    return c.json(await updateUser(id, body));
  });

  app.delete("/users/:id", async (c) => {
    try {
      const id = Number(c.req.param("id"));
      
      if (isNaN(id) || id <= 0) {
        c.status(400);
        return c.json({ error: "ID inválido" });
      }

      const result = await deleteUser(id);
      
      if (!result.success) {
        c.status(400);
        return c.json({ error: result.error });
      }

      return c.json({ message: result.message || `Usuário ${id} deletado com sucesso` });
    } catch (error) {
      c.status(500);
      return c.json({ error: "Erro interno ao deletar usuário" });
    }
  });

  app.patch("/users/:id/activate", async (c) => {
    try {
      const id = Number(c.req.param("id"));
      const result = await toggleUserStatus(id, true);
      
      if (!result) {
        c.status(404);
        return c.json({ error: "Usuário não encontrado" });
      }
      
      return c.json(result);
    } catch (error) {
      c.status(400);
      return c.json({ error: "Erro ao ativar usuário" });
    }
  });

  app.patch("/users/:id/deactivate", async (c) => {
    try {
      const id = Number(c.req.param("id"));
      const result = await toggleUserStatus(id, false);
      
      if (!result) {
        c.status(404);
        return c.json({ error: "Usuário não encontrado" });
      }
      
      return c.json(result);
    } catch (error) {
      c.status(400);
      return c.json({ error: "Erro ao inativar usuário" });
    }
  });

  app.post("/users", async (c) => {
    const body = await c.req.json();

    try {
      const user: createUserType = createUserSchema.parse(body);
      const response = await createUser(user);

      if (!response) {
        c.status(409);
        return c.json({ error: "Usuário já existe" });
      }

      c.status(201);
      return c.json(response);
    } catch (error) {
      c.status(400);
      return c.json({
        error: "Erro de validação",
        details: error instanceof z.ZodError ? error.issues : "Formato inválido",
      });
    }
  });

  app.post("/users/:id/deposit", async (c) => {
    try {
      const id = Number(c.req.param("id"));
      const body = await c.req.json();

      if (isNaN(id) || id <= 0) {
        c.status(400);
        return c.json({ error: "ID inválido" });
      }

      // Garantir que amount seja um número
      const amount = typeof body.amount === 'string' 
        ? parseFloat(body.amount) 
        : (typeof body.amount === 'number' ? body.amount : 0);

      if (isNaN(amount) || amount <= 0) {
        c.status(400);
        return c.json({ 
          error: "Valor inválido",
          details: "O valor deve ser um número positivo maior que zero"
        });
      }

      const result = await depositMoney({
        userId: id,
        amount: amount,
      });

      return c.json(result);
    } catch (error: any) {
      c.status(400);
      if (error instanceof z.ZodError) {
        return c.json({ 
          error: "Erro de validação",
          details: error.issues 
        });
      }
      return c.json({ error: error.message || "Erro ao depositar dinheiro" });
    }
  });

  app.get("/users/:id/wallet", async (c) => {
    try {
      const id = Number(c.req.param("id"));

      if (isNaN(id) || id <= 0) {
        c.status(400);
        return c.json({ error: "ID inválido" });
      }

      const result = await getUserWallet(id);
      return c.json(result);
    } catch (error: any) {
      c.status(400);
      return c.json({ error: error.message || "Erro ao buscar saldo" });
    }
  });
}