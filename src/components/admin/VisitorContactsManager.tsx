
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Mail, Phone, Eye, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface VisitorContactsManagerProps {
  agencyId: string;
}

export default function VisitorContactsManager({ agencyId }: VisitorContactsManagerProps) {
  const { data: visitorContacts, isLoading } = useQuery({
    queryKey: ['agency-visitor-contacts', agencyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visitor_contacts')
        .select(`
          *,
          agency_contact_access_logs (
            accessed_at,
            access_type
          )
        `)
        .eq('agency_id', agencyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const { data: accessStats } = useQuery({
    queryKey: ['agency-access-stats', agencyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agency_contact_access_logs')
        .select('accessed_at, access_type')
        .eq('agency_id', agencyId);

      if (error) throw error;
      
      const today = new Date();
      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      return {
        totalAccess: data.length,
        todayAccess: data.filter(log => new Date(log.accessed_at) >= today).length,
        weekAccess: data.filter(log => new Date(log.accessed_at) >= thisWeek).length,
        monthAccess: data.filter(log => new Date(log.accessed_at) >= thisMonth).length
      };
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Contacts des visiteurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/50 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques d'accès */}
      {accessStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total accès</p>
                  <p className="text-2xl font-bold">{accessStats.totalAccess}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ce mois</p>
                  <p className="text-2xl font-bold">{accessStats.monthAccess}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cette semaine</p>
                  <p className="text-2xl font-bold">{accessStats.weekAccess}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Visiteurs uniques</p>
                  <p className="text-2xl font-bold">{visitorContacts?.length || 0}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Liste des contacts visiteurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Contacts des visiteurs
          </CardTitle>
          <CardDescription>
            Visiteurs qui ont demandé l'accès à vos informations de contact
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!visitorContacts || visitorContacts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun contact visiteur</h3>
              <p className="text-muted-foreground">
                Les visiteurs qui demandent l'accès à vos informations apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {visitorContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium">
                        {contact.first_name} {contact.last_name}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {contact.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Première visite: {format(new Date(contact.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Dernière visite: {format(new Date(contact.last_seen_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={contact.is_verified ? 'default' : 'secondary'}>
                      {contact.is_verified ? 'Vérifié' : 'Non vérifié'}
                    </Badge>
                    <Badge variant="outline">
                      {contact.purpose === 'contact_agency' ? 'Contact agence' : contact.purpose}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
