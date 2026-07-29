import { Resend } from "resend";
import * as React from "react";

// Initialize the Resend client.
// Note: This relies on the RESEND_API_KEY environment variable.
const apiKey = process.env.RESEND_API_KEY || "re_dummy";
export const resend = new Resend(apiKey);

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement | React.ReactNode;
  replyTo?: string | string[];
}

/**
 * Helper function to send emails via Resend.
 * It will default to sending from hello@gaspostudios.com.
 */
export async function sendAppEmail({ to, subject, react, replyTo }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Gaspo Studios <hello@gaspostudios.com>", // Make sure hello@gaspostudios.com is a verified domain in Resend
      to,
      subject,
      reply_to: replyTo,
      react,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Failed to send email:", err);
    return { success: false, error: err };
  }
}
