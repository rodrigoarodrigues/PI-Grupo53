import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { getUsersRoutes } from "./routes/users";
import { getGamesRoutes } from "./routes/games";
import { getRentsRoutes } from "./routes/rents";
import { cors } from "hono/cors";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);
export const app = new Hono();

app.use("/*", cors());

// Registrar rotas
getUsersRoutes();
getGamesRoutes();
getRentsRoutes();

// Rota geral
app.get("/about", (c) => c.text("About Page"));

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`🚀 Server running on http://localhost:${info.port}`);
  },
);
