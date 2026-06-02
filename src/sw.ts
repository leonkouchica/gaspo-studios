// src/sw.ts — Service Worker for Web Push Notifications
// Built as a separate Vite entry point with WebWorker types.
// Handles push events and notification click navigation.

/// <reference lib="WebWorker" />

declare const self: ServiceWorkerGlobalScope;

interface PushPayload {
  title: string;
  body: string;
  url: string;
  contentType: "blog" | "event";
  eventDate?: string;
}

self.addEventListener("push", (event: PushEvent) => {
  if (!event.data) return;

  try {
    const data: PushPayload = event.data.json();

    const isEvent = data.contentType === "event";
    const bodyText = isEvent && data.eventDate
      ? `📅 Date: ${data.eventDate}\n${data.body}`
      : data.body;

    const options: NotificationOptions = {
      body: bodyText,
      icon: isEvent ? "/icons/event-icon.png" : "/icons/blog-icon.png",
      badge: "/icons/android-status-badge.png",
      tag: data.contentType,
      vibrate: isEvent ? [200, 100, 200] : [100],
      data: { url: data.url },
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (err) {
    console.error("Error handling background push execution:", err);
  }
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();

  const url = event.notification.data?.url;
  if (url) {
    event.waitUntil(
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
        // Focus existing window if already open to that URL
        for (const client of clients) {
          if (client.url === url && "focus" in client) {
            return (client as WindowClient).focus();
          }
        }
        // Otherwise open new window
        return self.clients.openWindow(url);
      })
    );
  }
});

// Let the SW activate immediately without waiting for old tabs to close
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(self.clients.claim());
});
