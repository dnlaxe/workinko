import { Result } from "../../shared/error.js";
import { appLogger } from "../../middleware/logger.js";
import { getSessionBySessionId } from "../../repo/session.repo.js";
import { getPendingPostsBySessionId } from "../../repo/pending-post.repo.js";
import { PendingPostRow } from "../../types/types.js";
import { config } from "../../config/config.js";
import { insertPayment } from "../../repo/payment.repo.js";

type StartSessionPaymentData =
  | { kind: "free"; amount: 0 }
  | { kind: "checkout"; amount: number; checkoutUrl: string };

export async function startSessionPayment(
  sessionId: number,
): Promise<Result<StartSessionPaymentData>> {
  let session;
  let posts;

  try {
    session = await getSessionBySessionId(sessionId);
    if (!session) {
      return { success: false, error: { reason: "SESSION_NOT_FOUND" } };
    }

    if (!session.email) {
      return { success: false, error: { reason: "EMAIL_NOT_FOUND" } };
    }

    posts = await getPendingPostsBySessionId(sessionId);
    if (posts.length === 0) {
      return { success: false, error: { reason: "POSTS_NOT_FOUND" } };
    }
  } catch (err) {
    appLogger.error(
      { err, sessionId },
      "getPendingPostsBySessionId failed loading data",
    );
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  let amountDue: number;
  try {
    amountDue = calculateSessionAmount(posts);
  } catch (err) {
    appLogger.error(
      { err, sessionId },
      "calculateSessionAmount failed calculating amount",
    );
    return { success: false, error: { reason: "AMOUNT_CALCULATION_FAILURE" } };
  }

  if (amountDue === 0) {
    return {
      success: true,
      data: { kind: "free", amount: 0 },
    };
  }

  const paymentRef = `pay_${crypto.randomUUID()}`;

  try {
    await insertPayment({
      sessionId,
      email: session.email,
      status: "initiated",
      paymentRef,
      paymentId: `awaiting_${paymentRef}`,
      paymentIntentId: `awaiting_${paymentRef}`,
      amount: amountDue,
    });
  } catch (err) {
    appLogger.error({ err, sessionId }, "insertPayment failed");
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  const successUrl = new URL("/payments/success", config.base_url);
  successUrl.searchParams.set("paymentRef", paymentRef);

  const cancelUrl = new URL("/payments/cancel", config.base_url);
  cancelUrl.searchParams.set("paymentRef", paymentRef);

  //   let payment;

  //     try {
  //     payment = await createProviderCheckout();
  //     } catch (err) {
  //     appLogger.error({ err, sessionId, paymentRef }, "Provider checkout creation failed");
  //     return { success: false, error: { reason: "PAYMENT_PROVIDER_ERROR" } };
  //     }

  //     try {
  //     await updatePaymentProviderDetails(
  //         paymentRef,
  //         payment.paymentId,
  //         payment.paymentIntentId,
  //     );
  //     } catch (err) {
  //     appLogger.error({ err, sessionId, paymentRef }, "Persisting provider payment details failed");
  //     return { success: false, error: { reason: "DB_ERROR" } };
  //     }

  // example while above isn't wired up
  return {
    success: true,
    data: {
      kind: "checkout",
      amount: amountDue,
      checkoutUrl: "http://localhost:3002/dummy-payment",
    },
  };
}

function calculateSessionAmount(posts: PendingPostRow[]): number {
  let total = 0;

  for (const post of posts) {
    switch (post.tier) {
      case "standard":
        total += 0;
        break;
      case "pinned":
        total += 10000;
        break;
      case "featured":
        total += 0;
        break;
      default:
        throw new Error(`Unsupported tier: ${post.tier}`);
    }
  }

  return total;
}

// type CreatedCheckout = {
//   checkoutUrl: string;
//   paymentId: string;
//   paymentIntentId: string;
// };

// async function createProviderCheckout(params: {
//   sessionId: number;
//   email: string;
//   amount: number;
// }): Promise<CreatedCheckout> {
//   // call provider

//   return {
//     checkoutUrl: "https://provider.example/checkout/abc123",
//     paymentId: `pay_${params.sessionId}`,
//     paymentIntentId: `intent_${params.sessionId}`,
//   };
// }
