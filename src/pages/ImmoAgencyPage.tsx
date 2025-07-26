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

const ImmoAgencyPage: React.FC = () => {
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [becomePartnerDialogOpen, setBecomePartnerDialogOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

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
      title: "Gestion Locative Complète",
      description: "Nous prenons en charge toute la gestion de vos biens locatifs : recherche de locataires, gestion administrative, maintenance et suivi.",
      features: [
        "Recherche et sélection de locataires qualifiés",
        "Gestion des contrats de location",
        "Suivi des paiements et relances",
        "Coordination des interventions de maintenance",
        "Rapports mensuels détaillés"
      ]
    },
    {
      icon: <Key className="w-6 h-6" />,
      title: "Location & Vente",
      description: "Services complets de transaction immobilière avec notre expertise du marché malien et notre réseau d'acheteurs/locataires.",
      features: [
        "Évaluation précise de vos biens",
        "Marketing et promotion ciblée",
        "Accompagnement des visites",
        "Négociation et finalisation des transactions",
        "Suivi post-transaction"
      ]
    },
    {
      icon: <Calculator className="w-6 h-6" />,
      title: "Optimisation Financière",
      description: "Maximisez vos revenus locatifs et optimisez vos investissements immobiliers avec nos conseils d'experts.",
      features: [
        "Analyse de rentabilité",
        "Optimisation des loyers",
        "Gestion fiscale et comptable",
        "Stratégies d'investissement",
        "Suivi des performances"
      ]
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Services Marketing",
      description: "Visites virtuelles, photos professionnelles et présence digitale pour valoriser vos biens sur le marché.",
      features: [
        "Photographie immobilière professionnelle",
        "Visites virtuelles 360°",
        "Création de contenus marketing",
        "Gestion des réseaux sociaux",
        "Publicité ciblée"
      ]
    }
  ];

  const advantages = [
    {
      icon: <Shield className="w-8 h-8 text-immoo-gold" />,
      title: "Expertise Locale",
      description: "Plus de 5 ans d'expérience sur le marché immobilier malien"
    },
    {
      icon: <Users className="w-8 h-8 text-immoo-gold" />,
      title: "Réseau Qualifié",
      description: "Base de données de locataires et acheteurs vérifiés"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-immoo-gold" />,
      title: "Performance Garantie",
      description: "Taux de location de 95% et délai moyen de 15 jours"
    },
    {
      icon: <FileText className="w-8 h-8 text-immoo-gold" />,
      title: "Transparence Totale",
      description: "Rapports détaillés et suivi en temps réel de vos biens"
    }
  ];

  const partnershipBenefits = [
    "Partage de propriétés avec le réseau IMMOO",
    "Accès à une base de données nationale",
    "Commission partagée équitable",
    "Support technique et formation",
    "Outils de gestion modernes"
  ];

  return (
    <ResponsiveLayout>
      <div className="bg-gradient-to-br from-immoo-pearl/20 via-white to-immoo-pearl/10 dark:from-immoo-navy/50 dark:via-immoo-navy-light/30 dark:to-immoo-navy/50 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
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
                IMMOO Agency
              </Badge>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              <span className="text-immoo-navy dark:text-immoo-pearl">
                Gestion Immobilière{" "}
              </span>
              <span className="bg-gradient-to-r from-immoo-gold to-immoo-gold-light bg-clip-text text-transparent">
                Professionnelle
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-immoo-navy/70 dark:text-immoo-pearl/70 mb-8 max-w-2xl mx-auto"
            >
              Confiez-nous la gestion de vos biens immobiliers. Nous maximisons vos revenus 
              tout en vous libérant des contraintes administratives.
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
                Discuter avec nous
              </Button>
              <Button 
                onClick={() => setContactDialogOpen(true)}
                variant="outline" 
                className="border-immoo-gold text-immoo-gold hover:bg-immoo-gold hover:text-immoo-navy px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300"
              >
                <Mail className="mr-2 w-5 h-5" />
                Nous contacter
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-immoo-navy dark:text-immoo-pearl mb-4">
              Nos Services Spécialisés
            </h2>
            <p className="text-lg text-immoo-navy/70 dark:text-immoo-pearl/70 max-w-2xl mx-auto">
              Une gamme complète de services pour optimiser votre investissement immobilier
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
                <Card className="h-full bg-white/80 dark:bg-immoo-navy-light/80 backdrop-blur-sm border-immoo-gold/20 hover:border-immoo-gold/40 transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-immoo-gold/20 to-immoo-gold-light/20 rounded-xl flex items-center justify-center mb-4">
                      {service.icon}
                    </div>
                    <CardTitle className="text-xl text-immoo-navy dark:text-immoo-pearl">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-immoo-navy/70 dark:text-immoo-pearl/70">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-immoo-gold mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-immoo-navy/80 dark:text-immoo-pearl/80">
                            {feature}
                          </span>
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

      {/* Advantages Section */}
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
              Pourquoi Choisir IMMOO Agency ?
            </h2>
            <p className="text-lg text-immoo-navy/70 dark:text-immoo-pearl/70 max-w-2xl mx-auto">
              Notre expertise et notre engagement font la différence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((advantage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-immoo-gold/10 to-immoo-gold-light/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {advantage.icon}
                </div>
                <h3 className="text-lg font-semibold text-immoo-navy dark:text-immoo-pearl mb-2">
                  {advantage.title}
                </h3>
                <p className="text-sm text-immoo-navy/70 dark:text-immoo-pearl/70">
                  {advantage.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-immoo-navy dark:text-immoo-pearl mb-4">
                Partenariat avec le Réseau IMMOO
              </h2>
              <p className="text-lg text-immoo-navy/70 dark:text-immoo-pearl/70">
                Rejoignez notre réseau d'agences partenaires et bénéficiez de notre plateforme
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-immoo-gold/10 to-immoo-gold-light/10 rounded-2xl p-8 border border-immoo-gold/20"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-immoo-navy dark:text-immoo-pearl mb-4">
                    Avantages du Partenariat
                  </h3>
                  <ul className="space-y-3">
                    {partnershipBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Handshake className="w-5 h-5 text-immoo-gold mt-0.5 flex-shrink-0" />
                        <span className="text-immoo-navy/80 dark:text-immoo-pearl/80">
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-immoo-gold to-immoo-gold-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-12 h-12 text-immoo-navy" />
                  </div>
                  <h4 className="text-xl font-semibold text-immoo-navy dark:text-immoo-pearl mb-2">
                    Réseau National
                  </h4>
                  <p className="text-immoo-navy/70 dark:text-immoo-pearl/70 mb-4">
                    Accédez à des propriétés dans tout le Mali
                  </p>
                  <Button 
                    onClick={() => setBecomePartnerDialogOpen(true)}
                    className="bg-immoo-navy hover:bg-immoo-navy-light text-immoo-pearl px-6 py-2 rounded-xl"
                  >
                    Devenir Partenaire
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-immoo-gold to-immoo-gold-light">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-immoo-navy mb-4">
              Prêt à Optimiser Vos Revenus Immobiliers ?
            </h2>
            <p className="text-lg text-immoo-navy/80 mb-8">
              Contactez-nous pour une consultation gratuite et découvrez comment nous pouvons 
              maximiser la rentabilité de vos biens.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleWhatsAppClick}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                WhatsApp
              </Button>
              <Button 
                onClick={() => setContactDialogOpen(true)}
                variant="outline" 
                className="border-immoo-navy text-immoo-navy hover:bg-immoo-navy hover:text-immoo-pearl px-8 py-3 text-lg font-semibold rounded-xl"
              >
                <Mail className="mr-2 w-5 h-5" />
                Nous contacter
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modal de contact */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-immoo-navy dark:text-immoo-pearl">
              Nous contacter
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                type="text"
                value={contactForm.name}
                onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Votre nom"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="votre@email.com"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={contactForm.phone}
                onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+223 XX XX XX XX"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={contactForm.message}
                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Décrivez votre demande..."
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
                Envoyer
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setContactDialogOpen(false)}
                className="px-6"
              >
                Annuler
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
              Devenir Partenaire IMMOO
            </DialogTitle>
          </DialogHeader>
          <BecomeAgencyForm 
            onSuccess={() => setBecomePartnerDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      </div>
    </ResponsiveLayout>
  );
};

export default ImmoAgencyPage;