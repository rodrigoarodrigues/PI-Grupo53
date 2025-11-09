import { app } from "..";
import { createRent } from "../data/rents/createRent";
import { deleteRent } from "../data/rents/deleteRent";
import { getRents } from "../data/rents/getRents";
import { updateRent } from "../data/rents/updateRents";

export function getRentsRoutes() {
  // ROTAS DE ALUGUÉIS
  app.get("/rents", async (c) => c.json(await getRents()));

  app.post("/rents", async (c) => {
    const body = await c.req.json();
    const created = await createRent(body);
    return c.json(created);
  });

  app.put("/rents/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    return c.json(await updateRent(id, body));
  });

  app.delete("/rents/:id", async (c) => {
    const id = Number(c.req.param("id"));
    await deleteRent(id);
    return c.json({ message: `Aluguel ${id} deletado.` });
  });
}
