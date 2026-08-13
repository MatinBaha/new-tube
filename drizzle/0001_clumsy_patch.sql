CREATE TYPE "public"."video_visibility" AS ENUM('private', 'public');--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "thumbnail_url" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "preview_url" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "duration" integer;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "visibility" "video_visibility" DEFAULT 'private' NOT NULL;