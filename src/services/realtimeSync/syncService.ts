import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { realtimeErrorHandler } from './errorHandler';

type SyncEventType = 'INSERT' | 'UPDATE' | 'DELETE';
type SyncCallback = (payload: any) => void;

interface SyncSubscription {
  id: string;
  channel: RealtimeChannel;
  table: string;
  callback: SyncCallback;
}

class RealtimeSyncService {
  private subscriptions: Map<string, SyncSubscription> = new Map();
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  /**
   * Initialise le service de synchronisation
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔄 Initializing Realtime Sync Service...');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('✅ Realtime Sync Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Realtime Sync Service:', error);
      realtimeErrorHandler.reportError(
        'connection',
        'high',
        'Failed to initialize Realtime Sync Service',
        error
      );
      this.handleReconnect();
    }
  }

  /**
   * S'abonne aux changements d'une table spécifique
   */
  subscribe(
    table: string,
    callback: SyncCallback,
    options: {
      event?: SyncEventType | '*';
      filter?: string;
      schema?: string;
    } = {}
  ): string {
    const { event = '*', filter, schema = 'public' } = options;
    const subscriptionId = `${table}_${Date.now()}_${Math.random()}`;

    try {
      // Créer le channel avec un nom unique
      const channelName = `sync_${table}_${subscriptionId}`;
      const channel = supabase.channel(channelName);

      // Configuration de l'écoute des changements
      const changeConfig: any = {
        event: event,
        schema: schema,
        table: table
      };

      if (filter) {
        changeConfig.filter = filter;
      }

      channel.on('postgres_changes', changeConfig, (payload) => {
        console.log(`🔄 Realtime update for ${table}:`, payload);
        try {
          callback(payload);
        } catch (error) {
          console.error(`❌ Error in callback for ${table}:`, error);
        }
      });

      // Gérer les événements de connexion
      channel.on('system', {}, (payload) => {
        if (payload.status === 'SUBSCRIBED') {
          console.log(`✅ Subscribed to ${table} changes`);
        } else if (payload.status === 'CHANNEL_ERROR') {
          console.error(`❌ Channel error for ${table}:`, payload);
          realtimeErrorHandler.reportError(
            'subscription',
            'medium',
            `Channel error for table ${table}`,
            payload
          );
          this.handleChannelError(subscriptionId);
        }
      });

      // S'abonner au channel
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`📡 Successfully subscribed to ${table}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Failed to subscribe to ${table}`);
          realtimeErrorHandler.reportError(
            'subscription',
            'high',
            `Failed to subscribe to table ${table}`,
            { table, subscriptionId }
          );
          this.handleChannelError(subscriptionId);
        }
      });

      // Stocker la subscription
      const subscription: SyncSubscription = {
        id: subscriptionId,
        channel,
        table,
        callback
      };

      this.subscriptions.set(subscriptionId, subscription);
      console.log(`📝 Created subscription ${subscriptionId} for table ${table}`);

      return subscriptionId;
    } catch (error) {
      console.error(`❌ Failed to subscribe to ${table}:`, error);
      realtimeErrorHandler.reportError(
        'subscription',
        'critical',
        `Critical error subscribing to table ${table}`,
        error
      );
      throw error;
    }
  }

  /**
   * Se désabonne d'une table
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      try {
        subscription.channel.unsubscribe();
        this.subscriptions.delete(subscriptionId);
        console.log(`🗑️ Unsubscribed from ${subscription.table}`);
      } catch (error) {
        console.error(`❌ Error unsubscribing from ${subscription.table}:`, error);
        realtimeErrorHandler.reportError(
          'subscription',
          'low',
          `Error unsubscribing from table ${subscription.table}`,
          error
        );
      }
    }
  }

  /**
   * Se désabonne de toutes les tables
   */
  unsubscribeAll(): void {
    console.log('🗑️ Unsubscribing from all channels...');
    for (const [subscriptionId] of this.subscriptions) {
      this.unsubscribe(subscriptionId);
    }
  }

  /**
   * Gère les erreurs de channel et tente une reconnexion
   */
  private handleChannelError(subscriptionId: string): void {
    console.log(`🔄 Handling channel error for subscription ${subscriptionId}`);
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      // Réessayer la connexion après un délai
      setTimeout(() => {
        this.resubscribe(subscription);
      }, this.reconnectDelay);
    }
  }

  /**
   * Reconnecte une subscription spécifique
   */
  private resubscribe(subscription: SyncSubscription): void {
    console.log(`🔄 Resubscribing to ${subscription.table}...`);
    try {
      // Supprimer l'ancienne subscription
      this.unsubscribe(subscription.id);
      
      // Créer une nouvelle subscription
      this.subscribe(subscription.table, subscription.callback);
    } catch (error) {
      console.error(`❌ Failed to resubscribe to ${subscription.table}:`, error);
      realtimeErrorHandler.reportError(
        'subscription',
        'medium',
        `Failed to resubscribe to table ${subscription.table}`,
        error
      );
    }
  }

  /**
   * Gère la reconnexion globale
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms...`);
    
    setTimeout(() => {
      this.initialize();
    }, delay);
  }

  /**
   * Vérifie l'état de la connexion
   */
  isServiceConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Obtient le nombre de subscriptions actives
   */
  getActiveSubscriptionsCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Obtient la liste des tables surveillées
   */
  getWatchedTables(): string[] {
    return Array.from(this.subscriptions.values()).map(sub => sub.table);
  }
}

// Instance singleton du service
export const realtimeSyncService = new RealtimeSyncService();

// Types exportés
export type { SyncEventType, SyncCallback };
export { RealtimeSyncService };