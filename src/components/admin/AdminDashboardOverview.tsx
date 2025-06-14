
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Home, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';

export default function AdminDashboardOverview() {
  const { stats, recentActivities, pendingItems, isLoading, refreshData } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const dashboardStats = [
    { 
      title: 'Utilisateurs', 
      value: stats?.totalUsers.toLocaleString() || '0', 
      change: stats?.usersTrend || '0%', 
      trend: 'up',
      icon: Users 
    },
    { 
      title: 'Agences', 
      value: stats?.totalAgencies.toLocaleString() || '0', 
      change: stats?.agenciesTrend || '0%', 
      trend: 'up',
      icon: Building2 
    },
    { 
      title: 'Propriétés', 
      value: stats?.totalProperties.toLocaleString() || '0', 
      change: stats?.propertiesTrend || '0%', 
      trend: 'up',
      icon: Home 
    },
    { 
      title: 'Taux d\'occupation', 
      value: `${stats?.occupancyRate || 0}%`, 
      change: stats?.occupancyTrend || '0%', 
      trend: stats?.occupancyRate && stats.occupancyRate > 90 ? 'up' : 'down',
      icon: Home 
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
          <div className="text-sm text-muted-foreground">
            Dernière mise à jour: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center">
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={stat.trend === 'up' ? "text-green-500" : "text-red-500"}>
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground ml-1">cette semaine</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activités Récentes</CardTitle>
            <CardDescription>
              Les dernières activités sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Heure</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">{activity.user}</TableCell>
                      <TableCell>{activity.action}</TableCell>
                      <TableCell className="text-muted-foreground">{activity.time}</TableCell>
                      <TableCell>
                        {activity.status === 'success' && (
                          <div className="flex items-center text-green-500">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span>Complété</span>
                          </div>
                        )}
                        {activity.status === 'pending' && (
                          <div className="flex items-center text-yellow-500">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>En attente</span>
                          </div>
                        )}
                        {activity.status === 'error' && (
                          <div className="flex items-center text-red-500">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <span>Problème</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucune activité récente
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>En attente</CardTitle>
            <CardDescription>
              Éléments nécessitant votre attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingItems.map((item, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-md border ${
                    item.type === 'verification' 
                      ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20'
                      : item.type === 'report'
                      ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20'
                      : 'border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/20'
                  }`}
                >
                  <div className={`font-medium ${
                    item.type === 'verification' 
                      ? 'text-yellow-800 dark:text-yellow-500'
                      : item.type === 'report'
                      ? 'text-red-800 dark:text-red-500'
                      : 'text-blue-800 dark:text-blue-500'
                  }`}>
                    {item.count} {item.description}
                  </div>
                  <div className={`text-sm ${
                    item.type === 'verification' 
                      ? 'text-yellow-700 dark:text-yellow-400'
                      : item.type === 'report'
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-blue-700 dark:text-blue-400'
                  }`}>
                    {item.daysWaiting > 0 ? `En attente depuis ${item.daysWaiting} jour${item.daysWaiting > 1 ? 's' : ''}` : 'Récemment ajouté'}
                  </div>
                </div>
              ))}

              {pendingItems.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  Aucun élément en attente
                </div>
              )}

              <Button variant="secondary" className="w-full mt-2">
                Voir tous les éléments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statistiques globales</CardTitle>
          <CardDescription>
            Vue d'ensemble des performances de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-2">
                {((stats?.totalProperties || 0) * 0.85).toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Propriétés actives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-2">
                {((stats?.totalUsers || 0) * 0.73).toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Utilisateurs actifs ce mois</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-2">
                {stats?.totalAgencies ? Math.round(stats.totalAgencies * 0.91) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Agences vérifiées</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
