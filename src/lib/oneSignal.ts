// OneSignal initialization helper
export const initOneSignalFromLocalConfig = () => {
  if (typeof window === 'undefined') return;
  const appId = localStorage.getItem('ONESIGNAL_APP_ID');
  if (!appId) return;

  // @ts-ignore
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  // @ts-ignore
  window.OneSignalDeferred.push(async function (OneSignal) {
    try {
      await OneSignal.init({
        appId,
        safari_web_id: localStorage.getItem('ONESIGNAL_SAFARI_WEB_ID') || undefined,
        notifyButton: { enable: true },
      });
      console.log('[OneSignal] Initialized');
    } catch (e) {
      console.error('[OneSignal] Init error', e);
    }
  });
};
