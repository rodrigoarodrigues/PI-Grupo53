import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import {
  createUser,
  type createUserType,
  createUserSchema,
} from "./data/users/createUser";
import { deleteUser } from "./data/users/deleteUser";
import { updateUser } from "./data/users/updateUsers";
import { getUsers } from "./data/users/getUsers";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);
export const app = new Hono();

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
    c.status(201);
    return c.json(response);
  } catch (error) {
    c.status(400);
    return c.json("Erro de validação de usuario");
  }
});

app.get("/about", (c) => c.text("About Page"));

//Imports DB games

import { createGame } from "./data/games/createGame";
import { getGames } from "./data/games/getGames";
import { updateGame } from "./data/games/updateGame";
import { deleteGame } from "./data/games/deleteGame";
import { getRentsRoutes } from "./routes/rents";

// ROTAS DE JOGOS
app.get("/games", async (c) => c.json(await getGames()));

app.post("/games", async (c) => {
  const body = await c.req.json();
  const created = await createGame(body);
  return created ? c.json(created) : c.json({ error: "Jogo já existe" }, 409);
});

app.put("/games/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  return c.json(await updateGame(id, body));
});

app.delete("/games/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await deleteGame(id);
  return c.json({ message: `Jogo ${id} deletado.` });
});

getRentsRoutes();

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`🚀 Server running on http://localhost:${info.port}`);
  },
);
