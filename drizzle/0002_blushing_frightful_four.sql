CREATE TYPE "public"."pending_session_status" AS ENUM('pending_review', 'approved', 'rejected');--> statement-breakpoint
ALTER TABLE "magic_tokens" DROP CONSTRAINT "magic_tokens_email_unique";--> statement-breakpoint
ALTER TABLE "live_posts" ADD COLUMN "session_id" integer;--> statement-breakpoint
ALTER TABLE "magic_tokens" ADD COLUMN "session_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "pending_session" ADD COLUMN "status" "pending_session_status" DEFAULT 'pending_review' NOT NULL;--> statement-breakpoint
ALTER TABLE "live_posts" ADD CONSTRAINT "live_posts_session_id_pending_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pending_session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "magic_tokens" ADD CONSTRAINT "magic_tokens_session_id_pending_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pending_session"("id") ON DELETE no action ON UPDATE no action;