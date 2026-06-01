import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { serverEnv } from "../env.server";

export const getGreeting = createServerFn({ method: "POST" })
  .inputValidator(z.object({ name: z.string().min(1) }))
  .handler(async ({ data }) => {
    return {
      greeting: `Hello, ${data.name}!`,
      mode: serverEnv.NODE_ENV ?? "unknown",
    };
  });
