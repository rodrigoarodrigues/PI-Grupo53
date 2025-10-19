import { usersTable } from "../db/schema.js";
import { app, db } from "../index.js";

export async function createUser() {
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
}
