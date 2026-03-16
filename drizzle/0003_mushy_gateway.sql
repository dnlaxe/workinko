ALTER TYPE "public"."payment_status" ADD VALUE 'awaiting' BEFORE 'initiated';--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_payment_id_unique";--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_payment_intent_id_unique";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'awaiting';