import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { getUsersRoutes } from "./routes/users.js";
import { getGamesRoutes } from "./routes/games.js";
import { getRentsRoutes } from "./routes/rents.js";
import { getAddressesRoutes } from "./routes/addresses.js";
import { cors } from "hono/cors";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Máximo de conexões no pool
  min: 5, // Mínimo de conexões mantidas
  idleTimeoutMillis: 30000, // Fecha conexões idle após 30s
  connectionTimeoutMillis: 2000, // Timeout para obter conexão do pool
});

export const db = drizzle(pool);
export const app = new Hono();

app.use("/*", cors());

getUsersRoutes();
getGamesRoutes();
getRentsRoutes();
getAddressesRoutes();

app.get("/about", (c) => c.text("About Page"));

const port = 3000;

serve({
  fetch: app.fetch,
  port: port,
});

// Mensagem de servidor iniciado
setTimeout(() => {
  console.log("\n🚀 Servidor iniciado com sucesso!");
  console.log(`📡 Servidor rodando em: http://localhost:${port}`);
  const env = process.env.NODE_ENV || 'development';
  console.log(`🌐 Ambiente: ${env}`);
  const dbStatus = process.env.DATABASE_URL ? 'Conectado' : 'Não configurado';
  console.log(`📊 Banco de dados: ${dbStatus}`);
  console.log("✨ Pronto para receber requisições!\n");
}, 100);
