import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';

interface FavoritesCounterProps {
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
}

export default function FavoritesCounter({ 
  className = '', 
  showText = true,
  variant = 'ghost',
  size = 'default'
}: FavoritesCounterProps) {
  const navigate = useNavigate();
  const { favoritesCount, isLoading } = useFavorites();

  const handleClick = () => {
    navigate('/favorites');
  };

  if (isLoading) {
    return (
      <Button
        variant={variant}
        size={size}
        className={`relative ${className}`}
        disabled
      >
        <Heart className="h-4 w-4" />
        {showText && <span className="ml-2">Favoris</span>}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={`relative ${className} ${
        favoritesCount > 0 ? 'text-red-600 hover:text-red-700' : ''
      }`}
      title={`${favoritesCount} favori${favoritesCount > 1 ? 's' : ''}`}
    >
      <Heart 
        className={`h-4 w-4 ${
          favoritesCount > 0 ? 'fill-red-500 text-red-500' : ''
        }`} 
      />
      {showText && (
        <span className="ml-2">
          Favoris
          {favoritesCount > 0 && ` (${favoritesCount})`}
        </span>
      )}
      
      {/* Counter badge */}
      {favoritesCount > 0 && !showText && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {favoritesCount > 99 ? '99+' : favoritesCount}
        </Badge>
      )}
    </Button>
  );
}
