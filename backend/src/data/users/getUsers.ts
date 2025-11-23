import { db } from "../../index";
import { usersTable } from "../../db/schema";

export async function getUsers() {
  return await db.select().from(usersTable);
}
