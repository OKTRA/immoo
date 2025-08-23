import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Home, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { useOptimizedAnalytics } from '@/hooks/useOptimizedAnalytics';

interface OptimizedBusinessTabProps {
  period?: 'week' | 'month' | 'quarter' | 'year';
}

const OptimizedBusinessTab = memo(function OptimizedBusinessTab({ 
  period = 'month' 
}: OptimizedBusinessTabProps) {
  const { 
    businessStats, 
    visitorStats, 
    topPages, 
    deviceData, 
    geoData, 
    isLoading 
  } = useOptimizedAnalytics(period);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Propriétés totales"
          value={businessStats?.totalProperties || 0}
          icon={Home}
          trend="+12%"
        />
        <StatCard
          title="Utilisateurs"
          value={businessStats?.totalUsers || 0}
          icon={Users}
          trend="+8%"
        />
        <StatCard
          title="Prix moyen"
          value={`${Math.round(businessStats?.avgPropertyPrice || 0).toLocaleString()} FCFA`}
          icon={DollarSign}
          trend="+5%"
        />
        <StatCard
          title="Réservations"
          value={businessStats?.totalBookings || 0}
          icon={Calendar}
          trend="+15%"
        />
      </div>

      {/* Tabs pour les différentes métriques */}
      <Tabs defaultValue="visitors" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visitors">Visiteurs</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="devices">Appareils</TabsTrigger>
          <TabsTrigger value="geography">Géographie</TabsTrigger>
        </TabsList>

        <TabsContent value="visitors" className="space-y-4">
          <VisitorStatsCards stats={visitorStats} />
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <TopPagesTable pages={topPages} />
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <DeviceBreakdownChart data={deviceData} />
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <GeographicChart data={geoData} />
        </TabsContent>
      </Tabs>
    </div>
  );
});

// Composant mémorisé pour les cartes de statistiques
const StatCard = memo(function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend 
}: {
  title: string;
  value: number | string;
  icon: any;
  trend: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          <span className="text-green-600">{trend}</span> par rapport au mois dernier
        </p>
      </CardContent>
    </Card>
  );
});

// Composant mémorisé pour les statistiques des visiteurs
const VisitorStatsCards = memo(function VisitorStatsCards({ 
  stats 
}: { 
  stats: any 
}) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Total visiteurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_visitors}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Nouveaux visiteurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.new_visitors}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Visiteurs récurrents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.returning_visitors}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Durée moyenne</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.average_duration}s</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Taux de rebond</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.bounce_rate}%</div>
        </CardContent>
      </Card>
    </div>
  );
});

// Composant mémorisé pour le tableau des pages top
const TopPagesTable = memo(function TopPagesTable({ 
  pages 
}: { 
  pages: any[] 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pages les plus visitées</CardTitle>
        <CardDescription>Classement des pages par nombre de visites</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pages.map((page, index) => (
            <div key={page.page_path} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {index + 1}.
                </span>
                <span className="text-sm font-medium">{page.page_path}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>{page.visits} visites</span>
                <span>{page.unique_visitors} visiteurs uniques</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

// Composant mémorisé pour le graphique des appareils
const DeviceBreakdownChart = memo(function DeviceBreakdownChart({ 
  data 
}: { 
  data: any[] 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition par appareil</CardTitle>
        <CardDescription>Types d'appareils utilisés par les visiteurs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((device) => (
            <div key={device.device_type} className="flex items-center justify-between">
              <span className="text-sm font-medium">{device.device_type}</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${device.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {device.visitors} ({device.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

// Composant mémorisé pour le graphique géographique
const GeographicChart = memo(function GeographicChart({ 
  data 
}: { 
  data: any[] 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition géographique</CardTitle>
        <CardDescription>Pays d'origine des visiteurs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((country) => (
            <div key={country.country} className="flex items-center justify-between">
              <span className="text-sm font-medium">{country.country}</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${country.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {country.visitors} ({country.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

export default OptimizedBusinessTab;
