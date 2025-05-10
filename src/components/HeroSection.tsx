import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ButtonEffects } from "./ui/ButtonEffects";
import { Search, MapPin, Home, Building, ArrowRight, BadgeCheck } from "lucide-react";
export default function HeroSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0
    },
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
  return <section className="relative pt-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 py-16 md:py-24 bg-orange-100">
        <motion.div className="max-w-4xl mx-auto text-center" initial="hidden" animate={isLoaded ? "visible" : "hidden"} variants={containerVariants}>
          <motion.div variants={itemVariants} className="inline-block mb-4">
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
              <BadgeCheck className="mr-1 h-3.5 w-3.5" />
              La première plateforme immobilière intégrée
            </span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Simplifiez votre <span className="text-primary">gestion immobilière</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Une plateforme tout-en-un pour les agences, propriétaires et locataires. 
            Recherchez, gérez et optimisez votre patrimoine immobilier.
          </motion.p>
          
          <motion.div variants={itemVariants} className="mb-10">
            <div className="relative max-w-lg mx-auto">
              <div className="relative glass-panel rounded-full px-2 py-1 flex items-center shadow-sm">
                <div className="flex items-center pl-3 text-muted-foreground">
                  <Search className="h-5 w-5" />
                </div>
                <input type="text" placeholder="Adresse, ville ou code postal..." className="w-full py-3 px-3 bg-transparent border-none focus:outline-none text-foreground" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <div className="pr-2">
                  <ButtonEffects variant="primary" className="rounded-full px-5 py-2">
                    Rechercher
                  </ButtonEffects>
                </div>
              </div>
              
              <div className="absolute -bottom-10 w-full flex justify-center space-x-2 text-xs text-muted-foreground">
                <span className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  Paris
                </span>
                <span className="flex items-center">
                  <Home className="h-3 w-3 mr-1" />
                  Appartements
                </span>
                <span className="flex items-center">
                  <Building className="h-3 w-3 mr-1" />
                  Bureaux
                </span>
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4 mt-16">
            <a href="#agencies" className="group flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200">
              Agences partenaires
              <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a href="#properties" className="group flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200">
              Propriétés disponibles
              <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a href="#pricing" className="group flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200">
              Tarifs et services
              <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
            </a>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Abstract shapes */}
      <div className="absolute top-1/3 left-10 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl opacity-50 animate-pulse-soft" style={{
      animationDuration: '7s'
    }} />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-30 animate-pulse-soft" style={{
      animationDuration: '10s'
    }} />
    </section>;
}