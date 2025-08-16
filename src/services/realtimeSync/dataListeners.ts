import { supabase } from '@/lib/supabase';
import { realtimeSyncService } from './syncService';
import { realtimeErrorHandler } from './errorHandler';

// Types pour les données critiques
interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  status: 'available' | 'rented' | 'sold' | 'maintenance';
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface Lease {
  id: string;
  property_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  status: 'active' | 'expired' | 'terminated';
  created_at: string;
  updated_at: string;
}

interface Payment {
  id: string;
  lease_id: string;
  amount: number;
  payment_date: string;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'owner' | 'tenant' | 'admin';
  phone?: string;
  updated_at: string;
}

// Service de gestion des listeners pour les données critiques
class DataListenersService {
  private activeListeners: Set<string> = new Set();
  private dataCache: Map<string, any[]> = new Map();
  private callbacks: Map<string, Set<(data: any) => void>> = new Map();

  /**
   * Initialise tous les listeners pour les données critiques
   */
  async initializeAllListeners(userId?: string): Promise<void> {
    console.log('🎯 Initializing data listeners for critical tables...');
    
    try {
      // Initialiser le service de synchronisation
      await realtimeSyncService.initialize();
      
      // Démarrer les listeners pour chaque table critique
      this.startPropertiesListener(userId);
      this.startLeasesListener(userId);
      this.startPaymentsListener(userId);
      this.startProfilesListener(userId);
      
      console.log('✅ All data listeners initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize data listeners:', error);
      realtimeErrorHandler.reportError(
        'data',
        'critical',
        'Failed to initialize all data listeners',
        error
      );
      throw error;
    }
  }

  /**
   * Listener pour les propriétés
   */
  private startPropertiesListener(userId?: string): void {
    const listenerId = 'properties_listener';
    
    if (this.activeListeners.has(listenerId)) {
      console.log('⚠️ Properties listener already active');
      return;
    }

    const filter = userId ? `owner_id=eq.${userId}` : undefined;
    
    const subscriptionId = realtimeSyncService.subscribe(
      'properties',
      (payload) => this.handlePropertyChange(payload),
      { filter }
    );
    
    this.activeListeners.add(listenerId);
    console.log(`📡 Properties listener started with filter: ${filter || 'none'}`);
  }

  /**
   * Listener pour les baux
   */
  private startLeasesListener(userId?: string): void {
    const listenerId = 'leases_listener';
    
    if (this.activeListeners.has(listenerId)) {
      console.log('⚠️ Leases listener already active');
      return;
    }

    // Pour les baux, on peut filtrer par propriétaire via une jointure
    // ou écouter tous les changements si l'utilisateur est admin
    const subscriptionId = realtimeSyncService.subscribe(
      'leases',
      (payload) => this.handleLeaseChange(payload)
    );
    
    this.activeListeners.add(listenerId);
    console.log('📡 Leases listener started');
  }

  /**
   * Listener pour les paiements
   */
  private startPaymentsListener(userId?: string): void {
    const listenerId = 'payments_listener';
    
    if (this.activeListeners.has(listenerId)) {
      console.log('⚠️ Payments listener already active');
      return;
    }

    const subscriptionId = realtimeSyncService.subscribe(
      'payments',
      (payload) => this.handlePaymentChange(payload)
    );
    
    this.activeListeners.add(listenerId);
    console.log('📡 Payments listener started');
  }

  /**
   * Listener pour les profils utilisateur
   */
  private startProfilesListener(userId?: string): void {
    const listenerId = 'profiles_listener';
    
    if (this.activeListeners.has(listenerId)) {
      console.log('⚠️ Profiles listener already active');
      return;
    }

    const filter = userId ? `id=eq.${userId}` : undefined;
    
    const subscriptionId = realtimeSyncService.subscribe(
      'profiles',
      (payload) => this.handleProfileChange(payload),
      { filter }
    );
    
    this.activeListeners.add(listenerId);
    console.log(`📡 Profiles listener started with filter: ${filter || 'none'}`);
  }

  /**
   * Gestionnaire des changements de propriétés
   */
  private handlePropertyChange(payload: any): void {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    console.log(`🏠 Property ${eventType}:`, { new: newRecord, old: oldRecord });
    
    // Mettre à jour le cache local
    this.updateCache('properties', eventType, newRecord, oldRecord);
    
    // Notifier les composants abonnés
    this.notifyCallbacks('properties', { eventType, new: newRecord, old: oldRecord });
    
    // Actions spécifiques selon le type d'événement
    switch (eventType) {
      case 'INSERT':
        console.log(`✨ Nouvelle propriété ajoutée: ${newRecord.title}`);
        break;
      case 'UPDATE':
        console.log(`📝 Propriété mise à jour: ${newRecord.title}`);
        if (oldRecord.status !== newRecord.status) {
          console.log(`🔄 Statut changé: ${oldRecord.status} → ${newRecord.status}`);
        }
        break;
      case 'DELETE':
        console.log(`🗑️ Propriété supprimée: ${oldRecord.title}`);
        break;
    }
  }

  /**
   * Gestionnaire des changements de baux
   */
  private handleLeaseChange(payload: any): void {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    console.log(`📋 Lease ${eventType}:`, { new: newRecord, old: oldRecord });
    
    this.updateCache('leases', eventType, newRecord, oldRecord);
    this.notifyCallbacks('leases', { eventType, new: newRecord, old: oldRecord });
    
    switch (eventType) {
      case 'INSERT':
        console.log(`✨ Nouveau bail créé pour la propriété ${newRecord.property_id}`);
        break;
      case 'UPDATE':
        console.log(`📝 Bail mis à jour: ${newRecord.id}`);
        if (oldRecord.status !== newRecord.status) {
          console.log(`🔄 Statut du bail changé: ${oldRecord.status} → ${newRecord.status}`);
        }
        break;
      case 'DELETE':
        console.log(`🗑️ Bail supprimé: ${oldRecord.id}`);
        break;
    }
  }

  /**
   * Gestionnaire des changements de paiements
   */
  private handlePaymentChange(payload: any): void {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    console.log(`💰 Payment ${eventType}:`, { new: newRecord, old: oldRecord });
    
    this.updateCache('payments', eventType, newRecord, oldRecord);
    this.notifyCallbacks('payments', { eventType, new: newRecord, old: oldRecord });
    
    switch (eventType) {
      case 'INSERT':
        console.log(`✨ Nouveau paiement enregistré: ${newRecord.amount}€`);
        break;
      case 'UPDATE':
        console.log(`📝 Paiement mis à jour: ${newRecord.id}`);
        if (oldRecord.status !== newRecord.status) {
          console.log(`🔄 Statut du paiement changé: ${oldRecord.status} → ${newRecord.status}`);
          if (newRecord.status === 'paid') {
            console.log(`✅ Paiement confirmé: ${newRecord.amount}€`);
          }
        }
        break;
      case 'DELETE':
        console.log(`🗑️ Paiement supprimé: ${oldRecord.id}`);
        break;
    }
  }

  /**
   * Gestionnaire des changements de profils
   */
  private handleProfileChange(payload: any): void {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    console.log(`👤 Profile ${eventType}:`, { new: newRecord, old: oldRecord });
    
    this.updateCache('profiles', eventType, newRecord, oldRecord);
    this.notifyCallbacks('profiles', { eventType, new: newRecord, old: oldRecord });
    
    switch (eventType) {
      case 'INSERT':
        console.log(`✨ Nouveau profil créé: ${newRecord.email}`);
        break;
      case 'UPDATE':
        console.log(`📝 Profil mis à jour: ${newRecord.email}`);
        break;
      case 'DELETE':
        console.log(`🗑️ Profil supprimé: ${oldRecord.email}`);
        break;
    }
  }

  /**
   * Met à jour le cache local des données
   */
  private updateCache(table: string, eventType: string, newRecord: any, oldRecord: any): void {
    const cacheKey = table;
    let cachedData = this.dataCache.get(cacheKey) || [];
    
    switch (eventType) {
      case 'INSERT':
        cachedData.push(newRecord);
        break;
      case 'UPDATE':
        const updateIndex = cachedData.findIndex(item => item.id === newRecord.id);
        if (updateIndex !== -1) {
          cachedData[updateIndex] = newRecord;
        }
        break;
      case 'DELETE':
        cachedData = cachedData.filter(item => item.id !== oldRecord.id);
        break;
    }
    
    this.dataCache.set(cacheKey, cachedData);
  }

  /**
   * Notifie les callbacks enregistrés
   */
  private notifyCallbacks(table: string, data: any): void {
    const callbacks = this.callbacks.get(table);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in callback for ${table}:`, error);
          realtimeErrorHandler.reportError(
            'data',
            'medium',
            `Error in ${table} data handler`,
            error
          );
        }
      });
    }
  }

  /**
   * Enregistre un callback pour une table
   */
  registerCallback(table: string, callback: (data: any) => void): () => void {
    if (!this.callbacks.has(table)) {
      this.callbacks.set(table, new Set());
    }
    
    this.callbacks.get(table)!.add(callback);
    
    // Retourne une fonction de nettoyage
    return () => {
      this.callbacks.get(table)?.delete(callback);
    };
  }

  /**
   * Obtient les données en cache pour une table
   */
  getCachedData(table: string): any[] {
    return this.dataCache.get(table) || [];
  }

  /**
   * Arrête tous les listeners
   */
  stopAllListeners(): void {
    console.log('🛑 Stopping all data listeners...');
    realtimeSyncService.unsubscribeAll();
    this.activeListeners.clear();
    this.dataCache.clear();
    this.callbacks.clear();
    console.log('✅ All data listeners stopped');
  }

  /**
   * Redémarre tous les listeners
   */
  async restartAllListeners(userId?: string): Promise<void> {
    console.log('🔄 Restarting all data listeners...');
    this.stopAllListeners();
    await this.initializeAllListeners(userId);
  }

  /**
   * Obtient le statut des listeners
   */
  getListenersStatus(): {
    active: string[];
    serviceConnected: boolean;
    cacheSize: Record<string, number>;
  } {
    const cacheSize: Record<string, number> = {};
    for (const [table, data] of this.dataCache) {
      cacheSize[table] = data.length;
    }
    
    return {
      active: Array.from(this.activeListeners),
      serviceConnected: realtimeSyncService.isServiceConnected(),
      cacheSize
    };
  }
}

// Instance singleton du service
export const dataListenersService = new DataListenersService();

// Types exportés
export type { Property, Lease, Payment, UserProfile };
export { DataListenersService };