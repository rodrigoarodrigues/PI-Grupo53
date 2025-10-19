import { serve } from "@hono/node-server";
import { Hono } from "hono";

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { usersTable } from "./db/schema.js";
import { createUser } from "./users/createUser.js";

type User = {
  id: number;
  name: string;
  age: number;
  email: string;
};

export const db = drizzle(process.env.DATABASE_URL!);

export const app = new Hono();

app.get("/", async (c) => {
  const users = await db.select().from(usersTable);
  return c.json(users);
});

app.get("/about", (c) => {
  return c.text("About Page");
});

await createUser();
serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
