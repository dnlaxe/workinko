ALTER TABLE "pending_jobs" RENAME TO "pending_post";--> statement-breakpoint
ALTER TABLE "pending_post" RENAME CONSTRAINT "pending_jobs_session_id_pending_session_id_fk" TO "pending_post_session_id_pending_session_id_fk";--> statement-breakpoint
ALTER TABLE "live_posts" RENAME CONSTRAINT "live_posts_source_pending_job_id_pending_jobs_id_fk" TO "live_posts_source_pending_job_id_pending_post_id_fk";--> statement-breakpoint
ALTER SEQUENCE "pending_jobs_id_seq" RENAME TO "pending_post_id_seq";
