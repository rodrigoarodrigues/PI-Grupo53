CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."rental_type" AS ENUM('unitario', 'assinatura');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'cliente');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"street" varchar(255) NOT NULL,
	"number" varchar(20) NOT NULL,
	"complement" varchar(255),
	"city" varchar(100) NOT NULL,
	"state" varchar(2) NOT NULL,
	"zip_code" varchar(10) NOT NULL,
	"is_primary" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"uuid" varchar(36) NOT NULL,
	"image_url" varchar(500),
	"description" varchar(2000),
	"platform" varchar(50),
	"size" varchar(50),
	"multiplayer" boolean DEFAULT false,
	"languages" varchar(255),
	CONSTRAINT "games_title_unique" UNIQUE("title"),
	CONSTRAINT "games_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"rent_id" integer,
	"amount" numeric(10, 2) NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"payment_method" varchar(50),
	"transaction_id" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"paid_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "rents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"game_id" integer,
	"rental_type" "rental_type" NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"expected_return_date" date,
	"returned" boolean DEFAULT false,
	"returned_date" date,
	"fine_amount" numeric(10, 2) DEFAULT '0',
	"days_overdue" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"birth_date" date,
	"email" varchar(255) NOT NULL,
	"password" varchar(255),
	"cpf" varchar(14),
	"phone" varchar(20),
	"role" "user_role" DEFAULT 'cliente',
	"expiration_date" date,
	"subscription_limit" integer DEFAULT 3,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_rent_id_rents_id_fk" FOREIGN KEY ("rent_id") REFERENCES "public"."rents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rents" ADD CONSTRAINT "rents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rents" ADD CONSTRAINT "rents_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "addresses_user_id_idx" ON "addresses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "addresses_user_primary_idx" ON "addresses" USING btree ("user_id","is_primary");--> statement-breakpoint
CREATE INDEX "payments_user_id_idx" ON "payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payments_rent_id_idx" ON "payments" USING btree ("rent_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "rents_user_id_idx" ON "rents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "rents_game_id_idx" ON "rents" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "rents_returned_idx" ON "rents" USING btree ("returned");--> statement-breakpoint
CREATE INDEX "rents_game_id_returned_idx" ON "rents" USING btree ("game_id","returned");--> statement-breakpoint
CREATE INDEX "rents_user_returned_type_idx" ON "rents" USING btree ("user_id","returned","rental_type");--> statement-breakpoint
CREATE INDEX "email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "is_active_idx" ON "users" USING btree ("is_active");