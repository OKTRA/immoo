import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMobileSync, useNetworkStatus, useAppState } from '@/hooks/useMobileSync';
import { Wifi, WifiOff, Smartphone, Monitor, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileSyncDiagnosticProps {
  className?: string;
  showDetails?: boolean;
}

/**
 * Composant de diagnostic pour surveiller l'état de synchronisation mobile
 */
export function MobileSyncDiagnostic({ 
  className, 
  showDetails = true 
}: MobileSyncDiagnosticProps) {
  const {
    isMobile,
    syncState,
    isOnline,
    isAppActive,
    isSyncActive,
    forceResync,
    connectionType
  } = useMobileSync();

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Jamais';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return `Il y a ${seconds}s`;
    if (minutes < 60) return `Il y a ${minutes}m`;
    return `Il y a ${hours}h`;
  };

  const getConnectionIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4 text-red-500" />;
    return <Wifi className="h-4 w-4 text-green-500" />;
  };

  const getPlatformIcon = () => {
    return isMobile ? 
      <Smartphone className="h-4 w-4 text-blue-500" /> : 
      <Monitor className="h-4 w-4 text-gray-500" />;
  };

  const getSyncStatusBadge = () => {
    if (!isOnline) {
      return <Badge variant="destructive">Hors ligne</Badge>;
    }
    if (!isAppActive) {
      return <Badge variant="secondary">En arrière-plan</Badge>;
    }
    if (syncState.syncPaused) {
      return <Badge variant="outline">En pause</Badge>;
    }
    if (isSyncActive) {
      return <Badge variant="default" className="bg-green-500">Actif</Badge>;
    }
    return <Badge variant="destructive">Inactif</Badge>;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {getPlatformIcon()}
          Diagnostic de Synchronisation
          {getSyncStatusBadge()}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* État principal */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            {getConnectionIcon()}
            <span className="text-sm">
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {isAppActive ? 
              <CheckCircle className="h-4 w-4 text-green-500" /> : 
              <XCircle className="h-4 w-4 text-orange-500" />
            }
            <span className="text-sm">
              {isAppActive ? 'Active' : 'En arrière-plan'}
            </span>
          </div>
        </div>

        {/* Détails étendus */}
        {showDetails && (
          <>
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plateforme:</span>
                <span>{isMobile ? 'Mobile (Capacitor)' : 'Web (Navigateur)'}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type de connexion:</span>
                <span className="capitalize">{connectionType}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dernière sync:</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{formatLastSync(syncState.lastSyncTime)}</span>
                </div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">État sync:</span>
                <span className={cn(
                  isSyncActive ? 'text-green-600' : 'text-red-600'
                )}>
                  {isSyncActive ? 'Synchronisé' : 'Non synchronisé'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-3">
              <Button 
                onClick={forceResync}
                size="sm" 
                variant="outline" 
                className="w-full"
                disabled={!isOnline}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Forcer la resynchronisation
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Version compacte du diagnostic pour la barre de statut
 */
export function MobileSyncStatusBar({ className }: { className?: string }) {
  const { isOnline, isSyncActive, connectionType } = useMobileSync();
  
  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      {isOnline ? (
        <div className="flex items-center gap-1 text-green-600">
          <Wifi className="h-3 w-3" />
          <span>{connectionType}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-red-600">
          <WifiOff className="h-3 w-3" />
          <span>Hors ligne</span>
        </div>
      )}
      
      <div className={cn(
        "w-2 h-2 rounded-full",
        isSyncActive ? "bg-green-500" : "bg-red-500"
      )} />
    </div>
  );
}

/**
 * Hook pour obtenir un résumé de l'état de synchronisation
 */
export function useSyncSummary() {
  const { isOnline, isAppActive, isSyncActive, syncState } = useMobileSync();
  
  const status = React.useMemo(() => {
    if (!isOnline) return 'offline';
    if (!isAppActive) return 'background';
    if (syncState.syncPaused) return 'paused';
    if (isSyncActive) return 'active';
    return 'inactive';
  }, [isOnline, isAppActive, isSyncActive, syncState.syncPaused]);
  
  const message = React.useMemo(() => {
    switch (status) {
      case 'offline': return 'Application hors ligne';
      case 'background': return 'Application en arrière-plan';
      case 'paused': return 'Synchronisation en pause';
      case 'active': return 'Synchronisation active';
      case 'inactive': return 'Synchronisation inactive';
      default: return 'État inconnu';
    }
  }, [status]);
  
  return { status, message, isHealthy: status === 'active' };
}