-- Create enum for rental_type
DO $$ BEGIN
  CREATE TYPE rental_type AS ENUM ('unitario', 'assinatura');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Alter users table: remove age, add birth_date and expiration_date
ALTER TABLE "users" DROP COLUMN IF EXISTS "age";
ALTER TABLE "users" ADD COLUMN "birth_date" date;
ALTER TABLE "users" ADD COLUMN "expiration_date" date;

-- Alter games table: add image_url
ALTER TABLE "games" ADD COLUMN "image_url" varchar(500);

-- Alter rents table: change rental_type from varchar to enum
ALTER TABLE "rents" ALTER COLUMN "rental_type" DROP DEFAULT;
ALTER TABLE "rents" ALTER COLUMN "rental_type" TYPE rental_type USING "rental_type"::rental_type;
