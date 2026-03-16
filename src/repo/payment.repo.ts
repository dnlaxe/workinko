import { eq } from "drizzle-orm";
import { payment } from "../db/schema.js";
import { db } from "../db/db.js";
import { PaymentRowInsert } from "../types/types.js";

export async function getPaymentByPaymentRef(paymentRef: string) {
  const [reference] = await db
    .select()
    .from(payment)
    .where(eq(payment.paymentRef, paymentRef));

  return reference ?? null;
}

export async function insertPayment(paymentData: PaymentRowInsert) {
  const [row] = await db.insert(payment).values(paymentData).returning();
  return row;
}

export async function updatePaymentProviderDetails(
  paymentRef: string,
  paymentId: string,
  paymentIntentId: string,
) {
  const [row] = await db
    .update(payment)
    .set({ paymentId, paymentIntentId })
    .where(eq(payment.paymentRef, paymentRef))
    .returning();

  return row ?? null;
}
