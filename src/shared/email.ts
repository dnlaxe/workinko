import { config } from "../config/config.js";
import { Resend } from "resend";
import Handlebars from "handlebars";
import { appLogger } from "../middleware/logger.js";
import { Result } from "./error.js";

const resend = new Resend(config.resend_api);

export async function sendReceipt(
  manageUrl: string,
  //   email: string,
): Promise<Result<void>> {
  appLogger.info({ manageUrl }, "Url link");
  const content = `
    <h1>Thank you for posting. Click the link to manage your post.</h1>
    <a href="{{{manageUrl}}}">Manage your post</a>
    `;

  const template = Handlebars.compile(content);
  const html = template({ manageUrl });

  const { error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: "dnlaxe@gmail.com",
    subject: `Your Receipt`,
    html,
  });

  if (error) {
    appLogger.error({ error }, "Receipt email sending failure");
    return { success: false, error: { reason: "EMAIL_API_ERROR" } };
  }

  appLogger.info("Receipt email sending success");
  return { success: true, data: undefined };
}
