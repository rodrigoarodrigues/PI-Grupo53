import { app } from "../index.js";
import { createRent } from "../data/rents/createRent.js";
import { deleteRent } from "../data/rents/deleteRent.js";
import { getRents } from "../data/rents/getRents.js";
import { updateRent } from "../data/rents/updateRents.js";
import { getActiveRents } from "../data/rents/getActiveRents.js";
import { returnRent } from "../data/rents/returnRent.js";
export function getRentsRoutes() {
    app.get("/rents", async (c) => c.json(await getRents()));
    app.get("/rents/active", async (c) => {
        try {
            const activeRents = await getActiveRents();
            return c.json(activeRents);
        }
        catch (error) {
            return c.json({ error: error.message || "Erro ao buscar aluguéis ativos" }, 500);
        }
    });
    app.get("/rents/user/:userId", async (c) => {
        const userId = Number(c.req.param("userId"));
        if (isNaN(userId)) {
            return c.json({ error: "ID de usuário inválido" }, 400);
        }
        const { getRentsByUser } = await import("../data/rents/getRentsByUser.js");
        return c.json(await getRentsByUser(userId));
    });
    app.post("/rents", async (c) => {
        const body = await c.req.json();
        try {
            const created = await createRent(body);
            return c.json(created, 201);
        }
        catch (error) {
            return c.json({ error: error.message || "Erro ao criar aluguel" }, 400);
        }
    });
    app.put("/rents/:id", async (c) => {
        const id = Number(c.req.param("id"));
        const body = await c.req.json();
        try {
            return c.json(await updateRent(id, body));
        }
        catch (error) {
            return c.json({ error: error.message || "Erro ao atualizar aluguel" }, 400);
        }
    });
    app.delete("/rents/:id", async (c) => {
        const id = Number(c.req.param("id"));
        await deleteRent(id);
        return c.json({ message: `Aluguel ${id} deletado.` });
    });
    app.post("/rents/:id/return", async (c) => {
        const id = Number(c.req.param("id"));
        const body = await c.req.json();
        try {
            const returnedDate = body.returnedDate || new Date().toISOString().split("T")[0];
            return c.json(await returnRent(id, returnedDate));
        }
        catch (error) {
            return c.json({ error: error.message || "Erro ao devolver jogo" }, 400);
        }
    });
}
