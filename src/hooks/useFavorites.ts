import { useState, useEffect, useCallback } from 'react';
import { Property } from '@/assets/types';
import FavoritesService, { FavoriteProperty } from '@/services/favorites/favoritesService';
import { toast } from 'sonner';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favoritesDetails, setFavoritesDetails] = useState<FavoriteProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites on mount
  useEffect(() => {
    const loadFavorites = () => {
      try {
        const favoriteIds = FavoritesService.getFavoriteIds();
        const details = FavoritesService.getFavoriteDetails();
        
        setFavorites(new Set(favoriteIds));
        setFavoritesDetails(details);
      } catch (error) {
        console.error('Error loading favorites:', error);
        toast.error('Erreur lors du chargement des favoris');
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, []);

  // Check if a property is favorited
  const isFavorite = useCallback((propertyId: string): boolean => {
    return favorites.has(propertyId);
  }, [favorites]);

  // Toggle favorite status
  const toggleFavorite = useCallback((property: Property) => {
    try {
      const wasAdded = FavoritesService.toggleFavorite(property);
      
      // Update local state
      const newFavorites = new Set(favorites);
      if (wasAdded) {
        newFavorites.add(property.id);
        // Propriété ajoutée aux favoris
      } else {
        newFavorites.delete(property.id);
        // Propriété retirée des favoris
      }
      
      setFavorites(newFavorites);
      
      // Update details
      const updatedDetails = FavoritesService.getFavoriteDetails();
      setFavoritesDetails(updatedDetails);
      
      return wasAdded;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Erreur lors de la modification des favoris');
      return false;
    }
  }, [favorites]);

  // Add to favorites
  const addToFavorites = useCallback((property: Property) => {
    if (!isFavorite(property.id)) {
      toggleFavorite(property);
    }
  }, [isFavorite, toggleFavorite]);

  // Remove from favorites
  const removeFromFavorites = useCallback((propertyId: string) => {
    if (isFavorite(propertyId)) {
      try {
        FavoritesService.removeFromFavorites(propertyId);
        
        const newFavorites = new Set(favorites);
        newFavorites.delete(propertyId);
        setFavorites(newFavorites);
        
        const updatedDetails = FavoritesService.getFavoriteDetails();
        setFavoritesDetails(updatedDetails);
        
        // Propriété retirée des favoris
      } catch (error) {
        console.error('Error removing from favorites:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  }, [favorites, isFavorite]);

  // Clear all favorites
  const clearAllFavorites = useCallback(() => {
    try {
      FavoritesService.clearAllFavorites();
      setFavorites(new Set());
      setFavoritesDetails([]);
      toast.success('Tous les favoris ont été supprimés');
    } catch (error) {
      console.error('Error clearing favorites:', error);
      toast.error('Erreur lors de la suppression des favoris');
    }
  }, []);

  // Get favorites count
  const favoritesCount = favorites.size;

  return {
    favorites: Array.from(favorites),
    favoritesSet: favorites,
    favoritesDetails,
    favoritesCount,
    isLoading,
    isFavorite,
    toggleFavorite,
    addToFavorites,
    removeFromFavorites,
    clearAllFavorites
  };
};
