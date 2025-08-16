import React, { useState, useEffect } from 'react';
import { useRealtimeSync, useTableSync } from '@/hooks/useRealtimeSync';
import { realtimeErrorHandler } from '@/services/realtimeSync';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface SyncEvent {
  id: string;
  table: string;
  eventType: string;
  timestamp: Date;
  data?: any;
}

export const RealtimeSyncTest: React.FC = () => {
  const [events, setEvents] = useState<SyncEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);
  
  // Hook principal de synchronisation
  const { 
    isConnected: syncConnected, 
    subscribe, 
    unsubscribe, 
    resubscribe 
  } = useRealtimeSync();
  
  // Hooks spécifiques pour chaque table
  const propertiesSync = useTableSync('properties', (payload) => {
    addEvent('properties', payload.eventType, payload.new || payload.old);
  });
  
  const leasesSync = useTableSync('leases', (payload) => {
    addEvent('leases', payload.eventType, payload.new || payload.old);
  });
  
  const paymentsSync = useTableSync('payments', (payload) => {
    addEvent('payments', payload.eventType, payload.new || payload.old);
  });
  
  // Fonction pour ajouter un événement
  const addEvent = (table: string, eventType: string, data?: any) => {
    const newEvent: SyncEvent = {
      id: `${Date.now()}-${Math.random()}`,
      table,
      eventType,
      timestamp: new Date(),
      data
    };
    
    setEvents(prev => [newEvent, ...prev.slice(0, 49)]); // Garder seulement les 50 derniers
  };
  
  // Surveiller l'état de connexion
  useEffect(() => {
    setIsConnected(syncConnected);
  }, [syncConnected]);
  
  // Surveiller les erreurs
  useEffect(() => {
    const handleError = (error: any) => {
      setErrors(prev => [{
        ...error,
        timestamp: new Date()
      }, ...prev.slice(0, 9)]); // Garder seulement les 10 dernières erreurs
    };
    
    realtimeErrorHandler.onError(handleError);
    
    return () => {
      // Cleanup si nécessaire
    };
  }, []);
  
  // Fonctions de contrôle
  const handleStartSync = async () => {
    try {
      await subscribe('properties', (payload) => {
        addEvent('properties', payload.eventType, payload.new || payload.old);
      });
      await subscribe('leases', (payload) => {
        addEvent('leases', payload.eventType, payload.new || payload.old);
      });
      await subscribe('payments', (payload) => {
        addEvent('payments', payload.eventType, payload.new || payload.old);
      });
    } catch (error) {
      console.error('Failed to start sync:', error);
    }
  };
  
  const handleStopSync = () => {
    unsubscribe('properties');
    unsubscribe('leases');
    unsubscribe('payments');
  };
  
  const handleRestart = async () => {
    await resubscribe();
  };
  
  const clearEvents = () => {
    setEvents([]);
  };
  
  const clearErrors = () => {
    setErrors([]);
  };
  
  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'INSERT': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getTableColor = (table: string) => {
    switch (table) {
      case 'properties': return 'bg-purple-100 text-purple-800';
      case 'leases': return 'bg-orange-100 text-orange-800';
      case 'payments': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Test de Synchronisation Realtime</h1>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-4 h-4 mr-1" />
              Connecté
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800">
              <XCircle className="w-4 h-4 mr-1" />
              Déconnecté
            </Badge>
          )}
        </div>
      </div>
      
      {/* Contrôles */}
      <Card>
        <CardHeader>
          <CardTitle>Contrôles de Synchronisation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button onClick={handleStartSync} variant="default">
              Démarrer Sync
            </Button>
            <Button onClick={handleStopSync} variant="outline">
              Arrêter Sync
            </Button>
            <Button onClick={handleRestart} variant="outline">
              <RefreshCw className="w-4 h-4 mr-1" />
              Redémarrer
            </Button>
            <Button onClick={clearEvents} variant="ghost">
              Effacer Événements
            </Button>
            <Button onClick={clearErrors} variant="ghost">
              Effacer Erreurs
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{events.length}</div>
            <div className="text-sm text-gray-600">Événements Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {events.filter(e => e.table === 'properties').length}
            </div>
            <div className="text-sm text-gray-600">Propriétés</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {events.filter(e => e.table === 'leases').length}
            </div>
            <div className="text-sm text-gray-600">Baux</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {events.filter(e => e.table === 'payments').length}
            </div>
            <div className="text-sm text-gray-600">Paiements</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Erreurs */}
      {errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
              Erreurs ({errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {errors.map((error, index) => (
                <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                  <div className="font-medium text-red-800">
                    {error.category} - {error.severity}
                  </div>
                  <div className="text-red-600">{error.message}</div>
                  <div className="text-xs text-red-500">
                    {error.timestamp?.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Événements en temps réel */}
      <Card>
        <CardHeader>
          <CardTitle>Événements en Temps Réel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Aucun événement détecté. Modifiez des données dans l'application pour voir la synchronisation.
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                  <div className="flex items-center space-x-3">
                    <Badge className={getTableColor(event.table)}>
                      {event.table}
                    </Badge>
                    <Badge className={getEventTypeColor(event.eventType)}>
                      {event.eventType}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {event.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  {event.data && (
                    <div className="text-xs text-gray-500 max-w-xs truncate">
                      ID: {event.data.id || 'N/A'}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeSyncTest;