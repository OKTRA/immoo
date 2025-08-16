import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRealtimeSync, useTableSync } from '@/hooks/useRealtimeSync';
import { dataListenersService } from '@/services/realtimeSync/dataListeners';
import { realtimeSyncService } from '@/services/realtimeSync/syncService';
import { useAuth } from '@/contexts/auth/AuthContext';
import { AlertCircle, CheckCircle, Clock, Database, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RealtimeEvent {
  id: string;
  timestamp: Date;
  table: string;
  eventType: string;
  data: any;
}

export const RealtimeSyncDemo: React.FC = () => {
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [listenersStatus, setListenersStatus] = useState<any>(null);

  // Hook pour surveiller les propriétés
  const propertiesSync = useTableSync(
    'properties',
    (record) => addEvent('properties', 'INSERT', record),
    (record, oldRecord) => addEvent('properties', 'UPDATE', { new: record, old: oldRecord }),
    (record) => addEvent('properties', 'DELETE', record),
    { enabled: isVisible }
  );

  // Hook pour surveiller les baux
  const leasesSync = useTableSync(
    'leases',
    (record) => addEvent('leases', 'INSERT', record),
    (record, oldRecord) => addEvent('leases', 'UPDATE', { new: record, old: oldRecord }),
    (record) => addEvent('leases', 'DELETE', record),
    { enabled: isVisible }
  );

  // Hook pour surveiller les paiements
  const paymentsSync = useTableSync(
    'payments',
    (record) => addEvent('payments', 'INSERT', record),
    (record, oldRecord) => addEvent('payments', 'UPDATE', { new: record, old: oldRecord }),
    (record) => addEvent('payments', 'DELETE', record),
    { enabled: isVisible }
  );

  // Fonction pour ajouter un événement à la liste
  const addEvent = (table: string, eventType: string, data: any) => {
    const newEvent: RealtimeEvent = {
      id: `${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      table,
      eventType,
      data
    };
    
    setEvents(prev => [newEvent, ...prev.slice(0, 49)]); // Garder seulement les 50 derniers événements
  };

  // Mettre à jour le statut des listeners
  useEffect(() => {
    if (isVisible) {
      const updateStatus = () => {
        const status = dataListenersService.getListenersStatus();
        setListenersStatus(status);
      };
      
      updateStatus();
      const interval = setInterval(updateStatus, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  // Fonction pour redémarrer les listeners
  const restartListeners = async () => {
    try {
      await dataListenersService.restartAllListeners(user?.id);
      setEvents([]);
      addEvent('system', 'RESTART', { message: 'Listeners redémarrés avec succès' });
    } catch (error) {
      console.error('Erreur lors du redémarrage des listeners:', error);
      addEvent('system', 'ERROR', { message: 'Erreur lors du redémarrage' });
    }
  };

  // Fonction pour vider les événements
  const clearEvents = () => {
    setEvents([]);
  };

  // Fonction pour obtenir la couleur du badge selon le type d'événement
  const getEventBadgeVariant = (eventType: string) => {
    switch (eventType) {
      case 'INSERT': return 'default';
      case 'UPDATE': return 'secondary';
      case 'DELETE': return 'destructive';
      case 'RESTART': return 'outline';
      case 'ERROR': return 'destructive';
      default: return 'outline';
    }
  };

  // Fonction pour obtenir l'icône selon l'état de connexion
  const getConnectionIcon = (isConnected: boolean) => {
    return isConnected ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    );
  };

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Vous devez être connecté pour utiliser la démonstration de synchronisation en temps réel.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Démonstration Synchronisation Temps Réel
              </CardTitle>
              <CardDescription>
                Surveillez les changements de données en temps réel entre l'application web et mobile
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isVisible ? "destructive" : "default"}
                onClick={() => setIsVisible(!isVisible)}
              >
                {isVisible ? (
                  <>
                    <WifiOff className="h-4 w-4 mr-2" />
                    Arrêter
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4 mr-2" />
                    Démarrer
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {isVisible && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Statut des connexions */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  État des Connexions
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Propriétés:</span>
                    {getConnectionIcon(propertiesSync.isConnected)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Baux:</span>
                    {getConnectionIcon(leasesSync.isConnected)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Paiements:</span>
                    {getConnectionIcon(paymentsSync.isConnected)}
                  </div>
                </div>
              </div>
              
              {/* Statistiques */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Statistiques
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Événements:</span>
                    <Badge variant="outline">{events.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Listeners actifs:</span>
                    <Badge variant="outline">{listenersStatus?.active?.length || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Service connecté:</span>
                    {getConnectionIcon(listenersStatus?.serviceConnected || false)}
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Actions
                </h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={restartListeners}
                    className="w-full"
                  >
                    Redémarrer Listeners
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearEvents}
                    className="w-full"
                  >
                    Vider Événements
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Liste des événements */}
      {isVisible && (
        <Card>
          <CardHeader>
            <CardTitle>Événements en Temps Réel</CardTitle>
            <CardDescription>
              Les derniers changements détectés dans la base de données
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun événement détecté pour le moment.</p>
                <p className="text-sm">Modifiez des données dans l'application pour voir les changements en temps réel.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events.map((event, index) => (
                  <div key={event.id}>
                    <div className="flex items-start justify-between p-3 rounded-lg border bg-card">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getEventBadgeVariant(event.eventType)}>
                            {event.eventType}
                          </Badge>
                          <Badge variant="outline">{event.table}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {event.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm">
                          <pre className="whitespace-pre-wrap text-xs bg-muted p-2 rounded overflow-x-auto">
                            {JSON.stringify(event.data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                    {index < events.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealtimeSyncDemo;