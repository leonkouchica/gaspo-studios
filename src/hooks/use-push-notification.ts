// src/hooks/use-push-notification.ts
// React hook for managing push notification subscriptions.
// Encapsulates SW registration, subscription, and preference management.

import { useState, useEffect, useCallback } from "react";
import {
  subscribeToPush,
  unsubscribeFromPush,
  updatePushPreferences,
} from "../lib/actions/push";

// ── Types ────────────────────────────────────────────────────────────────────

export interface UserPreferences {
  blogs: boolean;
  events: boolean;
}

type PushPermission = "default" | "granted" | "denied" | "unsupported";

interface UsePushNotificationReturn {
  permission: PushPermission;
  subscribed: boolean;
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
  subscribe: (prefs: UserPreferences) => Promise<void>;
  unsubscribe: () => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "mobile";
  if (/iPhone|iPad|iPod/i.test(ua)) return "mobile";
  if (/tablet|playbook|silk/i.test(ua.toLowerCase())) return "tablet";
  return "desktop";
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function usePushNotification(): UsePushNotificationReturn {
  const [permission, setPermission] = useState<PushPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    blogs: true,
    events: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);

  // Check browser support and current state on mount
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPermission("unsupported");
      return;
    }

    setPermission(Notification.permission as PushPermission);

    // Check if already subscribed
    navigator.serviceWorker.ready.then(async (registration) => {
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setSubscribed(true);
        setCurrentEndpoint(existingSubscription.endpoint);
      }
    });
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async (prefs: UserPreferences) => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setError("Push notifications are not supported in this browser.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm as PushPermission);

      if (perm !== "granted") {
        setError("Notification permission was denied. Enable it in your browser settings.");
        setLoading(false);
        return;
      }

      // 2. Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js", {
        type: "module",
      });

      // 3. Get VAPID public key
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        setError("Push notification configuration is missing (VAPID key).");
        setLoading(false);
        return;
      }

      // 4. Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const subscriptionJSON = subscription.toJSON();
      const endpoint = subscriptionJSON.endpoint!;
      const p256dhKey = (subscriptionJSON.keys as any)?.p256dh || "";
      const authKey = (subscriptionJSON.keys as any)?.auth || "";

      // 5. Send to backend via TanStack server function
      await subscribeToPush({
        data: {
          endpoint,
          p256dhKey,
          authKey,
          channels: prefs,
          userAgent: navigator.userAgent,
          deviceType: getDeviceType(),
        },
      });

      setSubscribed(true);
      setCurrentEndpoint(endpoint);
      setPreferences(prefs);
    } catch (err: any) {
      setError(err.message || "Failed to subscribe to notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Remove from backend via server function
      if (currentEndpoint) {
        await unsubscribeFromPush({
          data: { endpoint: currentEndpoint },
        });
      }

      // Remove browser subscription
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }

      setSubscribed(false);
      setCurrentEndpoint(null);
    } catch (err: any) {
      setError(err.message || "Failed to unsubscribe.");
    } finally {
      setLoading(false);
    }
  }, [currentEndpoint]);

  // Update channel preferences without re-subscribing
  const updatePreferences = useCallback(async (prefs: Partial<UserPreferences>) => {
    if (!currentEndpoint) return;

    const updatedPrefs = { ...preferences, ...prefs };
    setPreferences(updatedPrefs);

    try {
      await updatePushPreferences({
        data: {
          endpoint: currentEndpoint,
          channels: updatedPrefs,
        },
      });
    } catch (err: any) {
      setError(err.message || "Failed to update preferences.");
    }
  }, [currentEndpoint, preferences]);

  return {
    permission,
    subscribed,
    preferences,
    loading,
    error,
    subscribe,
    unsubscribe,
    updatePreferences,
  };
}
