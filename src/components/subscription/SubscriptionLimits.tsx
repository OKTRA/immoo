import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSubscriptionLimits } from '@/hooks/subscription/useSubscriptionLimits';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const SubscriptionLimits = () => {
  const { limits, isLoading } = useSubscriptionLimits();

  if (isLoading || !limits) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Chargement des limites d'abonnement...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const renderLimitBar = (label: string, limit: any) => (
    <div key={label} className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium capitalize">{label}</span>
        <span className="text-muted-foreground">
          {limit.currentCount} / {limit.maxAllowed || 'Illimité'}
        </span>
      </div>
      <Progress 
        value={limit.percentageUsed} 
        className={`h-2 ${limit.percentageUsed >= 90 ? 'bg-destructive/20' : ''}`}
      />
      {limit.percentageUsed >= 90 && (
        <p className="text-xs text-muted-foreground mt-1">
          Vous approchez de la limite de votre abonnement
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {limits.anyLimitReached && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Limite d'abonnement atteinte</AlertTitle>
          <AlertDescription>
            Vous avez atteint la limite de votre abonnement actuel. Pour continuer à ajouter du contenu, veuillez mettre à niveau votre abonnement.
            <Button variant="link" className="px-0 ml-2 h-auto" asChild>
              <Link href="/pricing">
                Voir les offres
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Votre utilisation</CardTitle>
        </CardHeader>
        <CardContent>
          {renderLimitBar('Agences', limits.agencies)}
          {renderLimitBar('Propriétés', limits.properties)}
          {renderLimitBar('Baux', limits.leases)}
          {renderLimitBar('Utilisateurs', limits.users)}
          
          <div className="mt-6 pt-4 border-t">
            <Button asChild className="w-full">
              <Link href="/pricing">
                Mettre à niveau l'abonnement
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
