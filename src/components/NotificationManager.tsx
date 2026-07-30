// src/components/NotificationManager.tsx
// User-facing push notification opt-in UI with channel checkboxes.
// Renders a floating panel / card for notification preferences.
// Auto-dismisses after user accepts or declines.

import { useState, useEffect } from "react";
import { Bell, BellRing, X, Loader2 } from "lucide-react";
import { usePushNotification, type UserPreferences } from "../hooks/use-push-notification";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";

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

  const [dismissed, setDismissed] = useState(false);
  const [justSubscribed, setJustSubscribed] = useState(false);

  // Auto-dismiss the "Notifications Active" panel 5 seconds after subscribing
  useEffect(() => {
    if (justSubscribed) {
      const timer = setTimeout(() => {
        setDismissed(true);
        setJustSubscribed(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [justSubscribed]);

  // Don't show anything if unsupported or permanently dismissed
  if (permission === "unsupported" || dismissed) return null;

  // Denied state — show a helpful message
  if (permission === "denied") {
    return (
      <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-4 duration-300">
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
              onClick={() => setDismissed(true)}
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

  // Subscribed state — show preference toggles (auto-dismisses after 5s)
  if (subscribed) {
    return (
      <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-2xl border border-border shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BellRing size={18} className="text-primary" />
              <p className="text-sm font-semibold text-dark">Notifications Active</p>
            </div>
            <button
              onClick={() => setDismissed(true)}
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
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded-2xl border border-border shadow-lg p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-primary" />
            <p className="text-sm font-semibold text-dark">Stay Updated</p>
          </div>
          <button
            onClick={() => setDismissed(true)}
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
