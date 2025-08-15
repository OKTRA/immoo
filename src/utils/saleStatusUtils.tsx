import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, DollarSign, XCircle, AlertCircle } from 'lucide-react';

export interface SaleStatusConfig {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const getSaleStatusConfig = (status: string): SaleStatusConfig => {
  switch (status) {
    case 'available':
      return {
        label: 'À vendre',
        variant: 'default',
        className: 'bg-green-100 text-green-800 hover:bg-green-200',
        icon: CheckCircle
      };
    case 'pending':
      return {
        label: 'Vente en cours',
        variant: 'secondary',
        className: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
        icon: Clock
      };
    case 'sold':
      return {
        label: 'Vendu',
        variant: 'outline',
        className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
        icon: DollarSign
      };
    case 'withdrawn':
      return {
        label: 'Vente suspendue',
        variant: 'destructive',
        className: 'bg-red-100 text-red-800 hover:bg-red-200',
        icon: XCircle
      };
    default:
      return {
        label: 'À vendre',
        variant: 'secondary',
        className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
        icon: AlertCircle
      };
  }
};

export const SaleStatusBadge: React.FC<{ 
  status: string; 
  size?: 'sm' | 'default'; 
  showIcon?: boolean;
}> = ({ 
  status, 
  size = 'default', 
  showIcon = true 
}) => {
  const config = getSaleStatusConfig(status);
  const IconComponent = config.icon;
  
  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${size === 'sm' ? 'text-xs' : ''}`}
    >
      {showIcon && <IconComponent className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />}
      {config.label}
    </Badge>
  );
};
