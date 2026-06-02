# Push Web Notification System — Implementation Plan

> **Project:** Gaspo Studios  
> **Stack:** TanStack Start + Vite + React 19 + TypeScript  
> **Database:** Supabase (PostgreSQL)  
> **Hosting:** Vercel (Nitro preset)  
> **Date:** June 2, 2026

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                          SYSTEM ARCHITECTURE                          │
│                                                                       │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────┐               │
│  │  Browser  │───▶│  Vite + SW   │───▶│  Google Push  │               │
│  │ (Android) │    │ (Service Wkr)│    │  Service      │               │
│  └──────────┘    └──────┬───────┘    └───────┬───────┘               │
│                         │                     │                       │
│                         ▼                     ▼                       │
│                  ┌──────────────┐    ┌───────────────┐               │
│                  │  Vercel Edge │    │  User's        │               │
│                  │  /api/notify │    │  Android Phone │               │
│                  └──────┬───────┘    └───────────────┘               │
│                         │                                            │
│                         ▼                                            │
│                  ┌──────────────┐                                     │
│                  │   Supabase   │                                     │
│                  │ (PostgreSQL) │                                     │
│                  └──────────────┘                                     │
└──────────────────────────────────────────────────────────────────────┘
```

### Data Flow

| Step | Actor | Action |
|------|-------|--------|
| 1 | User | Visits site, opts into notifications via checkboxes (Blogs / Events) |
| 2 | Browser | Registers Service Worker, requests `Notification.requestPermission()` |
| 3 | Browser | Subscribes to Google Push via `pushManager.subscribe(VAPID)` |
| 4 | Frontend | POSTs `{ subscription, channels: { blogs, events } }` to `/api/notifications/subscribe` |
| 5 | Backend | Stores subscription + channel preferences in Supabase `push_subscriptions` table |
| 6 | Admin/CMS | Publishes a new Blog Post or Upcoming Event |
| 7 | Backend | Queries `push_subscriptions` WHERE `channels.blogs = true` (or `channels.events = true`), applies rate limit filter |
| 8 | Backend | Uses `web-push` library to send payloads to Google's push endpoints |
| 9 | Service Worker | Receives push event, reads `contentType`, displays custom notification |
| 10 | User | Taps notification → `openWindow(url)` navigates to the content |

---

## 2. Database Schema Expansion

A new `push_subscriptions` table will be created in Supabase.

### Migration `006_push_subscriptions.sql`

```sql
-- supabase/migrations/006_push_subscriptions.sql
-- Push notification subscriptions with content channel preferences

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint        TEXT NOT NULL UNIQUE,
    p256dh_key      TEXT NOT NULL,
    auth_key        TEXT NOT NULL,
    channels        JSONB NOT NULL DEFAULT '{"blogs": false, "events": false}'::jsonb,
    user_agent      TEXT,
    device_type     TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    last_used_at    TIMESTAMPTZ DEFAULT now(),
    daily_push_count INT4 DEFAULT 0,
    daily_push_date  DATE,
    last_push_at     TIMESTAMPTZ
);

-- Index for channel-based queries (the most frequent query pattern)
CREATE INDEX idx_push_sub_channels_blogs
    ON public.push_subscriptions ((channels->>'blogs'))
    WHERE channels->>'blogs' = 'true';

CREATE INDEX idx_push_sub_channels_events
    ON public.push_subscriptions ((channels->>'events'))
    WHERE channels->>'events' = 'true';

-- Index on user_id for user-specific lookups
CREATE INDEX idx_push_sub_user_id ON public.push_subscriptions(user_id);

-- Trigger for updated_at
CREATE TRIGGER set_push_subscriptions_updated_at
    BEFORE UPDATE ON public.push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Public can insert (subscribe)
CREATE POLICY "Public can subscribe to push"
    ON public.push_subscriptions
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Users can update/delete their own subscriptions
CREATE POLICY "Users can manage own push subscriptions"
    ON public.push_subscriptions
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all subscriptions (for debugging/dispatch)
CREATE POLICY "Admins can view all push subscriptions"
    ON public.push_subscriptions
    FOR SELECT TO authenticated
    USING (public.is_admin(auth.uid()));


-- Push dispatch audit log
CREATE TABLE IF NOT EXISTS public.push_dispatch_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type    TEXT NOT NULL CHECK (content_type IN ('blog', 'event', 'manual')),
    content_id      TEXT,
    title           TEXT NOT NULL,
    url             TEXT NOT NULL,
    triggered_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    trigger_method  TEXT NOT NULL CHECK (trigger_method IN ('auto', 'manual', 'cron')),
    bypassed_rate_limit BOOLEAN DEFAULT false,
    subscribers_targeted INT4 DEFAULT 0,
    sent_count      INT4 DEFAULT 0,
    failed_count    INT4 DEFAULT 0,
    skipped_rate_limited INT4 DEFAULT 0,
    cleaned_count   INT4 DEFAULT 0,
    error_log       JSONB DEFAULT '[]'::jsonb,
    dispatched_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.push_dispatch_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view dispatch log"
    ON public.push_dispatch_log
    FOR SELECT TO authenticated
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Server can insert dispatch log"
    ON public.push_dispatch_log
    FOR INSERT TO authenticated
    WITH CHECK (true);
```

### Table Schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID (nullable) | Link to Supabase auth user (nullable for anonymous subs) |
| `endpoint` | TEXT (UNIQUE) | Google Push endpoint URL |
| `p256dh_key` | TEXT | WebPush encryption key (client public key) |
| `auth_key` | TEXT | WebPush authentication secret |
| `channels` | JSONB | `{ "blogs": boolean, "events": boolean }` |
| `user_agent` | TEXT | Browser/device info for debugging |
| `device_type` | TEXT | `"mobile"`, `"desktop"`, `"tablet"` |
| `created_at` | TIMESTAMPTZ | Subscription timestamp |
| `updated_at` | TIMESTAMPTZ | Last preference update |
| `last_used_at` | TIMESTAMPTZ | Last successful push delivery |
| `daily_push_count` | INT4 | Number of pushes sent today (rate limiting) |
| `daily_push_date` | DATE | The UTC date for `daily_push_count` |
| `last_push_at` | TIMESTAMPTZ | Timestamp of most recent push dispatch |

---

## 3. Environment Variables & VAPID Keys

Add the following to `.env`:

```env
# Push Notification VAPID Keys
VITE_VAPID_PUBLIC_KEY=<generated-public-key>
VAPID_PRIVATE_KEY=<generated-private-key>
VAPID_SUBJECT=mailto:admin@gaspostudios.com
```

### VAPID Key Generation (Day 1)

```bash
# Install web-push globally for CLI usage
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

The `VITE_VAPID_PUBLIC_KEY` is exposed to the client (prefixed with `VITE_`).
`VAPID_PRIVATE_KEY` is server-only and must NEVER be exposed to the browser.

Update `src/lib/env.server.ts` to validate the new keys:

```typescript
// Add to serverEnvSchema:
VAPID_PRIVATE_KEY: z.string().optional().default(""),
VAPID_SUBJECT: z.string().optional().default("mailto:admin@gaspostudios.com"),
```

---

## 4. New Dependencies

```bash
npm install web-push
npm install -D @types/web-push
```

| Package | Purpose |
|---------|---------|
| `web-push` | Server-side library for sending push notifications via VAPID |
| `@types/web-push` | TypeScript type definitions |

---

## 5. File Creation Inventory

### 5.1 New Files (to create)

| # | File | Purpose |
|---|------|---------|
| 1 | `src/sw.ts` | Service Worker — handles `push` and `notificationclick` events |
| 2 | `src/components/NotificationManager.tsx` | React component — subscription UI with blog/event checkboxes |
| 3 | `src/components/NotificationBell.tsx` | Optional bell icon component for navbar |
| 4 | `src/lib/push-notification.server.ts` | Server-side push dispatch logic (query + send) |
| 5 | `src/lib/actions/push.server.ts` | TanStack Start server functions — subscribe, unsubscribe, update-preferences |
| 6 | `src/lib/api/push.ts` | API route handler (if using API routes instead of server functions) |
| 7 | `src/hooks/use-push-notification.ts` | React hook — encapsulates subscribe/unsubscribe logic |
| 8 | `supabase/migrations/006_push_subscriptions.sql` | Database migration |

### 5.2 Files to Modify

| # | File | Change |
|---|------|--------|
| 1 | `vite.config.ts` | Register Service Worker as Vite entry point |
| 2 | `tsconfig.json` | Add WebWorker lib for SW compilation (or create `tsconfig.sw.json`) |
| 3 | `src/lib/env.server.ts` | Add VAPID env var validation |
| 4 | `src/routes/__root.tsx` | Mount `<NotificationManager />` in root layout |
| 5 | `src/components/Navbar.tsx` | Add `<NotificationBell />` to navbar |
| 6 | `src/routes/admin/index.tsx` | Add "Send Notification" card to admin dashboard |
| 7 | `src/lib/actions/blog.ts` | Trigger push on blog publish |
| 8 | `src/lib/actions/events.ts` | Trigger push on event publish |
| 9 | `package.json` | Add `web-push` dependency |

---

## 6. Detailed Component Specifications

### 6.1 Service Worker (`src/sw.ts`)

- **Environment**: WebWorker (not DOM)
- **Events Handled**:
  - `push` — receives push payload, parses `PushPayload`, displays `showNotification()` with customized icon/badge/vibration based on `contentType`
  - `notificationclick` — closes notification, opens `event.notification.data.url` via `clients.openWindow()`
- **Payload Interface**:
  ```typescript
  interface PushPayload {
    title: string;
    body: string;
    url: string;
    contentType: "blog" | "event";
    eventDate?: string;
  }
  ```
- **Notification Customization by Type**:
  | Property | Blog | Event |
  |----------|------|-------|
  | `icon` | `/icons/blog-icon.png` | `/icons/event-icon.png` |
  | `badge` | `/icons/android-status-badge.png` | `/icons/android-status-badge.png` |
  | `tag` | `"blog"` | `"event"` |
  | `vibrate` | `[100]` | `[200, 100, 200]` |
  | `body prefix` | `—` | `📅 Date: ${eventDate}\n` |
- **Vite Configuration for SW**: The service worker must be built as a separate entry point with WebWorker types:
  ```typescript
  // tsconfig.sw.json (or inline in sw.ts)
  {
    "compilerOptions": {
      "lib": ["WebWorker", "ES2022"],
      "types": []
    }
  }
  ```
- **Vite Plugin**: Use `vite-plugin-pwa` or a custom plugin to build `src/sw.ts` as a standalone output at `/sw.js`.

### 6.2 NotificationManager Component (`src/components/NotificationManager.tsx`)

#### Props
None — self-contained component.

#### State
```typescript
interface NotificationState {
  permission: "default" | "granted" | "denied" | "unsupported";
  subscribed: boolean;
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
}

interface UserPreferences {
  blogs: boolean;
  events: boolean;
}
```

#### Behavior
1. On mount, check `Notification.permission` and `navigator.serviceWorker` availability
2. If already subscribed, show current preferences with toggle checkboxes
3. If not subscribed, show opt-in UI with:
   - Checkbox: "New Blog Posts" (default: true)
   - Checkbox: "Upcoming Events" (default: true)
   - "Enable Notifications" button
4. On "Enable Notifications" click:
   - Request `Notification.requestPermission()`
   - Register Service Worker
   - Subscribe via `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })`
   - POST subscription + channels to `/api/notifications/subscribe`
5. Handle errors: permission denied, SW not supported, subscription failure
6. Show success toast via `sonner`

#### UI States
| State | UI |
|-------|-----|
| Unsupported | Hidden (no SW support) |
| Denied | Message: "Notifications blocked. Enable in browser settings." |
| Default | Opt-in panel with checkboxes + CTA |
| Subscribed | Preference toggles with live-update on change |
| Loading | Skeleton / spinner on CTA |
| Error | Red error banner with retry |

### 6.3 Push Notification Hook (`src/hooks/use-push-notification.ts`)

```typescript
interface UsePushNotificationReturn {
  permission: NotificationPermission | "unsupported";
  subscribed: boolean;
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
  subscribe: (prefs: UserPreferences) => Promise<void>;
  unsubscribe: () => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
}
```

### 6.4 Server-Side Push Dispatcher (`src/lib/push-notification.server.ts`)

```typescript
interface NotificationTarget {
  type: "blog" | "event";
  title: string;
  body: string;
  url: string;
  dateString?: string;
}

async function sendPushNotifications(target: NotificationTarget): Promise<{
  sent: number;
  failed: number;
  cleaned: number;
}>
```

#### Logic
1. Determine channel filter: `target.type === "blog"` → `channels->>'blogs' = 'true'`
2. Query `push_subscriptions` table using Supabase admin client
3. Construct JSON payload with `PushPayload` interface
4. Call `webpush.sendNotification(sub, payload)` for each subscriber
5. Catch `410 Gone` / `404 Not Found` → delete expired subscription from DB
6. Return counts: `{ sent, failed, cleaned }`

### 6.5 Server Functions (`src/lib/actions/push.server.ts`)

Three TanStack Start server functions:

| Function | Method | Purpose |
|----------|--------|---------|
| `subscribeToPush` | POST | Save subscription + channel preferences |
| `unsubscribeFromPush` | POST | Delete subscription by endpoint |
| `updatePushPreferences` | PATCH | Update channels JSONB without re-subscribing |
| `sendAdminNotification` | POST | Admin-triggered push (manual dispatch from admin panel) |

All functions use `.server.ts` suffix — they never bundle to client.

### 6.6 Admin Notification UI (`src/routes/admin/index.tsx` addition)

Add a "Push Notifications" card to the admin dashboard:

- **Blog Post Notification Form**: Select published blog post → custom message override → "Send" button
- **Event Notification Form**: Select upcoming event → custom message override → "Send" button
- **Audience Summary**: Shows subscriber count per channel (blogs: X, events: Y)
- **Recent Dispatch Log**: Last 10 notification sends with status

### 6.7 Auto-Trigger Integration

When an admin publishes content, push is triggered automatically:

#### Blog Publish Hook (`src/lib/actions/blog.ts`)
After a blog post status changes to `"published"`:
1. Call `sendPushNotifications({ type: "blog", title, body: excerpt, url: /blog/${slug} })`
2. Log result to console
3. Do NOT block the publish action — fire-and-forget or background

#### Event Publish Hook (`src/lib/actions/events.ts`)
After an event status changes to `"published"` or `"upcoming"`:
1. Call `sendPushNotifications({ type: "event", title, body: summary, url: /events/${slug}, dateString: event.date })`
2. Log result to console
3. Fire-and-forget pattern

---

## 7. Icon Asset Requirements

Create the following assets in `public/icons/`:

| File | Dimensions | Description |
|------|------------|-------------|
| `blog-icon.png` | 192×192 | Blog post notification icon |
| `event-icon.png` | 192×192 | Event notification icon |
| `android-status-badge.png` | 72×72 (monochrome) | Android status bar badge |
| `icon-192.png` | 192×192 | General app icon (fallback) |
| `icon-512.png` | 512×512 | PWA app icon |

---

## 8. Execution Timeline

### Day 1: VAPID Keys & Environment Setup
- [ ] Generate VAPID key pair via `web-push generate-vapid-keys`
- [ ] Add `VITE_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` to `.env`
- [ ] Update `src/lib/env.server.ts` schema
- [ ] Install `web-push` and `@types/web-push`
- [ ] Create `supabase/migrations/006_push_subscriptions.sql` and apply migration

### Day 2: Service Worker & Build Configuration
- [ ] Create `src/sw.ts` with push/notificationclick handlers
- [ ] Configure Vite to build SW as separate entry (`vite.config.ts`)
- [ ] Create or update `tsconfig.sw.json` for WebWorker lib
- [ ] Test SW registration in browser dev tools
- [ ] Create icon assets in `public/icons/`

### Day 3: Frontend Subscription UI
- [ ] Create `src/hooks/use-push-notification.ts`
- [ ] Create `src/components/NotificationManager.tsx`
- [ ] Create `src/components/NotificationBell.tsx` (optional)
- [ ] Mount `<NotificationManager />` in `__root.tsx`
- [ ] Add notification bell to `Navbar.tsx`
- [ ] Test subscription flow end-to-end (check Supabase table)

### Day 4: Backend Dispatcher & Integration
- [ ] Create `src/lib/push-notification.server.ts` (dispatcher logic)
- [ ] Create `src/lib/actions/push.server.ts` (server functions)
- [ ] Wire auto-trigger into `src/lib/actions/blog.ts`
- [ ] Wire auto-trigger into `src/lib/actions/events.ts`
- [ ] Create admin notification UI in admin dashboard
- [ ] Test manual dispatch from admin panel

### Day 5: Testing & Polish
- [ ] Test on Chrome Desktop (DevTools → Application → Service Workers)
- [ ] Test on Android phone over HTTPS (Vercel preview deploy)
- [ ] Verify notification click → open correct URL
- [ ] Verify channel filtering (blog-only subscribers don't get event pushes)
- [ ] Verify expired subscription cleanup (410/404 handling)
- [ ] Test with screen locked / backgrounded device
- [ ] Verify vibration patterns and icon rendering on Android

---

## 9. Edge Cases & Error Handling

| Scenario | Handling |
|----------|----------|
| Browser doesn't support Service Workers | Graceful degradation — no UI shown |
| User denies notification permission | Show message with instructions to enable in browser settings |
| VAPID keys not configured | Skip all push logic silently (no crash) |
| Subscription endpoint returns 410 Gone | Auto-delete from `push_subscriptions` table |
| Subscription endpoint returns 404 | Auto-delete from `push_subscriptions` table |
| User clears browser data → new subscription | Deduplicate by endpoint UNIQUE constraint |
| Multiple tabs subscribe simultaneously | UNIQUE constraint on endpoint prevents duplicates |
| `web-push.sendNotification` throws network error | Catch per-subscription, don't block batch |
| Empty subscriber list | Return early with `{ sent: 0, failed: 0, cleaned: 0 }` |
| Supabase query error | Log error, return empty result set |
| Subscriber hits daily channel cap (1) | Skip, increment `skipped_rate_limited` counter |
| Subscriber hits daily global cap (3) | Skip, increment `skipped_rate_limited` counter |
| Admin uses "Bypass rate limit" | Set `bypassed_rate_limit = true` on dispatch log, skip rate checks for that batch |
| Vercel Cron Job fails | Vercel retries automatically; cron handler is idempotent (checks `scheduled_for <= now()`) |
| Same scheduled post triggers twice | Idempotent: status check prevents double-publish; dispatch log deduplicates by `content_id` within same hour |

---

## 10. Resolved Decisions

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | **Auto-dispatch or manual admin dispatch?** | **Option C — Both.** Auto-fire when content is published (default), with admin override panel for manual sends, resends, or custom messages. | Covers bulk publishing workflows AND one-off announcements. |
| 2 | **Should notifications respect scheduled posts?** | **Yes.** If a blog post has `scheduled_for` set to a future timestamp, the push notification must not fire until that time. Use Vercel Cron Jobs to poll for due scheduled posts every 15 minutes. | Avoids spoiling content before the intended publish window. |
| 3 | **Anonymous vs. authenticated subscriptions?** | **Both.** Allow anonymous subscriptions (`user_id` nullable) for maximum reach. If the user is logged in, link the subscription to their `auth.users` ID so preferences persist across devices and browsers. Deduplicate by endpoint UNIQUE constraint to handle the case where the same user subscribes on multiple devices. | Balances reach (no login barrier) with cross-device preference sync for authenticated users. |
| 4 | **Notification frequency caps?** | **Yes — 1 per channel per day per subscriber, global cap of 3 per day.** | See detailed rate limiting design below. |

---

### 10.1 Rate Limiting Design (Question 4 — Recommendation)

**Recommendation: Implement rate limiting.** Without caps, a busy publishing day could flood subscribers with 5+ notifications, causing mass unsubscribes or browser-level blocks. Web push has no built-in throttle — it's entirely developer-controlled.

#### Rate Limit Rules

| Rule | Value | Enforcement Point |
|------|-------|-------------------|
| Max per channel per subscriber per day | 1 | `sendPushNotifications()` — check `last_used_at` on the subscription row |
| Max total per subscriber per day (all channels) | 3 | Same function — count of pushes in current UTC day |
| Cooldown between any two pushes to same subscriber | 60 minutes | Optional, recommended for high-volume publishers |

#### Implementation Strategy

```sql
-- Add rate limit tracking columns to push_subscriptions
ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS daily_push_count INT4 DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_push_date DATE,
  ADD COLUMN IF NOT EXISTS last_push_at TIMESTAMPTZ;
```

**Server-side logic in `sendPushNotifications()`:**

1. Before dispatching, filter subscribers: exclude any where `daily_push_date = today` AND `daily_push_count >= 3` (global cap)
2. For each dispatched subscriber, increment `daily_push_count` and update `daily_push_date` / `last_push_at`
3. On a new UTC day, `daily_push_count` naturally resets (checked against `daily_push_date`)
4. Return `{ sent, skipped_rate_limited, failed, cleaned }` for observability

#### Why This Threshold?

| Metric | Reasoning |
|--------|-----------|
| **1 per channel** | One blog notification and one event notification per day is reasonable. Users who want both get at most 2/day from auto-publish. |
| **3 global** | Leaves headroom for 1 manual admin push (e.g., "Flash sale on prints") without exceeding the daily budget. |
| **Per-subscriber, not per-user** | A user with Chrome on phone + Chrome on laptop gets 2 subscriptions — each tracked independently since they're different push endpoints. This is correct behavior. |

#### Admin Override

When an admin manually sends a push from the admin panel, a checkbox **"Bypass rate limit"** is available. This is logged in a `push_dispatch_log` table for audit. Use sparingly (emergency announcements only).

---

### 10.2 Scheduled Posts — Vercel Cron Job Design

Since the app is deployed on Vercel, use **Vercel Cron Jobs** via `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/publish-scheduled-posts",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

The `/api/cron/publish-scheduled-posts` endpoint:
1. Queries `blog_posts` WHERE `status = 'scheduled'` AND `scheduled_for <= now()`
2. Updates status to `published`, sets `published_at = now()`
3. Triggers `sendPushNotifications()` for each newly published post
4. Same pattern for `events` with `status = 'scheduled'`

---

## 11. Success Criteria

- [ ] User can opt into Blog notifications only, Event notifications only, or both
- [ ] Service Worker registers and handles push events
- [ ] Subscription stored in Supabase with correct channel tags
- [ ] Admin can view subscriber count per channel
- [ ] Admin can manually trigger a push notification
- [ ] Publishing a blog post automatically triggers push to blog subscribers
- [ ] Publishing an event automatically triggers push to event subscribers
- [ ] Notification click opens the correct URL
- [ ] Expired subscriptions (410/404) are auto-cleaned
- [ ] Works on Chrome Android with screen locked
- [ ] Works on Chrome Desktop
- [ ] No crashes when VAPID keys are missing
