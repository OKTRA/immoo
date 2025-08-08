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
    // Obtenir l'adresse IP du visiteur (côté client, on peut utiliser un service externe)
    const visitorData = {
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    };

    const { error } = await supabase
      .from('visitor_contacts')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        contact_type: 'view',
        visitor_ip: null, // À implémenter avec un service d'IP
        user_agent: visitorData.user_agent,
        referrer: visitorData.referrer,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Erreur lors de l\'enregistrement de la vue:', error);
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la vue:', error);
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
    const { count, error } = await supabase
      .from('visitor_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('contact_type', 'view');

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
    const { count, error } = await supabase
      .from('visitor_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('contact_type', 'view')
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