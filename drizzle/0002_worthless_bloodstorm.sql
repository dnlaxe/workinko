ALTER TYPE "public"."payment_status" ADD VALUE 'initiated' BEFORE 'holding';--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "payment_ref" text NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_ref_unique" UNIQUE("payment_ref");