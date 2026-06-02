// public/sw.js — Service Worker for Web Push Notifications
// Served from /public so Vite hosts it at /sw.js without compilation.
// Handles push events and notification click navigation.

/* eslint-env serviceworker */

self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const isEvent = data.contentType === "event";

    const bodyText = isEvent && data.eventDate
      ? "\uD83D\uDCC5 Date: " + data.eventDate + "\n" + data.body
      : data.body;

    const options = {
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

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data && event.notification.data.url;
  if (url) {
    event.waitUntil(
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clients) {
        for (var i = 0; i < clients.length; i++) {
          var client = clients[i];
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      })
    );
  }
});

self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});
