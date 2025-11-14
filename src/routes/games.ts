import { app } from "../index";
import { createGame } from "../data/games/createGame";
import { getGames } from "../data/games/getGames";
import { updateGame } from "../data/games/updateGame";
import { deleteGame } from "../data/games/deleteGame";

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
    const id = Number(c.req.param("id"));
    await deleteGame(id);
    return c.json({ message: `Jogo ${id} deletado.` });
  });
}