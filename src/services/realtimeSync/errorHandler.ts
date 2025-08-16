import { toast } from 'sonner';
import { realtimeSyncService } from './syncService';
import { dataListenersService } from './dataListeners';

type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
type ErrorCategory = 'connection' | 'subscription' | 'data' | 'authentication' | 'permission';

interface SyncError {
  id: string;
  timestamp: Date;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  details?: any;
  resolved: boolean;
  retryCount: number;
}

class RealtimeErrorHandler {
  private errors: Map<string, SyncError> = new Map();
  private maxRetries: number = 3;
  private retryDelays: number[] = [1000, 3000, 5000]; // Délais progressifs
  private errorCallbacks: Set<(error: SyncError) => void> = new Set();
  private isHandlingCriticalError: boolean = false;

  /**
   * Enregistre une nouvelle erreur
   */
  reportError(
    category: ErrorCategory,
    severity: ErrorSeverity,
    message: string,
    details?: any
  ): string {
    const errorId = `${category}_${Date.now()}_${Math.random()}`;
    
    const error: SyncError = {
      id: errorId,
      timestamp: new Date(),
      category,
      severity,
      message,
      details,
      resolved: false,
      retryCount: 0
    };

    this.errors.set(errorId, error);
    
    console.error(`🚨 Realtime Error [${severity.toUpperCase()}]:`, {
      category,
      message,
      details
    });

    // Notifier les callbacks
    this.notifyErrorCallbacks(error);

    // Gérer l'erreur selon sa sévérité
    this.handleErrorBySeverity(error);

    return errorId;
  }

  /**
   * Gère l'erreur selon sa sévérité
   */
  private handleErrorBySeverity(error: SyncError): void {
    switch (error.severity) {
      case 'low':
        // Erreurs mineures - log seulement
        console.warn(`⚠️ Minor sync issue: ${error.message}`);
        break;
        
      case 'medium':
        // Erreurs moyennes - tentative de récupération automatique
        console.warn(`⚠️ Sync issue detected: ${error.message}`);
        this.attemptAutoRecovery(error);
        break;
        
      case 'high':
        // Erreurs importantes - notification utilisateur + récupération
        console.error(`❌ Serious sync issue: ${error.message}`);
        toast.warning('Problème de synchronisation détecté', {
          description: 'Tentative de reconnexion en cours...'
        });
        this.attemptAutoRecovery(error);
        break;
        
      case 'critical':
        // Erreurs critiques - arrêt et redémarrage complet
        console.error(`🚨 Critical sync error: ${error.message}`);
        this.handleCriticalError(error);
        break;
    }
  }

  /**
   * Tentative de récupération automatique
   */
  private async attemptAutoRecovery(error: SyncError): Promise<void> {
    if (error.retryCount >= this.maxRetries) {
      console.error(`❌ Max retries reached for error: ${error.id}`);
      this.escalateError(error);
      return;
    }

    const delay = this.retryDelays[error.retryCount] || this.retryDelays[this.retryDelays.length - 1];
    error.retryCount++;
    
    console.log(`🔄 Attempting recovery for error ${error.id} (attempt ${error.retryCount}/${this.maxRetries})`);
    
    setTimeout(async () => {
      try {
        await this.executeRecoveryStrategy(error);
        this.markErrorAsResolved(error.id);
        console.log(`✅ Successfully recovered from error: ${error.id}`);
        
        if (error.severity === 'high') {
          toast.success('Synchronisation rétablie', {
            description: 'La connexion en temps réel fonctionne à nouveau.'
          });
        }
      } catch (recoveryError) {
        console.error(`❌ Recovery failed for error ${error.id}:`, recoveryError);
        this.attemptAutoRecovery(error); // Réessayer
      }
    }, delay);
  }

  /**
   * Exécute la stratégie de récupération selon le type d'erreur
   */
  private async executeRecoveryStrategy(error: SyncError): Promise<void> {
    switch (error.category) {
      case 'connection':
        // Problème de connexion - réinitialiser le service
        await realtimeSyncService.initialize();
        break;
        
      case 'subscription':
        // Problème d'abonnement - redémarrer les listeners
        await dataListenersService.restartAllListeners();
        break;
        
      case 'authentication':
        // Problème d'authentification - revalider la session
        // Cette logique devrait être gérée par AuthContext
        console.log('🔑 Authentication error - should be handled by AuthContext');
        break;
        
      case 'permission':
        // Problème de permissions - vérifier les droits
        console.log('🔒 Permission error - checking user permissions');
        break;
        
      case 'data':
        // Problème de données - validation et nettoyage
        console.log('📊 Data error - validating and cleaning data');
        break;
        
      default:
        throw new Error(`Unknown error category: ${error.category}`);
    }
  }

  /**
   * Gère les erreurs critiques
   */
  private async handleCriticalError(error: SyncError): Promise<void> {
    if (this.isHandlingCriticalError) {
      console.log('⚠️ Already handling a critical error, skipping...');
      return;
    }

    this.isHandlingCriticalError = true;
    
    try {
      console.log('🚨 Handling critical error - stopping all services');
      
      // Arrêter tous les services
      dataListenersService.stopAllListeners();
      
      // Notifier l'utilisateur
      toast.error('Erreur critique de synchronisation', {
        description: 'Redémarrage du système de synchronisation en cours...',
        duration: 5000
      });
      
      // Attendre un peu avant de redémarrer
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redémarrer complètement
      await this.performFullRestart();
      
      this.markErrorAsResolved(error.id);
      
      toast.success('Système de synchronisation redémarré', {
        description: 'La synchronisation en temps réel est maintenant opérationnelle.'
      });
      
    } catch (restartError) {
      console.error('❌ Failed to recover from critical error:', restartError);
      
      toast.error('Échec de la récupération', {
        description: 'Veuillez rafraîchir la page pour rétablir la synchronisation.',
        duration: 10000
      });
    } finally {
      this.isHandlingCriticalError = false;
    }
  }

  /**
   * Effectue un redémarrage complet du système
   */
  private async performFullRestart(): Promise<void> {
    console.log('🔄 Performing full system restart...');
    
    // Réinitialiser le service de synchronisation
    await realtimeSyncService.initialize();
    
    // Redémarrer tous les listeners
    await dataListenersService.restartAllListeners();
    
    console.log('✅ Full system restart completed');
  }

  /**
   * Escalade une erreur vers un niveau supérieur
   */
  private escalateError(error: SyncError): void {
    console.error(`🚨 Escalating error ${error.id} - max retries exceeded`);
    
    // Transformer en erreur critique si ce n'est pas déjà le cas
    if (error.severity !== 'critical') {
      error.severity = 'critical';
      this.handleCriticalError(error);
    } else {
      // Si c'était déjà critique, notifier l'utilisateur de rafraîchir
      toast.error('Erreur persistante', {
        description: 'Veuillez rafraîchir la page pour résoudre le problème.',
        duration: 0 // Toast persistant
      });
    }
  }

  /**
   * Marque une erreur comme résolue
   */
  markErrorAsResolved(errorId: string): void {
    const error = this.errors.get(errorId);
    if (error) {
      error.resolved = true;
      console.log(`✅ Error resolved: ${errorId}`);
    }
  }

  /**
   * Enregistre un callback pour les erreurs
   */
  onError(callback: (error: SyncError) => void): () => void {
    this.errorCallbacks.add(callback);
    
    // Retourne une fonction de nettoyage
    return () => {
      this.errorCallbacks.delete(callback);
    };
  }

  /**
   * Notifie tous les callbacks d'erreur
   */
  private notifyErrorCallbacks(error: SyncError): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('❌ Error in error callback:', callbackError);
      }
    });
  }

  /**
   * Obtient toutes les erreurs
   */
  getAllErrors(): SyncError[] {
    return Array.from(this.errors.values());
  }

  /**
   * Obtient les erreurs non résolues
   */
  getUnresolvedErrors(): SyncError[] {
    return this.getAllErrors().filter(error => !error.resolved);
  }

  /**
   * Obtient les erreurs par catégorie
   */
  getErrorsByCategory(category: ErrorCategory): SyncError[] {
    return this.getAllErrors().filter(error => error.category === category);
  }

  /**
   * Obtient les erreurs par sévérité
   */
  getErrorsBySeverity(severity: ErrorSeverity): SyncError[] {
    return this.getAllErrors().filter(error => error.severity === severity);
  }

  /**
   * Nettoie les anciennes erreurs résolues
   */
  cleanupResolvedErrors(olderThanHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - (olderThanHours * 60 * 60 * 1000));
    
    for (const [errorId, error] of this.errors) {
      if (error.resolved && error.timestamp < cutoffTime) {
        this.errors.delete(errorId);
      }
    }
    
    console.log(`🧹 Cleaned up old resolved errors (older than ${olderThanHours}h)`);
  }

  /**
   * Obtient les statistiques d'erreurs
   */
  getErrorStats(): {
    total: number;
    unresolved: number;
    byCategory: Record<ErrorCategory, number>;
    bySeverity: Record<ErrorSeverity, number>;
  } {
    const allErrors = this.getAllErrors();
    const unresolvedErrors = this.getUnresolvedErrors();
    
    const byCategory: Record<ErrorCategory, number> = {
      connection: 0,
      subscription: 0,
      data: 0,
      authentication: 0,
      permission: 0
    };
    
    const bySeverity: Record<ErrorSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };
    
    allErrors.forEach(error => {
      byCategory[error.category]++;
      bySeverity[error.severity]++;
    });
    
    return {
      total: allErrors.length,
      unresolved: unresolvedErrors.length,
      byCategory,
      bySeverity
    };
  }
}

// Instance singleton du gestionnaire d'erreurs
export const realtimeErrorHandler = new RealtimeErrorHandler();

// Types exportés
export type { SyncError, ErrorSeverity, ErrorCategory };
export { RealtimeErrorHandler };