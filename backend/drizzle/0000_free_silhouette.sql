CREATE TABLE "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"uuid" varchar(36) NOT NULL,
	CONSTRAINT "games_title_unique" UNIQUE("title"),
	CONSTRAINT "games_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"age" integer,
	"email" varchar(255) NOT NULL
);
