
import React from 'react';

export default function PricingLoadingState() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Chargement des plans...</p>
      </div>
    </div>
  );
}
