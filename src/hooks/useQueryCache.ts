import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

interface CacheOptions {
  staleTime?: number; // Temps en ms avant que les données soient considérées comme périmées
  cacheTime?: number; // Temps en ms avant que les données soient supprimées du cache
}

class QueryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private subscribers = new Map<string, Set<() => void>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.timestamp + entry.expiresIn) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const { cacheTime = 5 * 60 * 1000 } = options; // 5 minutes par défaut
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: cacheTime
    });

    // Notifier les subscribers
    const subs = this.subscribers.get(key);
    if (subs) {
      subs.forEach(callback => callback());
    }
  }

  subscribe(key: string, callback: () => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    
    this.subscribers.get(key)!.add(callback);
    
    // Retourner une fonction de nettoyage
    return () => {
      const subs = this.subscribers.get(key);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    const subs = this.subscribers.get(key);
    if (subs) {
      subs.forEach(callback => callback());
    }
  }

  clear(): void {
    this.cache.clear();
    this.subscribers.clear();
  }
}

const queryCache = new QueryCache();

export function useQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options: CacheOptions & { enabled?: boolean } = {}
) {
  const { staleTime = 30 * 1000, enabled = true } = options; // 30 secondes par défaut
  
  const [data, setData] = useState<T | null>(() => queryCache.get<T>(key));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;

    const cachedData = queryCache.get<T>(key);
    const now = Date.now();
    
    // Si on a des données en cache et qu'elles ne sont pas périmées
    if (cachedData && !force) {
      const entry = (queryCache as any).cache.get(key);
      const isDataStale = now > entry.timestamp + staleTime;
      
      setData(cachedData);
      setIsStale(isDataStale);
      
      // Si les données sont périmées, refetch en arrière-plan
      if (isDataStale) {
        try {
          const freshData = await queryFnRef.current();
          queryCache.set(key, freshData, options);
          setData(freshData);
          setIsStale(false);
        } catch (err) {
          console.error('Background refetch failed:', err);
        }
      }
      return;
    }

    // Sinon, fetch les données
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await queryFnRef.current();
      queryCache.set(key, result, options);
      setData(result);
      setIsStale(false);
    } catch (err) {
      setError(err as Error);
      console.error('Query failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [key, enabled, staleTime, options]);

  // Subscribe aux changements du cache
  useEffect(() => {
    const unsubscribe = queryCache.subscribe(key, () => {
      const newData = queryCache.get<T>(key);
      if (newData !== null) {
        setData(newData);
        setIsStale(false);
      }
    });

    return unsubscribe;
  }, [key]);

  // Fetch initial
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const invalidate = useCallback(() => {
    queryCache.invalidate(key);
  }, [key]);

  return {
    data,
    isLoading,
    error,
    isStale,
    refetch,
    invalidate
  };
}

export function useMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    invalidateQueries?: string[];
  } = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (variables: TVariables) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await mutationFn(variables);
      
      // Invalider les queries spécifiées
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach(key => {
          queryCache.invalidate(key);
        });
      }
      
      options.onSuccess?.(result, variables);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error, variables);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, options]);

  return {
    mutate,
    isLoading,
    error
  };
}

export { queryCache };
