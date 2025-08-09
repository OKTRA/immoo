import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  Shield, 
  TrendingUp, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle, 
  Star,
  ArrowRight,
  Home,
  Key,
  Calculator,
  Camera,
  Handshake,
  LogIn,
  Globe,
  Zap,
  MessageCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import BecomeAgencyForm from '@/components/auth/BecomeAgencyForm';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import { useTranslation } from '@/hooks/useTranslation';
import LoginDialog from '@/components/auth/LoginDialog';

const ImmoAgencyPage: React.FC = () => {
  const { t } = useTranslation();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [becomePartnerDialogOpen, setBecomePartnerDialogOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [activeSection, setActiveSection] = useState<'agencies' | 'immoo'>('agencies');
  const [agencyLoginDialogOpen, setAgencyLoginDialogOpen] = useState(false);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Bonjour, je souhaite obtenir un devis pour vos services de gestion immobilière.");
    const whatsappUrl = `https://wa.me/22377010202?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailClick = () => {
    const subject = encodeURIComponent("Demande d'information - IMMOO Agency");
    const body = encodeURIComponent("Bonjour,\n\nJe souhaite obtenir plus d'informations sur vos services.\n\nCordialement,");
    const mailtoUrl = `mailto:contact@immoo.pro?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent("Nouveau message depuis le site IMMOO Agency");
    const body = encodeURIComponent(`
Nom: ${contactForm.name}
Email: ${contactForm.email}
Téléphone: ${contactForm.phone}
Message: ${contactForm.message}
    `);
    const mailtoUrl = `mailto:contact@immoo.pro?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
    setContactDialogOpen(false);
    setContactForm({ name: '', email: '', phone: '', message: '' });
  };

  const services = [
    {
      icon: <Home className="w-6 h-6" />,
      title: t('immoAgency.services.propertyManagement.title'),
      description: t('immoAgency.services.propertyManagement.description'),
      features: t('immoAgency.services.propertyManagement.features', { returnObjects: true }) as string[]
    },
    {
      icon: <Key className="w-6 h-6" />,
      title: t('immoAgency.services.rentalSale.title'),
      description: t('immoAgency.services.rentalSale.description'),
      features: t('immoAgency.services.rentalSale.features', { returnObjects: true }) as string[]
    },
    {
      icon: <Calculator className="w-6 h-6" />,
      title: t('immoAgency.services.financialOptimization.title'),
      description: t('immoAgency.services.financialOptimization.description'),
      features: t('immoAgency.services.financialOptimization.features', { returnObjects: true }) as string[]
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: t('immoAgency.services.marketingServices.title'),
      description: t('immoAgency.services.marketingServices.description'),
      features: t('immoAgency.services.marketingServices.features', { returnObjects: true }) as string[]
    }
  ];

  const advantages = [
    {
      icon: <Shield className="w-8 h-8 text-immoo-gold" />,
      title: t('immoAgency.advantages.localExpertise.title'),
      description: t('immoAgency.advantages.localExpertise.description')
    },
    {
      icon: <Users className="w-8 h-8 text-immoo-gold" />,
      title: t('immoAgency.advantages.qualifiedNetwork.title'),
      description: t('immoAgency.advantages.qualifiedNetwork.description')
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-immoo-gold" />,
      title: t('immoAgency.advantages.guaranteedPerformance.title'),
      description: t('immoAgency.advantages.guaranteedPerformance.description')
    },
    {
      icon: <FileText className="w-8 h-8 text-immoo-gold" />,
      title: t('immoAgency.advantages.totalTransparency.title'),
      description: t('immoAgency.advantages.totalTransparency.description')
    }
  ];

  const partnershipBenefits = t('immoAgency.partnershipBenefits', { returnObjects: true }) as string[];

  return (
    <ResponsiveLayout>
      <div className="bg-gradient-to-br from-immoo-pearl/20 via-white to-immoo-pearl/10 dark:from-immoo-navy/50 dark:via-immoo-navy-light/30 dark:to-immoo-navy/50 min-h-[100dvh] overflow-x-hidden">
      
      {/* Navigation Tabs */}
      <section className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-2xl mx-auto">
            <Button
              onClick={() => setActiveSection('agencies')}
              className={`flex-1 py-4 px-6 text-lg font-semibold rounded-xl transition-all duration-300 ${
                activeSection === 'agencies'
                  ? 'bg-gradient-to-r from-immoo-gold to-immoo-gold-light text-immoo-navy shadow-lg'
                  : 'bg-white/80 text-immoo-navy border border-immoo-gold/30 hover:bg-immoo-gold/10'
              }`}
            >
              <Users className="mr-2 w-5 h-5" />
              Vous êtes agence ?
            </Button>
            <Button
              onClick={() => setActiveSection('immoo')}
              className={`flex-1 py-4 px-6 text-lg font-semibold rounded-xl transition-all duration-300 ${
                activeSection === 'immoo'
                  ? 'bg-gradient-to-r from-immoo-navy to-immoo-navy-light text-immoo-pearl shadow-lg'
                  : 'bg-white/80 text-immoo-navy border border-immoo-navy/30 hover:bg-immoo-navy/10'
              }`}
            >
              <Building2 className="mr-2 w-5 h-5" />
              IMMOO Agency
            </Button>
          </div>
        </div>
      </section>

      {/* Section pour les agences externes */}
      {activeSection === 'agencies' && (
        <>
          {/* Hero Section - Agences */}
          <section className="relative pb-16 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <motion.div 
                className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-r from-immoo-gold/5 to-immoo-gold-light/3 rounded-full filter blur-3xl"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mb-6"
                >
                  <Badge className="bg-immoo-gold/10 text-immoo-gold border-immoo-gold/20 px-4 py-2 text-sm font-medium">
                    Plateforme IMMOO
                  </Badge>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl md:text-6xl font-bold mb-6"
                >
                  <span className="text-immoo-navy dark:text-immoo-pearl">
                    Rejoignez la{" "}
                  </span>
                  <span className="bg-gradient-to-r from-immoo-gold to-immoo-gold-light bg-clip-text text-transparent">
                    Plateforme IMMOO
                  </span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-xl text-immoo-navy/70 dark:text-immoo-pearl/70 mb-8 max-w-2xl mx-auto"
                >
                  Développez votre activité avec nos outils modernes de gestion immobilière et notre réseau national
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <Button 
                    onClick={() => setBecomePartnerDialogOpen(true)}
                    className="bg-gradient-to-r from-immoo-gold to-immoo-gold-light hover:from-immoo-gold-light hover:to-immoo-gold text-immoo-navy px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Handshake className="mr-2 w-5 h-5" />
                    Devenir Partenaire
                  </Button>
                  <Button 
                     onClick={() => setAgencyLoginDialogOpen(true)}
                     variant="outline" 
                     className="border-immoo-gold text-immoo-gold hover:bg-immoo-gold hover:text-immoo-navy px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300"
                   >
                     <LogIn className="mr-2 w-5 h-5" />
                     Se connecter
                   </Button>

                </motion.div>
              </div>
            </div>
          </section>

          {/* Avantages pour les agences */}
          <section className="py-16 bg-white/50 dark:bg-immoo-navy-light/30">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-immoo-navy dark:text-immoo-pearl mb-4">
                  Pourquoi rejoindre IMMOO ?
                </h2>
                <p className="text-lg text-immoo-navy/70 dark:text-immoo-pearl/70 max-w-2xl mx-auto">
                  Découvrez tous les avantages de notre plateforme moderne
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: <Zap className="w-8 h-8 text-immoo-gold" />,
                    title: "Outils Modernes",
                    description: "Dashboard complet, gestion des propriétés, contrats automatisés et analytics en temps réel"
                  },
                  {
                    icon: <Globe className="w-8 h-8 text-immoo-gold" />,
                    title: "Réseau National",
                    description: "Accédez à un réseau d'agences partenaires dans tout le Mali pour plus d'opportunités"
                  },
                  {
                    icon: <TrendingUp className="w-8 h-8 text-immoo-gold" />,
                    title: "Croissance Assurée",
                    description: "Augmentez votre visibilité et développez votre portefeuille client efficacement"
                  },
                  {
                    icon: <Shield className="w-8 h-8 text-immoo-gold" />,
                    title: "Sécurité Garantie",
                    description: "Transactions sécurisées, vérification des locataires et protection des données"
                  },
                  {
                    icon: <FileText className="w-8 h-8 text-immoo-gold" />,
                    title: "Gestion Simplifiée",
                    description: "Automatisation des tâches administratives et génération de documents légaux"
                  },
                  {
                    icon: <Users className="w-8 h-8 text-immoo-gold" />,
                    title: "Support Dédié",
                    description: "Équipe support disponible et formation complète pour optimiser votre utilisation"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center p-6 bg-white/80 dark:bg-immoo-navy-light/80 rounded-2xl border border-immoo-gold/20 hover:border-immoo-gold/40 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-immoo-gold/10 to-immoo-gold-light/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-immoo-navy dark:text-immoo-pearl mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-immoo-navy/70 dark:text-immoo-pearl/70">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
                className="text-center mt-12"
              >
                <Button 
                  onClick={() => setBecomePartnerDialogOpen(true)}
                  className="bg-gradient-to-r from-immoo-gold to-immoo-gold-light hover:from-immoo-gold-light hover:to-immoo-gold text-immoo-navy px-12 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Handshake className="mr-2 w-6 h-6" />
                  Rejoindre IMMOO maintenant
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </section>
        </>
      )}

      {/* Section IMMOO Agency */}
      {activeSection === 'immoo' && (
        <>
          {/* Hero Section - IMMOO Agency */}
          <section className="relative pb-16 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <motion.div 
                className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-r from-immoo-navy/10 to-immoo-navy-light/5 rounded-full filter blur-3xl"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mb-6"
                >
                  <Badge className="bg-immoo-navy/10 text-immoo-navy border-immoo-navy/20 px-4 py-2 text-sm font-medium">
                    {t('immoAgency.badge')}
                  </Badge>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl md:text-6xl font-bold mb-6"
                >
                  <span className="text-immoo-navy dark:text-immoo-pearl">
                    {t('immoAgency.heroTitle')}{" "}
                  </span>
                  <span className="bg-gradient-to-r from-immoo-navy to-immoo-navy-light bg-clip-text text-transparent">
                    {t('immoAgency.heroSubtitle')}
                  </span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-xl text-immoo-navy/70 dark:text-immoo-pearl/70 mb-8 max-w-2xl mx-auto"
                >
                  {t('immoAgency.heroDescription')}
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <Button 
                    onClick={handleWhatsAppClick}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <MessageCircle className="mr-2 w-5 h-5" />
                    {t('immoAgency.chatWithUs')}
                  </Button>
                  <Button 
                    onClick={() => setContactDialogOpen(true)}
                    variant="outline" 
                    className="border-immoo-navy text-immoo-navy hover:bg-immoo-navy hover:text-immoo-pearl px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300"
                  >
                    <Mail className="mr-2 w-5 h-5" />
                    {t('immoAgency.contactUs')}
                  </Button>
                </motion.div>
              </div>
            </div>
          </section>

           {/* Services Section - IMMOO Agency */}
           <section className="py-16 bg-white/50 dark:bg-immoo-navy-light/30">
             <div className="container mx-auto px-4">
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6 }}
                 viewport={{ once: true }}
                 className="text-center mb-12"
               >
                 <h2 className="text-3xl md:text-4xl font-bold text-immoo-navy dark:text-immoo-pearl mb-4">
                   {t('immoAgency.servicesTitle')}
                 </h2>
                 <p className="text-lg text-immoo-navy/70 dark:text-immoo-pearl/70 max-w-2xl mx-auto">
                   {t('immoAgency.servicesSubtitle')}
                 </p>
               </motion.div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {services.map((service, index) => (
                   <motion.div
                     key={index}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.6, delay: index * 0.1 }}
                     viewport={{ once: true }}
                   >
                     <Card className="h-full p-6 bg-white/80 dark:bg-immoo-navy-light/80 border-immoo-gold/20 hover:border-immoo-gold/40 transition-all duration-300 hover:shadow-lg">
                       <CardContent className="p-0">
                         <h3 className="text-xl font-semibold text-immoo-navy dark:text-immoo-pearl mb-3">
                           {t(service.title)}
                         </h3>
                         <p className="text-immoo-navy/70 dark:text-immoo-pearl/70 mb-4">
                           {t(service.description)}
                         </p>
                         <ul className="space-y-2">
                           {service.features.map((feature, featureIndex) => (
                             <li key={featureIndex} className="flex items-center text-sm text-immoo-navy/60 dark:text-immoo-pearl/60">
                               <CheckCircle className="w-4 h-4 text-immoo-gold mr-2 flex-shrink-0" />
                               {t(feature)}
                             </li>
                           ))}
                         </ul>
                       </CardContent>
                     </Card>
                   </motion.div>
                 ))}
               </div>
             </div>
           </section>

           {/* Advantages Section - IMMOO Agency */}
           <section className="py-16 bg-gradient-to-br from-immoo-navy/5 to-immoo-navy-light/10 dark:from-immoo-navy-light/20 dark:to-immoo-navy/30">
             <div className="container mx-auto px-4">
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6 }}
                 viewport={{ once: true }}
                 className="text-center mb-12"
               >
                 <h2 className="text-3xl md:text-4xl font-bold text-immoo-navy dark:text-immoo-pearl mb-4">
                   {t('immoAgency.advantagesTitle')}
                 </h2>
                 <p className="text-lg text-immoo-navy/70 dark:text-immoo-pearl/70 max-w-2xl mx-auto">
                   {t('immoAgency.advantagesSubtitle')}
                 </p>
               </motion.div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {advantages.map((advantage, index) => (
                   <motion.div
                     key={index}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.6, delay: index * 0.1 }}
                     viewport={{ once: true }}
                     className="text-center p-6 bg-white/80 dark:bg-immoo-navy-light/80 rounded-2xl border border-immoo-gold/20 hover:border-immoo-gold/40 transition-all duration-300 hover:shadow-lg"
                   >
                     <div className="w-16 h-16 bg-gradient-to-r from-immoo-gold/10 to-immoo-gold-light/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                       {advantage.icon}
                     </div>
                     <h3 className="text-lg font-semibold text-immoo-navy dark:text-immoo-pearl mb-2">
                       {t(advantage.title)}
                     </h3>
                     <p className="text-sm text-immoo-navy/70 dark:text-immoo-pearl/70">
                       {t(advantage.description)}
                     </p>
                   </motion.div>
                 ))}
               </div>
             </div>
           </section>

           {/* Partnership Section - IMMOO Agency */}
           <section className="py-16 bg-white/50 dark:bg-immoo-navy-light/30">
             <div className="container mx-auto px-4">
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6 }}
                 viewport={{ once: true }}
                 className="text-center mb-12"
               >
                 <h2 className="text-3xl md:text-4xl font-bold text-immoo-navy dark:text-immoo-pearl mb-4">
                   {t('immoAgency.partnershipTitle')}
                 </h2>
                 <p className="text-lg text-immoo-navy/70 dark:text-immoo-pearl/70 max-w-2xl mx-auto">
                   {t('immoAgency.partnershipSubtitle')}
                 </p>
               </motion.div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {partnershipBenefits.map((benefit, index) => (
                   <motion.div
                     key={index}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.6, delay: index * 0.1 }}
                     viewport={{ once: true }}
                     className="flex items-start space-x-3 p-4 bg-white/60 dark:bg-immoo-navy-light/60 rounded-xl border border-immoo-gold/10"
                   >
                     <CheckCircle className="w-5 h-5 text-immoo-gold mt-1 flex-shrink-0" />
                     <span className="text-sm text-immoo-navy/80 dark:text-immoo-pearl/80">
                       {t(benefit)}
                     </span>
                   </motion.div>
                 ))}
               </div>

               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6, delay: 0.8 }}
                 viewport={{ once: true }}
                 className="text-center mt-12"
               >
                 <Button 
                   onClick={() => setBecomePartnerDialogOpen(true)}
                   className="bg-gradient-to-r from-immoo-gold to-immoo-gold-light hover:from-immoo-gold-light hover:to-immoo-gold text-immoo-navy px-12 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                 >
                   <Handshake className="mr-2 w-6 h-6" />
                   {t('immoAgency.becomePartner')}
                   <ArrowRight className="ml-2 w-5 h-5" />
                 </Button>
               </motion.div>
             </div>
           </section>

           {/* CTA Section - IMMOO Agency */}
           <section className="py-16 bg-gradient-to-r from-immoo-navy to-immoo-navy-light text-white">
             <div className="container mx-auto px-4">
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6 }}
                 viewport={{ once: true }}
                 className="text-center max-w-3xl mx-auto"
               >
                 <h2 className="text-3xl md:text-4xl font-bold mb-4">
                   {t('immoAgency.ctaTitle')}
                 </h2>
                 <p className="text-xl text-immoo-pearl/80 mb-8">
                   {t('immoAgency.ctaDescription')}
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
                   <Button 
                     onClick={handleWhatsAppClick}
                     className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                   >
                     <MessageCircle className="mr-2 w-5 h-5" />
                     {t('immoAgency.chatWithUs')}
                   </Button>
                   <Button 
                     onClick={handleEmailClick}
                     variant="outline" 
                     className="border-immoo-pearl text-immoo-pearl hover:bg-immoo-pearl hover:text-immoo-navy px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300"
                   >
                     <Mail className="mr-2 w-5 h-5" />
                     {t('immoAgency.sendEmail')}
                   </Button>
                 </div>
               </motion.div>
             </div>
           </section>
         </>
       )}



     {/* Modal de contact */}
     <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
       <DialogContent className="max-w-md">
         <DialogHeader>
           <DialogTitle className="text-xl font-bold text-immoo-navy dark:text-immoo-pearl">
             {t('immoAgency.contactForm.title')}
           </DialogTitle>
         </DialogHeader>
         <form onSubmit={handleContactSubmit} className="space-y-4">
           <div className="space-y-2">
             <Label htmlFor="name">{t('immoAgency.contactForm.fullName')}</Label>
             <Input
               id="name"
               type="text"
               value={contactForm.name}
               onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
               placeholder={t('immoAgency.contactForm.fullNamePlaceholder')}
               required
               className="h-11"
             />
           </div>
           <div className="space-y-2">
             <Label htmlFor="email">{t('immoAgency.contactForm.email')}</Label>
             <Input
               id="email"
               type="email"
               value={contactForm.email}
               onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
               placeholder={t('immoAgency.contactForm.emailPlaceholder')}
               required
               className="h-11"
             />
           </div>
           <div className="space-y-2">
             <Label htmlFor="phone">{t('immoAgency.contactForm.phone')}</Label>
             <Input
               id="phone"
               type="tel"
               value={contactForm.phone}
               onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
               placeholder={t('immoAgency.contactForm.phonePlaceholder')}
               className="h-11"
             />
           </div>
           <div className="space-y-2">
             <Label htmlFor="message">{t('immoAgency.contactForm.message')}</Label>
             <Textarea
               id="message"
               value={contactForm.message}
               onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
               placeholder={t('immoAgency.contactForm.messagePlaceholder')}
               rows={4}
               required
               className="resize-none"
             />
           </div>
           <div className="flex gap-3 pt-2">
             <Button 
               type="submit" 
               className="flex-1 bg-gradient-to-r from-immoo-gold to-immoo-gold-light hover:from-immoo-gold-light hover:to-immoo-gold text-immoo-navy"
             >
               <Mail className="mr-2 w-4 h-4" />
               {t('immoAgency.contactForm.send')}
             </Button>
             <Button 
               type="button" 
               variant="outline" 
               onClick={() => setContactDialogOpen(false)}
               className="px-6"
             >
               {t('immoAgency.contactForm.cancel')}
             </Button>
           </div>
         </form>
       </DialogContent>
     </Dialog>

     {/* Modal Devenir Partenaire */}
     <Dialog open={becomePartnerDialogOpen} onOpenChange={setBecomePartnerDialogOpen}>
       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
         <DialogHeader>
           <DialogTitle className="text-xl font-bold text-immoo-navy dark:text-immoo-pearl">
             {t('immoAgency.becomePartnerTitle')}
           </DialogTitle>
         </DialogHeader>
         <BecomeAgencyForm 
           onSuccess={() => setBecomePartnerDialogOpen(false)}
         />
       </DialogContent>
     </Dialog>
       <LoginDialog
         open={agencyLoginDialogOpen}
         onOpenChange={setAgencyLoginDialogOpen}
         userType="agency"
       />
     </div>
   </ResponsiveLayout>
  );
};

export default ImmoAgencyPage;