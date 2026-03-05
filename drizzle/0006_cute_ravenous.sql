ALTER TABLE "live_posts" RENAME COLUMN "stripe_payment_id" TO "payment_id";--> statement-breakpoint
ALTER TABLE "live_posts" DROP CONSTRAINT "live_posts_slug_unique";--> statement-breakpoint
ALTER TABLE "live_posts" DROP CONSTRAINT "live_posts_stripe_payment_id_payments_payment_id_fk";
--> statement-breakpoint
ALTER TABLE "live_posts" ADD CONSTRAINT "live_posts_payment_id_payments_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("payment_id") ON DELETE no action ON UPDATE no action;