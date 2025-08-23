import { useState, useCallback, useMemo } from 'react';
import { useQuery } from './useQueryCache';

interface PaginationOptions {
  pageSize?: number;
  initialPage?: number;
}

interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface PaginatedQueryResult<T> {
  data: T[] | null;
  total: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isLoading: boolean;
  error: Error | null;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  refetch: () => void;
}

export function usePaginatedQuery<T>(
  queryKey: string,
  queryFn: (page: number, pageSize: number) => Promise<PaginatedData<T>>,
  options: PaginationOptions = {}
): PaginatedQueryResult<T> {
  const { pageSize = 10, initialPage = 1 } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Créer une clé unique pour cette page
  const paginatedQueryKey = `${queryKey}-page-${currentPage}-size-${pageSize}`;

  const { 
    data: paginatedData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery(
    paginatedQueryKey,
    () => queryFn(currentPage, pageSize),
    {
      staleTime: 1 * 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000  // 5 minutes
    }
  );

  const totalPages = useMemo(() => {
    if (!paginatedData?.total) return 0;
    return Math.ceil(paginatedData.total / pageSize);
  }, [paginatedData?.total, pageSize]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (paginatedData?.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [paginatedData?.hasNextPage]);

  const previousPage = useCallback(() => {
    if (paginatedData?.hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [paginatedData?.hasPreviousPage]);

  return {
    data: paginatedData?.data || null,
    total: paginatedData?.total || 0,
    currentPage,
    pageSize,
    totalPages,
    hasNextPage: paginatedData?.hasNextPage || false,
    hasPreviousPage: paginatedData?.hasPreviousPage || false,
    isLoading,
    error,
    goToPage,
    nextPage,
    previousPage,
    refetch
  };
}

// Hook spécialisé pour les utilisateurs admin
export function useAdminUsers(options: PaginationOptions = {}) {
  return usePaginatedQuery(
    'admin-users',
    async (page: number, pageSize: number) => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

      // Requête pour les données
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })
        .range(start, end);

      // Requête pour le total
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error || countError) {
        throw error || countError;
      }

      return {
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        hasNextPage: (count || 0) > end + 1,
        hasPreviousPage: page > 1
      };
    },
    options
  );
}

// Hook spécialisé pour les agences admin
export function useAdminAgencies(options: PaginationOptions = {}) {
  return usePaginatedQuery(
    'admin-agencies',
    async (page: number, pageSize: number) => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

      const { data, error } = await supabase
        .from('agencies')
        .select(`
          id,
          name,
          email,
          phone,
          verified,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })
        .range(start, end);

      const { count, error: countError } = await supabase
        .from('agencies')
        .select('*', { count: 'exact', head: true });

      if (error || countError) {
        throw error || countError;
      }

      return {
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        hasNextPage: (count || 0) > end + 1,
        hasPreviousPage: page > 1
      };
    },
    options
  );
}

// Hook spécialisé pour les propriétés admin
export function useAdminProperties(options: PaginationOptions = {}) {
  return usePaginatedQuery(
    'admin-properties',
    async (page: number, pageSize: number) => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          price,
          status,
          created_at,
          updated_at,
          agencies (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .range(start, end);

      const { count, error: countError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      if (error || countError) {
        throw error || countError;
      }

      return {
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        hasNextPage: (count || 0) > end + 1,
        hasPreviousPage: page > 1
      };
    },
    options
  );
}
