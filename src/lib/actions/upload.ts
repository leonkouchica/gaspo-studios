import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireRole } from "../auth-guard.server.ts";
import { convertAndUploadImage } from "./upload.server.ts";

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export const uploadEditorImage = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      fileBase64: z.string(),
      fileName: z.string(),
      mimeType: z.string(),
      folder: z
        .enum(["gallery", "blog", "events", "team", "newsletter", "campaigns"])
        .default("newsletter"),
    }),
  )
  .handler(async ({ data }) => {
    requireRole(["admin", "editor"]);
    const buffer = base64ToBytes(data.fileBase64);
    const file = new File([buffer], data.fileName, { type: data.mimeType });
    const publicUrl = await convertAndUploadImage(file, data.folder);
    return { url: publicUrl };
  });
