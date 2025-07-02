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
    imageUrl?: string;
    images?: Array<{ id: string; image_url: string; is_primary: boolean; description?: string; }>;
  };
  statusInfo: DisplayStatus;
}

export default function PropertyImageDisplay({ property, statusInfo }: PropertyImageDisplayProps) {
  return (
    <div className="mb-8 relative">
      {property.id ? (
        <PropertyImageGallery 
          propertyId={property.id} 
          mainImageUrl={property.imageUrl || (property as any).image_url}
          images={property.images || []}
          height="h-96"
          showControls={true}
          showThumbnails={true}
          enableZoom={true}
          className="rounded-lg overflow-hidden shadow-lg"
        />
      ) : (
        <div className="w-full h-96 bg-muted flex items-center justify-center rounded-lg">
          <Home className="h-16 w-16 text-muted-foreground" />
        </div>
      )}
      <Badge 
        className="absolute top-4 right-4 text-sm px-3 py-1 z-30 shadow-md" 
        variant={statusInfo.variant}
      >
        {statusInfo.label}
      </Badge>
    </div>
  );
}
