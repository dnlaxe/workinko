ALTER TABLE "live_posts" ALTER COLUMN "contact_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "live_posts" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pending_jobs" ALTER COLUMN "contact_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pending_jobs" ALTER COLUMN "title" SET NOT NULL;