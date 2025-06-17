import { supabase } from '@/lib/supabase';

/**
 * Upload agency logo
 */
export const uploadAgencyLogo = async (agencyId: string, file: File) => {
  try {
    console.log('uploadAgencyLogo called with:', { agencyId, fileName: file.name, fileSize: file.size });

    // Create unique filename with timestamp to prevent conflicts
    const fileExt = file.name.split('.').pop();
    const fileName = `${agencyId}-logo-${Date.now()}.${fileExt}`;
    const filePath = `agency-logos/${fileName}`;
    
    console.log('Uploading to path:', filePath);

    // Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('agency-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }
    
    console.log('Upload successful:', uploadData);

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('agency-assets')
      .getPublicUrl(filePath);
    
    console.log('Public URL generated:', publicUrl);

    // Update the agency record with the new logo URL
    const { data: updateData, error: updateError } = await supabase
      .from('agencies')
      .update({ logo_url: publicUrl })
      .eq('id', agencyId)
      .select();
    
    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }
    
    console.log('Database updated successfully:', updateData);
    
    return { logoUrl: publicUrl, error: null };
  } catch (error: any) {
    console.error('Error uploading agency logo:', error);
    return { logoUrl: null, error: error.message || 'Erreur inconnue lors du téléchargement' };
  }
};
