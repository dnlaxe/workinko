ALTER TYPE "public"."pending_session_status" ADD VALUE 'draft' BEFORE 'pending_review';--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"event_type" text NOT NULL,
	"actor_type" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer,
	"session_id" integer,
	"post_id" integer,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb
);
