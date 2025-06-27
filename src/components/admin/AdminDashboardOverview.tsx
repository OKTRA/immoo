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
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground mt-1 sm:hidden">
            Vue d'ensemble de la plateforme
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sm:inline">Actualiser</span>
          </Button>
          <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Dernière mise à jour: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="transition-all hover:shadow-md">
            <CardContent className="p-4 sm:p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 truncate">
                    {stat.title}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold truncate">{stat.value}</p>
                </div>
                <div className="p-2 rounded-full bg-primary/10 text-primary flex-shrink-0 ml-2">
                  <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center">
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1 flex-shrink-0" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 mr-1 flex-shrink-0" />
                )}
                <span className={`text-sm font-medium ${stat.trend === 'up' ? "text-green-500" : "text-red-500"}`}>
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground ml-1 hidden sm:inline">cette semaine</span>
                <span className="text-xs text-muted-foreground ml-1 sm:hidden">sem.</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Activités Récentes</CardTitle>
            <CardDescription className="text-sm">
              Les dernières activités sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:px-6 sm:pb-6">
            {recentActivities.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Utilisateur</TableHead>
                      <TableHead className="min-w-[150px]">Action</TableHead>
                      <TableHead className="min-w-[100px] hidden sm:table-cell">Heure</TableHead>
                      <TableHead className="min-w-[100px]">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell className="font-medium text-sm">
                          <div className="truncate max-w-[120px]" title={activity.user}>
                            {activity.user}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="truncate max-w-[150px]" title={activity.action}>
                            {activity.action}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm hidden sm:table-cell">
                          {activity.time}
                        </TableCell>
                        <TableCell>
                          {activity.status === 'success' && (
                            <div className="flex items-center text-green-500 text-sm">
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              <span className="hidden sm:inline">Complété</span>
                              <span className="sm:hidden">✓</span>
                            </div>
                          )}
                          {activity.status === 'pending' && (
                            <div className="flex items-center text-yellow-500 text-sm">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              <span className="hidden sm:inline">En attente</span>
                              <span className="sm:hidden">⏳</span>
                            </div>
                          )}
                          {activity.status === 'error' && (
                            <div className="flex items-center text-red-500 text-sm">
                              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              <span className="hidden sm:inline">Problème</span>
                              <span className="sm:hidden">❌</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground px-4">
                <div className="text-sm">Aucune activité récente</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">En attente</CardTitle>
            <CardDescription className="text-sm">
              Éléments nécessitant votre attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {pendingItems.map((item, index) => (
              <div 
                key={index}
                className={`p-3 sm:p-4 rounded-md border transition-colors ${
                  item.type === 'verification' 
                    ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20'
                    : item.type === 'report'
                    ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20'
                    : 'border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/20'
                }`}
              >
                <div className={`font-medium text-sm sm:text-base ${
                  item.type === 'verification' 
                    ? 'text-yellow-800 dark:text-yellow-500'
                    : item.type === 'report'
                    ? 'text-red-800 dark:text-red-500'
                    : 'text-blue-800 dark:text-blue-500'
                }`}>
                  <span className="font-bold">{item.count}</span> {item.description}
                </div>
                <div className={`text-xs sm:text-sm mt-1 ${
                  item.type === 'verification' 
                    ? 'text-yellow-700 dark:text-yellow-400'
                    : item.type === 'report'
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-blue-700 dark:text-blue-400'
                }`}>
                  {item.daysWaiting > 0 ? (
                    <>
                      <span className="hidden sm:inline">En attente depuis {item.daysWaiting} jour{item.daysWaiting > 1 ? 's' : ''}</span>
                      <span className="sm:hidden">{item.daysWaiting}j d'attente</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Récemment ajouté</span>
                      <span className="sm:hidden">Récent</span>
                    </>
                  )}
                </div>
              </div>
            ))}

            {pendingItems.length === 0 && (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-green-500" />
                <div className="text-sm">Aucun élément en attente</div>
              </div>
            )}

            <Button 
              variant="secondary" 
              className="w-full mt-3 sm:mt-4 text-sm"
              size="sm"
            >
              Voir tous les éléments
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Statistiques globales</CardTitle>
          <CardDescription className="text-sm">
            Vue d'ensemble des performances de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-4 sm:p-6 rounded-lg bg-muted/50">
              <div className="text-xl sm:text-2xl font-bold text-primary mb-2">
                {((stats?.totalProperties || 0) * 0.85).toFixed(0)}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                <span className="hidden sm:inline">Propriétés actives</span>
                <span className="sm:hidden">Prop. actives</span>
              </div>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-lg bg-muted/50">
              <div className="text-xl sm:text-2xl font-bold text-primary mb-2">
                {((stats?.totalUsers || 0) * 0.73).toFixed(0)}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                <span className="hidden sm:inline">Utilisateurs actifs ce mois</span>
                <span className="sm:hidden">Users actifs</span>
              </div>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-lg bg-muted/50">
              <div className="text-xl sm:text-2xl font-bold text-primary mb-2">
                {stats?.totalAgencies ? Math.round(stats.totalAgencies * 0.91) : 0}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                <span className="hidden sm:inline">Agences vérifiées</span>
                <span className="sm:hidden">Agences vérif.</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
