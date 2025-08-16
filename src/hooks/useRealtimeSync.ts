import { useEffect, useRef, useCallback, useState } from 'react';
import { realtimeSyncService, SyncCallback, SyncEventType } from '@/services/realtimeSync/syncService';

interface UseRealtimeSyncOptions {
  event?: SyncEventType | '*';
  filter?: string;
  schema?: string;
  enabled?: boolean;
}

interface UseRealtimeSyncReturn {
  isConnected: boolean;
  subscriptionId: string | null;
  error: string | null;
  resubscribe: () => void;
}

/**
 * Hook personnalisé pour la synchronisation en temps réel avec Supabase
 * 
 * @param table - Nom de la table à surveiller
 * @param callback - Fonction appelée lors des changements
 * @param options - Options de configuration
 * @returns Objet contenant l'état de la connexion et les méthodes de contrôle
 */
export function useRealtimeSync(
  table: string,
  callback: SyncCallback,
  options: UseRealtimeSyncOptions = {}
): UseRealtimeSyncReturn {
  const { enabled = true, ...syncOptions } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  
  const callbackRef = useRef(callback);
  const optionsRef = useRef(syncOptions);
  
  // Mettre à jour les refs quand les props changent
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  useEffect(() => {
    optionsRef.current = syncOptions;
  }, [syncOptions]);

  // Fonction pour s'abonner
  const subscribe = useCallback(() => {
    if (!enabled || !table) return;
    
    try {
      setError(null);
      
      const wrappedCallback: SyncCallback = (payload) => {
        setIsConnected(true);
        callbackRef.current(payload);
      };
      
      const id = realtimeSyncService.subscribe(table, wrappedCallback, optionsRef.current);
      setSubscriptionId(id);
      setIsConnected(true);
      
      console.log(`🔗 useRealtimeSync: Subscribed to ${table} with ID ${id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsConnected(false);
      console.error(`❌ useRealtimeSync: Failed to subscribe to ${table}:`, err);
    }
  }, [table, enabled]);

  // Fonction pour se désabonner
  const unsubscribe = useCallback(() => {
    if (subscriptionId) {
      try {
        realtimeSyncService.unsubscribe(subscriptionId);
        setSubscriptionId(null);
        setIsConnected(false);
        console.log(`🔌 useRealtimeSync: Unsubscribed from ${table}`);
      } catch (err) {
        console.error(`❌ useRealtimeSync: Failed to unsubscribe from ${table}:`, err);
      }
    }
  }, [subscriptionId, table]);

  // Fonction pour se réabonner
  const resubscribe = useCallback(() => {
    console.log(`🔄 useRealtimeSync: Resubscribing to ${table}...`);
    unsubscribe();
    setTimeout(subscribe, 100); // Petit délai pour éviter les conflits
  }, [subscribe, unsubscribe, table]);

  // Effet pour gérer l'abonnement
  useEffect(() => {
    if (enabled && table) {
      subscribe();
    }
    
    return () => {
      unsubscribe();
    };
  }, [enabled, table, subscribe, unsubscribe]);

  // Effet pour initialiser le service si nécessaire
  useEffect(() => {
    const initializeService = async () => {
      if (!realtimeSyncService.isServiceConnected()) {
        try {
          await realtimeSyncService.initialize();
        } catch (err) {
          console.error('❌ useRealtimeSync: Failed to initialize service:', err);
        }
      }
    };
    
    initializeService();
  }, []);

  return {
    isConnected,
    subscriptionId,
    error,
    resubscribe
  };
}

/**
 * Hook simplifié pour surveiller une table spécifique avec des callbacks typés
 */
export function useTableSync<T = any>(
  table: string,
  onInsert?: (record: T) => void,
  onUpdate?: (record: T, oldRecord?: T) => void,
  onDelete?: (record: T) => void,
  options: UseRealtimeSyncOptions = {}
) {
  const callback: SyncCallback = useCallback((payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        onInsert?.(newRecord);
        break;
      case 'UPDATE':
        onUpdate?.(newRecord, oldRecord);
        break;
      case 'DELETE':
        onDelete?.(oldRecord);
        break;
      default:
        console.log(`📡 ${table} change:`, payload);
    }
  }, [onInsert, onUpdate, onDelete, table]);

  return useRealtimeSync(table, callback, options);
}

/**
 * Hook pour surveiller plusieurs tables simultanément
 */
export function useMultiTableSync(
  tables: Array<{
    name: string;
    callback: SyncCallback;
    options?: UseRealtimeSyncOptions;
  }>
) {
  const [connections, setConnections] = useState<Record<string, UseRealtimeSyncReturn>>({});

  useEffect(() => {
    const newConnections: Record<string, UseRealtimeSyncReturn> = {};
    
    tables.forEach(({ name }) => {
      newConnections[name] = {
        isConnected: false,
        subscriptionId: null,
        error: null,
        resubscribe: () => {}
      };
    });
    
    setConnections(newConnections);
  }, [tables]);

  // Utiliser le hook pour chaque table
  tables.forEach(({ name, callback, options }) => {
    const result = useRealtimeSync(name, callback, options);
    
    useEffect(() => {
      setConnections(prev => ({
        ...prev,
        [name]: result
      }));
    }, [name, result]);
  });

  const allConnected = Object.values(connections).every(conn => conn.isConnected);
  const hasErrors = Object.values(connections).some(conn => conn.error);
  
  const resubscribeAll = useCallback(() => {
    Object.values(connections).forEach(conn => conn.resubscribe());
  }, [connections]);

  return {
    connections,
    allConnected,
    hasErrors,
    resubscribeAll
  };
}