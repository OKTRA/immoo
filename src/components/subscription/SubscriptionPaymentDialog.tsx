
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

          {/* Information de contact WhatsApp */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-muted-foreground mb-3 text-center">
              Les paiements ne sont pas encore configurés. Pour les procédures de paiement, contactez-nous sur WhatsApp :
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => window.open('https://wa.me/22377010202?text=Bonjour, je souhaite obtenir des informations sur les procédures de paiement.', '_blank')}
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Contacter pour paiement (+223 77 01 02 02)
              </button>
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
