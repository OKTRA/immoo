import { supabase } from '@/integrations/supabase/client';

export interface UserActivity {
  user_id: string;
  activity_type: string;
  description: string;
  metadata?: Record<string, any>;
}

export class ActivityTrackingService {
  /**
   * Track a user activity
   */
  static async trackActivity(activity: UserActivity): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_activities')
        .insert([activity]);

      if (error) {
        console.error('Error tracking activity:', error);
      }
    } catch (error) {
      console.error('Failed to track activity:', error);
    }
  }

  /**
   * Track user registration
   */
  static async trackUserRegistration(userId: string, userEmail: string): Promise<void> {
    await this.trackActivity({
      user_id: userId,
      activity_type: 'user_registration',
      description: `Nouvel utilisateur inscrit: ${userEmail}`,
      metadata: { user_email: userEmail }
    });
  }

  /**
   * Track property creation
   */
  static async trackPropertyCreation(userId: string, propertyTitle: string, propertyType: string): Promise<void> {
    await this.trackActivity({
      user_id: userId,
      activity_type: 'property_created',
      description: `Nouvelle propriété créée: ${propertyTitle}`,
      metadata: { property_title: propertyTitle, property_type: propertyType }
    });
  }

  /**
   * Track agency verification
   */
  static async trackAgencyVerification(userId: string, agencyName: string, verified: boolean): Promise<void> {
    await this.trackActivity({
      user_id: userId,
      activity_type: verified ? 'agency_verified' : 'agency_verification_request',
      description: verified ? `Agence vérifiée: ${agencyName}` : `Demande de vérification: ${agencyName}`,
      metadata: { agency_name: agencyName, verified }
    });
  }

  /**
   * Track user report
   */
  static async trackUserReport(userId: string, reportSubject: string, reportCategory: string): Promise<void> {
    await this.trackActivity({
      user_id: userId,
      activity_type: 'user_report',
      description: `Signalement utilisateur: ${reportSubject}`,
      metadata: { subject: reportSubject, category: reportCategory }
    });
  }

  /**
   * Track payment events
   */
  static async trackPaymentEvent(userId: string, eventType: 'payment_success' | 'payment_failed' | 'subscription_renewed', amount?: number): Promise<void> {
    await this.trackActivity({
      user_id: userId,
      activity_type: eventType,
      description: `Événement de paiement: ${eventType}`,
      metadata: { amount, event_type: eventType }
    });
  }

  /**
   * Get recent activities for a user
   */
  static async getUserActivities(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user activities:', error);
      return [];
    }
  }

  /**
   * Get recent activities for admin dashboard
   */
  static async getRecentActivities(limit: number = 5): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }
}
