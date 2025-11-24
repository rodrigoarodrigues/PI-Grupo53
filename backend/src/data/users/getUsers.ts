import { db } from "../../index.js";
import { usersTable, addressesTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function getUsers() {
  // Otimização: usar uma única query com LEFT JOIN ao invés de N+1 queries
  const usersWithAddresses = await db
    .select({
      user: usersTable,
      address: addressesTable,
    })
    .from(usersTable)
    .leftJoin(
      addressesTable,
      eq(addressesTable.userId, usersTable.id)
    );

  // Agrupar endereços por usuário, priorizando isPrimary
  const userMap = new Map();
  
  for (const row of usersWithAddresses) {
    const userId = row.user.id;
    
    if (!userMap.has(userId)) {
      userMap.set(userId, {
        ...row.user,
        primaryAddress: null,
      });
    }
    
    // Priorizar endereço primário, senão usar o primeiro disponível
    const currentUser = userMap.get(userId);
    if (row.address) {
      if (row.address.isPrimary) {
        // Sempre priorizar endereço primário
        currentUser.primaryAddress = row.address;
      } else if (!currentUser.primaryAddress) {
        // Se não tem endereço ainda, usar este (mesmo que não seja primário)
        currentUser.primaryAddress = row.address;
      }
    }
  }
  
  return Array.from(userMap.values());
}
