
import React, { ReactNode } from 'react';

interface PublicPageWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper pour les pages publiques qui empêche toute redirection d'authentification
 * Cette composant garantit que les pages publiques restent accessibles sans authentification
 */
const PublicPageWrapper: React.FC<PublicPageWrapperProps> = ({ children }) => {
  // Ce wrapper ne fait aucune vérification d'authentification
  // Il sert uniquement à documenter explicitement qu'une page est publique
  // et à empêcher toute logique d'authentification de s'immiscer
  
  console.log('PublicPageWrapper - Rendering public page');
  
  return <>{children}</>;
};

export default PublicPageWrapper;
