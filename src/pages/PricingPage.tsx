
import React, { useState, useEffect } from 'react';
import { Check, Star, MessageCircle, X, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import { MuanaPayClient } from '../../libs/muana-pay-sdk/index.js';

interface PlanData {
  id: string;
  name: string;
  price: number;
  billing_cycle: string;
  features: string[];
  max_properties: number;
  is_active: boolean;
  period?: string;
  description?: string;
  popular?: boolean;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline';
  savings?: string;
}

export default function PricingPage() {
  const { t } = useTranslation();
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null);
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Charger les plans depuis la base de données
  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Erreur lors du chargement des plans:', error);
        setError('Impossible de charger les plans d\'abonnement');
        toast.error('Erreur lors du chargement des plans');
        return;
      }

      // Transformer les données pour l'affichage
      const transformedPlans: PlanData[] = (data || []).map((plan, index) => {
        const isGratuit = plan.price === 0;
        const isPro = plan.price > 0;
        
        // Déterminer la période d'affichage
        let period = '';
        if (plan.billing_cycle === 'monthly') period = '1 mois';
        else if (plan.billing_cycle === 'semestriel') period = '6 mois';
        else if (plan.billing_cycle === 'yearly') period = '1 an';
        else period = plan.billing_cycle;

        // Description basée sur le type de plan
        let description = '';
        if (isGratuit) description = 'Parfait pour commencer';
        else if (plan.billing_cycle === 'semestriel') description = 'Idéal pour les agences en croissance';
        else if (plan.billing_cycle === 'yearly') description = 'Le meilleur rapport qualité-prix';
        else description = 'Plan professionnel';

        // Ajouter des fonctionnalités par défaut si nécessaire
        let features = Array.isArray(plan.features) ? plan.features : [];
        if (isPro && features.length < 3) {
          features = [
            ...features,
            `Jusqu'à ${plan.max_properties} propriétés`,
            'Gestion avancée',
            'Support prioritaire'
          ];
        }

        return {
          ...plan,
          price: Number(plan.price),
          period,
          description,
          features,
          popular: index === 1, // Le deuxième plan est populaire
          buttonText: isGratuit ? 'Commencer gratuitement' : `Activer ${plan.name}`,
          buttonVariant: isGratuit ? 'outline' as const : 'default' as const,
          savings: plan.billing_cycle === 'yearly' ? 'Économies sur l\'année' : undefined
        };
      });

      setPlans(transformedPlans);
    } catch (err) {
      console.error('Erreur inattendue:', err);
      setError('Une erreur inattendue s\'est produite');
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan: PlanData) => {
    if (plan.price === 0) {
      // Plan gratuit - pas besoin de contact
      toast.info('Le plan gratuit est déjà actif par défaut');
      return;
    }
    
    // Plans PRO - ouvrir le dialogue WhatsApp
    setSelectedPlan(plan);
    setShowWhatsAppDialog(true);
  };

  const handleWhatsAppContact = () => {
    if (!selectedPlan) return;
    
    const message = `Bonjour, je souhaite activer le plan ${selectedPlan.name} (${selectedPlan.price.toLocaleString()} FCFA pour ${selectedPlan.period}). Pouvez-vous m'aider avec la procédure d'activation ?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/22377010202?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setShowWhatsAppDialog(false);
  };

  const handleVerifyPayment = async () => {
    try {
      if (!selectedPlan) {
        toast.error('Veuillez sélectionner un plan');
        return;
      }
      if (!paymentRef || paymentRef.trim().length < 3) {
        toast.error('Entrez une référence de paiement valide');
        return;
      }

      setVerifying(true);
      setVerificationMessage(null);

      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes?.user) {
        toast.error('Connectez-vous pour activer un plan');
        navigate('/login');
        return;
      }
      const userId = userRes.user.id;

      const muana = new MuanaPayClient({
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      });

      const result = await muana.verifyTransaction({
        userId,
        paymentReference: paymentRef.trim(),
        planId: selectedPlan.id,
      });

      if (result.status === 'verified') {
        toast.success('Paiement vérifié et abonnement activé');
        setVerificationMessage('✅ Paiement vérifié. Votre abonnement a été activé.');
        setShowWhatsAppDialog(false);
        navigate('/admin');
      } else {
        setVerificationMessage('❌ Référence non reconnue ou montant incorrect.');
        toast.error('Vérification échouée');
      }
    } catch (e: any) {
      console.error('Verification error', e);
      toast.error(e?.message || 'Erreur lors de la vérification');
      setVerificationMessage('❌ Erreur lors de la vérification');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header compact pour mobile */}
        <div className="text-center mb-8 md:mb-16 mt-6 md:mt-8">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 md:mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-sm md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            {t('pricing.subtitle')}
          </p>
        </div>
        
        {/* Plans de pricing */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
            <span className="ml-2 text-gray-600">{t('pricing.loadingPlans')}</span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-600 mb-4">
              <MessageCircle className="w-12 h-12 mx-auto mb-2" />
              <h3 className="text-xl font-semibold">{t('errors.somethingWentWrong')}</h3>
              <p className="text-gray-600 mt-2">{error}</p>
            </div>
            <Button onClick={loadPlans} variant="outline">
              {t('pricing.retryLoading')}
            </Button>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-600 mb-4">
              <MessageCircle className="w-12 h-12 mx-auto mb-2" />
              <h3 className="text-xl font-semibold">{t('pricing.noPlansAvailable')}</h3>
              <p className="mt-2">{t('pricing.noPlansAvailable')}</p>
            </div>
            <Button onClick={loadPlans} variant="outline">
              {t('pricing.refreshPlans')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-7xl mx-auto px-4">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                className={`group relative transform transition-all duration-300 hover:scale-[1.02] md:hover:scale-105 ${
                  plan.popular ? 'md:-translate-y-4' : 'hover:-translate-y-1 md:hover:-translate-y-2'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Background simplifié pour mobile */}
                <div className={`absolute inset-0 rounded-xl md:rounded-2xl backdrop-blur-sm md:backdrop-blur-xl ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-amber-50 to-orange-50 md:from-gold/20 md:via-yellow-500/10 md:to-orange-500/20 border-2 border-amber-200 md:border-white/20' 
                    : 'bg-white/80 md:bg-white/60 border border-gray-200 md:border-white/20'
                } shadow-lg md:shadow-2xl`} />
                
                {/* Effet de brillance réduit sur mobile */}
                <div className="hidden md:block absolute inset-0 rounded-2xl overflow-hidden">
                  <div className={`absolute -top-2 -left-2 w-16 md:w-24 h-16 md:h-24 rounded-full blur-lg md:blur-xl opacity-50 md:opacity-70 group-hover:opacity-80 md:group-hover:opacity-100 transition-opacity duration-500 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-gold to-yellow-400' 
                      : 'bg-gradient-to-r from-blue-400 to-purple-400'
                  }`} />
                </div>

                <Card className="relative z-10 bg-transparent border-0 shadow-none overflow-hidden">
                  {/* Badge populaire compact pour mobile */}
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 z-20">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 md:from-gold md:via-yellow-500 md:to-orange-500 text-white text-center py-2 md:py-3 text-xs md:text-sm font-bold relative overflow-hidden">
                        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                        <div className="relative flex items-center justify-center">
                          <Star className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 animate-bounce" />
                          <span className="tracking-wide text-xs md:text-sm">✨ POPULAIRE ✨</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className={`text-center relative z-10 ${plan.popular ? 'pt-10 md:pt-16' : 'pt-4 md:pt-8'} pb-3 md:pb-4 px-3 md:px-6`}>
                    {/* Icône du plan réduite sur mobile */}
                    <div className="flex justify-center mb-3 md:mb-4">
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center ${
                        plan.popular 
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 md:from-gold md:to-yellow-500 shadow-md md:shadow-lg shadow-amber-300/50 md:shadow-gold/30' 
                          : plan.price === 0 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-md md:shadow-lg shadow-green-500/30'
                            : 'bg-gradient-to-br from-blue-500 to-purple-500 shadow-md md:shadow-lg shadow-blue-500/30'
                      }`}>
                        {plan.price === 0 ? (
                          <span className="text-lg md:text-2xl">🎁</span>
                        ) : plan.popular ? (
                          <span className="text-lg md:text-2xl">👑</span>
                        ) : (
                          <span className="text-lg md:text-2xl">🚀</span>
                        )}
                      </div>
                    </div>

                    <CardTitle className={`text-xl md:text-3xl font-black mb-1 md:mb-2 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 md:from-gold md:to-yellow-600 bg-clip-text text-transparent' 
                        : 'text-gray-900'
                    }`}>
                      {plan.name}
                    </CardTitle>
                    
                    <CardDescription className="text-gray-600 font-medium mb-3 md:mb-6 text-sm md:text-base">
                      {plan.description}
                    </CardDescription>
                    
                    {/* Prix compact pour mobile */}
                    <div className="relative">
                      <div className="flex items-baseline justify-center mb-2">
                        <span className={`text-2xl md:text-5xl font-black ${
                          plan.popular 
                            ? 'bg-gradient-to-r from-amber-600 to-orange-600 md:from-gold md:to-yellow-600 bg-clip-text text-transparent' 
                            : 'text-gray-900'
                        }`}>
                          {plan.price === 0 ? 'Gratuit' : `${plan.price.toLocaleString()}`}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-sm md:text-xl font-bold text-gray-500 ml-1 md:ml-2">FCFA</span>
                        )}
                      </div>
                      
                      <div className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-amber-100 to-orange-100 md:from-gold/20 md:to-yellow-500/20 text-amber-800 md:text-yellow-800 border border-amber-300 md:border-gold/30' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        📅 {plan.period}
                      </div>
                      
                      {plan.savings && (
                        <div className="mt-2 md:mt-3">
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-2 md:px-3 py-1 shadow-lg animate-pulse text-xs md:text-sm">
                            💰 {plan.savings}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="px-3 md:px-8 pb-4 md:pb-8 relative z-10">
                    {/* Liste des fonctionnalités compacte pour mobile */}
                    <div className="space-y-2 md:space-y-4 mb-4 md:mb-8">
                      {plan.features.slice(0, 3).map((feature, featureIndex) => (
                        <div 
                          key={featureIndex} 
                          className="flex items-center group/feature"
                          style={{ animationDelay: `${(index * 100) + (featureIndex * 50)}ms` }}
                        >
                          <div className={`w-4 h-4 md:w-6 md:h-6 rounded-full flex items-center justify-center mr-2 md:mr-4 transition-all duration-300 group-hover/feature:scale-110 ${
                            plan.popular 
                              ? 'bg-gradient-to-r from-amber-400 to-orange-500 md:from-gold md:to-yellow-500 shadow-sm md:shadow-lg shadow-amber-300/50 md:shadow-gold/30' 
                              : 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-sm md:shadow-lg shadow-green-500/30'
                          }`}>
                            <Check className="w-2 h-2 md:w-4 md:h-4 text-white font-bold" />
                          </div>
                          <span className="text-gray-700 font-medium group-hover/feature:text-gray-900 transition-colors text-sm md:text-base">
                            {feature}
                          </span>
                        </div>
                      ))}
                      {plan.features.length > 3 && (
                        <div className="flex items-center text-gray-500 text-xs md:text-sm pl-6 md:pl-10">
                          +{plan.features.length - 3} autres fonctionnalités
                        </div>
                      )}
                    </div>
                    
                    {/* Bouton compact pour mobile */}
                    <Button 
                      onClick={() => handlePlanSelect(plan)}
                      className={`w-full py-3 md:py-4 text-sm md:text-lg font-bold rounded-lg md:rounded-xl transition-all duration-300 transform hover:scale-[1.02] md:hover:scale-105 active:scale-95 relative overflow-hidden group/button ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 md:from-gold md:via-yellow-500 md:to-orange-500 hover:from-orange-500 hover:to-amber-500 md:hover:from-yellow-500 md:hover:via-gold md:hover:to-yellow-600 text-white shadow-lg md:shadow-xl shadow-amber-300/50 md:shadow-gold/30 border-0' 
                          : plan.price === 0
                            ? 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 border border-gray-300 md:border-2 hover:border-gray-400'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg md:shadow-xl shadow-blue-500/30 border-0'
                      }`}
                    >
                      {/* Effet de brillance réduit sur mobile */}
                      <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-700" />
                      
                      <span className="relative z-10 flex items-center justify-center">
                        {plan.price === 0 ? '🎯' : '⚡'} 
                        <span className="ml-1 md:ml-2">{plan.buttonText}</span>
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
        
        {/* Footer compact pour mobile */}
        <div className="text-center mt-8 md:mt-16 pb-6 md:pb-12 px-4">
          <p className="text-gray-600 mb-3 md:mb-4 text-sm md:text-base">
            {t('pricing.needHelp')}
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.open('https://wa.me/22377010202?text=Bonjour, j\'ai besoin d\'aide pour choisir un plan IMMOO.', '_blank')}
            className="flex items-center gap-2 mx-auto text-sm md:text-base py-2 md:py-3 px-4 md:px-6"
          >
            <MessageCircle className="w-4 h-4" />
            {t('pricing.contactTeam')}
          </Button>
        </div>
      </div>

      {/* Dialog WhatsApp Élégant */}
      <Dialog open={showWhatsAppDialog} onOpenChange={setShowWhatsAppDialog}>
        <DialogContent className="sm:max-w-lg border-0 shadow-2xl">
          {/* Header avec gradient */}
          <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 p-6 text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
            <div className="relative z-10">
              <DialogTitle className="flex items-center gap-3 text-xl font-bold mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <MessageCircle className="w-5 h-5" />
                </div>
                {t('pricing.whatsAppActivationTitle')}
              </DialogTitle>
              <DialogDescription className="text-green-100">
                {t('pricing.whatsAppActivationDescription')}
              </DialogDescription>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Carte du plan sélectionné */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 p-5">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full blur-xl" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-lg">👑</span>
                  </div>
                  <h4 className="font-bold text-gray-900">{t('pricing.selectedPlan')}</h4>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t('pricing.plan')}:</span>
                    <span className="font-semibold text-gray-900">{selectedPlan?.name}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t('pricing.price')}:</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        {selectedPlan?.price?.toLocaleString()}
                      </span>
                      <span className="text-sm font-semibold text-gray-500">FCFA</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t('pricing.period')}:</span>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-sm font-semibold border border-amber-300">
                      📅 {selectedPlan?.period}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Message d'information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">ℹ️</span>
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">{t('pricing.quickActivation')}</p>
                  <p>{t('pricing.activationGuidance')}</p>
                </div>
              </div>
            </div>

            {/* Vérification par référence de paiement */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-gray-700">Référence de paiement Mobile Money</label>
                <Input
                  placeholder="Collez la référence (ex: ABC123)"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                />
                {verificationMessage && (
                  <div className="text-sm">
                    {verificationMessage}
                  </div>
                )}
                <Button
                  onClick={handleVerifyPayment}
                  disabled={verifying || !paymentRef}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Vérification...
                    </>
                  ) : (
                    'Vérifier et activer'
                  )}
                </Button>
                <div className="text-xs text-gray-500">
                  Astuce: lʼapplication mobile Muana enverra automatiquement vos SMS vers IMMOO pour accélérer la vérification.
                </div>
              </div>
            </div>
            
            {/* Boutons d'action */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowWhatsAppDialog(false)}
                className="flex-1 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              >
                <X className="w-4 h-4 mr-2" />
                {t('pricing.cancel')}
              </Button>
              
              <Button 
                onClick={handleWhatsAppContact}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 relative overflow-hidden group"
              >
                {/* Effet de brillance */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                
                <div className="relative z-10 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 mr-2"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {t('pricing.contactWhatsApp')}
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
