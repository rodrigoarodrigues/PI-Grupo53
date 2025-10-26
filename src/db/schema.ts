import { pgTable, serial, varchar, integer, boolean, date } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  age: integer('age'),
  email: varchar('email', { length: 255 }).notNull(),
});

export const gamesTable = pgTable('games', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull().unique(),
  quantity: integer('quantity').notNull(),
  uuid: varchar('uuid', { length: 36 }).notNull().unique(),
});

export const rentsTable = pgTable("rents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  gameId: integer("game_id").references(() => gamesTable.id),
  rentalType: varchar("rental_type", { length: 50 }).notNull(), // "unitario" | "assinatura"
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  returned: boolean("returned").default(false),
});