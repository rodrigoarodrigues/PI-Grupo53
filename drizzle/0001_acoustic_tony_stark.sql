CREATE TABLE "rents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"game_id" integer,
	"rental_type" varchar(50) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"returned" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "rents" ADD CONSTRAINT "rents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rents" ADD CONSTRAINT "rents_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;