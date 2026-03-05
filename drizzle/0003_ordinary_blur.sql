ALTER TABLE "live_posts" ALTER COLUMN "contact_email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "live_posts" ALTER COLUMN "title" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pending_jobs" ALTER COLUMN "contact_email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pending_jobs" ALTER COLUMN "title" DROP NOT NULL;