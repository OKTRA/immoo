
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown, AlertTriangle } from 'lucide-react';

interface LimitWarningProps {
  resourceType: string;
  currentCount: number;
  maxAllowed: number;
  onUpgrade?: () => void;
}

export default function LimitWarning({ 
  resourceType, 
  currentCount, 
  maxAllowed, 
  onUpgrade 
}: LimitWarningProps) {
  const percentage = (currentCount / maxAllowed) * 100;
  
  if (percentage < 80) return null;

  const getResourceLabel = (type: string) => {
    switch (type) {
      case 'properties': return 'propriétés';
      case 'agencies': return 'agences';
      case 'leases': return 'baux';
      case 'users': return 'utilisateurs';
      default: return type;
    }
  };

  const isAtLimit = percentage >= 100;
  const isNearLimit = percentage >= 80 && percentage < 100;

  return (
    <Alert className={`border-l-4 ${isAtLimit ? 'border-red-500 bg-red-50' : 'border-orange-500 bg-orange-50'}`}>
      <AlertTriangle className={`h-4 w-4 ${isAtLimit ? 'text-red-600' : 'text-orange-600'}`} />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p className={`font-semibold ${isAtLimit ? 'text-red-800' : 'text-orange-800'}`}>
            {isAtLimit ? 'Limite atteinte!' : 'Limite bientôt atteinte'}
          </p>
          <p className={`text-sm ${isAtLimit ? 'text-red-700' : 'text-orange-700'}`}>
            Vous avez utilisé {currentCount}/{maxAllowed} {getResourceLabel(resourceType)}.
            {isAtLimit && ' Passez à un plan supérieur pour continuer.'}
          </p>
        </div>
        {onUpgrade && (
          <Button 
            onClick={onUpgrade}
            className="ml-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Crown className="mr-2 h-4 w-4" />
            Passer Premium
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
