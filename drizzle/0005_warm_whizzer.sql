ALTER TABLE "live_posts" ADD COLUMN "source_pending_job_id" integer;--> statement-breakpoint
ALTER TABLE "magic_tokens" ADD COLUMN "used_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pending_session" ADD COLUMN "approved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pending_session" ADD COLUMN "rejected_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "live_posts" ADD CONSTRAINT "live_posts_source_pending_job_id_pending_jobs_id_fk" FOREIGN KEY ("source_pending_job_id") REFERENCES "public"."pending_jobs"("id") ON DELETE no action ON UPDATE no action;