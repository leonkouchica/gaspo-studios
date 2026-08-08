import * as React from "react";
import { render } from "@react-email/components";

// ─── ZeptoMail configuration ────────────────────────────────────────────────
const ZEPTO_API_URL = "https://api.zeptomail.com/v1.1/email";
const ZEPTO_API_KEY = process.env.ZEPTO_MAIL_API_KEY || "";

const FROM_ADDRESS = "noreply@gaspostudios.com";
const FROM_NAME = "Gaspo Studios";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement | React.ReactNode;
  replyTo?: string | string[];
}

interface ZeptoRecipient {
  email_address: { address: string; name?: string };
}

interface ZeptoPayloadItem {
  from?: string;
  to: string;
  subject: string;
  html: string;
}

// ─── Core ZeptoMail send ─────────────────────────────────────────────────────

/**
 * Sends a single email via the ZeptoMail REST API.
 * @param to        Recipient email address (single)
 * @param subject   Email subject line
 * @param htmlBody  Rendered HTML body
 * @param replyTo   Optional reply-to address
 */
async function sendZeptoMail(
  to: string,
  subject: string,
  htmlBody: string,
  replyTo?: string,
): Promise<{ success: boolean; error?: string }> {
  const recipients: ZeptoRecipient[] = [{ email_address: { address: to } }];

  const body: Record<string, unknown> = {
    from: { address: FROM_ADDRESS, name: FROM_NAME },
    to: recipients,
    subject,
    htmlbody: htmlBody,
  };

  if (replyTo) {
    body.reply_to = [{ address: replyTo }];
  }

  try {
    const res = await fetch(ZEPTO_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Zoho-enczapikey ${ZEPTO_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`ZeptoMail API error (${res.status}):`, text);
      return { success: false, error: `ZeptoMail API error ${res.status}: ${text}` };
    }

    return { success: true };
  } catch (err: any) {
    console.error("ZeptoMail fetch failed:", err);
    return { success: false, error: err?.message ?? "Unknown error" };
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Sends an email using a React Email template via ZeptoMail.
 * Accepts the same options as the previous Resend implementation so
 * all callers (bookings, contact, sponsors, events, newsletter) are unchanged.
 */
export async function sendAppEmail({ to, subject, react, replyTo }: SendEmailOptions) {
  try {
    // Render the React Email template to a plain HTML string
    const htmlBody = await render(react as React.ReactElement);

    const recipients = Array.isArray(to) ? to : [to];
    const firstReplyTo = Array.isArray(replyTo) ? replyTo[0] : replyTo;

    // Send to each recipient (ZeptoMail has no batch endpoint)
    let lastError: string | undefined;
    let allSuccess = true;

    for (const recipient of recipients) {
      const result = await sendZeptoMail(recipient, subject, htmlBody, firstReplyTo);
      if (!result.success) {
        allSuccess = false;
        lastError = result.error;
        console.error(`Failed to send to ${recipient}:`, result.error);
      }
    }

    if (!allSuccess) {
      return { success: false, error: { message: lastError ?? "One or more sends failed" } };
    }

    return { success: true, data: { id: "zepto-sent" } };
  } catch (err: any) {
    console.error("sendAppEmail failed:", err);
    return { success: false, error: { message: err?.message ?? "Unknown error" } };
  }
}

/**
 * Sends a batch of pre-rendered HTML emails via ZeptoMail.
 * Replaces `resend.batch.send()` in broadcast functions.
 *
 * Each item in the payload has the same shape used in the existing
 * batch calls: { from, to, subject, html }
 */
export async function zeptoMailBatchSend(
  payload: ZeptoPayloadItem[],
): Promise<{ error: null | { message: string } }> {
  let failed = 0;

  for (const item of payload) {
    const result = await sendZeptoMail(item.to, item.subject, item.html);
    if (!result.success) {
      failed++;
      console.error(`Batch: failed to send to ${item.to}:`, result.error);
    }
  }

  if (failed > 0) {
    return { error: { message: `${failed} of ${payload.length} emails failed to send.` } };
  }

  return { error: null };
}
