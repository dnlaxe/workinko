import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { magicToken } from "../db/schema.js";
import { randomBytes } from "crypto";

export async function createMagicToken(
  email: string,
  sessionId: number,
  expiresAt: Date,
  paymentId?: string | null,
) {
  const [tokenRow] = await db
    .insert(magicToken)
    .values({
      email,
      sessionId,
      expiresAt,
      paymentId: paymentId ?? null,
      token: randomBytes(32).toString("hex"),
    })
    .returning();
  return tokenRow;
}

export async function getSessionIdByToken(token: string) {
  const [session] = await db
    .select()
    .from(magicToken)
    .where(eq(magicToken.token, token));

  return session ?? null;
}
