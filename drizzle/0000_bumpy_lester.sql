CREATE TYPE "public"."contact_method" AS ENUM('link', 'relay');--> statement-breakpoint
CREATE TYPE "public"."pending_session_status" AS ENUM('pending_review', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."live_post_status" AS ENUM('active', 'expired', 'pending_review', 'unpublished');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('holding', 'captured', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."relay_message_status" AS ENUM('pending', 'sent', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."tier_options" AS ENUM('standard', 'pinned', 'featured');--> statement-breakpoint
CREATE TABLE "pending_session" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pending_session_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"token" text NOT NULL,
	"email" text,
	"status" "pending_session_status" DEFAULT 'pending_review' NOT NULL,
	"approved_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	CONSTRAINT "pending_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "live_posts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "live_posts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"session_id" integer,
	"source_pending_job_id" integer,
	"email" text NOT NULL,
	"status" "live_post_status" DEFAULT 'active' NOT NULL,
	"contact_method" "contact_method" NOT NULL,
	"contact_url" text,
	"contact_email" text,
	"title" text NOT NULL,
	"subheading" text NOT NULL,
	"category" text NOT NULL,
	"specialization" text NOT NULL,
	"contract_type" text NOT NULL,
	"province" text NOT NULL,
	"city" text NOT NULL,
	"korean_proficiency" integer NOT NULL,
	"english_proficiency" integer NOT NULL,
	"other_languages" text,
	"visa_sponsorship" text NOT NULL,
	"start_date" text NOT NULL,
	"full_description" text NOT NULL,
	"tier" "tier_options" DEFAULT 'standard' NOT NULL,
	"slug" text NOT NULL,
	"payment_id" text,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"unpublished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "magic_tokens" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "magic_tokens_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" text NOT NULL,
	"token" text NOT NULL,
	"session_id" integer NOT NULL,
	"payment_id" text,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "magic_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"session_id" integer,
	"email" text NOT NULL,
	"status" "payment_status" DEFAULT 'holding' NOT NULL,
	"payment_id" text NOT NULL,
	"payment_intent_id" text NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_payment_id_unique" UNIQUE("payment_id"),
	CONSTRAINT "payments_payment_intent_id_unique" UNIQUE("payment_intent_id")
);
--> statement-breakpoint
CREATE TABLE "pending_post" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pending_post_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"session_id" integer NOT NULL,
	"contact_method" "contact_method" NOT NULL,
	"contact_url" text,
	"contact_email" text,
	"title" text NOT NULL,
	"subheading" text NOT NULL,
	"category" text NOT NULL,
	"specialization" text NOT NULL,
	"contract_type" text NOT NULL,
	"province" text NOT NULL,
	"city" text NOT NULL,
	"korean_proficiency" integer NOT NULL,
	"english_proficiency" integer NOT NULL,
	"other_languages" text,
	"visa_sponsorship" text NOT NULL,
	"start_date" text NOT NULL,
	"full_description" text NOT NULL,
	"tier" "tier_options" DEFAULT 'standard' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relay_messages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "relay_messages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"job_id" integer NOT NULL,
	"from_email" text,
	"to_email" text,
	"message" text NOT NULL,
	"status" "relay_message_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "live_posts" ADD CONSTRAINT "live_posts_session_id_pending_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pending_session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_posts" ADD CONSTRAINT "live_posts_source_pending_job_id_pending_post_id_fk" FOREIGN KEY ("source_pending_job_id") REFERENCES "public"."pending_post"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_posts" ADD CONSTRAINT "live_posts_payment_id_payments_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("payment_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "magic_tokens" ADD CONSTRAINT "magic_tokens_session_id_pending_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pending_session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "magic_tokens" ADD CONSTRAINT "magic_tokens_payment_id_payments_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("payment_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_session_id_pending_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pending_session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pending_post" ADD CONSTRAINT "pending_post_session_id_pending_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pending_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relay_messages" ADD CONSTRAINT "relay_messages_job_id_live_posts_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."live_posts"("id") ON DELETE no action ON UPDATE no action;