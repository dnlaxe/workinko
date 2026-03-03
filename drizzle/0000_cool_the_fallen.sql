CREATE TYPE "public"."basket_state" AS ENUM('open', 'locked', 'paid', 'expired');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('draft', 'ready', 'published', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('requires_payment_method', 'authorized', 'captured', 'failed', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."relay_message_status" AS ENUM('pending', 'sent', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."tier" AS ENUM('standard', 'pinned', 'featured');--> statement-breakpoint
CREATE TABLE "baskets" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "baskets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"token_hash" text NOT NULL,
	"state" "basket_state" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"state_changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	CONSTRAINT "baskets_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "draft_jobs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "draft_jobs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"basket_id" integer NOT NULL,
	"status" "job_status" DEFAULT 'draft' NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"specialization" text NOT NULL,
	"contract_type" text NOT NULL,
	"location" integer NOT NULL,
	"korean_proficiency" integer NOT NULL,
	"other_languages" text,
	"english_proficiency" text NOT NULL,
	"visa_sponsorship" text NOT NULL,
	"start_date" text NOT NULL,
	"full_description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status_changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"rejected_reason" text
);
--> statement-breakpoint
CREATE TABLE "live_posts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "live_posts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"draft_job_id" integer NOT NULL,
	"tier" "tier" DEFAULT 'standard' NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"specialization" text NOT NULL,
	"contract_type" text NOT NULL,
	"location" integer NOT NULL,
	"korean_proficiency" integer NOT NULL,
	"other_languages" text,
	"english_proficiency" text NOT NULL,
	"visa_sponsorship" text NOT NULL,
	"start_date" text NOT NULL,
	"full_description" text NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"unpublished_at" timestamp with time zone,
	CONSTRAINT "live_posts_draft_job_id_unique" UNIQUE("draft_job_id"),
	CONSTRAINT "live_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"basket_id" integer NOT NULL,
	"provider" text NOT NULL,
	"provider_intent_id" text NOT NULL,
	"provider_charge_id" text,
	"status" "payment_status" DEFAULT 'requires_payment_method' NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text NOT NULL,
	"authorized_at" timestamp with time zone,
	"captured_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_basket_id_unique" UNIQUE("basket_id"),
	CONSTRAINT "payments_provider_intent_id_unique" UNIQUE("provider_intent_id")
);
--> statement-breakpoint
CREATE TABLE "relay_messages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "relay_messages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"job_id" integer NOT NULL,
	"from_email" text NOT NULL,
	"message" text NOT NULL,
	"status" "relay_message_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "draft_jobs" ADD CONSTRAINT "draft_jobs_basket_id_baskets_id_fk" FOREIGN KEY ("basket_id") REFERENCES "public"."baskets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_posts" ADD CONSTRAINT "live_posts_draft_job_id_draft_jobs_id_fk" FOREIGN KEY ("draft_job_id") REFERENCES "public"."draft_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_basket_id_baskets_id_fk" FOREIGN KEY ("basket_id") REFERENCES "public"."baskets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relay_messages" ADD CONSTRAINT "relay_messages_job_id_live_posts_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."live_posts"("id") ON DELETE no action ON UPDATE no action;