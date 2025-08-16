import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { mobileSyncService, MobileSyncState } from '@/services/realtimeSync/mobileSyncService';
import { useRealtimeSync } from './useRealtimeSync';

interface UseMobileSyncReturn {
  isMobile: boolean;
  syncState: MobileSyncState;
  isOnline: boolean;
  isAppActive: boolean;
  isSyncActive: boolean;
  forceResync: () => Promise<void>;
  connectionType: string;
}

/**
 * Hook personnalisé pour la synchronisation mobile avec gestion des états natifs
 * 
 * @returns Objet contenant l'état de synchronisation mobile et les méthodes de contrôle
 */
export function useMobileSync(): UseMobileSyncReturn {
  const [syncState, setSyncState] = useState<MobileSyncState>({
    isOnline: true,
    isAppActive: true,
    connectionType: 'unknown',
    lastSyncTime: null,
    syncPaused: false
  });

  const isMobile = Capacitor.isNativePlatform();

  // Fonction pour mettre à jour l'état
  const updateSyncState = useCallback(() => {
    const currentState = mobileSyncService.getState();
    setSyncState(currentState);
  }, []);

  // Fonction pour forcer une resynchronisation
  const forceResync = useCallback(async () => {
    await mobileSyncService.forceResync();
    updateSyncState();
  }, [updateSyncState]);

  // Effet pour surveiller l'état de synchronisation
  useEffect(() => {
    if (!isMobile) {
      // Sur web, on utilise des valeurs par défaut
      setSyncState({
        isOnline: navigator.onLine,
        isAppActive: !document.hidden,
        connectionType: 'unknown',
        lastSyncTime: new Date(),
        syncPaused: false
      });
      return;
    }

    // Mettre à jour l'état initial
    updateSyncState();

    // Surveiller les changements d'état toutes les 2 secondes
    const interval = setInterval(updateSyncState, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [isMobile, updateSyncState]);

  // Effet pour surveiller les changements de visibilité sur web
  useEffect(() => {
    if (isMobile) return;

    const handleVisibilityChange = () => {
      setSyncState(prev => ({
        ...prev,
        isAppActive: !document.hidden
      }));
    };

    const handleOnlineChange = () => {
      setSyncState(prev => ({
        ...prev,
        isOnline: navigator.onLine
      }));
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnlineChange);
    window.addEventListener('offline', handleOnlineChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnlineChange);
      window.removeEventListener('offline', handleOnlineChange);
    };
  }, [isMobile]);

  return {
    isMobile,
    syncState,
    isOnline: syncState.isOnline,
    isAppActive: syncState.isAppActive,
    isSyncActive: mobileSyncService.isSyncActive(),
    forceResync,
    connectionType: syncState.connectionType
  };
}

/**
 * Hook combiné pour la synchronisation mobile et table
 * 
 * @param table - Nom de la table à surveiller
 * @param callback - Fonction appelée lors des changements
 * @param options - Options de configuration
 * @returns Objet combinant les fonctionnalités mobile et table sync
 */
export function useMobileTableSync(
  table: string,
  callback: (payload: any) => void,
  options: any = {}
) {
  const mobileSync = useMobileSync();
  const tableSync = useRealtimeSync(table, callback, {
    ...options,
    enabled: mobileSync.isSyncActive && (options.enabled !== false)
  });

  return {
    ...mobileSync,
    ...tableSync,
    // Override isConnected to include mobile state
    isConnected: tableSync.isConnected && mobileSync.isSyncActive
  };
}

/**
 * Hook pour surveiller l'état de connexion réseau uniquement
 * 
 * @returns État de la connexion réseau
 */
export function useNetworkStatus() {
  const { isOnline, connectionType, syncState } = useMobileSync();
  
  return {
    isOnline,
    connectionType,
    lastSyncTime: syncState.lastSyncTime
  };
}

/**
 * Hook pour surveiller l'état de l'application uniquement
 * 
 * @returns État de l'application (active/background)
 */
export function useAppState() {
  const { isAppActive, isMobile } = useMobileSync();
  
  return {
    isAppActive,
    isMobile
  };
}