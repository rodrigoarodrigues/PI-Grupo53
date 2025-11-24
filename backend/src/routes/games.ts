import { app } from "../index.js";
import { createGame } from "../data/games/createGame.js";
import { getGames } from "../data/games/getGames.js";
import { updateGame } from "../data/games/updateGame.js";
import { deleteGame } from "../data/games/deleteGame.js";

export function getGamesRoutes() {
  app.get("/games", async (c) => c.json(await getGames()));

  app.post("/games", async (c) => {
    const body = await c.req.json();
    const created = await createGame(body);
    return created ? c.json(created) : c.json({ error: "Jogo já existe" }, 409);
  });

  app.put("/games/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    return c.json(await updateGame(id, body));
  });

  app.delete("/games/:id", async (c) => {
    try {
      const id = Number(c.req.param("id"));
      
      if (isNaN(id) || id <= 0) {
        c.status(400);
        return c.json({ error: "ID inválido" });
      }
      
      const result = await deleteGame(id);
      
      if (!result.success) {
        c.status(400);
        return c.json({ error: result.error });
      }
      
      return c.json({ message: result.message || `Jogo ${id} deletado com sucesso` });
    } catch (error) {
      c.status(500);
      return c.json({ error: "Erro interno ao deletar jogo" });
    }
  });
}