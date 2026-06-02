// src/components/NotificationBell.tsx
// Optional navbar bell icon that shows notification subscription status.
// Tapping opens the NotificationManager panel or navigates to preferences.

import { Bell, BellRing } from "lucide-react";
import { usePushNotification } from "../hooks/use-push-notification";

interface NotificationBellProps {
  onClick: () => void;
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const { subscribed } = usePushNotification();

  if (subscribed) {
    return (
      <button
        onClick={onClick}
        className="relative p-2 text-white/70 hover:text-white transition-colors"
        aria-label="Notification preferences"
      >
        <BellRing size={20} className="text-green-400" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="p-2 text-white/50 hover:text-white transition-colors"
      aria-label="Enable notifications"
    >
      <Bell size={20} />
    </button>
  );
}
