import { desc } from "drizzle-orm";
import { db } from "../db/db.js";
import { auditEvent } from "../db/schema.js";
import { AuditEventInsert } from "../types/types.js";

export async function insertAuditEvents(events: AuditEventInsert[]) {
  if (events.length === 0) return [];
  return db.insert(auditEvent).values(events).returning();
}

export async function getLogs() {
  return db
    .select()
    .from(auditEvent)
    .orderBy(desc(auditEvent.createdAt))
    .limit(50);
}
