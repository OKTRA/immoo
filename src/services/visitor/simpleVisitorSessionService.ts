import { supabase } from '@/lib/supabase';

export interface SimpleVisitorSession {
  id: string;
  session_id: string;
  email?: string;
  phone?: string;
  name?: string;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
  last_activity_at: string;
}

export class SimpleVisitorSessionService {
  private static readonly STORAGE_KEY = 'immoo_simple_visitor_session';

  /**
   * Create a new visitor session (persists until manual logout)
   */
  static async createSession(contactInfo: {
    email?: string;
    phone?: string;
    name?: string;
  }): Promise<SimpleVisitorSession | null> {
    try {
      const sessionId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('💾 Creating session with ID:', sessionId);
      console.log('💾 Contact info:', contactInfo);
      
      const { data, error } = await supabase
        .from('simple_visitor_sessions')
        .insert({
          session_id: sessionId,
          email: contactInfo.email,
          phone: contactInfo.phone,
          name: contactInfo.name,
          is_active: true,
          expires_at: null // Session ne expire jamais automatiquement
        })
        .select()
        .single();

      if (error) {
        console.error('💾 Error creating visitor session:', error);
        return null;
      }

      console.log('💾 Session created successfully:', data);
      
      // Store session ID in localStorage
      try {
        localStorage.setItem(this.STORAGE_KEY, sessionId);
        console.log('💾 Session ID stored in localStorage');
        console.log('💾 localStorage test read:', localStorage.getItem(this.STORAGE_KEY));
      } catch (localStorageError) {
        console.error('💾 localStorage error:', localStorageError);
      }
      
      return data;
    } catch (error) {
      console.error('💾 Exception in createSession:', error);
      return null;
    }
  }

  /**
   * Get current session from localStorage and validate
   */
  static async getCurrentSession(): Promise<SimpleVisitorSession | null> {
    try {
      const sessionId = localStorage.getItem(this.STORAGE_KEY);
      if (!sessionId) return null;

      const { data, error } = await supabase
        .from('simple_visitor_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        // Session not found or inactive, cleanup localStorage
        localStorage.removeItem(this.STORAGE_KEY);
        return null;
      }

      // Update last activity
      await this.updateLastActivity(sessionId);
      
      return data;
    } catch (error) {
      console.error('Error getting current session:', error);
      localStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }

  /**
   * Update last activity timestamp
   */
  static async updateLastActivity(sessionId: string): Promise<void> {
    try {
      await supabase
        .from('simple_visitor_sessions')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('session_id', sessionId);
    } catch (error) {
      console.error('Error updating last activity:', error);
    }
  }

  /**
   * End current session
   */
  static async endSession(): Promise<void> {
    try {
      const sessionId = localStorage.getItem(this.STORAGE_KEY);
      if (sessionId) {
        // Mark session as inactive in database
        await supabase
          .from('simple_visitor_sessions')
          .update({ is_active: false })
          .eq('session_id', sessionId);
      }
      
      // Remove from localStorage
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error ending session:', error);
      // Still remove from localStorage even if DB update fails
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Check if user has an active session
   */
  static hasActiveSession(): boolean {
    return !!localStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * Get session contact info from localStorage
   */
  static getLocalSessionInfo(): { email?: string; phone?: string; name?: string } | null {
    try {
      const sessionId = localStorage.getItem(this.STORAGE_KEY);
      if (!sessionId) return null;

      // For now, we'll need to fetch from DB
      // In the future, we could cache this info locally
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Cleanup inactive sessions (can be called periodically)
   */
  static async cleanupInactiveSessions(): Promise<void> {
    try {
      await supabase.rpc('cleanup_inactive_visitor_sessions');
    } catch (error) {
      console.error('Error cleaning up inactive sessions:', error);
    }
  }
} 