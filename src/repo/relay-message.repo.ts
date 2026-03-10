import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { relayMessage } from "../db/schema.js";

export async function insertRelayMessage(
  postId: number,
  from: string,
  to: string,
  message: string,
) {
  const [row] = await db
    .insert(relayMessage)
    .values({
      jobId: postId,
      fromEmail: from,
      toEmail: to,
      message,
      status: "pending",
    })
    .returning({ id: relayMessage.id });
  return row ?? null;
}

export async function getAllPendingRelayMessages() {
  return await db
    .select()
    .from(relayMessage)
    .where(eq(relayMessage.status, "pending"));
}

export async function updateRelayMessageStatus(
  id: number,
  status: "sent" | "rejected",
) {
  await db.update(relayMessage).set({ status }).where(eq(relayMessage.id, id));
}

export async function getRelayMessageById(id: number) {
  const [row] = await db
    .select()
    .from(relayMessage)
    .where(eq(relayMessage.id, id));
  return row ?? null;
}
