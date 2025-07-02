import { supabase } from '@/lib/supabase';

/**
 * Upload multiple identity photos for a tenant and return the public URLs.
 * Bucket must exist in Supabase Storage (e.g. "tenant-identity").
 */
export const uploadIdentityPhotos = async (
  tenantId: string,
  files: File[],
  bucket = 'tenant-identity'
): Promise<string[]> => {
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const filePath = `${tenantId}/${Date.now()}-${file.name}`;

    // Upload file (content-type inferred automatically)
    const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
      upsert: false,
    });

    if (error) {
      console.error('Error uploading identity photo:', error);
      throw error;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    uploadedUrls.push(data.publicUrl);
  }

  return uploadedUrls;
}; 