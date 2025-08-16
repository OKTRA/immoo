import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { App } from '@capacitor/app';
import { realtimeSyncService } from './syncService';
import { dataListenersService } from './dataListeners';
import { realtimeErrorHandler } from './errorHandler';

interface MobileSyncState {
  isOnline: boolean;
  isAppActive: boolean;
  connectionType: string;
  lastSyncTime: Date | null;
  syncPaused: boolean;
}

class MobileSyncService {
  private state: MobileSyncState = {
    isOnline: true,
    isAppActive: true,
    connectionType: 'unknown',
    lastSyncTime: null,
    syncPaused: false
  };

  private networkListener: any = null;
  private appStateListener: any = null;
  private syncResumeTimeout: NodeJS.Timeout | null = null;

  /**
   * Initialise le service de synchronisation mobile
   */
  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('📱 MobileSyncService: Running on web, using standard sync');
      return;
    }

    try {
      console.log('📱 Initializing Mobile Sync Service...');
      
      // Vérifier l'état initial du réseau
      await this.checkNetworkStatus();
      
      // Configurer les listeners
      await this.setupNetworkListener();
      await this.setupAppStateListener();
      
      console.log('✅ Mobile Sync Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Mobile Sync Service:', error);
      realtimeErrorHandler.reportError(
        'connection',
        'high',
        'Failed to initialize Mobile Sync Service',
        error
      );
    }
  }

  /**
   * Vérifie l'état du réseau
   */
  private async checkNetworkStatus(): Promise<void> {
    try {
      const status = await Network.getStatus();
      this.state.isOnline = status.connected;
      this.state.connectionType = status.connectionType;
      
      console.log(`📶 Network status: ${status.connected ? 'Online' : 'Offline'} (${status.connectionType})`);
      
      if (!status.connected && !this.state.syncPaused) {
        await this.pauseSync('Network disconnected');
      } else if (status.connected && this.state.syncPaused) {
        await this.resumeSync('Network reconnected');
      }
    } catch (error) {
      console.error('❌ Error checking network status:', error);
    }
  }

  /**
   * Configure l'écoute des changements de réseau
   */
  private async setupNetworkListener(): Promise<void> {
    try {
      this.networkListener = await Network.addListener('networkStatusChange', async (status) => {
        console.log(`📶 Network status changed: ${status.connected ? 'Online' : 'Offline'} (${status.connectionType})`);
        
        const wasOnline = this.state.isOnline;
        this.state.isOnline = status.connected;
        this.state.connectionType = status.connectionType;
        
        if (!status.connected && !this.state.syncPaused) {
          await this.pauseSync('Network disconnected');
        } else if (status.connected && !wasOnline) {
          await this.resumeSync('Network reconnected');
        }
      });
    } catch (error) {
      console.error('❌ Error setting up network listener:', error);
    }
  }

  /**
   * Configure l'écoute des changements d'état de l'application
   */
  private async setupAppStateListener(): Promise<void> {
    try {
      this.appStateListener = await App.addListener('appStateChange', async ({ isActive }) => {
        console.log(`📱 App state changed: ${isActive ? 'Active' : 'Background'}`);
        
        const wasActive = this.state.isAppActive;
        this.state.isAppActive = isActive;
        
        if (!isActive && !this.state.syncPaused) {
          // L'app passe en arrière-plan, on peut réduire la fréquence de sync
          console.log('📱 App backgrounded, reducing sync frequency');
        } else if (isActive && !wasActive) {
          // L'app revient au premier plan, on reprend la sync normale
          console.log('📱 App foregrounded, resuming normal sync');
          await this.resumeSync('App foregrounded');
        }
      });
    } catch (error) {
      console.error('❌ Error setting up app state listener:', error);
    }
  }

  /**
   * Met en pause la synchronisation
   */
  private async pauseSync(reason: string): Promise<void> {
    if (this.state.syncPaused) return;
    
    try {
      console.log(`⏸️ Pausing sync: ${reason}`);
      this.state.syncPaused = true;
      
      // Arrêter les listeners de données
      await dataListenersService.stopAllListeners();
      
      // Nettoyer les abonnements
      realtimeSyncService.unsubscribeAll();
      
    } catch (error) {
      console.error('❌ Error pausing sync:', error);
    }
  }

  /**
   * Reprend la synchronisation
   */
  private async resumeSync(reason: string): Promise<void> {
    if (!this.state.syncPaused) return;
    
    try {
      console.log(`▶️ Resuming sync: ${reason}`);
      
      // Attendre un peu avant de reprendre pour éviter les reconnexions rapides
      if (this.syncResumeTimeout) {
        clearTimeout(this.syncResumeTimeout);
      }
      
      this.syncResumeTimeout = setTimeout(async () => {
        try {
          this.state.syncPaused = false;
          this.state.lastSyncTime = new Date();
          
          // Réinitialiser le service de sync
          await realtimeSyncService.initialize();
          
          // Redémarrer les listeners de données
          await dataListenersService.initializeAllListeners();
          
          console.log('✅ Sync resumed successfully');
        } catch (error) {
          console.error('❌ Error resuming sync:', error);
          realtimeErrorHandler.reportError(
            'connection',
            'medium',
            'Failed to resume sync after network reconnection',
            error
          );
        }
      }, 2000); // Attendre 2 secondes
      
    } catch (error) {
      console.error('❌ Error resuming sync:', error);
    }
  }

  /**
   * Force une resynchronisation complète
   */
  async forceResync(): Promise<void> {
    try {
      console.log('🔄 Forcing complete resync...');
      
      // Arrêter tout
      await this.pauseSync('Force resync requested');
      
      // Attendre un moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reprendre
      await this.resumeSync('Force resync');
      
    } catch (error) {
      console.error('❌ Error during force resync:', error);
    }
  }

  /**
   * Nettoie les listeners
   */
  async cleanup(): Promise<void> {
    try {
      console.log('🧹 Cleaning up Mobile Sync Service...');
      
      if (this.syncResumeTimeout) {
        clearTimeout(this.syncResumeTimeout);
        this.syncResumeTimeout = null;
      }
      
      if (this.networkListener) {
        this.networkListener.remove();
        this.networkListener = null;
      }
      
      if (this.appStateListener) {
        this.appStateListener.remove();
        this.appStateListener = null;
      }
      
      console.log('✅ Mobile Sync Service cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up Mobile Sync Service:', error);
    }
  }

  /**
   * Retourne l'état actuel du service
   */
  getState(): MobileSyncState {
    return { ...this.state };
  }

  /**
   * Vérifie si la synchronisation est active
   */
  isSyncActive(): boolean {
    return this.state.isOnline && this.state.isAppActive && !this.state.syncPaused;
  }

  /**
   * Vérifie si on est sur une plateforme mobile
   */
  isMobilePlatform(): boolean {
    return Capacitor.isNativePlatform();
  }
}

// Instance singleton
export const mobileSyncService = new MobileSyncService();
export { MobileSyncService };
export type { MobileSyncState };