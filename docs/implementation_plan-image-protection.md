# Portfolio Image Protection — Watermark + Download Prevention

## Overview

This implements two layers of portfolio image protection for Gaspo Studios:

1. **Server-side watermarking** — every image uploaded through the admin gallery is automatically watermarked at upload time using the GASPO STUDIOS logo in a Shutterstock-style diagonal tile pattern, baked permanently into the WebP file stored in Supabase.
2. **Frontend download prevention** — CSS, JavaScript, and HTML techniques that prevent right-click saving, drag-and-drop, long-press (mobile), and keyboard shortcuts from exposing the raw image to users.

> [!IMPORTANT]
> No client-side technique is 100% unbreakable — a determined user can always open DevTools and find a URL. The real protection is the watermark: even if they extract the image, it's branded. The frontend measures stop casual theft (the vast majority of cases).

---

## Protection Strategy (Best Practices)

### Layer 1 — Watermark (Primary, Unbreakable)
- Applied **at upload time** on the server using `sharp` (already installed)
- Logo is composited over the image using a **tiled diagonal pattern** similar to Shutterstock
- The watermark is semi-transparent (~40% opacity) so the content is still visible
- The watermarked version is what gets stored in Supabase — so the URL itself, even if shared, always shows the branded image

### Layer 2 — Frontend Hardening (Secondary, UX deterrent)
- `pointer-events: none` and `user-select: none` on all gallery `<img>` tags
- `onContextMenu` → `preventDefault()` to block right-click
- `onDragStart` → `preventDefault()` to block drag-to-desktop
- CSS `-webkit-touch-callout: none` for iOS long-press prevention
- Lightbox images wrapped in a transparent `<div>` overlay so the underlying `<img>` is never directly interactable
- `loading="lazy"` and no `download` attribute on any anchor

### Layer 3 — Supabase Storage (Optional but Recommended)
> [!TIP]
> Currently images are served from a **public** Supabase bucket (direct URL is accessible). For maximum protection, you can switch to a **private bucket** and serve images via signed URLs with an expiry (e.g. 1 hour). This means even if someone finds the URL, it expires. I'll document this as a future enhancement below.

---

## Open Questions

> [!IMPORTANT]
> **Existing images** — All images already uploaded to the gallery will **not** have a watermark. The watermark only applies to newly uploaded images going forward. Do you want me to add a "Re-watermark all" batch operation in the admin panel, or is forward-only acceptable?

> [!IMPORTANT]
> **Watermark position** — Shutterstock style = diagonal tiled repeating logo across the full image. Is this what you want, or do you prefer a single centered watermark (larger, like Getty Images style)?

---

## Proposed Changes

### Server — Watermark Pipeline

#### [MODIFY] [upload.server.ts](file:///c:/Users/leonk/Documents/RUSSELL/GASPOTECH/GASPO%20Studios/gaspo-studios/src/lib/actions/upload.server.ts)
- Add `applyWatermark(buffer, folder)` function using `sharp` composite
- Load the GASPO STUDIOS logo (`docs/gaspo-studios-logo.webp`) from disk
- Create a tiled watermark pattern at 40% opacity, rotated 30°, repeated across the image
- Modify `convertAndUploadImage` to accept an optional `watermark: boolean` flag — default `true` for `"gallery"` folder, `false` for others (blog, events)
- The watermark is applied **after** WebP conversion, before upload

#### [NEW] `src/lib/watermark.server.ts`
- Isolated watermark utility: `createWatermarkTile()` and `applyWatermarkToBuffer()`
- Reads logo from `docs/gaspo-studios-logo.webp` using Node.js `fs.readFileSync`
- Generates a repeating tile overlay using `sharp` metadata + composite

---

### Frontend — Download Prevention

#### [MODIFY] [gallery.tsx](file:///c:/Users/leonk/Documents/RUSSELL/GASPOTECH/GASPO%20Studios/gaspo-studios/src/routes/gallery.tsx)
- Wrap all `<img>` tags in a `<div>` with `onContextMenu` → `preventDefault()`
- Add `draggable={false}` to all images
- Add CSS classes: `select-none pointer-events-none` on `<img>` elements
- Add transparent overlay `<div>` in the lightbox to intercept mouse events
- Add `onContextMenu={e => e.preventDefault()}` on the lightbox container

---

### CSS — Global Protection Tokens

#### [MODIFY] [styles.css](file:///c:/Users/leonk/Documents/RUSSELL/GASPOTECH/GASPO%20Studios/gaspo-studios/src/styles.css)
- Add `.protected-image` utility class:
  ```css
  .protected-image {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
    pointer-events: none;
  }
  .gallery-image-wrapper {
    -webkit-touch-callout: none;
    user-select: none;
    position: relative;
  }
  ```

---

## Files Touched Summary

| File | Change |
|---|---|
| `src/lib/actions/upload.server.ts` | Add watermark step in image pipeline |
| `src/lib/watermark.server.ts` | **NEW** — Watermark utility (sharp-based) |
| `src/routes/gallery.tsx` | Frontend download protection |
| `src/styles.css` | `.protected-image` utility class |

---

## Verification Plan

### Automated
- Extend `upload.server.test.ts` to verify watermarked images are returned for gallery folder
- Unit test `watermark.server.ts` with a test PNG

### Manual
1. Upload a new image via admin → verify watermark appears in gallery
2. Right-click on gallery image → verify context menu is blocked
3. Try drag-and-drop → verify it doesn't save
4. Open lightbox → right-click the lightbox image → verify blocked
5. Inspect the Supabase Storage bucket → confirm the stored file itself has the watermark baked in

---

## Future Enhancement — Private Bucket + Signed URLs

To go further, you could:
1. Make the Supabase `gaspo-media` bucket **private**
2. Add a server function `getSignedGalleryUrls` that returns short-lived signed URLs (e.g. 2 hours)
3. Gallery page calls this on load — images display fine, but the URL expires after 2 hours
4. This prevents URL sharing / hotlinking entirely

This is not included in this plan but I can add it if you'd like.
