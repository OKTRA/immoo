import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Home } from "lucide-react";
import PropertyImageGallery from './PropertyImageGallery';

interface DisplayStatus {
  label: string;
  variant: "default" | "destructive" | "secondary" | "success" | "outline";
}

interface PropertyImageDisplayProps {
  property: {
    id: string;
    title: string;
    images?: Array<{ id: string; image_url: string; is_primary: boolean; }>;
  };
  statusInfo: DisplayStatus;
}

export default function PropertyImageDisplay({ property, statusInfo }: PropertyImageDisplayProps) {
  const mainImageUrl = property.images?.[0]?.image_url || '/placeholder.svg';

  return (
    <div className="mb-8 relative overflow-hidden rounded-lg">
      {property.id ? (
        <PropertyImageGallery 
          propertyId={property.id} 
          mainImageUrl={(property as any).image_url}
          images={property.images || []}
          height="h-96"
          showControls={true}
        />
      ) : (
        <div className="w-full h-96 bg-muted flex items-center justify-center">
          <Home className="h-16 w-16 text-muted-foreground" />
        </div>
      )}
      <Badge 
        className="absolute top-4 right-4 text-sm px-3 py-1 z-20" 
        variant={statusInfo.variant}
      >
        {statusInfo.label}
      </Badge>
    </div>
  );
}
