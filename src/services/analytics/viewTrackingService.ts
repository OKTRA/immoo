import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface ViewRecord {
  id?: string;
  entity_type: 'property' | 'agency';
  entity_id: string;
  visitor_ip?: string;
  user_agent?: string;
  referrer?: string;
  created_at?: string;
}

/**
 * Enregistre une vue pour une propriété ou une agence
 */
export async function recordView(entityType: 'property' | 'agency', entityId: string): Promise<void> {
  try {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : undefined;

    const payload: Record<string, any> = {
      user_agent: userAgent,
      created_at: new Date().toISOString(),
      purpose: 'view',
    };

    if (entityType === 'agency') {
      payload.agency_id = entityId;
    } else {
      payload.property_id = entityId;
    }

    const { error } = await supabase
      .from('visitor_contacts')
      .insert(payload);

    if (error) {
      console.error("Erreur lors de l'enregistrement de la vue:", error);
    }
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la vue:", error);
  }
}

/**
 * Hook pour enregistrer automatiquement une vue lors du montage du composant
 */
export function useViewTracking(entityType: 'property' | 'agency', entityId: string | undefined) {
  const [hasRecorded, setHasRecorded] = useState(false);

  useEffect(() => {
    if (entityId && !hasRecorded) {
      recordView(entityType, entityId);
      setHasRecorded(true);
    }
  }, [entityType, entityId, hasRecorded]);

  return { hasRecorded };
}

/**
 * Obtient le nombre de vues pour une entité
 */
export async function getViewsCount(entityType: 'property' | 'agency', entityId: string): Promise<number> {
  try {
    const idColumn = entityType === 'agency' ? 'agency_id' : 'property_id';
    const { count, error } = await supabase
      .from('visitor_contacts')
      .select('*', { count: 'exact', head: true })
      .eq(idColumn as any, entityId)
      .eq('purpose', 'view');

    if (error) {
      console.error('Erreur lors de la récupération du nombre de vues:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre de vues:', error);
    return 0;
  }
}

/**
 * Obtient les vues par période pour une entité
 */
export async function getViewsByPeriod(
  entityType: 'property' | 'agency',
  entityId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  try {
    const idColumn = entityType === 'agency' ? 'agency_id' : 'property_id';
    const { count, error } = await supabase
      .from('visitor_contacts')
      .select('*', { count: 'exact', head: true })
      .eq(idColumn as any, entityId)
      .eq('purpose', 'view')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) {
      console.error('Erreur lors de la récupération des vues par période:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Erreur lors de la récupération des vues par période:', error);
    return 0;
  }
}