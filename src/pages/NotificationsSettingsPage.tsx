import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { initOneSignalFromLocalConfig } from '@/lib/oneSignal';
import { Textarea } from '@/components/ui/textarea';
import { sendPushNotification } from '@/services/notifications/oneSignalService';

const NotificationsSettingsPage: React.FC = () => {
  const [appId, setAppId] = useState<string>('');
  const [safariWebId, setSafariWebId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);

  useEffect(() => {
    document.title = 'Notifications settings – OneSignal';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Configure OneSignal web push notifications.');

    setAppId(localStorage.getItem('ONESIGNAL_APP_ID') || '');
    setSafariWebId(localStorage.getItem('ONESIGNAL_SAFARI_WEB_ID') || '');
  }, []);

  const handleSave = () => {
    localStorage.setItem('ONESIGNAL_APP_ID', appId.trim());
    if (safariWebId.trim()) {
      localStorage.setItem('ONESIGNAL_SAFARI_WEB_ID', safariWebId.trim());
    } else {
      localStorage.removeItem('ONESIGNAL_SAFARI_WEB_ID');
    }
    toast.success('Saved notification settings');
  };

  const handleInit = () => {
    if (!appId.trim()) {
      toast.error('Please enter your OneSignal App ID');
      return;
    }
    initOneSignalFromLocalConfig();
    toast.info('Initializing OneSignal…');
  };

  const handleSendTest = async () => {
    if (!appId.trim()) {
      toast.error('Please save your OneSignal App ID first');
      return;
    }
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    try {
      setSending(true);
      const res = await sendPushNotification({
        title: title?.trim() || 'Test notification',
        message: message.trim(),
        url: window.location.origin,
        includedSegments: ['All'],
      });
      toast.success('Notification sent');
      console.log('[OneSignal] Test notification result', res);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };
  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Notification settings (OneSignal)</h1>
        <p className="text-muted-foreground">Add your OneSignal IDs to enable web push.</p>
      </header>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>OneSignal Web SDK</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">App ID (public)</label>
              <Input value={appId} onChange={(e) => setAppId(e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Safari Web ID (optional)</label>
              <Input value={safariWebId} onChange={(e) => setSafariWebId(e.target.value)} placeholder="web.onesignal.auto.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={handleInit}>Test initialize</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Send test notification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title (optional)</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bienvenue sur IMMOO" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Un nouveau bien est disponible 🔔" />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSendTest} disabled={sending || !message.trim()}>
                {sending ? 'Sending…' : 'Send to All'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Requires Supabase Edge Function secrets (ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY) configured.</p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default NotificationsSettingsPage;
