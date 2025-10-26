import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import { usersTable } from './db/schema';
import { createUser, newUser, UserSchema } from './users/createUser';
import { deleteUser } from './users/deleteUser';
import { updateUser } from './users/updateUsers';
import { getUsers } from './users/getUsers';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);
export const app = new Hono();

app.get('/users', async (c) => c.json(await getUsers()));


app.put('/users/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  return c.json(await updateUser(id, body));
});

app.delete('/users/:id', async (c) => {
  const id = Number(c.req.param('id'));
  await deleteUser(id);
  return c.json({ message: `Usuário ${id} deletado.` });
});

app.post('/create/user', async (c) => {
  const body = await c.req.json();

  try {
    const user: newUser = UserSchema.parse(body);
    const response = await createUser(user);
    c.status(201);
    return c.json(response);
  } catch (error) {
    c.status(400);
    return c.json("Erro de validação de usuario");
    
  }

})

app.get('/about', (c) => c.text('About Page'));


//Imports DB games

import { createGame } from './games/createGame';
import { getGames } from './games/getGames';
import { updateGame } from './games/updateGame';
import { deleteGame } from './games/deleteGame';

// ROTAS DE JOGOS
app.get('/games', async (c) => c.json(await getGames()));

app.post('/games', async (c) => {
  const body = await c.req.json();
  const created = await createGame(body);
  return created ? c.json(created) : c.json({ error: 'Jogo já existe' }, 409);
});

app.put('/games/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  return c.json(await updateGame(id, body));
});

app.delete('/games/:id', async (c) => {
  const id = Number(c.req.param('id'));
  await deleteGame(id);
  return c.json({ message: `Jogo ${id} deletado.` });
});

//imports DB Alugueis
import { createRent } from './rents/createRent';
import { getRents } from './rents/getRents';
import { updateRent } from './rents/updateRents';
import { deleteRent } from './rents/deleteRent';

// ROTAS DE ALUGUÉIS
app.get('/rents', async (c) => c.json(await getRents()));

app.post('/rents', async (c) => {
  const body = await c.req.json();
  const created = await createRent(body);
  return c.json(created);
});

app.put('/rents/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  return c.json(await updateRent(id, body));
});

app.delete('/rents/:id', async (c) => {
  const id = Number(c.req.param('id'));
  await deleteRent(id);
  return c.json({ message: `Aluguel ${id} deletado.` });
});


serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`🚀 Server running on http://localhost:${info.port}`);
  }
);
