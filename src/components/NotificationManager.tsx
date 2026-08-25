// src/components/NotificationManager.tsx
// User-facing push notification opt-in UI with channel checkboxes.
// Renders a floating panel / card for notification preferences.
// Non-intrusive: delays appearance, remembers dismissal, and auto-fades.

import { useState, useEffect, useCallback } from "react";
import { Bell, BellRing, X, Loader2 } from "lucide-react";
import { usePushNotification } from "../hooks/use-push-notification";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";

/** localStorage key for tracking dismissal */
const DISMISS_KEY = "gaspo_notif_dismissed_at";
/** How long (ms) to suppress the popup after dismissal — 7 days */
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
/** How long (ms) to wait before showing the popup on page load */
const SHOW_DELAY_MS = 5000;
/** How long (ms) to show the "Notifications Active" confirmation before auto-fading */
const AUTO_FADE_DELAY_MS = 4000;
/** Duration (ms) of the fade-out animation */
const FADE_DURATION_MS = 600;

/**
 * Checks whether the notification popup was recently dismissed.
 * Returns true if the popup should remain hidden.
 */
function isRecentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = parseInt(raw, 10);
    if (isNaN(dismissedAt)) return false;
    return Date.now() - dismissedAt < DISMISS_DURATION_MS;
  } catch {
    return false;
  }
}

/**
 * Persists the dismissal timestamp to localStorage.
 * @param permanent - If true, sets a far-future timestamp so the popup never returns.
 */
function recordDismissal(permanent = false): void {
  try {
    const ts = permanent ? Date.now() + DISMISS_DURATION_MS * 52 : Date.now(); // ~1 year for permanent
    localStorage.setItem(DISMISS_KEY, String(ts));
  } catch {
    // localStorage may be unavailable — fail silently
  }
}

export function NotificationManager() {
  const {
    permission,
    subscribed,
    preferences,
    loading,
    error,
    subscribe,
    unsubscribe,
    updatePreferences,
  } = usePushNotification();

  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [justSubscribed, setJustSubscribed] = useState(false);
  const [fading, setFading] = useState(false);

  // Delay initial render so the popup doesn't hijack the first impression
  useEffect(() => {
    if (isRecentlyDismissed()) {
      setDismissed(true);
      return;
    }
    const timer = setTimeout(() => setReady(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Auto-fade the "Notifications Active" confirmation panel
  useEffect(() => {
    if (justSubscribed) {
      const fadeTimer = setTimeout(() => {
        setFading(true);
        const removeTimer = setTimeout(() => {
          setDismissed(true);
          setJustSubscribed(false);
          setFading(false);
          // Subscribed users don't need to see this again
          recordDismissal(true);
        }, FADE_DURATION_MS);
        return () => clearTimeout(removeTimer);
      }, AUTO_FADE_DELAY_MS);
      return () => clearTimeout(fadeTimer);
    }
  }, [justSubscribed]);

  /** Dismiss handler — remembers dismissal for 7 days */
  const handleDismiss = useCallback(
    (permanent = false) => {
      setFading(true);
      setTimeout(() => {
        setDismissed(true);
        setFading(false);
        recordDismissal(permanent);
      }, FADE_DURATION_MS);
    },
    [],
  );

  // Don't render if unsupported, dismissed, not ready, or already subscribed (and not just subscribed)
  if (permission === "unsupported" || dismissed) return null;
  if (!ready) return null;
  if (subscribed && !justSubscribed) return null;

  // Shared wrapper styles with enter/fade animation
  const wrapperClassName = [
    "fixed bottom-6 right-6 z-50 max-w-sm",
    fading ? "animate-fade-out" : "animate-slide-fade-in",
  ].join(" ");

  // Denied state — show a helpful message
  if (permission === "denied") {
    return (
      <div className={wrapperClassName}>
        <style>{animationStyles}</style>
        <div className="bg-white rounded-2xl border border-border shadow-lg p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <Bell size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-dark">Notifications Blocked</p>
              <p className="text-xs text-muted-foreground mt-1">
                Enable notifications in your browser settings to stay updated on new blog posts and
                events.
              </p>
            </div>
            <button
              onClick={() => handleDismiss(true)}
              className="text-muted-foreground hover:text-dark shrink-0"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Subscribed state — show preference toggles (auto-fades)
  if (subscribed) {
    return (
      <div className={wrapperClassName}>
        <style>{animationStyles}</style>
        <div className="bg-white rounded-2xl border border-border shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BellRing size={18} className="text-primary" />
              <p className="text-sm font-semibold text-dark">Notifications Active</p>
            </div>
            <button
              onClick={() => handleDismiss(true)}
              className="text-muted-foreground hover:text-dark shrink-0"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="notif-blogs"
                className="text-sm text-dark/80 cursor-pointer select-none"
              >
                📝 New Blog Posts
              </label>
              <Switch
                id="notif-blogs"
                checked={preferences.blogs}
                onCheckedChange={(checked) => updatePreferences({ blogs: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="notif-events"
                className="text-sm text-dark/80 cursor-pointer select-none"
              >
                📅 Upcoming Events
              </label>
              <Switch
                id="notif-events"
                checked={preferences.events}
                onCheckedChange={(checked) => updatePreferences({ events: checked })}
              />
            </div>
          </div>

          <button
            onClick={unsubscribe}
            className="text-xs text-muted-foreground hover:text-red-500 transition-colors mt-4"
          >
            Unsubscribe from all notifications
          </button>
        </div>
      </div>
    );
  }

  // Default state — opt-in prompt
  return (
    <div className={wrapperClassName}>
      <style>{animationStyles}</style>
      <div className="bg-white rounded-2xl border border-border shadow-lg p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-primary" />
            <p className="text-sm font-semibold text-dark">Stay Updated</p>
          </div>
          <button
            onClick={() => handleDismiss()}
            className="text-muted-foreground hover:text-dark shrink-0"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Get notified when we publish new blog posts or announce upcoming events.
        </p>

        {error && <p className="text-xs text-red-500 mb-3 bg-red-50 rounded-lg p-2">{error}</p>}

        <Button
          onClick={async () => {
            await subscribe(preferences);
            setJustSubscribed(true);
          }}
          disabled={loading}
          className="w-full"
          size="sm"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin mr-1.5" />
              Enabling...
            </>
          ) : (
            "Enable Notifications"
          )}
        </Button>
      </div>
    </div>
  );
}

/**
 * Inline keyframe animations for the notification popup.
 * Using inline styles to avoid needing a separate CSS import.
 * Respects prefers-reduced-motion for accessibility.
 */
const animationStyles = `
  @keyframes notifSlideIn {
    from {
      opacity: 0;
      transform: translateY(16px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  @keyframes notifFadeOut {
    from {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    to {
      opacity: 0;
      transform: translateY(8px) scale(0.96);
    }
  }
  .animate-slide-fade-in {
    animation: notifSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .animate-fade-out {
    animation: notifFadeOut ${FADE_DURATION_MS}ms ease-out forwards;
    pointer-events: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .animate-slide-fade-in {
      animation: none;
      opacity: 1;
    }
    .animate-fade-out {
      animation: none;
      opacity: 0;
    }
  }
`;
