
import { supabase } from '@/lib/supabase';
import { BrowserFingerprintService } from './browserFingerprintService';

export interface VisitorSession {
  id: string;
  visitor_contact_id: string;
  session_token: string;
  browser_fingerprint?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  expires_at: string;
  last_activity_at: string;
  is_active: boolean;
  recognition_method: string;
  agency_id?: string;
}

export interface VisitorRecognition {
  visitor_contact_id?: string;
  recognition_method: string;
  session_valid: boolean;
  days_since_last_visit?: number;
}

/**
 * Service pour gérer les sessions persistantes des visiteurs
 */
export class VisitorSessionService {
  private static SESSION_TOKEN_KEY = 'visitor_session_token';
  private static VISITOR_ID_KEY = 'visitor_id';

  /**
   * Tente de reconnaître un visiteur existant
   */
  static async recognizeVisitor(
    email?: string,
    phone?: string,
    agencyId?: string
  ): Promise<VisitorRecognition> {
    try {
      console.log('VisitorSessionService - Attempting to recognize visitor');
      
      // Générer le fingerprint du navigateur
      const browserFingerprint = await BrowserFingerprintService.generateFingerprint();
      
      // Récupérer le token de session stocké
      const sessionToken = localStorage.getItem(this.SESSION_TOKEN_KEY);
      
      console.log('Recognition parameters:', {
        email: email ? '***' : 'none',
        phone: phone ? '***' : 'none',
        hasSessionToken: !!sessionToken,
        browserFingerprint: browserFingerprint.substring(0, 8) + '...',
        agencyId
      });

      // Appeler la fonction Supabase pour reconnaître le visiteur
      const { data, error } = await supabase.rpc('recognize_returning_visitor', {
        p_email: email || null,
        p_phone: phone || null,
        p_browser_fingerprint: browserFingerprint,
        p_session_token: sessionToken || null,
        p_agency_id: agencyId || null
      });

      if (error) {
        console.error('Error in recognize_returning_visitor:', error);
        return {
          recognition_method: 'none',
          session_valid: false
        };
      }

      const result = data?.[0];
      console.log('Recognition result:', result);

      if (result?.visitor_contact_id) {
        // Stocker l'ID du visiteur pour référence future
        localStorage.setItem(this.VISITOR_ID_KEY, result.visitor_contact_id);
        
        // Si c'est une reconnaissance par token valide, pas besoin de créer une nouvelle session
        if (result.session_valid) {
          console.log('Valid session found, visitor recognized via token');
        } else {
          console.log(`Visitor recognized via ${result.recognition_method}, creating new session`);
          // Créer une nouvelle session pour ce visiteur reconnu
          await this.createSession(result.visitor_contact_id, agencyId, result.recognition_method);
        }
      }

      return {
        visitor_contact_id: result?.visitor_contact_id || undefined,
        recognition_method: result?.recognition_method || 'none',
        session_valid: result?.session_valid || false,
        days_since_last_visit: result?.days_since_last_visit || undefined
      };
    } catch (error) {
      console.error('Error recognizing visitor:', error);
      return {
        recognition_method: 'none',
        session_valid: false
      };
    }
  }

  /**
   * Crée une nouvelle session pour un visiteur
   */
  static async createSession(
    visitorContactId: string,
    agencyId?: string,
    recognitionMethod: string = 'manual',
    durationDays: number = 30
  ): Promise<{ sessionToken?: string; expiresAt?: string }> {
    try {
      console.log('Creating new visitor session:', { visitorContactId, agencyId, recognitionMethod });
      
      const browserFingerprint = await BrowserFingerprintService.generateFingerprint();
      const ipAddress = await this.getClientIP();

      const { data, error } = await supabase.rpc('create_visitor_session', {
        p_visitor_contact_id: visitorContactId,
        p_agency_id: agencyId || null,
        p_browser_fingerprint: browserFingerprint,
        p_ip_address: ipAddress,
        p_user_agent: navigator.userAgent,
        p_duration_days: durationDays,
        p_recognition_method: recognitionMethod
      });

      if (error) {
        console.error('Error creating visitor session:', error);
        return {};
      }

      const result = data?.[0];
      if (result?.session_token) {
        // Stocker le token de session
        localStorage.setItem(this.SESSION_TOKEN_KEY, result.session_token);
        localStorage.setItem(this.VISITOR_ID_KEY, visitorContactId);
        
        console.log('Session created successfully, expires at:', result.expires_at);
        
        return {
          sessionToken: result.session_token,
          expiresAt: result.expires_at
        };
      }

      return {};
    } catch (error) {
      console.error('Error creating session:', error);
      return {};
    }
  }

  /**
   * Vérifie si le visiteur a accès à une agence
   */
  static hasAccessToAgency(agencyId: string): boolean {
    const sessionToken = localStorage.getItem(this.SESSION_TOKEN_KEY);
    const visitorId = localStorage.getItem(this.VISITOR_ID_KEY);
    
    // Pour l'instant, on vérifie juste si on a un token et un visitor ID
    // Dans une implémentation plus avancée, on pourrait vérifier l'agence spécifique
    return !!(sessionToken && visitorId);
  }

  /**
   * Efface la session locale
   */
  static clearLocalSession(): void {
    localStorage.removeItem(this.SESSION_TOKEN_KEY);
    localStorage.removeItem(this.VISITOR_ID_KEY);
    BrowserFingerprintService.clearCache();
    console.log('Local visitor session cleared');
  }

  /**
   * Obtient l'adresse IP du client
   */
  private static async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch (error) {
      console.warn('Could not fetch client IP:', error);
      return 'unknown';
    }
  }

  /**
   * Nettoie les sessions expirées (à appeler périodiquement)
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('cleanup_expired_visitor_sessions');
      
      if (error) {
        console.error('Error cleaning up expired sessions:', error);
        return 0;
      }
      
      console.log(`Cleaned up ${data} expired sessions`);
      return data || 0;
    } catch (error) {
      console.error('Error in cleanup:', error);
      return 0;
    }
  }

  /**
   * Obtient les statistiques de reconnaissance pour une agence
   */
  static async getRecognitionStats(agencyId: string, days: number = 30) {
    try {
      const { data, error } = await supabase
        .from('visitor_recognition_stats')
        .select('*')
        .eq('agency_id', agencyId)
        .gte('recognition_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching recognition stats:', error);
      return [];
    }
  }
}
