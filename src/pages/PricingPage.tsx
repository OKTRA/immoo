
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap, ArrowRight } from 'lucide-react';
import { getAllSubscriptionPlans } from '@/services/subscriptionService';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { SubscriptionPlan } from '@/assets/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function PricingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const { subscription, upgradeSubscription, isFreePlan } = useUserSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { plans: allPlans, error } = await getAllSubscriptionPlans(true);
      if (error) {
        toast.error(`Erreur: ${error}`);
        return;
      }
      // Trier par prix croissant
      const sortedPlans = allPlans.sort((a, b) => a.price - b.price);
      setPlans(sortedPlans);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Erreur lors du chargement des plans');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setUpgrading(planId);
    try {
      const success = await upgradeSubscription(planId, undefined, 'stripe');
      if (success) {
        toast.success('Mise à niveau réussie !');
        navigate('/agencies');
      }
    } catch (error) {
      console.error('Error upgrading:', error);
      toast.error('Erreur lors de la mise à niveau');
    } finally {
      setUpgrading(null);
    }
  };

  const getPlanIcon = (plan: SubscriptionPlan) => {
    if (plan.price === 0) return <Star className="h-6 w-6 text-yellow-500" />;
    if (plan.price > 50000) return <Crown className="h-6 w-6 text-purple-500" />;
    return <Zap className="h-6 w-6 text-blue-500" />;
  };

  const getCurrentPlanId = () => subscription?.planId;

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratuit';
    return `${price.toLocaleString()} FCFA`;
  };

  const getPlanColor = (plan: SubscriptionPlan) => {
    if (plan.price === 0) return 'border-gray-200';
    if (plan.price > 50000) return 'border-purple-500 shadow-purple-100';
    return 'border-blue-500 shadow-blue-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Chargement des plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* En-tête */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            💎 Plans d'abonnement
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Choisissez votre plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Développez votre activité immobilière avec nos plans adaptés à tous vos besoins.
            Passez au niveau supérieur dès aujourd'hui !
          </p>
        </div>

        {/* Affichage du plan actuel */}
        {subscription && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border rounded-full px-6 py-3 shadow-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                Plan actuel: <span className="text-primary font-semibold">{subscription.plan?.name}</span>
                {subscription.plan?.price === 0 ? ' (Gratuit)' : ` - ${formatPrice(subscription.plan?.price || 0)}/mois`}
              </span>
            </div>
          </div>
        )}

        {/* Grille des plans */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === getCurrentPlanId();
            const isUpgradable = subscription && plan.price > (subscription.plan?.price || 0);
            const isPremium = plan.price > 0;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative transition-all duration-300 hover:scale-105 hover:shadow-xl bg-white/90 backdrop-blur-sm ${getPlanColor(plan)} ${isCurrentPlan ? 'ring-2 ring-primary scale-105' : ''}`}
              >
                {isPremium && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1">
                      ⭐ Recommandé
                    </Badge>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-white px-4 py-1">
                      ✅ Plan actuel
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full w-fit">
                    {getPlanIcon(plan)}
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {formatPrice(plan.price)}
                    </div>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground text-sm">
                        par {plan.billingCycle === 'monthly' ? 'mois' : 'an'}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Limites principales */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Limites incluses
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
                        <span className="font-bold text-blue-600">
                          {plan.maxAgencies === 999999 ? '∞' : plan.maxAgencies}
                        </span>
                        <span className="text-xs text-muted-foreground">Agences</span>
                      </div>
                      <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
                        <span className="font-bold text-green-600">
                          {plan.maxProperties === 999999 ? '∞' : plan.maxProperties}
                        </span>
                        <span className="text-xs text-muted-foreground">Propriétés</span>
                      </div>
                      <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
                        <span className="font-bold text-purple-600">
                          {plan.maxLeases === 999999 ? '∞' : plan.maxLeases}
                        </span>
                        <span className="text-xs text-muted-foreground">Baux</span>
                      </div>
                      <div className="flex flex-col items-center p-3 bg-orange-50 rounded-lg">
                        <span className="font-bold text-orange-600">
                          {plan.maxUsers === 999999 ? '∞' : plan.maxUsers}
                        </span>
                        <span className="text-xs text-muted-foreground">Utilisateurs</span>
                      </div>
                    </div>
                  </div>

                  {/* Fonctionnalités */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Fonctionnalités
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {plan.features.slice(0, 4).map((feature, index) => (
                        <div key={index} className="flex items-start text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                      {plan.features.length > 4 && (
                        <div className="text-xs text-muted-foreground italic">
                          +{plan.features.length - 4} autres fonctionnalités...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bouton d'action */}
                  <div className="pt-4">
                    {isCurrentPlan ? (
                      <Button disabled className="w-full bg-green-500 text-white">
                        ✅ Plan actuel
                      </Button>
                    ) : isUpgradable ? (
                      <Button 
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={upgrading === plan.id}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3"
                      >
                        {upgrading === plan.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Mise à niveau...
                          </>
                        ) : (
                          <>
                            Passer à ce plan
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button variant="outline" disabled className="w-full">
                        {plan.price === 0 ? 'Plan gratuit' : 'Rétrogradation non disponible'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Section FAQ/Support */}
        <div className="max-w-4xl mx-auto mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Questions fréquentes</h2>
            <p className="text-muted-foreground">
              Vous avez des questions ? Nous avons les réponses.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">💳 Méthodes de paiement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Nous acceptons Mobile Money, virements bancaires, et paiements manuels.
                  Tous les paiements sont sécurisés.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">🔄 Changement de plan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Vous pouvez mettre à niveau votre plan à tout moment.
                  Les changements prennent effet immédiatement.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">🛠️ Support technique</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Tous les plans incluent notre support technique et les mises à jour automatiques.
                  Support prioritaire pour les plans premium.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">📞 Besoin d'aide ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Notre équipe est là pour vous guider dans le choix du plan adapté à vos besoins.
                </p>
                <Button variant="outline" className="w-full">
                  Contacter le support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to action final */}
        {isFreePlan() && (
          <div className="text-center mt-16">
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">
                  🚀 Prêt à développer votre activité ?
                </h3>
                <p className="mb-6 opacity-90">
                  Passez au plan premium et débloquez toutes les fonctionnalités avancées 
                  pour faire croître votre portefeuille immobilier.
                </p>
                <Button 
                  onClick={() => {
                    const premiumPlan = plans.find(p => p.price > 0 && p.price < 50000);
                    if (premiumPlan) handleUpgrade(premiumPlan.id);
                  }}
                  className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-3"
                >
                  Passer au premium maintenant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
