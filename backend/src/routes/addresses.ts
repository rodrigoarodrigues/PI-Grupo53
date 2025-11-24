import { app } from "../index.js";
import { createAddress } from "../data/users/createAddress.js";
import { getAddresses } from "../data/users/getAddresses.js";
import { updateAddress } from "../data/users/updateAddress.js";

export function getAddressesRoutes() {
  app.get("/addresses/:userId", async (c) => {
    const userId = Number(c.req.param("userId"));
    if (isNaN(userId)) {
      return c.json({ error: "ID de usuário inválido" }, 400);
    }
    return c.json(await getAddresses(userId));
  });

  app.post("/addresses", async (c) => {
    const body = await c.req.json();
    try {
      const created = await createAddress(body);
      return c.json(created, 201);
    } catch (error: any) {
      return c.json({ error: error.message || "Erro ao criar endereço" }, 400);
    }
  });

  app.put("/addresses/:userId", async (c) => {
    const userId = Number(c.req.param("userId"));
    if (isNaN(userId)) {
      return c.json({ error: "ID de usuário inválido" }, 400);
    }
    const body = await c.req.json();
    try {
      const updated = await updateAddress(userId, body);
      return c.json(updated);
    } catch (error: any) {
      return c.json({ error: error.message || "Erro ao atualizar endereço" }, 400);
    }
  });
}

