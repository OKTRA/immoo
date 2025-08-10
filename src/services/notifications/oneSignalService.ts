import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface SendNotificationInput {
  title?: string;
  message: string;
  url?: string;
  data?: Record<string, unknown>;
  includedExternalUserIds?: string[];
  includedSegments?: string[];
}

export async function sendPushNotification(input: SendNotificationInput) {
  const { data, error } = await supabase.functions.invoke('onesignal-notify', {
    body: input,
  });
  if (error) throw error;
  return data;
}





