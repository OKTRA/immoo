import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ButtonEffects } from "./ui/ButtonEffects";
import { Search, MapPin, Home, Building, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"properties" | "agencies">("properties");
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -80]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0.9]);
  
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
        staggerChildren: 0.08
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
        damping: 15,
        duration: 0.4
      }
    }
  };

  return (
    <section className="relative pt-16 overflow-hidden bg-gradient-to-br from-white via-immoo-pearl/30 to-white dark:from-immoo-navy dark:via-immoo-navy-light/50 dark:to-immoo-navy min-h-[75vh] flex items-center">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          style={{ y: y1 }}
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
        <motion.div 
          style={{ y: y2 }}
          className="absolute -bottom-32 -left-32 w-48 h-48 bg-gradient-to-r from-immoo-navy/5 to-immoo-navy-light/3 rounded-full filter blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.1, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
      </div>
      
      <motion.div 
        style={{ opacity }}
        className="container mx-auto px-4 py-12 relative z-10"
      >
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-block mb-4">
            <span className="inline-flex items-center px-4 py-2 text-xs font-medium rounded-full bg-immoo-gold/10 text-immoo-navy dark:text-immoo-pearl border border-immoo-gold/20">
              <Sparkles className="mr-2 h-3 w-3 text-immoo-gold" />
              Plateforme immobilière moderne
            </span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
            <span className="text-immoo-navy dark:text-immoo-pearl">
              Trouvez votre{" "}
            </span>
            <span className="bg-gradient-to-r from-immoo-gold to-immoo-gold-light bg-clip-text text-transparent">
              futur chez vous
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-base md:text-lg text-immoo-navy/70 dark:text-immoo-pearl/70 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
            Découvrez des propriétés exceptionnelles et connectez-vous avec les meilleures agences.{" "}
            <span className="font-medium text-immoo-gold">
              Simple et moderne.
            </span>
          </motion.p>
          
          <motion.div variants={itemVariants} className="mb-8">
            <div className="max-w-2xl mx-auto">
              {/* Compact Search Type Toggle */}
              <div className="flex justify-center mb-4">
                <div className="inline-flex rounded-xl p-1 bg-white/90 dark:bg-immoo-navy-light/90 backdrop-blur-sm shadow-lg border border-immoo-gold/10">
                  <button
                    onClick={() => setSearchType("properties")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      searchType === "properties"
                        ? "bg-immoo-navy text-immoo-pearl shadow-sm"
                        : "text-immoo-navy/70 dark:text-immoo-pearl/70 hover:text-immoo-gold"
                    }`}
                  >
                    <Home className="inline h-4 w-4 mr-2" />
                    Propriétés
                  </button>
                  <button
                    onClick={() => setSearchType("agencies")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      searchType === "agencies"
                        ? "bg-immoo-gold text-immoo-navy shadow-sm"
                        : "text-immoo-navy/70 dark:text-immoo-pearl/70 hover:text-immoo-gold"
                    }`}
                  >
                    <Building className="inline h-4 w-4 mr-2" />
                    Agences
                  </button>
                </div>
              </div>

              {/* Compact Search Bar */}
              <div className="relative flex items-center bg-white/95 dark:bg-immoo-navy-light/95 backdrop-blur-sm rounded-xl border border-immoo-gold/20 shadow-lg hover:shadow-xl transition-all duration-300 p-2">
                <div className="flex items-center pl-3 text-immoo-gold">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder={searchType === "properties" ? "Rechercher une propriété..." : "Rechercher une agence..."}
                  className="w-full py-3 px-3 bg-transparent border-none focus:outline-none text-immoo-navy dark:text-immoo-pearl placeholder-immoo-navy/50 dark:placeholder-immoo-pearl/50 text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <div className="pr-1">
                  <ButtonEffects 
                    variant="primary" 
                    className="bg-gradient-to-r from-immoo-gold to-immoo-gold-light hover:from-immoo-gold-light hover:to-immoo-gold text-immoo-navy rounded-lg px-6 py-2.5 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={handleSearch}
                  >
                    Rechercher
                  </ButtonEffects>
                </div>
              </div>
              
              {/* Compact Quick Filters */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {searchType === "properties" ? (
                  <></>
                ) : (
                  <>
                    <span className="flex items-center px-3 py-1.5 bg-white/80 dark:bg-immoo-navy-light/80 backdrop-blur-sm rounded-lg text-xs font-medium text-immoo-navy dark:text-immoo-pearl border border-immoo-gold/10 cursor-pointer hover:border-immoo-gold/30 transition-colors">
                      Agences certifiées
                    </span>
                    <span className="flex items-center px-3 py-1.5 bg-white/80 dark:bg-immoo-navy-light/80 backdrop-blur-sm rounded-lg text-xs font-medium text-immoo-navy dark:text-immoo-pearl border border-immoo-gold/10 cursor-pointer hover:border-immoo-gold/30 transition-colors">
                      Spécialiste location
                    </span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* Compact Action Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-3xl mx-auto">
            <div className="group p-4 bg-white/80 dark:bg-immoo-navy-light/80 backdrop-blur-sm rounded-xl border border-immoo-gold/10 hover:border-immoo-gold/30 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-to-r from-immoo-gold to-immoo-gold-light rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200">
                <Home className="h-4 w-4 text-immoo-navy" />
              </div>
              <h3 className="text-sm font-semibold text-immoo-navy dark:text-immoo-pearl mb-1">Propriétés exclusives</h3>
              <p className="text-xs text-immoo-navy/60 dark:text-immoo-pearl/60 mb-2">Biens sélectionnés par nos experts</p>
              <button className="text-immoo-gold text-xs font-medium hover:text-immoo-gold-light transition-colors flex items-center">
                Explorer <ArrowRight className="ml-1 h-3 w-3" />
              </button>
            </div>

            <div className="group p-4 bg-white/80 dark:bg-immoo-navy-light/80 backdrop-blur-sm rounded-xl border border-immoo-gold/10 hover:border-immoo-gold/30 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-to-r from-immoo-navy to-immoo-navy-light rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200">
                <Building className="h-4 w-4 text-immoo-pearl" />
              </div>
              <h3 className="text-sm font-semibold text-immoo-navy dark:text-immoo-pearl mb-1">Agences de confiance</h3>
              <p className="text-xs text-immoo-navy/60 dark:text-immoo-pearl/60 mb-2">Meilleures agences locales</p>
              <button 
                onClick={() => navigate("/browse-agencies")}
                className="text-immoo-gold text-xs font-medium hover:text-immoo-gold-light transition-colors flex items-center"
              >
                Voir les agences <ArrowRight className="ml-1 h-3 w-3" />
              </button>
            </div>

            <div className="group p-4 bg-white/80 dark:bg-immoo-navy-light/80 backdrop-blur-sm rounded-xl border border-immoo-gold/10 hover:border-immoo-gold/30 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-to-r from-immoo-gold to-immoo-gold-light rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200">
                <Search className="h-4 w-4 text-immoo-navy" />
              </div>
              <h3 className="text-sm font-semibold text-immoo-navy dark:text-immoo-pearl mb-1">Gestion simplifiée</h3>
              <p className="text-xs text-immoo-navy/60 dark:text-immoo-pearl/60 mb-2">Outils modernes et intuitifs</p>
              <button className="text-immoo-gold text-xs font-medium hover:text-immoo-gold-light transition-colors flex items-center">
                Commencer <ArrowRight className="ml-1 h-3 w-3" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
