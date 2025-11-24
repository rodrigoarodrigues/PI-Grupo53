import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  date,
  decimal,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

export const rentalTypeEnum = pgEnum("rental_type", ["unitario", "assinatura"]);
export const userRoleEnum = pgEnum("user_role", ["admin", "cliente"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "failed", "refunded"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  birthDate: date("birth_date"),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }),
  cpf: varchar("cpf", { length: 14 }),
  phone: varchar("phone", { length: 20 }),
  role: userRoleEnum("role").default("cliente"),
  expirationDate: date("expiration_date"),
  subscriptionLimit: integer("subscription_limit").default(3),
  isActive: boolean("is_active").default(true),
  wallet: decimal("wallet", { precision: 10, scale: 2 }).default("0.00"),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email), // Para buscas de login
  isActiveIdx: index("is_active_idx").on(table.isActive), // Para filtrar usuários ativos
}));

export const gamesTable = pgTable("games", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull().unique(),
  quantity: integer("quantity").notNull(),
  uuid: varchar("uuid", { length: 36 }).notNull().unique(),
  imageUrl: varchar("image_url", { length: 500 }),
  description: varchar("description", { length: 2000 }),
  platform: varchar("platform", { length: 50 }),
  size: varchar("size", { length: 50 }),
  multiplayer: boolean("multiplayer").default(false),
  languages: varchar("languages", { length: 255 }),
  price: decimal("price", { precision: 10, scale: 2 }).default("0.00"),
});

export const rentsTable = pgTable("rents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  gameId: integer("game_id").references(() => gamesTable.id),
  rentalType: rentalTypeEnum("rental_type").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(), // NOT NULL no banco
  expectedReturnDate: date("expected_return_date"), // Data esperada de devolução
  returned: boolean("returned").default(false),
  returnedDate: date("returned_date"), // Data real de devolução
  fineAmount: decimal("fine_amount", { precision: 10, scale: 2 }).default("0"), // Valor da multa
  daysOverdue: integer("days_overdue").default(0), // Dias de atraso
}, (table) => ({
  userIdIdx: index("rents_user_id_idx").on(table.userId), // Para getRentsByUser
  gameIdIdx: index("rents_game_id_idx").on(table.gameId), // Para checkGameAvailability
  returnedIdx: index("rents_returned_idx").on(table.returned), // Para getActiveRents
  // Índice composto para queries comuns: gameId + returned
  gameIdReturnedIdx: index("rents_game_id_returned_idx").on(table.gameId, table.returned),
  // Índice composto para queries comuns: userId + returned + rentalType
  userReturnedTypeIdx: index("rents_user_returned_type_idx").on(table.userId, table.returned, table.rentalType),
}));

export const addressesTable = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  street: varchar("street", { length: 255 }).notNull(),
  number: varchar("number", { length: 20 }).notNull(),
  complement: varchar("complement", { length: 255 }),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  zipCode: varchar("zip_code", { length: 10 }).notNull(),
  isPrimary: boolean("is_primary").default(false),
}, (table) => ({
  userIdIdx: index("addresses_user_id_idx").on(table.userId), // Para JOINs em getUsers
  // Índice composto para buscar endereço primário
  userPrimaryIdx: index("addresses_user_primary_idx").on(table.userId, table.isPrimary),
}));

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  rentId: integer("rent_id").references(() => rentsTable.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: paymentStatusEnum("payment_status").notNull().default("pending"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  transactionId: varchar("transaction_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  paidAt: timestamp("paid_at"),
}, (table) => ({
  userIdIdx: index("payments_user_id_idx").on(table.userId),
  rentIdIdx: index("payments_rent_id_idx").on(table.rentId),
  statusIdx: index("payments_status_idx").on(table.status),
}));