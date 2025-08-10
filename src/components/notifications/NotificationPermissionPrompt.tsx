import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void>;
  }
}

export default function NotificationPermissionPrompt() {
  const [shouldPrompt, setShouldPrompt] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Must be secure context for Push (localhost allowed)
    const isSecure = window.isSecureContext || location.hostname === "localhost";
    if (!isSecure || !("Notification" in window)) {
      setChecking(false);
      setShouldPrompt(false);
      return;
    }

    const permission = Notification.permission; // 'default' | 'granted' | 'denied'
    if (permission === "granted") {
      setChecking(false);
      setShouldPrompt(false);
      return;
    }

    // If not granted, also check if OneSignal already has a subscription
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      try {
        const subId = await OneSignal.User.PushSubscription.getId();
        setShouldPrompt(!subId);
      } catch {
        setShouldPrompt(true);
      } finally {
        setChecking(false);
      }
    });
  }, []);

  const requestPermission = () => {
    if (typeof window === "undefined") return;
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      try {
        const res = await OneSignal.Notifications.requestPermission();
        if (res === "granted") {
          // Ensure a subscription is created
          await OneSignal.User.PushSubscription.optIn?.();
          const id = await OneSignal.User.PushSubscription.getId();
          if (id) setShouldPrompt(false);
        }
      } catch {
        // ignore
      }
    });
  };

  if (checking || !shouldPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border bg-white shadow-md p-4">
      <div className="text-sm font-medium mb-2">Activer les notifications</div>
      <div className="text-sm text-muted-foreground mb-3">
        Recevez les nouveautés et alertes immobilières d'IMMOO.
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={() => setShouldPrompt(false)}>
          Plus tard
        </Button>
        <Button size="sm" onClick={requestPermission}>
          Autoriser
        </Button>
      </div>
    </div>
  );
}


