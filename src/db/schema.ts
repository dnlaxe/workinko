import {
  pgTable,
  text,
  integer,
  timestamp,
  pgEnum,
  numeric,
} from "drizzle-orm/pg-core";

export const basketState = pgEnum("basket_state", [
  "open",
  "locked",
  "paid",
  "expired",
]);

export const jobStatus = pgEnum("job_status", [
  "draft",
  "ready",
  "published",
  "rejected",
]);

export const tierOptions = pgEnum("tier", ["standard", "pinned", "featured"]);

export const paymentStatus = pgEnum("payment_status", [
  "requires_payment_method",
  "authorized",
  "captured",
  "failed",
  "canceled",
]);

export const relayMessageStatus = pgEnum("relay_message_status", [
  "pending",
  "sent",
  "rejected",
]);

export const contactMethod = pgEnum("contact_method", ["link", "relay"]);

const jobMetadata = {
  contactMethod: contactMethod("contact_method").notNull(),
  heading: text("title").notNull(),
  subheading: text("description").notNull(),
  specialization: text("specialization").notNull(),
  contractType: text("contract_type").notNull(),
  location: integer("location").notNull(),
  koreanProficiency: integer("korean_proficiency").notNull(),
  englishProficiency: text("english_proficiency").notNull(),
  otherLanguages: text("other_languages"),
  visaSponsorship: text("visa_sponsorship").notNull(),
  startDate: text("start_date").notNull(),
  fullDescription: text("full_description").notNull(),
};

export const baskets = pgTable("baskets", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tokenHash: text("token_hash").notNull().unique(),
  email: text("email"),
  state: basketState("state").notNull().default("open"),

  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),

  // updates only through drizzle commands (add triggers later?)

  stateChangedAt: timestamp("state_changed_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),

  reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: "date" }),
});

export const draftJobs = pgTable("draft_jobs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  basketId: integer("basket_id")
    .notNull()
    .references(() => baskets.id, { onDelete: "cascade" }),

  status: jobStatus("status").notNull().default("draft"),

  ...jobMetadata,

  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),

  statusChangedAt: timestamp("status_changed_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),

  rejectedReason: text("rejected_reason"),
});

export const payments = pgTable("payments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  basketId: integer("basket_id")
    .notNull()
    .references(() => baskets.id, { onDelete: "cascade" })
    .unique(),

  provider: text("provider").notNull(),
  providerIntentId: text("provider_intent_id").notNull().unique(),
  providerChargeId: text("provider_charge_id"),

  status: paymentStatus("status").notNull().default("requires_payment_method"),

  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull(),

  authorizedAt: timestamp("authorized_at", {
    withTimezone: true,
    mode: "date",
  }),
  capturedAt: timestamp("captured_at", { withTimezone: true, mode: "date" }),

  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const livePosts = pgTable("live_posts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  draftJobId: integer("draft_job_id")
    .notNull()
    .references(() => draftJobs.id)
    .unique(),

  tier: tierOptions("tier").notNull().default("standard"),

  slug: text("slug").notNull().unique(),

  ...jobMetadata,

  publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),

  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }),
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

  fromEmail: text("from_email").notNull(),
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
