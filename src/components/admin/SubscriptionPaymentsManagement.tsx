
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Edit, 
  Settings,
  DollarSign,
  Users,
  Building,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface SubscriptionPayment {
  id: string;
  userId: string;
  agencyId: string;
  planId: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  paidAt?: string;
  agencyName: string;
  planName: string;
  userEmail: string;
}

interface PaymentStats {
  totalPayments: number;
  pendingPayments: number;
  paidPayments: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export default function SubscriptionPaymentsManagement() {
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalPayments: 0,
    pendingPayments: 0,
    paidPayments: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<SubscriptionPayment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isActivationDialogOpen, setIsActivationDialogOpen] = useState(false);
  const [autoActivation, setAutoActivation] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPayments();
    loadSettings();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      
      // Charger les paiements d'abonnement depuis billing_history
      const { data: billingData, error } = await supabase
        .from('billing_history')
        .select(`
          *,
          agencies:agency_id(name),
          subscription_plans:plan_id(name),
          profiles:user_id(email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const paymentsData = billingData?.map(payment => ({
        id: payment.id,
        userId: payment.user_id,
        agencyId: payment.agency_id,
        planId: payment.plan_id,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: payment.payment_method || 'unknown',
        transactionId: payment.transaction_id,
        createdAt: payment.created_at,
        paidAt: payment.payment_date,
        agencyName: payment.agencies?.name || 'N/A',
        planName: payment.subscription_plans?.name || 'N/A',
        userEmail: payment.profiles?.email || 'N/A'
      })) || [];

      setPayments(paymentsData);
      
      // Calculer les statistiques
      const totalPayments = paymentsData.length;
      const pendingPayments = paymentsData.filter(p => p.status === 'pending').length;
      const paidPayments = paymentsData.filter(p => p.status === 'paid').length;
      const totalRevenue = paymentsData
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const monthlyRevenue = paymentsData
        .filter(p => p.status === 'paid' && new Date(p.paidAt || p.createdAt) >= thisMonth)
        .reduce((sum, p) => sum + p.amount, 0);

      setStats({
        totalPayments,
        pendingPayments,
        paidPayments,
        totalRevenue,
        monthlyRevenue
      });

    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('system_config')
        .select('config_value')
        .eq('config_key', 'auto_subscription_activation')
        .single();
      
      if (data) {
        setAutoActivation(data.config_value?.enabled || true);
      }
    } catch (error) {
      console.log('No auto activation config found, using default');
    }
  };

  const handleManualActivation = async (paymentId: string) => {
    try {
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return;

      // Marquer le paiement comme payé
      const { error: billingError } = await supabase
        .from('billing_history')
        .update({
          status: 'paid',
          payment_date: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (billingError) throw billingError;

      // Activer l'abonnement
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: payment.userId,
          agency_id: payment.agencyId,
          plan_id: payment.planId,
          status: 'active',
          start_date: new Date().toISOString(),
          payment_method: payment.paymentMethod
        });

      if (subscriptionError) throw subscriptionError;

      toast.success('Abonnement activé manuellement');
      loadPayments();
      setIsActivationDialogOpen(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error('Error activating subscription:', error);
      toast.error('Erreur lors de l\'activation');
    }
  };

  const handleStatusChange = async (paymentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('billing_history')
        .update({ 
          status: newStatus,
          payment_date: newStatus === 'paid' ? new Date().toISOString() : null
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast.success('Statut mis à jour');
      loadPayments();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleAutoActivationToggle = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('system_config')
        .upsert({
          config_key: 'auto_subscription_activation',
          config_value: { enabled },
          category: 'payments',
          description: 'Activation automatique des abonnements après paiement'
        });

      if (error) throw error;

      setAutoActivation(enabled);
      toast.success(`Activation automatique ${enabled ? 'activée' : 'désactivée'}`);
    } catch (error) {
      console.error('Error updating auto activation:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Payé</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Échoué</Badge>;
      case 'cancelled':
        return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      payment.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.planName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des paiements d'abonnement</h1>
          <p className="text-muted-foreground">
            Gérez les paiements et activations d'abonnement des agences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="auto-activation">Activation automatique</Label>
          <Switch
            id="auto-activation"
            checked={autoActivation}
            onCheckedChange={handleAutoActivationToggle}
          />
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total paiements</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPayments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingPayments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payés</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paidPayments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyRevenue.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Rechercher</Label>
              <Input
                id="search"
                placeholder="Nom d'agence, email, plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status-filter">Statut</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="paid">Payé</SelectItem>
                  <SelectItem value="failed">Échoué</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des paiements */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des paiements</CardTitle>
          <CardDescription>
            Liste de tous les paiements d'abonnement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Agence</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Méthode</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="font-medium">{payment.agencyName}</TableCell>
                  <TableCell>{payment.userEmail}</TableCell>
                  <TableCell>{payment.planName}</TableCell>
                  <TableCell>{payment.amount.toLocaleString()} FCFA</TableCell>
                  <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {payment.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setIsActivationDialogOpen(true);
                          }}
                        >
                          Activer
                        </Button>
                      )}
                      <Dialog open={isEditDialogOpen && selectedPayment?.id === payment.id} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPayment(payment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifier le paiement</DialogTitle>
                            <DialogDescription>
                              Modifiez le statut du paiement
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="status">Statut</Label>
                              <Select
                                value={payment.status}
                                onValueChange={(value) => handleStatusChange(payment.id, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">En attente</SelectItem>
                                  <SelectItem value="paid">Payé</SelectItem>
                                  <SelectItem value="failed">Échoué</SelectItem>
                                  <SelectItem value="cancelled">Annulé</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                              Annuler
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog d'activation manuelle */}
      <AlertDialog open={isActivationDialogOpen} onOpenChange={setIsActivationDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activer l'abonnement manuellement</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir activer manuellement cet abonnement ?
              Cela marquera le paiement comme effectué et activera l'abonnement pour l'agence.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedPayment && handleManualActivation(selectedPayment.id)}
            >
              Activer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
