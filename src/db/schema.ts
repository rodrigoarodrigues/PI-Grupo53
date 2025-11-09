import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";

export const rentalTypeEnum = pgEnum("rental_type", ["unitario", "assinatura"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  birthDate: date("birth_date"),
  email: varchar("email", { length: 255 }).notNull(),
  expirationDate: date("expiration_date"),
});

export const gamesTable = pgTable("games", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull().unique(),
  quantity: integer("quantity").notNull(),
  uuid: varchar("uuid", { length: 36 }).notNull().unique(),
  imageUrl: varchar("image_url", { length: 500 }),
});

export const rentsTable = pgTable("rents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  gameId: integer("game_id").references(() => gamesTable.id),
  rentalType: rentalTypeEnum("rental_type").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  returned: boolean("returned").default(false),
});
