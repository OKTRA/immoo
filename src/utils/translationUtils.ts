import { TFunction } from 'react-i18next';

export const getPropertyStatusLabel = (status: string, t: TFunction): string => {
  const translation = t(`propertyDetails.status.${status}`);
  
  // If translation returns the same key, it means the translation is missing
  if (translation === `propertyDetails.status.${status}`) {
    // Fallback to a simple status mapping
    const statusMap: Record<string, string> = {
      'available': 'Disponible',
      'rented': 'Loué',
      'occupied': 'Occupé',
      'sold': 'Vendu',
      'pending': 'En attente'
    };
    return statusMap[status] || status;
  }
  return translation;
};

export const getPropertyStatusVariant = (status: string) => {
  switch (status) {
    case 'available': return 'default';
    case 'sold': return 'destructive';
    case 'rented':
    case 'occupied': return 'success';
    default: return 'secondary';
  }
};