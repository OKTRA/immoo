// OneSignal initialization helper
export const initOneSignalFromLocalConfig = () => {
  if (typeof window === 'undefined') return;
  const appId =
    localStorage.getItem('ONESIGNAL_APP_ID') ||
    import.meta.env.VITE_ONESIGNAL_APP_ID ||
    // Fallback to provided App ID if none configured
    '0d8dd206-1cbe-4a9f-9914-3f905d22d8f3';
  if (!appId) return;

  // @ts-ignore
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  // @ts-ignore
  window.OneSignalDeferred.push(async function (OneSignal) {
    try {
      await OneSignal.init({
        appId,
        safari_web_id:
          localStorage.getItem('ONESIGNAL_SAFARI_WEB_ID') ||
          import.meta.env.VITE_ONESIGNAL_SAFARI_WEB_ID ||
          undefined,
        notifyButton: { enable: true },
      });
      console.log('[OneSignal] Initialized');
    } catch (e) {
      console.error('[OneSignal] Init error', e);
    }
  });
};
