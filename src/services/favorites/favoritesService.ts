import { Property } from '@/assets/types';

export interface FavoriteProperty {
  id: string;
  title: string;
  price: number;
  location: string;
  imageUrl?: string;
  addedAt: string;
}

class FavoritesService {
  private static readonly STORAGE_KEY = 'propertyFavorites';
  private static readonly FAVORITES_DETAILS_KEY = 'propertyFavoritesDetails';

  /**
   * Get all favorite property IDs
   */
  static getFavoriteIds(): string[] {
    try {
      const favorites = localStorage.getItem(this.STORAGE_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error loading favorite IDs:', error);
      return [];
    }
  }

  /**
   * Get detailed information about favorite properties
   */
  static getFavoriteDetails(): FavoriteProperty[] {
    try {
      const details = localStorage.getItem(this.FAVORITES_DETAILS_KEY);
      return details ? JSON.parse(details) : [];
    } catch (error) {
      console.error('Error loading favorite details:', error);
      return [];
    }
  }

  /**
   * Check if a property is favorited
   */
  static isFavorite(propertyId: string): boolean {
    const favorites = this.getFavoriteIds();
    return favorites.includes(propertyId);
  }

  /**
   * Add a property to favorites
   */
  static addToFavorites(property: Property): void {
    try {
      // Add to favorites list
      const favorites = this.getFavoriteIds();
      if (!favorites.includes(property.id)) {
        favorites.push(property.id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
      }

      // Add detailed information
      const details = this.getFavoriteDetails();
      const existingIndex = details.findIndex(item => item.id === property.id);
      
      const favoriteProperty: FavoriteProperty = {
        id: property.id,
        title: property.title,
        price: property.price,
        location: property.location,
        imageUrl: property.imageUrl || (property.images && property.images.length > 0 
          ? (typeof property.images[0] === 'string' ? property.images[0] : property.images[0].image_url)
          : undefined),
        addedAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        details[existingIndex] = favoriteProperty;
      } else {
        details.push(favoriteProperty);
      }

      localStorage.setItem(this.FAVORITES_DETAILS_KEY, JSON.stringify(details));
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  }

  /**
   * Remove a property from favorites
   */
  static removeFromFavorites(propertyId: string): void {
    try {
      // Remove from favorites list
      const favorites = this.getFavoriteIds();
      const filteredFavorites = favorites.filter(id => id !== propertyId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredFavorites));

      // Remove from details
      const details = this.getFavoriteDetails();
      const filteredDetails = details.filter(item => item.id !== propertyId);
      localStorage.setItem(this.FAVORITES_DETAILS_KEY, JSON.stringify(filteredDetails));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  }

  /**
   * Toggle favorite status for a property
   */
  static toggleFavorite(property: Property): boolean {
    const isFav = this.isFavorite(property.id);
    
    if (isFav) {
      this.removeFromFavorites(property.id);
      return false;
    } else {
      this.addToFavorites(property);
      return true;
    }
  }

  /**
   * Get favorites count
   */
  static getFavoritesCount(): number {
    return this.getFavoriteIds().length;
  }

  /**
   * Clear all favorites
   */
  static clearAllFavorites(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.FAVORITES_DETAILS_KEY);
    } catch (error) {
      console.error('Error clearing favorites:', error);
    }
  }

  /**
   * Export favorites data
   */
  static exportFavorites(): { ids: string[], details: FavoriteProperty[] } {
    return {
      ids: this.getFavoriteIds(),
      details: this.getFavoriteDetails()
    };
  }

  /**
   * Import favorites data
   */
  static importFavorites(data: { ids: string[], details: FavoriteProperty[] }): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data.ids));
      localStorage.setItem(this.FAVORITES_DETAILS_KEY, JSON.stringify(data.details));
    } catch (error) {
      console.error('Error importing favorites:', error);
    }
  }
}

export default FavoritesService;
