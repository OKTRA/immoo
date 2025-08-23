import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Heart, 
  Eye, 
  Users, 
  Building, 
  Phone, 
  Mail, 
  MapPin,
  Search,
  Filter,
  Download,
  TrendingUp,
  Clock,
  Tag,
  Star,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';

interface FavoriteProperty {
  id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  agency_id: string;
  agency_name?: string;
  agency_phone?: string;
  agency_email?: string;
  favorite_count: number;
  view_count: number;
  visitor_contacts: VisitorContact[];
}

interface VisitorContact {
  id: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  property_id?: string;
  agency_id?: string;
  created_at: string;
  last_seen_at?: string;
  ip_address?: string;
  is_verified: boolean;
}

interface AgencyContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  contact_count: number;
}

export default function VisitorAnalytics() {
  const [favoriteProperties, setFavoriteProperties] = useState<FavoriteProperty[]>([]);
  const [visitorContacts, setVisitorContacts] = useState<VisitorContact[]>([]);
  const [agencyContacts, setAgencyContacts] = useState<AgencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Charger les propriétés de base
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          type,
          price,
          location,
          agency_id
        `)
        .eq('is_visible', true);

      if (propertiesError) throw propertiesError;

      // Charger les agences séparément
      const { data: agenciesData, error: agenciesError } = await supabase
        .from('agencies')
        .select(`
          id,
          name,
          email,
          phone
        `);

      if (agenciesError) throw agenciesError;

      // Créer un map des agences pour un accès rapide
      const agenciesMap = new Map(agenciesData?.map(agency => [agency.id, agency]) || []);

      // Récupérer les contacts visiteurs (avec les colonnes de base qui existent)
      const { data: contactsData, error: contactsError } = await supabase
        .from('visitor_contacts')
        .select(`
          id,
          email,
          phone,
          first_name,
          last_name,
          property_id,
          agency_id,
          created_at,
          last_seen_at,
          ip_address,
          is_verified
        `)
        .order('created_at', { ascending: false });

      if (contactsError) throw contactsError;

      // Traiter les données pour créer les statistiques
      const propertyStats = new Map();
      
      // Initialiser les statistiques pour toutes les propriétés
      propertiesData?.forEach(property => {
        propertyStats.set(property.id, {
          favorite_count: 0,
          view_count: 0,
          visitor_contacts: [],
          unique_visitors: new Set()
        });
      });
      
      // Compter les contacts par propriété
      contactsData?.forEach(contact => {
        if (contact.property_id && propertyStats.has(contact.property_id)) {
          const stats = propertyStats.get(contact.property_id);
          stats.view_count += 1; // Chaque contact = 1 vue
          stats.visitor_contacts.push(contact);
          
          // Compter les visiteurs uniques par email/phone
          if (contact.email) stats.unique_visitors.add(contact.email);
          if (contact.phone) stats.unique_visitors.add(contact.phone);
        }
      });

      // Fusionner avec les données des propriétés
      const enrichedProperties = propertiesData?.map(property => {
        const agency = property.agency_id ? agenciesMap.get(property.agency_id) : null;
        const stats = propertyStats.get(property.id) || { favorite_count: 0, view_count: 0, visitor_contacts: [] };
        
        return {
          ...property,
          agency_name: agency?.name || 'Agence inconnue',
          agency_phone: agency?.phone || '',
          agency_email: agency?.email || '',
          favorite_count: stats.favorite_count,
          view_count: stats.view_count,
          visitor_contacts: stats.visitor_contacts
        };
      }) || [];

      // Trier par nombre de vues + contacts
      enrichedProperties.sort((a, b) => (b.view_count + b.visitor_contacts.length) - (a.view_count + a.visitor_contacts.length));

      // Récupérer les statistiques par agence
      const agencyStats = new Map();
      contactsData?.forEach(contact => {
        if (contact.agency_id) {
          if (!agencyStats.has(contact.agency_id)) {
            const agency = agenciesMap.get(contact.agency_id);
            agencyStats.set(contact.agency_id, {
              id: contact.agency_id,
              name: agency?.name || 'Agence inconnue',
              email: agency?.email,
              phone: agency?.phone,
              contact_count: 0
            });
          }
          agencyStats.get(contact.agency_id).contact_count++;
        }
      });

      setFavoriteProperties(enrichedProperties);
      setVisitorContacts(contactsData || []);
      setAgencyContacts(Array.from(agencyStats.values()).sort((a, b) => b.contact_count - a.contact_count));
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // En cas d'erreur, essayer de charger au moins les propriétés de base
      try {
        const { data: fallbackProperties, error: fallbackError } = await supabase
          .from('properties')
          .select('id, title, type, price, location, agency_id')
          .eq('is_visible', true)
          .limit(50);

        if (!fallbackError && fallbackProperties) {
          setFavoriteProperties(fallbackProperties.map(p => ({
            ...p,
            agency_name: 'Agence',
            agency_phone: '',
            agency_email: '',
            favorite_count: 0,
            view_count: 0,
            visitor_contacts: []
          })));
        }
      } catch (fallbackErr) {
        console.error('Erreur lors du chargement de fallback:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = visitorContacts.filter(contact => {
    const matchesSearch = !searchTerm || 
      (contact.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.phone?.includes(searchTerm)) ||
      (contact.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.last_name?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'verified' && contact.is_verified) ||
      (selectedFilter === 'unverified' && !contact.is_verified);

    return matchesSearch && matchesFilter;
  });

  const exportData = () => {
    const csvContent = [
      ['Email', 'Téléphone', 'Nom', 'Prénom', 'Propriété', 'Agence', 'Date de création', 'Dernière visite', 'Vérifié', 'Nombre de vues'].join(','),
      ...filteredContacts.map(contact => [
        contact.email || '',
        contact.phone || '',
        contact.last_name || '',
        contact.first_name || '',
        contact.property_id || '',
        contact.agency_id || '',
        contact.created_at,
        contact.last_seen_at || '',
        contact.is_verified ? 'Oui' : 'Non',
        1
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `visiteurs_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Fonction pour générer les tags des propriétés
  const getPropertyTags = (property: FavoriteProperty) => {
    const tags = [];
    
    // Tag de type de propriété
    tags.push({
      label: property.type,
      variant: 'outline' as const,
      icon: Tag,
      color: 'text-blue-600'
    });
    
    // Tag de popularité basé sur le nombre de vues
    if (property.view_count >= 10) {
      tags.push({
        label: 'Très populaire',
        variant: 'default' as const,
        icon: Zap,
        color: 'text-red-600'
      });
    } else if (property.view_count >= 5) {
      tags.push({
        label: 'Populaire',
        variant: 'secondary' as const,
        icon: Star,
        color: 'text-yellow-600'
      });
    } else if (property.view_count >= 2) {
      tags.push({
        label: 'Intéressante',
        variant: 'outline' as const,
        icon: Eye,
        color: 'text-green-600'
      });
    }
    
    // Tag de taux de contact
    if (property.visitor_contacts.length > 0) {
      const contactRate = Math.round((property.visitor_contacts.length / property.view_count) * 100);
      if (contactRate >= 50) {
        tags.push({
          label: 'Taux élevé',
          variant: 'default' as const,
          icon: Heart,
          color: 'text-pink-600'
        });
      }
    }
    
    return tags;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Propriétés populaires</p>
                <p className="text-2xl font-bold">{favoriteProperties.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Visiteurs total</p>
                <p className="text-2xl font-bold">{visitorContacts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Agences actives</p>
                <p className="text-2xl font-bold">{agencyContacts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Vues totales</p>
                <p className="text-2xl font-bold">
                  {favoriteProperties.reduce((sum, prop) => sum + prop.view_count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Propriétés les plus populaires */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Propriétés les plus populaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {favoriteProperties.slice(0, 10).map((property) => (
              <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{property.title}</h3>
                  <p className="text-sm text-gray-600">{property.location} • {property.type}</p>
                  <p className="text-sm font-semibold text-green-600">{formatCurrency(property.price)}</p>
                  
                  {/* Tags des propriétés */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {getPropertyTags(property).map((tag, index) => {
                      const IconComponent = tag.icon;
                      return (
                        <Badge 
                          key={index} 
                          variant={tag.variant}
                          className={`text-xs ${tag.color} border-current`}
                        >
                          <IconComponent className="h-3 w-3 mr-1" />
                          {tag.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-sm font-medium">{property.view_count}</span>
                    </div>
                    <p className="text-xs text-gray-500">vues</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-sm font-medium">{property.visitor_contacts.length}</span>
                    </div>
                    <p className="text-xs text-gray-500">contacts</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-sm font-medium">
                        {property.visitor_contacts.length > 0 ? 
                          Math.round((property.visitor_contacts.length / property.view_count) * 100) : 0
                        }%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">taux de contact</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Liste des visiteurs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Contacts visiteurs ({filteredContacts.length})
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as any)}
                className="border rounded px-3 py-2"
              >
                <option value="all">Tous</option>
                <option value="verified">Vérifiés</option>
                <option value="unverified">Non vérifiés</option>
              </select>
              <Button onClick={exportData} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {filteredContacts.slice(0, 10).map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {contact.first_name} {contact.last_name}
                    </span>
                    <Badge variant={contact.is_verified ? "default" : "secondary"}>
                      {contact.is_verified ? "Vérifié" : "Non vérifié"}
                    </Badge>
                  </div>
                  
                  {/* Tags des contacts visiteurs */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {/* Tag de type de contact */}
                    {contact.email && contact.phone ? (
                      <Badge variant="outline" className="text-xs text-blue-600 border-blue-600">
                        <Mail className="h-3 w-3 mr-1" />
                        Email + Téléphone
                      </Badge>
                    ) : contact.email ? (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Badge>
                    ) : contact.phone ? (
                      <Badge variant="outline" className="text-xs text-purple-600 border-purple-600">
                        <Phone className="h-3 w-3 mr-1" />
                        Téléphone
                      </Badge>
                    ) : null}
                    
                    {/* Tag de statut de vérification */}
                    {contact.is_verified ? (
                      <Badge variant="default" className="text-xs text-green-600 bg-green-100">
                        <Star className="h-3 w-3 mr-1" />
                        Vérifié
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs text-orange-600 bg-orange-100">
                        <Clock className="h-3 w-3 mr-1" />
                        En attente
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    {contact.email && (
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {contact.email}
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {contact.phone}
                      </div>
                    )}
                    {contact.ip_address && (
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {contact.ip_address}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center text-sm text-gray-600">
                    <Eye className="h-3 w-3 mr-1" />
                    1 vue
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(contact.created_at).toLocaleDateString('fr-FR')}
                  </div>
                  {contact.last_seen_at && (
                    <div className="text-xs text-gray-500">
                      Dernière visite: {new Date(contact.last_seen_at).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Indicateur du nombre total et bouton pour voir plus */}
            {filteredContacts.length > 10 && (
              <div className="text-center py-4 border-t">
                <p className="text-sm text-gray-600 mb-3">
                  Affichage des 10 premiers contacts sur {filteredContacts.length} au total
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Ici on pourrait ajouter une logique pour charger plus ou afficher tous
                    console.log('Chargement de tous les contacts...');
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Voir tous les contacts
                </Button>
              </div>
            )}
            
            {filteredContacts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun contact visiteur trouvé
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top agences par contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Agences les plus contactées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {agencyContacts.slice(0, 10).map((agency) => (
              <div key={agency.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{agency.name}</h3>
                  
                  {/* Tags des agences */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {/* Tag de niveau d'activité */}
                    {agency.contact_count >= 10 ? (
                      <Badge variant="default" className="text-xs text-red-600 bg-red-100">
                        <Zap className="h-3 w-3 mr-1" />
                        Très active
                      </Badge>
                    ) : agency.contact_count >= 5 ? (
                      <Badge variant="secondary" className="text-xs text-yellow-600 bg-yellow-100">
                        <Star className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-blue-600 border-blue-600">
                        <Building className="h-3 w-3 mr-1" />
                        Standard
                      </Badge>
                    )}
                    
                    {/* Tag de disponibilité des contacts */}
                    {agency.email && agency.phone ? (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                        <Phone className="h-3 w-3 mr-1" />
                        Contact complet
                      </Badge>
                    ) : agency.email || agency.phone ? (
                      <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">
                        <Mail className="h-3 w-3 mr-1" />
                        Contact partiel
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-gray-600 border-gray-600">
                        <Building className="h-3 w-3 mr-1" />
                        Contact limité
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    {agency.email && (
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {agency.email}
                      </div>
                    )}
                    {agency.phone && (
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {agency.phone}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="font-semibold">{agency.contact_count}</span>
                  </div>
                  <p className="text-xs text-gray-500">contacts</p>
                </div>
              </div>
            ))}
            
            {/* Indicateur du nombre total d'agences */}
            {agencyContacts.length > 10 && (
              <div className="text-center py-4 border-t">
                <p className="text-sm text-gray-600 mb-3">
                  Affichage des 10 premières agences sur {agencyContacts.length} au total
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    console.log('Chargement de toutes les agences...');
                  }}
                >
                  <Building className="h-4 w-4 mr-2" />
                  Voir toutes les agences
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
