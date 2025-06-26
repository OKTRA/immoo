import { supabase } from '@/lib/supabase';

/**
 * Service pour corriger automatiquement les liaisons agence-utilisateur
 */
export class AutoFixAgencyLinksService {
  
  /**
   * Corriger la liaison pour un utilisateur spécifique
   */
  static async fixUserAgencyLink(userId: string): Promise<{ success: boolean; message: string; agencyId?: string }> {
    try {
      // Récupérer le profil utilisateur
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, agency_id, role')
        .eq('id', userId)
        .single();

      if (!profile) {
        return { success: false, message: 'Utilisateur non trouvé' };
      }

      if (profile.role !== 'agency') {
        return { success: false, message: 'Utilisateur n\'est pas une agence' };
      }

      // Si l'utilisateur a déjà une agence liée, vérifier qu'elle existe
      if (profile.agency_id) {
        const { data: existingAgency } = await supabase
          .from('agencies')
          .select('id, user_id')
          .eq('id', profile.agency_id)
          .single();

        if (existingAgency) {
          // Corriger la liaison bidirectionnelle si nécessaire
          if (existingAgency.user_id !== userId) {
            await supabase
              .from('agencies')
              .update({ user_id: userId })
              .eq('id', profile.agency_id);
          }
          
          return { 
            success: true, 
            message: 'Liaison agence existante corrigée',
            agencyId: profile.agency_id 
          };
        }
      }

      // Chercher une agence orpheline avec l'email de l'utilisateur
      const { data: orphanAgency } = await supabase
        .from('agencies')
        .select('id, name, email')
        .eq('email', profile.email)
        .is('user_id', null)
        .single();

      if (orphanAgency) {
        // Lier l'agence à l'utilisateur
        await supabase
          .from('agencies')
          .update({ user_id: userId })
          .eq('id', orphanAgency.id);

        // Lier l'utilisateur à l'agence
        await supabase
          .from('profiles')
          .update({ agency_id: orphanAgency.id })
          .eq('id', userId);

        return { 
          success: true, 
          message: `Agence orpheline liée: ${orphanAgency.name}`,
          agencyId: orphanAgency.id
        };
      }

      // Créer une nouvelle agence si aucune n'existe
      const agencyName = `${profile.email.split('@')[0]} Agency`;
      
      const { data: newAgency, error: createError } = await supabase
        .from('agencies')
        .insert({
          name: agencyName,
          email: profile.email,
          description: 'Agence créée automatiquement lors de la correction',
          user_id: userId,
          status: 'active',
          is_visible: true,
          properties_count: 0,
          rating: 0.0,
          verified: false
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Lier l'utilisateur à la nouvelle agence
      await supabase
        .from('profiles')
        .update({ agency_id: newAgency.id })
        .eq('id', userId);

      return { 
        success: true, 
        message: `Nouvelle agence créée: ${newAgency.name}`,
        agencyId: newAgency.id
      };

    } catch (error: any) {
      console.error('Erreur lors de la correction de liaison agence:', error);
      return { 
        success: false, 
        message: `Erreur: ${error.message}` 
      };
    }
  }

  /**
   * Corriger toutes les liaisons agence-utilisateur manquantes
   */
  static async fixAllOrphanAgencies(): Promise<{ fixed: number; errors: string[] }> {
    let fixed = 0;
    const errors: string[] = [];

    try {
      // Trouver tous les utilisateurs d'agence sans agence liée
      const { data: orphanUsers } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('role', 'agency')
        .is('agency_id', null);

      if (orphanUsers) {
        for (const user of orphanUsers) {
          const result = await this.fixUserAgencyLink(user.id);
          if (result.success) {
            fixed++;
            console.log(`✅ ${user.email}: ${result.message}`);
          } else {
            errors.push(`❌ ${user.email}: ${result.message}`);
          }
        }
      }

      // Trouver toutes les agences sans utilisateur lié
      const { data: orphanAgencies } = await supabase
        .from('agencies')
        .select('id, email')
        .is('user_id', null);

      if (orphanAgencies) {
        for (const agency of orphanAgencies) {
          // Chercher un utilisateur avec le même email
          const { data: matchingUser } = await supabase
            .from('profiles')
            .select('id, role')
            .eq('email', agency.email)
            .eq('role', 'agency')
            .single();

          if (matchingUser) {
            await supabase
              .from('agencies')
              .update({ user_id: matchingUser.id })
              .eq('id', agency.id);

            await supabase
              .from('profiles')
              .update({ agency_id: agency.id })
              .eq('id', matchingUser.id);

            fixed++;
            console.log(`✅ Agence orpheline liée: ${agency.email}`);
          }
        }
      }

    } catch (error: any) {
      errors.push(`Erreur générale: ${error.message}`);
    }

    return { fixed, errors };
  }

  /**
   * Corriger spécifiquement l'agence d'izoflores45@gmail.com
   */
  static async fixIzofloresAgency(): Promise<{ success: boolean; message: string }> {
    const agencyId = '341e5578-5494-4ed1-b91e-36cfb2c35c27';
    const userEmail = 'izoflores45@gmail.com';

    try {
      // Récupérer l'utilisateur
      const { data: user } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (!user) {
        return { success: false, message: 'Utilisateur izoflores45@gmail.com non trouvé' };
      }

      // Lier l'agence à l'utilisateur
      await supabase
        .from('agencies')
        .update({ user_id: user.id })
        .eq('id', agencyId);

      // Lier l'utilisateur à l'agence
      await supabase
        .from('profiles')
        .update({ agency_id: agencyId })
        .eq('id', user.id);

      return { 
        success: true, 
        message: 'Agence izoflores45@gmail.com corrigée avec succès' 
      };

    } catch (error: any) {
      return { 
        success: false, 
        message: `Erreur: ${error.message}` 
      };
    }
  }
}

/**
 * Hook pour utiliser le service de correction automatique
 */
export const useAutoFixAgencyLinks = () => {
  const fixCurrentUser = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user?.id) {
      throw new Error('Utilisateur non connecté');
    }

    return AutoFixAgencyLinksService.fixUserAgencyLink(session.session.user.id);
  };

  const fixAllOrphans = async () => {
    return AutoFixAgencyLinksService.fixAllOrphanAgencies();
  };

  const fixIzoflores = async () => {
    return AutoFixAgencyLinksService.fixIzofloresAgency();
  };

  return {
    fixCurrentUser,
    fixAllOrphans,
    fixIzoflores
  };
}; 