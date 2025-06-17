import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import { BarChart3, Building2, Briefcase, Shield, Users2, FileText, ArrowRight } from "lucide-react";
import { Feature, UserTypeOption } from "@/assets/types";

export default function FeatureSection() {
  const features: Feature[] = [
    {
      title: "Gestion des Biens",
      description: "Portefeuille immobilier centralisé et outils de gestion intelligents.",
      icon: "Building2"
    },
    {
      title: "Gestion Locative",
      description: "Relations locataires simplifiées et processus automatisés.",
      icon: "Users2"
    },
    {
      title: "Finances & Comptabilité",
      description: "Suivi financier en temps réel et rapports détaillés.",
      icon: "Briefcase"
    },
    {
      title: "Analytics",
      description: "Tableaux de bord et analyses de performances avancées.",
      icon: "BarChart3"
    },
    {
      title: "Documents",
      description: "Gestion documentaire et signature électronique intégrée.",
      icon: "FileText"
    },
    {
      title: "Sécurité",
      description: "Protection des données et conformité RGPD garantie.",
      icon: "Shield"
    }
  ];

  const userTypes: UserTypeOption[] = [
    {
      type: "agency",
      label: "Espace Agence",
      path: "/agence",
      description: "Suite complète d'outils pour optimiser votre gestion locative et développer votre activité."
    },
    {
      type: "owner",
      label: "Espace Propriétaire",
      path: "/owner",
      description: "Interface simplifiée pour suivre vos biens, revenus et communiquer avec votre agence."
    },
    {
      type: "admin",
      label: "Super Admin",
      path: "/admin",
      description: "Contrôle total du système, gestion des agences et accès aux statistiques globales."
    }
  ];

  const featureRef = useRef(null);
  const userTypeRef = useRef(null);
  const isFeatureInView = useInView(featureRef, { once: true, amount: 0.2 });
  const isUserTypeInView = useInView(userTypeRef, { once: true, amount: 0.2 });

  // Map icon string to icon component
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      Building2: <Building2 className="h-full w-full" />,
      Users2: <Users2 className="h-full w-full" />,
      Briefcase: <Briefcase className="h-full w-full" />,
      BarChart3: <BarChart3 className="h-full w-full" />,
      FileText: <FileText className="h-full w-full" />,
      Shield: <Shield className="h-full w-full" />
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
    <section className="py-16 bg-gradient-to-br from-immoo-pearl/20 via-white to-immoo-pearl/10 dark:from-immoo-navy/50 dark:via-immoo-navy-light/30 dark:to-immoo-navy/50 relative overflow-hidden" id="features">
      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-immoo-gold/5 to-immoo-gold-light/3 rounded-full filter blur-3xl" />
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-immoo-navy/5 to-immoo-navy-light/3 rounded-full filter blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Features Section */}
        <motion.div 
          ref={featureRef}
          className="max-w-5xl mx-auto text-center mb-16"
          initial="hidden"
          animate={isFeatureInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-3">
            <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-immoo-gold/10 text-immoo-navy dark:text-immoo-pearl border border-immoo-gold/20">
              Fonctionnalités
            </span>
          </motion.div>
          
          <motion.h2 variants={itemVariants} className="text-2xl md:text-3xl font-bold mb-4 text-immoo-navy dark:text-immoo-pearl">
            Tout ce dont vous avez besoin
          </motion.h2>
          
          <motion.p variants={itemVariants} className="text-sm md:text-base text-immoo-navy/60 dark:text-immoo-pearl/60 mb-12 max-w-2xl mx-auto">
            Une solution complète pour simplifier la gestion immobilière
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group p-4 bg-white/80 dark:bg-immoo-navy-light/80 backdrop-blur-sm rounded-xl border border-immoo-gold/10 hover:border-immoo-gold/30 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col h-full text-left">
                  <div className="w-8 h-8 mb-3 rounded-lg bg-gradient-to-r from-immoo-gold/10 to-immoo-gold-light/5 flex items-center justify-center text-immoo-gold group-hover:scale-105 transition-transform duration-200">
                    {getIconComponent(feature.icon)}
                  </div>
                  <h3 className="text-sm font-semibold mb-2 text-immoo-navy dark:text-immoo-pearl">{feature.title}</h3>
                  <p className="text-xs text-immoo-navy/60 dark:text-immoo-pearl/60 leading-relaxed flex-grow">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* User Types Section */}
        <motion.div 
          ref={userTypeRef}
          className="max-w-5xl mx-auto mt-16"
          initial="hidden"
          animate={isUserTypeInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="mb-3">
              <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-immoo-navy/10 dark:bg-immoo-pearl/10 text-immoo-navy dark:text-immoo-pearl border border-immoo-navy/20 dark:border-immoo-pearl/20">
                Espaces dédiés
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-immoo-navy dark:text-immoo-pearl">
              Pour chaque utilisateur
            </h2>
            <p className="text-sm md:text-base text-immoo-navy/60 dark:text-immoo-pearl/60 max-w-2xl mx-auto">
              IMMOO s'adapte à vos besoins spécifiques
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userTypes.map((userType, index) => (
              <motion.a 
                key={index} 
                href={userType.path}
                className="block h-full group"
                variants={itemVariants}
              >
                <div className="relative p-6 h-full bg-white/90 dark:bg-immoo-navy-light/90 backdrop-blur-sm rounded-xl border border-immoo-gold/10 hover:border-immoo-gold/30 shadow-sm hover:shadow-md transition-all duration-300">
                  {/* Number Badge */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-immoo-gold to-immoo-gold-light rounded-full flex items-center justify-center text-immoo-navy font-bold text-xs shadow-sm">
                    {index + 1}
                  </div>
                  
                  <div className="flex flex-col h-full">
                    <h3 className="text-lg font-bold mb-3 text-immoo-navy dark:text-immoo-pearl group-hover:text-immoo-gold transition-colors duration-300">{userType.label}</h3>
                    <p className="text-sm text-immoo-navy/60 dark:text-immoo-pearl/60 mb-4 flex-grow leading-relaxed">
                      {userType.description}
                    </p>
                    <div className="mt-auto">
                      <div className="inline-flex items-center text-immoo-gold font-medium text-sm group-hover:text-immoo-gold-light transition-all duration-300">
                        Découvrir
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
