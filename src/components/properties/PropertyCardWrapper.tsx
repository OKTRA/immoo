
import React from 'react';
import { Link } from 'react-router-dom';

interface PropertyCardWrapperProps {
  children: React.ReactNode;
  isPublicView: boolean;
  onCardClick?: (e: React.MouseEvent) => void;
  propertyUrl: string;
}

export default function PropertyCardWrapper({ 
  children, 
  isPublicView, 
  onCardClick, 
  propertyUrl 
}: PropertyCardWrapperProps) {
  if (isPublicView) {
    return (
      <div onClick={onCardClick} className="cursor-pointer">
        {children}
      </div>
    );
  }
  
  return (
    <Link to={propertyUrl} className="block">
      {children}
    </Link>
  );
}
