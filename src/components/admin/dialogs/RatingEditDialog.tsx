
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Star } from 'lucide-react';
import { Agency } from '@/hooks/useAgenciesManagement';

interface RatingEditDialogProps {
  agency: Agency;
  isOpen: boolean;
  onClose: () => void;
  onSave: (rating: number) => void;
}

export function RatingEditDialog({
  agency,
  isOpen,
  onClose,
  onSave
}: RatingEditDialogProps) {
  const [rating, setRating] = useState(agency.rating || 0);

  useEffect(() => {
    setRating(agency.rating || 0);
  }, [agency.rating, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(rating);
    onClose();
  };

  const renderStars = (value: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(value) 
            ? 'text-yellow-500 fill-yellow-500' 
            : i < value 
            ? 'text-yellow-500 fill-yellow-500/50' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier l'évaluation</DialogTitle>
          <DialogDescription>
            Modifier l'évaluation de l'agence "{agency.name}"
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="text-center">
              <div className="flex justify-center items-center space-x-1 mb-2">
                {renderStars(rating)}
              </div>
              <p className="text-sm text-muted-foreground">
                {rating.toFixed(1)} / 5.0
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating-slider">Évaluation</Label>
              <Slider
                id="rating-slider"
                min={0}
                max={5}
                step={0.1}
                value={[rating]}
                onValueChange={(values) => setRating(values[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating-input">Valeur précise</Label>
              <Input
                id="rating-input"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(Math.min(5, Math.max(0, parseFloat(e.target.value) || 0)))}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Sauvegarder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
