import { supabase } from '@/lib/supabase';

export class PropertyImageService {
  private static readonly BUCKET_NAME = 'property-images';
  private static readonly PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&h=600';

  /**
   * Get the public URL for a property image
   */
  static getImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) {
      return this.PLACEHOLDER_IMAGE;
    }

    // If it's already a full URL (external image), return as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    // If it's a path in our bucket, get the public URL
    try {
      const { data } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(imageUrl);
      
      return data?.publicUrl || this.PLACEHOLDER_IMAGE;
    } catch (error) {
      console.error('Error getting image URL:', error);
      return this.PLACEHOLDER_IMAGE;
    }
  }

  /**
   * Upload a new property image
   */
  static async uploadImage(file: File, propertyId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${propertyId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading image:', error);
        return null;
      }

      return data.path;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  }

  /**
   * Delete a property image
   */
  static async deleteImage(imagePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([imagePath]);

      if (error) {
        console.error('Error deleting image:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  /**
   * Get multiple image URLs for a property
   */
  static getMultipleImageUrls(imageUrls: string[]): string[] {
    return imageUrls.map(url => this.getImageUrl(url));
  }
} 