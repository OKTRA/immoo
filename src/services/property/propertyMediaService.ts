import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Fonction pour télécharger une image de propriété
export const uploadPropertyImage = async (propertyId: string, file: File, isPrimary: boolean = false, description: string = '') => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${propertyId}-${uuidv4()}.${fileExt}`;
    const filePath = `${propertyId}/${fileName}`;
    
    // Téléchargement du fichier dans le bucket
    const { error: uploadError } = await supabase.storage
      .from('properties')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Récupération de l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('properties')
      .getPublicUrl(filePath);
    
    // Enregistrement des métadonnées dans la base de données
    // Seulement si l'ID n'est pas temporaire (ne commence pas par 'temp-')
    if (!propertyId.startsWith('temp-') && propertyId !== 'temp') {
      const { error: dbError } = await supabase
        .from('property_images')
        .insert({
          property_id: propertyId,
          image_url: publicUrl,
          description: description,
          is_primary: isPrimary
        });
      
      if (dbError) {
        console.warn('Could not save image metadata to database (property not created yet):', dbError);
        // Ne pas jeter d'erreur car l'upload du fichier a réussi
      }
    }
    
    return { imageUrl: publicUrl, error: null, filePath };
  } catch (error: any) {
    console.error('Error uploading property image:', error);
    return { imageUrl: '', error: error.message, filePath: '' };
  }
};

// Fonction pour récupérer toutes les images d'une propriété
export const getPropertyImages = async (propertyId: string) => {
  try {
    const { data, error } = await supabase
      .from('property_images')
      .select('*')
      .eq('property_id', propertyId)
      .order('is_primary', { ascending: false })
      .order('position', { ascending: true });
      
    if (error) throw error;
    
    return { images: data, error: null };
  } catch (error: any) {
    console.error('Error fetching property images:', error);
    return { images: [], error: error.message };
  }
};

// Fonction pour définir une image comme principale
export const setPropertyPrimaryImage = async (imageId: string, propertyId: string) => {
  try {
    // D'abord, réinitialiser toutes les images comme non principales
    const { error: resetError } = await supabase
      .from('property_images')
      .update({ is_primary: false })
      .eq('property_id', propertyId);
      
    if (resetError) throw resetError;
    
    // Ensuite, définir l'image sélectionnée comme principale
    const { error: updateError } = await supabase
      .from('property_images')
      .update({ is_primary: true })
      .eq('id', imageId);
      
    if (updateError) throw updateError;
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error setting primary image:', error);
    return { success: false, error: error.message };
  }
};

// Fonction pour supprimer une image de propriété
export const deletePropertyImage = async (imageId: string, filePath: string) => {
  try {
    // Supprimer l'entrée de la base de données
    const { error: dbError } = await supabase
      .from('property_images')
      .delete()
      .eq('id', imageId);
      
    if (dbError) throw dbError;
    
    // Supprimer le fichier du stockage si le chemin est fourni
    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from('properties')
        .remove([filePath]);
        
      if (storageError) {
        console.error('Error removing file from storage:', storageError);
        // On continue malgré l'erreur de suppression du fichier
      }
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting property image:', error);
    return { success: false, error: error.message };
  }
};

// Fonction pour mettre à jour les métadonnées d'une image
export const updatePropertyImageDetails = async (imageId: string, data: { description?: string, position?: number }) => {
  try {
    const { error } = await supabase
      .from('property_images')
      .update(data)
      .eq('id', imageId);
      
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error updating image details:', error);
    return { success: false, error: error.message };
  }
};
