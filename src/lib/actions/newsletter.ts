import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server.ts";
import { sendAppEmail } from "../resend.server.ts";
import NewsletterWelcomeEmail from "../../emails/NewsletterWelcomeEmail.tsx";
import * as React from "react";

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
    })
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();

    // 1. Save to Database
    // Note: Assuming a 'newsletter_subscribers' table exists. 
    // If it doesn't, we still send the email for the prototype.
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email: data.email,
        subscribed_at: new Date().toISOString(),
        status: "subscribed"
      });
      
    // Ignore error if table doesn't exist yet, we still want to test the email
    if (error && !error.message.includes("does not exist") && !error.message.includes("Could not find the table")) {
      throw new Error(`Failed to subscribe: ${error.message}`);
    }

    // 2. Send Welcome Email via Resend
    const result = await sendAppEmail({
      to: data.email,
      subject: "Welcome to Gaspo Studios!",
      react: React.createElement(NewsletterWelcomeEmail),
    });
    
    if (!result.success) {
      console.error("Resend Error:", result.error);
      throw new Error(`Failed to send welcome email: ${result.error?.message || "Unknown Resend error"}`);
    }

    return { success: true };
  });
