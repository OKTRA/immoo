import { Capacitor } from '@capacitor/core';

declare global {
  interface Window {
    OneSignal?: any;
    cordova?: any;
  }
}
// OneSignal initialization helper (Web v16 and Capacitor Mobile)
export const initOneSignalFromLocalConfig = () => {
  if (typeof window === 'undefined') return;

  // Skip OneSignal initialization in development mode (localhost)
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.includes('localhost');
  
  const isDevelopment = (import.meta as any).env?.DEV || 
                       (import.meta as any).env?.NODE_ENV === 'development';
  
  if (isLocalhost || isDevelopment) {
    console.log('[OneSignal] Skipping initialization in development mode');
    return;
  }

  const appId =
    localStorage.getItem('ONESIGNAL_APP_ID') ||
    // Vite env var support
    (import.meta as any).env?.VITE_ONESIGNAL_APP_ID ||
    // Fallback to provided App ID if none configured
    '0d8dd206-1cbe-4a9f-9914-3f905d22d8f3';
  if (!appId) return;

  // If running on a native platform (iOS/Android), initialize the Capacitor plugin directly
  if (Capacitor?.isNativePlatform?.()) {
    (async () => {
      try {
        const plugin = window.OneSignal;
        if (!plugin || typeof plugin.initialize !== 'function') {
          console.warn('[OneSignal] Cordova/Capacitor plugin not available. Ensure onesignal-cordova-plugin is installed and synced.');
          return;
        }
        await plugin.initialize(appId);
        try {
          await plugin.Notifications.requestPermission(true);
        } catch {
          // ignore
        }
        // Optionally attach listeners, e.g. notification click
        // await plugin.Notifications.addClickListener(() => {});
        // eslint-disable-next-line no-console
        console.log('[OneSignal] Mobile plugin initialized');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[OneSignal] Mobile init error', error);
      }
    })();
    return;
  }

  // Defer until the Web SDK is available
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.OneSignalDeferred.push(async function (OneSignal: any) {
    try {
      // If Web v16 SDK is present, it exposes init(options)
      if (typeof OneSignal?.init === 'function') {
        await OneSignal.init({
          appId,
          serviceWorkerPath: '/OneSignalSDKWorker.js',
          serviceWorkerParam: { scope: '/' },
          // Helpful when testing on localhost per OneSignal Web docs
          allowLocalhostAsSecureOrigin: true,
          safari_web_id:
            localStorage.getItem('ONESIGNAL_SAFARI_WEB_ID') ||
            (import.meta as any).env?.VITE_ONESIGNAL_SAFARI_WEB_ID ||
            undefined,
          notifyButton: { enable: true },
        });
        // Auto-request permission on web and ensure subscription is created
        try {
          const status = await OneSignal.Notifications.permission;
          if (status === 'default') {
            const res = await OneSignal.Notifications.requestPermission(true);
            if (res === 'granted') {
              await OneSignal.User.PushSubscription.optIn?.();
            }
          } else if (status === 'granted') {
            await OneSignal.User.PushSubscription.optIn?.();
          }
        } catch {
          // noop
        }
        console.log('[OneSignal] Web SDK initialized');
        return;
      }

      // If Capacitor/Cordova Mobile plugin is present, it exposes initialize(appId)
      if (typeof OneSignal?.initialize === 'function') {
        await OneSignal.initialize(appId);
        // On Android 13+ this will prompt; on iOS it registers for push
        try {
          await OneSignal.Notifications.requestPermission(true);
        } catch {
          // ignore
        }
        console.log('[OneSignal] Mobile plugin initialized');
        return;
      }

      console.warn('[OneSignal] SDK not available yet');
    } catch (e) {
      console.error('[OneSignal] Init error', e);
    }
  });
};
