
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
        navigate("/agencies");
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
    <section className="relative pt-20 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Modern animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-400 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <motion.div 
          className="max-w-5xl mx-auto text-center"
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-block mb-6">
            <span className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
              <TrendingUp className="mr-2 h-4 w-4" />
              #1 Plateforme immobilière nouvelle génération
            </span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent dark:from-white dark:via-blue-200 dark:to-purple-200">
            Trouvez votre 
            <span className="block text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              futur chez vous
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Découvrez des propriétés exceptionnelles et connectez-vous avec les meilleures agences. 
            <span className="font-semibold text-blue-600 dark:text-blue-400"> Simple, rapide, moderne.</span>
          </motion.p>
          
          <motion.div variants={itemVariants} className="mb-12">
            <div className="max-w-2xl mx-auto">
              {/* Search Type Toggle */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex rounded-full p-1 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setSearchType("properties")}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      searchType === "properties"
                        ? "bg-blue-500 text-white shadow-md"
                        : "text-gray-600 dark:text-gray-300 hover:text-blue-500"
                    }`}
                  >
                    <Home className="inline h-4 w-4 mr-2" />
                    Propriétés
                  </button>
                  <button
                    onClick={() => setSearchType("agencies")}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      searchType === "agencies"
                        ? "bg-purple-500 text-white shadow-md"
                        : "text-gray-600 dark:text-gray-300 hover:text-purple-500"
                    }`}
                  >
                    <Building className="inline h-4 w-4 mr-2" />
                    Agences
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative glass-panel rounded-2xl p-2 flex items-center shadow-xl border border-white/20 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
                <div className="flex items-center pl-4 text-gray-500 dark:text-gray-400">
                  <Search className="h-6 w-6" />
                </div>
                <input
                  type="text"
                  placeholder={searchType === "properties" ? "Rechercher une propriété, adresse, ville..." : "Rechercher une agence, nom, localisation..."}
                  className="w-full py-4 px-4 bg-transparent border-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <div className="pr-2">
                  <ButtonEffects 
                    variant="primary" 
                    className="rounded-xl px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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
                    <span className="flex items-center px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-white/30">
                      <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                      Paris 15ème
                    </span>
                    <span className="flex items-center px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-white/30">
                      <Home className="h-4 w-4 mr-2 text-green-500" />
                      2-3 pièces
                    </span>
                    <span className="flex items-center px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-white/30">
                      <Building className="h-4 w-4 mr-2 text-purple-500" />
                      {"< 1500€"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-white/30">
                      <Star className="h-4 w-4 mr-2 text-yellow-500" />
                      Agences certifiées
                    </span>
                    <span className="flex items-center px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-white/30">
                      <Users className="h-4 w-4 mr-2 text-blue-500" />
                      Spécialiste location
                    </span>
                    <span className="flex items-center px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-white/30">
                      <BadgeCheck className="h-4 w-4 mr-2 text-green-500" />
                      Réponse rapide
                    </span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* Action Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="group p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <Home className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Propriétés exclusives</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Découvrez des biens uniques sélectionnés par nos experts</p>
              <button className="text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors flex items-center">
                Explorer <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="group p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <Building className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Agences de confiance</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Connectez-vous avec les meilleures agences locales</p>
              <button 
                onClick={() => navigate("/agencies")}
                className="text-purple-600 dark:text-purple-400 font-medium text-sm group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors flex items-center"
              >
                Voir les agences <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="group p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Gestion simplifiée</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Outils modernes pour propriétaires et locataires</p>
              <button className="text-green-600 dark:text-green-400 font-medium text-sm group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors flex items-center">
                Commencer <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Add custom animations to tailwind */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}
