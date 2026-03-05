import { pgTable, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const livePostStatus = pgEnum("live_post_status", [
  "active",
  "expired",
  "pending_review",
  "unpublished",
]);

export const tierOptions = pgEnum("tier_options", [
  "standard",
  "pinned",
  "featured",
]);

export const relayMessageStatus = pgEnum("relay_message_status", [
  "pending",
  "sent",
  "rejected",
]);

export const paymentStatus = pgEnum("payment_status", [
  "holding",
  "captured",
  "cancelled",
]);

export const contactMethod = pgEnum("contact_method", ["link", "relay"]);

const jobMetadata = {
  contactMethod: contactMethod("contact_method").notNull(),
  contactUrl: text("contact_url").notNull(),
  contactEmail: text("contact_email").notNull(),
  heading: text("title").notNull(),
  subheading: text("subheading").notNull(),
  category: text("category").notNull(),
  specialization: text("specialization").notNull(),
  contractType: text("contract_type").notNull(),
  province: text("province").notNull(),
  city: text("city").notNull(),
  koreanProficiency: integer("korean_proficiency").notNull(),
  englishProficiency: integer("english_proficiency").notNull(),
  otherLanguages: text("other_languages"),
  visaSponsorship: text("visa_sponsorship").notNull(),
  startDate: text("start_date").notNull(),
  fullDescription: text("full_description").notNull(),
};

export const pendingSession = pgTable("pending_session", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  token: text("token").notNull().unique(),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),

  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }),
});

export const pendingJobs = pgTable("pending_jobs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => pendingSession.id, { onDelete: "cascade" }),

  ...jobMetadata,

  tier: tierOptions("tier").notNull().default("standard"),

  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),

  // updates only through drizzle commands (add triggers later?)
});

export const livePosts = pgTable("live_posts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull(),
  status: livePostStatus("status").notNull().default("active"),

  ...jobMetadata,

  tier: tierOptions("tier").notNull().default("standard"),

  slug: text("slug").notNull().unique(),

  paymentId: text("stripe_payment_id").references(() => payments.paymentId),

  publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),

  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  unpublishedAt: timestamp("unpublished_at", {
    withTimezone: true,
    mode: "date",
  }),
});

export const relayMessages = pgTable("relay_messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  jobId: integer("job_id")
    .notNull()
    .references(() => livePosts.id),

  fromEmail: text("from_email"),
  toEmail: text("to_email"),
  message: text("message").notNull(),

  status: relayMessageStatus("status").notNull().default("pending"),

  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const magicTokens = pgTable("magic_tokens", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull().unique(),
  token: text("token").notNull().unique(),

  paymentId: text("payment_id").references(() => payments.paymentId), // ← add this

  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

export const payments = pgTable("payments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: integer("session_id").references(() => pendingSession.id),
  email: text("email").notNull(),
  status: paymentStatus("status").notNull().default("holding"),
  paymentId: text("payment_id").notNull().unique(),
  paymentIntentId: text("payment_intent_id").notNull().unique(),
  amount: integer("amount").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});
