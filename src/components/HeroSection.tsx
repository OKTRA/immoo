import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ButtonEffects } from "./ui/ButtonEffects";
import { Search, MapPin, Home, Building, ArrowRight, BadgeCheck, Users, Star, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"properties" | "agencies">("properties");
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      if (searchType === "agencies") {
        navigate("/browse-agencies");
      } else {
        navigate("/search");
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
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
    <section className="relative pt-20 overflow-hidden immoo-hero-bg">
      {/* IMMOO Premium animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-immoo-gold to-immoo-gold-light rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-immoo-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-immoo-navy to-immoo-navy-light rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-immoo-float animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-r from-immoo-gold/50 to-immoo-gold rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-immoo-float animation-delay-4000"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <motion.div 
          className="max-w-5xl mx-auto text-center"
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-block mb-6">
            <span className="inline-flex items-center px-6 py-3 text-sm font-bold rounded-full bg-gradient-to-r from-immoo-gold to-immoo-gold-light text-immoo-navy shadow-xl border border-immoo-gold/30">
              <TrendingUp className="mr-2 h-4 w-4" />
              #1 Plateforme immobilière nouvelle génération
            </span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-gradient-to-r from-immoo-navy via-immoo-navy-light to-immoo-gold bg-clip-text text-transparent dark:from-immoo-pearl dark:via-immoo-gold-light dark:to-immoo-gold">
            Trouvez votre 
            <span className="block text-gradient bg-gradient-to-r from-immoo-gold to-immoo-gold-light bg-clip-text text-transparent">
              futur chez vous
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-immoo-navy/80 dark:text-immoo-pearl/80 max-w-3xl mx-auto mb-12 leading-relaxed">
            Découvrez des propriétés exceptionnelles et connectez-vous avec les meilleures agences. 
            <span className="font-semibold text-immoo-gold"> Simple, rapide, moderne.</span>
          </motion.p>
          
          <motion.div variants={itemVariants} className="mb-12">
            <div className="max-w-2xl mx-auto">
              {/* Search Type Toggle */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex rounded-full p-1 bg-immoo-pearl/90 dark:bg-immoo-navy-light shadow-xl border border-immoo-gold/20">
                  <button
                    onClick={() => setSearchType("properties")}
                    className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                      searchType === "properties"
                        ? "bg-immoo-navy text-immoo-pearl shadow-lg"
                        : "text-immoo-navy/70 dark:text-immoo-pearl/70 hover:text-immoo-gold"
                    }`}
                  >
                    <Home className="inline h-4 w-4 mr-2" />
                    Propriétés
                  </button>
                  <button
                    onClick={() => setSearchType("agencies")}
                    className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                      searchType === "agencies"
                        ? "bg-immoo-gold text-immoo-navy shadow-lg"
                        : "text-immoo-navy/70 dark:text-immoo-pearl/70 hover:text-immoo-gold"
                    }`}
                  >
                    <Building className="inline h-4 w-4 mr-2" />
                    Agences
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative glass-panel rounded-2xl p-2 flex items-center shadow-2xl border border-immoo-gold/30 backdrop-blur-sm bg-immoo-pearl/90 dark:bg-immoo-navy-light/90">
                <div className="flex items-center pl-4 text-immoo-gold">
                  <Search className="h-6 w-6" />
                </div>
                <input
                  type="text"
                  placeholder={searchType === "properties" ? "Rechercher une propriété, adresse, ville..." : "Rechercher une agence, nom, localisation..."}
                  className="w-full py-4 px-4 bg-transparent border-none focus:outline-none text-immoo-navy dark:text-immoo-pearl placeholder-immoo-navy/60 dark:placeholder-immoo-pearl/60 text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <div className="pr-2">
                  <ButtonEffects 
                    variant="primary" 
                    className="immoo-cta-button rounded-xl px-8 py-3 text-lg font-semibold animate-immoo-glow"
                    onClick={handleSearch}
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Rechercher
                  </ButtonEffects>
                </div>
              </div>
              
              {/* Quick Filters */}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {searchType === "properties" ? (
                  <>
                    <span className="flex items-center px-4 py-2 bg-immoo-pearl/70 dark:bg-immoo-navy-light/70 backdrop-blur-sm rounded-full text-sm font-medium text-immoo-navy dark:text-immoo-pearl border border-immoo-gold/30">
                      <MapPin className="h-4 w-4 mr-2 text-immoo-gold" />
                      Paris 15ème
                    </span>
                    <span className="flex items-center px-4 py-2 bg-immoo-pearl/70 dark:bg-immoo-navy-light/70 backdrop-blur-sm rounded-full text-sm font-medium text-immoo-navy dark:text-immoo-pearl border border-immoo-gold/30">
                      <Home className="h-4 w-4 mr-2 text-immoo-gold" />
                      2-3 pièces
                    </span>
                    <span className="flex items-center px-4 py-2 bg-immoo-pearl/70 dark:bg-immoo-navy-light/70 backdrop-blur-sm rounded-full text-sm font-medium text-immoo-navy dark:text-immoo-pearl border border-immoo-gold/30">
                      <Building className="h-4 w-4 mr-2 text-immoo-gold" />
                      {"< 1500€"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center px-4 py-2 bg-immoo-pearl/70 dark:bg-immoo-navy-light/70 backdrop-blur-sm rounded-full text-sm font-medium text-immoo-navy dark:text-immoo-pearl border border-immoo-gold/30">
                      <Star className="h-4 w-4 mr-2 text-immoo-gold" />
                      Agences certifiées
                    </span>
                    <span className="flex items-center px-4 py-2 bg-immoo-pearl/70 dark:bg-immoo-navy-light/70 backdrop-blur-sm rounded-full text-sm font-medium text-immoo-navy dark:text-immoo-pearl border border-immoo-gold/30">
                      <Users className="h-4 w-4 mr-2 text-immoo-gold" />
                      Spécialiste location
                    </span>
                    <span className="flex items-center px-4 py-2 bg-immoo-pearl/70 dark:bg-immoo-navy-light/70 backdrop-blur-sm rounded-full text-sm font-medium text-immoo-navy dark:text-immoo-pearl border border-immoo-gold/30">
                      <BadgeCheck className="h-4 w-4 mr-2 text-immoo-gold" />
                      Réponse rapide
                    </span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* Action Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="group p-6 bg-immoo-pearl/80 dark:bg-immoo-navy-light/80 backdrop-blur-sm rounded-2xl border border-immoo-gold/20 hover:shadow-2xl hover:border-immoo-gold/50 transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-immoo-gold to-immoo-gold-light rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <Home className="h-6 w-6 text-immoo-navy" />
              </div>
              <h3 className="text-lg font-semibold text-immoo-navy dark:text-immoo-pearl mb-2">Propriétés exclusives</h3>
              <p className="text-immoo-navy/70 dark:text-immoo-pearl/70 text-sm mb-4">Découvrez des biens uniques sélectionnés par nos experts</p>
              <button className="text-immoo-gold font-semibold text-sm group-hover:text-immoo-gold-light transition-colors flex items-center">
                Explorer <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="group p-6 bg-immoo-pearl/80 dark:bg-immoo-navy-light/80 backdrop-blur-sm rounded-2xl border border-immoo-gold/20 hover:shadow-2xl hover:border-immoo-gold/50 transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-immoo-navy to-immoo-navy-light rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <Building className="h-6 w-6 text-immoo-pearl" />
              </div>
              <h3 className="text-lg font-semibold text-immoo-navy dark:text-immoo-pearl mb-2">Agences de confiance</h3>
              <p className="text-immoo-navy/70 dark:text-immoo-pearl/70 text-sm mb-4">Connectez-vous avec les meilleures agences locales</p>
              <button 
                onClick={() => navigate("/browse-agencies")}
                className="text-immoo-gold font-semibold text-sm group-hover:text-immoo-gold-light transition-colors flex items-center"
              >
                Voir les agences <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="group p-6 bg-immoo-pearl/80 dark:bg-immoo-navy-light/80 backdrop-blur-sm rounded-2xl border border-immoo-gold/20 hover:shadow-2xl hover:border-immoo-gold/50 transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-immoo-gold to-immoo-gold-dark rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <Users className="h-6 w-6 text-immoo-navy" />
              </div>
              <h3 className="text-lg font-semibold text-immoo-navy dark:text-immoo-pearl mb-2">Gestion simplifiée</h3>
              <p className="text-immoo-navy/70 dark:text-immoo-pearl/70 text-sm mb-4">Outils modernes pour propriétaires et locataires</p>
              <button className="text-immoo-gold font-semibold text-sm group-hover:text-immoo-gold-light transition-colors flex items-center">
                Commencer <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
