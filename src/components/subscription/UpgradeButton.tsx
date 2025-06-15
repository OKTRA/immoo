
import React from 'react';
import { Button } from '@/components/ui/button';
import { Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UpgradeButtonProps {
  planName?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  showIcon?: boolean;
}

export default function UpgradeButton({ 
  planName = 'Premium',
  className = '',
  variant = 'default',
  size = 'default',
  showIcon = true
}: UpgradeButtonProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const Icon = planName?.toLowerCase().includes('enterprise') ? Crown : Zap;

  return (
    <Button
      onClick={handleUpgrade}
      variant={variant}
      size={size}
      className={`bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 ${className}`}
    >
      {showIcon && <Icon className="mr-2 h-4 w-4" />}
      Passer {planName}
    </Button>
  );
}
