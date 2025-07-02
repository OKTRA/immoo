
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Home } from "lucide-react";
import PropertyImageGallery from './PropertyImageGallery';

interface DisplayStatus {
  label: string;
  variant: "default" | "destructive" | "secondary" | "success" | "outline";
}

interface PropertyImageDisplayProps {
  property: any;
  statusInfo: DisplayStatus;
}

export default function PropertyImageDisplay({ property, statusInfo }: PropertyImageDisplayProps) {
  return (
    <div className="mb-8 relative overflow-hidden rounded-lg">
      {property.id ? (
        <PropertyImageGallery 
          propertyId={property.id} 
          mainImageUrl={property.imageUrl}
          height="h-96"
          enableZoom={true}
          showThumbnails={true}
        />
      ) : property.imageUrl ? (
        <img 
          src={property.imageUrl} 
          alt={property.title} 
          className="w-full h-96 object-cover"
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
