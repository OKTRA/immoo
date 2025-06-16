
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { initCinetPayPayment } from '@/services/payment/cinetpayService';
import { SubscriptionPlan } from '@/assets/types';

interface SubscriptionPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
  onSuccess: (transactionId: string) => void;
}

export default function SubscriptionPaymentDialog({
  isOpen,
  onClose,
  plan,
  onSuccess
}: SubscriptionPaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'card'>('mobile_money');
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Abidjan',
    country: 'CI'
  });

  const handlePayment = async () => {
    if (!customerData.name || !customerData.email || !customerData.phone) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);

    try {
      const origin = window.location.origin;
      const amount = plan.price;
      const description = `Abonnement ${plan.name} - ${plan.billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}`;

      const { data, error } = await initCinetPayPayment({
        amount,
        description,
        currency: 'XOF',
        returnUrl: `${origin}/pricing?payment=success`,
        cancelUrl: `${origin}/pricing?payment=cancel`,
        paymentData: {
          customerName: customerData.name,
          customerEmail: customerData.email,
          customerPhone: customerData.phone,
          customerAddress: customerData.address,
          customerCity: customerData.city,
          customerCountry: customerData.country
        }
      });

      if (error || !data) {
        toast.error('Erreur lors de l\'initialisation du paiement');
        return;
      }

      if (data.data?.payment_url) {
        // Ouvrir l'URL de paiement dans une nouvelle fenêtre
        const paymentWindow = window.open(
          data.data.payment_url,
          'cinetpay_payment',
          'width=800,height=600,scrollbars=yes,resizable=yes'
        );

        // Vérifier périodiquement si la fenêtre est fermée
        const checkClosed = setInterval(() => {
          if (paymentWindow?.closed) {
            clearInterval(checkClosed);
            // Vérifier le statut du paiement
            setTimeout(() => {
              toast.info('Vérification du statut du paiement...');
              onSuccess(data.data.transaction_id);
            }, 1000);
          }
        }, 1000);

        toast.success('Redirection vers la page de paiement...');
      }
    } catch (error) {
      console.error('Erreur de paiement:', error);
      toast.error('Une erreur est survenue lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Paiement de l'abonnement</DialogTitle>
          <DialogDescription>
            Payez votre abonnement {plan.name} via Mobile Money ou carte bancaire
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Résumé du plan */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <CardDescription>
                {plan.billingCycle === 'monthly' ? 'Abonnement mensuel' : 'Abonnement annuel'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total à payer</span>
                <span className="text-primary">{plan.price.toLocaleString()} FCFA</span>
              </div>
            </CardContent>
          </Card>

          {/* Méthode de paiement */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Méthode de paiement</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={paymentMethod === 'mobile_money' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('mobile_money')}
                className="h-12 flex items-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                Mobile Money
              </Button>
              <Button
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('card')}
                className="h-12 flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Carte bancaire
              </Button>
            </div>
          </div>

          {/* Informations client */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Informations de facturation</Label>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  value={customerData.name}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Votre nom complet"
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  value={customerData.phone}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+225 XX XX XX XX"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={customerData.email}
                onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={customerData.address}
                onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Votre adresse"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={customerData.city}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Abidjan"
                />
              </div>
              <div>
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  value={customerData.country}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="CI"
                />
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button onClick={handlePayment} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payer {plan.price.toLocaleString()} FCFA
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
