import { app } from "../index";
import {
  createUser,
  type createUserType,
  createUserSchema,
} from "../data/users/createUser";
import { deleteUser } from "../data/users/deleteUser";
import { updateUser } from "../data/users/updateUsers";
import { getUsers } from "../data/users/getUsers";
import z from "zod";

export function getUsersRoutes() {
  app.get("/users", async (c) => c.json(await getUsers()));

  app.put("/users/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    return c.json(await updateUser(id, body));
  });

  app.delete("/users/:id", async (c) => {
    const id = Number(c.req.param("id"));
    await deleteUser(id);
    return c.json({ message: `Usuário ${id} deletado.` });
  });

  app.post("/create/user", async (c) => {
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
      console.error("Erro na validação:", error);
      c.status(400);
      return c.json({
        error: "Erro de validação",
        details: error instanceof z.ZodError ? error.issues : "Formato inválido",
      });
    }
  });
}