import { db } from "../../index.js";
import { usersTable, addressesTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function getUserById(userId: number) {
  const usersWithAddresses = await db
    .select({
      user: usersTable,
      address: addressesTable,
    })
    .from(usersTable)
    .leftJoin(
      addressesTable,
      eq(addressesTable.userId, usersTable.id)
    )
    .where(eq(usersTable.id, userId));

  if (usersWithAddresses.length === 0) {
    return null;
  }

  // Agrupar endereços, priorizando isPrimary
  let primaryAddress = null;
  
  for (const row of usersWithAddresses) {
    if (row.address) {
      if (row.address.isPrimary) {
        primaryAddress = row.address;
        break; // Priorizar endereço primário
      } else if (!primaryAddress) {
        primaryAddress = row.address; // Usar o primeiro disponível se não houver primário
      }
    }
  }

  return {
    ...usersWithAddresses[0].user,
    primaryAddress,
  };
}

