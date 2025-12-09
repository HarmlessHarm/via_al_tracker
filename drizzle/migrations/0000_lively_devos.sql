CREATE TYPE "public"."character_source" AS ENUM('manual', 'dndbeyond', 'pdf');--> statement-breakpoint
CREATE TYPE "public"."loot_rarity" AS ENUM('common', 'uncommon', 'rare', 'very_rare', 'legendary');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('player', 'dm', 'admin');--> statement-breakpoint
CREATE TABLE "attendance_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"session_name" varchar(255) NOT NULL,
	"session_date" timestamp NOT NULL,
	"awarded_by" uuid NOT NULL,
	"awarded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"classes" jsonb NOT NULL,
	"race" varchar(100) NOT NULL,
	"background" varchar(100) NOT NULL,
	"character_source" character_source DEFAULT 'manual' NOT NULL,
	"dnd_beyond_link" text,
	"pdf_url" text,
	"gold" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loot_vouchers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"rarity" "loot_rarity" NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"awarded_by" uuid NOT NULL,
	"awarded_at" timestamp DEFAULT now() NOT NULL,
	"used_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'player' NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "attendance_tokens" ADD CONSTRAINT "attendance_tokens_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_tokens" ADD CONSTRAINT "attendance_tokens_awarded_by_users_id_fk" FOREIGN KEY ("awarded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_player_id_users_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loot_vouchers" ADD CONSTRAINT "loot_vouchers_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loot_vouchers" ADD CONSTRAINT "loot_vouchers_awarded_by_users_id_fk" FOREIGN KEY ("awarded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;