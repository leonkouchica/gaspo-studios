import { defineEventHandler, getHeader } from "h3";
import { processScheduledCampaigns } from "../../../src/lib/actions/campaign-processor.server";
import { serverEnv } from "../../../src/lib/env.server";

/**
 * Vercel Cron endpoint for processing scheduled email campaigns.
 * Runs every 5 minutes (configured in vercel.json).
 *
 * This is a Nitro server route (not a TanStack Start route) so it lives
 * entirely on the server — no risk of Node.js modules leaking into the
 * client bundle.
 *
 * Security: Validates the Authorization header against CRON_SECRET
 * to ensure only Vercel's cron scheduler can trigger this endpoint.
 */
export default defineEventHandler(async (event) => {
  // Verify the request is from Vercel Cron
  const authHeader = getHeader(event, "authorization");
  const expectedToken = serverEnv.CRON_SECRET;

  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return { error: "Unauthorized" };
  }

  try {
    const result = await processScheduledCampaigns();

    console.log(
      `[Cron] Process-campaigns complete: ${result.processed} campaign(s) processed`,
    );

    return result;
  } catch (err: any) {
    console.error("[Cron] Process-campaigns failed:", err);
    return { error: err.message || "Internal server error" };
  }
});
