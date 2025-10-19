import { serve } from "@hono/node-server";
import { Hono } from "hono";

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { usersTable } from "./db/schema.js";

type User = {
  id: number;
  name: string;
  age: number;
  email: string;
};

const db = drizzle(process.env.DATABASE_URL!);

const app = new Hono();

app.get("/", async (c) => {
  const users = await db.select().from(usersTable);
  return c.json(users);
});

app.get("/about", (c) => {
  return c.text("About Page");
});

app.post("/create", async (c) => {
  const json = await c.req.json();
  if (!json.name || !json.age || !json.email) {
    return c.json({ error: "Missing fields" }, 400);
  }
  const response = await db.insert(usersTable).values({
    name: json.name,
    age: json.age,
    email: json.email,
  });
  return c.json({ success: true, user: response });
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
