import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  BarChart3, 
  Building2, 
  Briefcase, 
  Shield, 
  Users2, 
  FileText, 
  Calculator,
  Calendar,
  Smartphone,
  ArrowRight
} from "lucide-react";
import { Feature } from "@/assets/types";
import { Button } from "@/components/ui/button";

export default function FeatureSection() {
  const navigate = useNavigate();
  
  const features: Feature[] = [
    {
      title: "Gestion des Propriétés",
      description: "Créez et gérez votre portefeuille immobilier : ajout de biens, galeries photos, statuts de location, informations détaillées et suivi des performances.",
      icon: "Building2"
    },
    {
      title: "Gestion des Locataires",
      description: "Centralisez vos relations locatives : dossiers locataires, historique des baux, suivi des paiements et communication directe.",
      icon: "Users2"
    },
    {
      title: "Suivi des Paiements",
      description: "Gérez tous vos encaissements : loyers, charges, dépôts de garantie avec statuts détaillés et historique complet des transactions.",
      icon: "Calculator"
    },
    {
      title: "Génération de Contrats",
      description: "Créez des contrats de location professionnels avec éditeur intégré, validation juridique et signature électronique.",
      icon: "FileText"
    },
    {
      title: "Tableaux de Bord",
      description: "Visualisez vos statistiques d'agence : nombre de propriétés, notes, vues, performance et activité récente en temps réel.",
      icon: "BarChart3"
    },
    {
      title: "Gestion des Baux",
      description: "Administrez vos contrats de location : création, suivi des échéances, renouvellements et archivage automatique.",
      icon: "Calendar"
    },
    {
      title: "Profil d'Agence",
      description: "Personnalisez votre présence : logo, description, zones de service, coordonnées et gestion de la visibilité publique.",
      icon: "Briefcase"
    },
    {
      title: "Recherche & Filtres",
      description: "Trouvez rapidement vos biens et locataires avec des filtres avancés : prix, type, statut, localisation et critères personnalisés.",
      icon: "Shield"
    },
    {
      title: "Interface Responsive",
      description: "Accédez à votre dashboard depuis n'importe quel appareil avec une interface optimisée mobile et desktop.",
      icon: "Smartphone"
    }
  ];



  const featureRef = useRef(null);
  const isFeatureInView = useInView(featureRef, { once: true, amount: 0.2 });

  // Map icon string to icon component
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      Building2: <Building2 className="h-full w-full" />,
      Users2: <Users2 className="h-full w-full" />,
      Briefcase: <Briefcase className="h-full w-full" />,
      BarChart3: <BarChart3 className="h-full w-full" />,
      FileText: <FileText className="h-full w-full" />,
      Shield: <Shield className="h-full w-full" />,
      Calculator: <Calculator className="h-full w-full" />,
      Calendar: <Calendar className="h-full w-full" />,
      Smartphone: <Smartphone className="h-full w-full" />
    };
    
    return iconMap[iconName] || null;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-white" id="features">

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div 
          ref={featureRef}
          className="max-w-4xl mx-auto text-center mb-16"
          initial="hidden"
          animate={isFeatureInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-light mb-6 text-gray-900 tracking-tight">
            Tout ce dont vous avez besoin
          </motion.h2>
          
          <motion.p variants={itemVariants} className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Une plateforme moderne pour simplifier la gestion de votre agence immobilière
          </motion.p>
          
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate={isFeatureInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-700 group-hover:bg-gray-100 transition-colors duration-200">
                {getIconComponent(feature.icon)}
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="text-center mt-16"
          initial="hidden"
          animate={isFeatureInView ? "visible" : "hidden"}
          variants={itemVariants}
        >
          <h3 className="text-2xl font-semibold mb-4 text-gray-900">
            Prêt à commencer votre gestion avec IMMOO ?
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Créez votre agence en quelques minutes et découvrez tous les outils pour optimiser votre activité
          </p>
          <Button 
            onClick={() => navigate('/create-agency')}
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 inline-flex items-center"
          >
            Commencer ma gestion
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
