import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ButtonEffects } from "./ui/ButtonEffects";
import { Search, MapPin, Home, Building, ArrowRight, Sparkles, Shield, Star, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Property } from "@/assets/types";
import { getProperties } from "@/services/propertyService";
import { supabase } from "@/integrations/supabase/client";
import PropertyList from "./properties/PropertyList";
import { Card, CardContent } from "./ui/card";
import { useAuth } from "@/contexts/auth/AuthContext";
import QuickVisitorLogin from "./visitor/QuickVisitorLogin";
import { useQuickVisitorAccess } from "@/hooks/useQuickVisitorAccess";

export default function HeroSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"properties" | "agencies">("properties");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [surface, setSurface] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [agencyStatus, setAgencyStatus] = useState("");
  const [agencyPropertiesCount, setAgencyPropertiesCount] = useState("");
  const [agencyContactType, setAgencyContactType] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showVisitorLogin, setShowVisitorLogin] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLoggedIn: visitorIsLoggedIn } = useQuickVisitorAccess();
  
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -80]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0.9]);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      if (searchType === "properties") {
        // Search properties
        const { properties } = await getProperties();
        let filteredProperties = properties || [];
        
        // Apply filters
        if (searchTerm) {
          filteredProperties = filteredProperties.filter(p => 
            p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.location?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        if (location) {
          filteredProperties = filteredProperties.filter(p => 
            p.location?.toLowerCase().includes(location.toLowerCase())
          );
        }
        
        if (propertyType) {
          filteredProperties = filteredProperties.filter(p => 
            p.type === propertyType
          );
        }
        
        if (priceRange) {
          const [min, max] = priceRange.split('-').map(Number);
          filteredProperties = filteredProperties.filter(p => {
            const price = Number(p.price);
            if (max) {
              return price >= min && price <= max;
            } else {
              return price >= min;
            }
          });
        }
        
        setSearchResults(filteredProperties);
        setAgencies([]);
      } else {
        // Search agencies and get real properties count
        const { data: agenciesData, error } = await supabase
          .from('agencies')
          .select('*')
          .eq('is_visible', true);
          
        if (error) {
          console.error('Error fetching agencies:', error);
          setAgencies([]);
          return;
        }
        
        if (agenciesData && Array.isArray(agenciesData)) {
          // Get properties count and rating for each agency
          const agenciesWithPropertiesCount = await Promise.all(
            agenciesData.map(async (agency: any) => {
              try {
                // Get properties count
                const { count } = await supabase
                  .from('properties')
                  .select('*', { count: 'exact', head: true })
                  .eq('agency_id', agency.id);
                
                // Get average rating from visitor contacts or reviews
                const { data: contactsData } = await supabase
                  .from('visitor_contacts')
                  .select('rating')
                  .eq('agency_id', agency.id)
                  .not('rating', 'is', null);
                
                let averageRating = null;
                if (contactsData && contactsData.length > 0) {
                  const totalRating = contactsData.reduce((sum: number, contact: any) => sum + (contact.rating || 0), 0);
                  averageRating = (totalRating / contactsData.length).toFixed(1);
                }
                
                return {
                  ...agency,
                  properties_count: count || 0,
                  calculated_rating: averageRating,
                  reviews_count: contactsData?.length || 0
                };
              } catch (err) {
                console.error('Error processing agency:', agency.id, err);
                return {
                  ...agency,
                  properties_count: 0,
                  calculated_rating: null,
                  reviews_count: 0
                };
              }
            })
          );
          let filteredAgencies = agenciesWithPropertiesCount;
          
          // Apply filters - Enhanced search with username and keywords
          if (searchTerm) {
            const searchWords = searchTerm.toLowerCase().split(' ').filter(word => word.length > 0);
            
            filteredAgencies = filteredAgencies.filter(a => {
              const searchableText = [
                a.name?.toLowerCase() || '',
                a.username?.toLowerCase() || '',
                a.description?.toLowerCase() || '',
                a.email?.toLowerCase() || '',
                a.phone?.toLowerCase() || ''
              ].join(' ');
              
              // Check if all search words are found in the searchable text
              return searchWords.every(word => 
                searchableText.includes(word)
              );
            });
          }
          
          if (location === 'verified') {
            filteredAgencies = filteredAgencies.filter(a => a.verified === true);
          } else if (location === 'non-verified') {
            filteredAgencies = filteredAgencies.filter(a => a.verified === false);
          }
          
          if (propertyType) {
            // Filter by country (using propertyType state for country)
            filteredAgencies = filteredAgencies.filter(a => 
              a.location?.toLowerCase().includes(propertyType.toLowerCase())
            );
          }
          
          if (agencyPropertiesCount) {
            // Filter by properties count
            if (agencyPropertiesCount === '0') {
              filteredAgencies = filteredAgencies.filter(a => a.properties_count === 0);
            } else if (agencyPropertiesCount === '1-5') {
              filteredAgencies = filteredAgencies.filter(a => a.properties_count >= 1 && a.properties_count <= 5);
            } else if (agencyPropertiesCount === '5+') {
              filteredAgencies = filteredAgencies.filter(a => a.properties_count > 5);
            }
          }
          
          setAgencies(filteredAgencies);
          setSearchResults([]);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLocation("");
    setPropertyType("");
    setPriceRange("");
    setSurface("");
    setSelectedFeatures([]);
    setSearchResults([]);
    setAgencies([]);
    setHasSearched(false);
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
        className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 relative z-10"
      >
        <motion.div 
          className="max-w-4xl mx-auto text-center px-2 sm:px-0"
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-block mb-3 sm:mb-4">
            <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-medium rounded-full bg-immoo-gold/10 text-immoo-navy dark:text-immoo-pearl border border-immoo-gold/20">
              <Sparkles className="mr-1.5 sm:mr-2 h-3 w-3 text-immoo-gold" />
              <span className="text-xs sm:text-sm">Plateforme immobilière moderne</span>
            </span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 leading-tight px-2">
            <span className="text-immoo-navy dark:text-immoo-pearl">
              Trouvez votre{" "}
            </span>
            <span className="bg-gradient-to-r from-immoo-gold to-immoo-gold-light bg-clip-text text-transparent">
              futur chez vous
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-sm sm:text-base md:text-lg text-immoo-navy/70 dark:text-immoo-pearl/70 max-w-2xl mx-auto mb-8 sm:mb-10 md:mb-12 leading-relaxed font-normal px-4">
            Trouvez votre propriété idéale avec nos filtres avancés.{" "}
            <span className="font-medium text-immoo-gold">
              Recherche intelligente et moderne.
            </span>
          </motion.p>
          
          {/* Simplified Smart Search */}
          <motion.div variants={itemVariants} className="max-w-4xl mx-auto mb-8 sm:mb-12 md:mb-16">
            <div className="bg-white/95 dark:bg-immoo-navy-light/95 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-immoo-gold/20 shadow-2xl p-4 sm:p-6 md:p-8">
              {/* Search Type Toggle */}
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="inline-flex rounded-lg sm:rounded-xl p-0.5 sm:p-1 bg-immoo-gold/10 backdrop-blur-sm">
                  <button
                    onClick={() => setSearchType("properties")}
                    className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                      searchType === "properties"
                        ? "bg-immoo-gold text-immoo-navy shadow-sm"
                        : "text-immoo-navy/70 dark:text-immoo-pearl/70 hover:text-immoo-gold"
                    }`}
                  >
                    <Home className="inline h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Propriétés</span>
                    <span className="xs:hidden">Props</span>
                  </button>
                  <button
                    onClick={() => setSearchType("agencies")}
                    className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                      searchType === "agencies"
                        ? "bg-immoo-navy text-immoo-pearl shadow-sm"
                        : "text-immoo-navy/70 dark:text-immoo-pearl/70 hover:text-immoo-gold"
                    }`}
                  >
                    <Building className="inline h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                    Agences
                  </button>
                </div>
              </div>

              {/* Main Search Bar */}
<<<<<<< HEAD
              <div className="relative mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white dark:bg-immoo-navy-light rounded-lg sm:rounded-xl border border-immoo-gold/30 shadow-lg hover:shadow-xl transition-all duration-300 p-3 sm:p-4 gap-3 sm:gap-0">
                  <div className="flex items-center flex-1">
                    <Search className="h-4 sm:h-5 w-4 sm:w-5 text-immoo-gold mr-2 sm:mr-3 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder={searchType === "properties" ? "Rechercher une propriété..." : "Rechercher une agence..."}
                      className="flex-1 bg-transparent border-none focus:outline-none text-immoo-navy dark:text-immoo-pearl placeholder-immoo-navy/50 dark:placeholder-immoo-pearl/50 text-sm sm:text-base"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <button 
=======
              <div className="relative mb-6 sm:mb-8">
                <div className="flex items-center bg-white/80 dark:bg-immoo-navy-light/80 rounded-xl border border-immoo-gold/20 shadow-sm hover:shadow-md transition-shadow duration-300 p-3 gap-2 backdrop-blur-md">
                  <input
                    type="text"
                    placeholder={searchType === "properties" ? "Rechercher une propriété..." : "Rechercher une agence..."}
                    className="flex-1 bg-transparent border-none focus:outline-none text-immoo-navy dark:text-immoo-pearl placeholder-immoo-navy/40 dark:placeholder-immoo-pearl/40 text-base font-light"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button 
                    className="p-1.5 rounded-md bg-immoo-gold/10 hover:bg-immoo-gold/20 transition-colors duration-200"
>>>>>>> 8ff1fce (style(HeroSection): simplify search bar styling and improve readability)
                    onClick={handleSearch}
                    className="sm:ml-4 bg-gradient-to-r from-immoo-gold to-immoo-gold-light hover:from-immoo-gold-light hover:to-immoo-gold text-immoo-navy px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
                  >
                    <span className="sm:hidden">Rechercher</span>
                    <span className="hidden sm:inline">Rechercher</span>
                  </button>
                </div>
              </div>

              {/* Smart Filters - Properties */}
              {searchType === "properties" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  {/* Location - Based on real data */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-immoo-navy dark:text-immoo-pearl flex items-center">
                      <MapPin className="h-3 sm:h-4 w-3 sm:w-4 mr-1.5 sm:mr-2 text-immoo-gold" />
                      Localisation
                    </label>
                    <select 
                      className="w-full bg-white dark:bg-immoo-navy-light border border-immoo-gold/20 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-immoo-navy dark:text-immoo-pearl focus:outline-none focus:border-immoo-gold transition-colors"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    >
                      <option value="">Toutes</option>
                      <option value="Kabala">Kabala</option>
                      <option value="Kati Fouga">Kati Fouga</option>
                    </select>
                  </div>

                  {/* Property Type - Based on real data */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-immoo-navy dark:text-immoo-pearl flex items-center">
                      <Home className="h-3 sm:h-4 w-3 sm:w-4 mr-1.5 sm:mr-2 text-immoo-gold" />
                      Type
                    </label>
                    <select 
                      className="w-full bg-white dark:bg-immoo-navy-light border border-immoo-gold/20 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-immoo-navy dark:text-immoo-pearl focus:outline-none focus:border-immoo-gold transition-colors"
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                    >
                      <option value="">Tous types</option>
                      <option value="apartment">Appartement</option>
                      <option value="house">Maison</option>
                    </select>
                  </div>

                  {/* Price Range - Based on real data */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-immoo-navy dark:text-immoo-pearl flex items-center">
                      <span className="text-immoo-gold mr-2">€</span>
                      Budget
                    </label>
                    <select 
                      className="w-full bg-white dark:bg-immoo-navy-light border border-immoo-gold/20 rounded-lg px-4 py-3 text-immoo-navy dark:text-immoo-pearl focus:outline-none focus:border-immoo-gold transition-colors"
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                    >
                      <option value="">Tous budgets</option>
                      <option value="0-75000">Jusqu'à 75 000 FCFA</option>
                      <option value="75000-100000">75 000 - 100 000 FCFA</option>
                      <option value="100000-">Plus de 100 000 FCFA</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Smart Filters - Agencies */}
              {searchType === "agencies" && (
                <div className="space-y-4 mb-6">
                  {/* Search Tips */}
                  <div className="bg-immoo-gold/5 border border-immoo-gold/20 rounded-lg p-3">
                    <p className="text-xs text-immoo-navy/70 dark:text-immoo-pearl/70">
                      <strong>Conseils de recherche:</strong> Utilisez @username, nom d'agence, mots-clés, email ou téléphone
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Verification Status */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-immoo-navy dark:text-immoo-pearl flex items-center">
                        <Building className="h-4 w-4 mr-2 text-immoo-gold" />
                        Statut
                      </label>
                      <select 
                        className="w-full bg-white dark:bg-immoo-navy-light border border-immoo-gold/20 rounded-lg px-4 py-3 text-immoo-navy dark:text-immoo-pearl focus:outline-none focus:border-immoo-gold transition-colors"
                        value={agencyStatus}
                        onChange={(e) => setAgencyStatus(e.target.value)}
                      >
                        <option value="">Toutes agences</option>
                        <option value="verified">Agences vérifiées</option>
                        <option value="non-verified">Agences non vérifiées</option>
                      </select>
                    </div>

                    {/* Country/Location */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-immoo-navy dark:text-immoo-pearl flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-immoo-gold" />
                        Pays
                      </label>
                      <select 
                        className="w-full bg-white dark:bg-immoo-navy-light border border-immoo-gold/20 rounded-lg px-4 py-3 text-immoo-navy dark:text-immoo-pearl focus:outline-none focus:border-immoo-gold transition-colors"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      >
                        <option value="">Tous pays</option>
                        <option value="mali">Mali</option>
                        <option value="senegal">Sénégal</option>
                        <option value="burkina">Burkina Faso</option>
                        <option value="cote-ivoire">Côte d'Ivoire</option>
                        <option value="guinea">Guinée</option>
                      </select>
                    </div>

                    {/* Properties Count */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-immoo-navy dark:text-immoo-pearl flex items-center">
                        <Home className="h-4 w-4 mr-2 text-immoo-gold" />
                        Propriétés
                      </label>
                      <select 
                        className="w-full bg-white dark:bg-immoo-navy-light border border-immoo-gold/20 rounded-lg px-4 py-3 text-immoo-navy dark:text-immoo-pearl focus:outline-none focus:border-immoo-gold transition-colors"
                        value={agencyPropertiesCount}
                        onChange={(e) => setAgencyPropertiesCount(e.target.value)}
                      >
                        <option value="">Toutes</option>
                        <option value="0">Nouvelles agences</option>
                        <option value="1-5">1-5 propriétés</option>
                        <option value="5+">5+ propriétés</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Action */}
              <div className="flex justify-center">
                <button 
                  onClick={clearFilters}
                  className="text-sm text-immoo-navy/60 dark:text-immoo-pearl/60 hover:text-immoo-gold transition-colors"
                >
                  Effacer les filtres
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* Search Results */}
          {hasSearched && (
            <motion.div 
              variants={itemVariants} 
              className="max-w-6xl mx-auto mb-16"
              initial="hidden"
              animate="visible"
            >
              <div className="bg-white/95 dark:bg-immoo-navy-light/95 backdrop-blur-xl rounded-2xl border border-immoo-gold/20 shadow-2xl p-6 md:p-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-immoo-navy dark:text-immoo-pearl mb-2">
                    Résultats de recherche
                  </h3>
                  <p className="text-sm text-immoo-navy/60 dark:text-immoo-pearl/60">
                    {isSearching ? 'Recherche en cours...' : 
                      searchType === "properties" 
                        ? `${searchResults.length} propriété${searchResults.length !== 1 ? 's' : ''} trouvée${searchResults.length !== 1 ? 's' : ''}`
                        : `${agencies.length} agence${agencies.length !== 1 ? 's' : ''} trouvée${agencies.length !== 1 ? 's' : ''}`
                    }
                  </p>
                </div>
                
                {isSearching ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                      <Card key={index} className="overflow-hidden animate-pulse">
                        <div className="h-48 bg-gray-300"></div>
                        <CardContent className="p-4">
                          <div className="h-4 bg-gray-300 rounded mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded mb-3 w-2/3"></div>
                          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div>
                    {searchType === "properties" ? (
                      searchResults.length > 0 ? (
                        <PropertyList properties={searchResults} />
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-gray-500">Aucune propriété trouvée avec ces critères</p>
                        </div>
                      )
                    ) : (
                      agencies.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {agencies.map((agency) => (
                            <motion.div
                              key={agency.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className="group"
                            >
                              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white via-immoo-pearl/5 to-white dark:from-immoo-navy-light dark:via-immoo-navy-light/80 dark:to-immoo-navy-light backdrop-blur-sm">
                                <CardContent className="p-0">
                                  {/* Header with gradient */}
                                  <div className="bg-gradient-to-r from-immoo-gold/10 via-immoo-pearl/20 to-immoo-gold/10 p-6 pb-4">
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-center">
                                        <div className="w-14 h-14 bg-gradient-to-br from-immoo-gold to-immoo-gold/80 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                                          <Building className="h-7 w-7 text-white" />
                                        </div>
                                        <div>
                                          <h3 className="font-bold text-xl text-immoo-navy dark:text-immoo-pearl mb-1">
                                            {agency.name}
                                          </h3>
                                          <p className="text-sm text-immoo-gold font-semibold">
                                            @{agency.username}
                                          </p>
                                        </div>
                                      </div>
                                      {agency.verified && (
                                        <div className="flex items-center bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                          <Shield className="h-3 w-3 text-green-600 mr-1" />
                                          <span className="text-xs text-green-600 font-medium">Vérifiée</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Content */}
                                  <div className="p-6 pt-4">
                                    {/* Description */}
                                    <p className="text-sm text-immoo-navy/70 dark:text-immoo-pearl/70 mb-4 line-clamp-2 leading-relaxed">
                                      {agency.description || "Agence créée automatiquement lors de l'inscription"}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center space-x-4">
                                        <div className="flex items-center">
                                          <Home className="h-4 w-4 text-immoo-gold mr-1" />
                                          <span className="text-sm font-semibold text-immoo-navy dark:text-immoo-pearl">
                                            {agency.properties_count}
                                          </span>
                                          <span className="text-xs text-immoo-navy/60 dark:text-immoo-pearl/60 ml-1">
                                            propriété{agency.properties_count !== 1 ? 's' : ''}
                                          </span>
                                        </div>
                                        <div className="flex items-center">
                                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                          <span className="text-sm font-semibold text-immoo-navy dark:text-immoo-pearl">
                                            {agency.calculated_rating || agency.rating || 'Nouveau'}
                                          </span>
                                          {agency.reviews_count > 0 && (
                                            <span className="text-xs text-immoo-navy/50 dark:text-immoo-pearl/50 ml-1">
                                              ({agency.reviews_count})
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Simple Clickable Area */}
                                    <div 
                                      onClick={() => {
                                        if (user || visitorIsLoggedIn) {
                                          navigate(`/public-agency/${agency.id}`);
                                        } else {
                                          setSelectedAgency(agency);
                                          setShowVisitorLogin(true);
                                        }
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <div className="flex items-center justify-center">
                                        <div className="w-8 h-8 bg-immoo-gold/20 rounded-full flex items-center justify-center">
                                          <Users className="h-4 w-4 text-immoo-gold" />
                                        </div>
                                        {user && (
                                          <div className="ml-2 flex items-center text-xs text-immoo-navy/60 dark:text-immoo-pearl/60">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                            Connecté
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="bg-gradient-to-br from-immoo-pearl/20 to-immoo-gold/10 rounded-2xl p-8 max-w-md mx-auto">
                            <Building className="h-12 w-12 text-immoo-gold/60 mx-auto mb-4" />
                            <p className="text-immoo-navy/70 dark:text-immoo-pearl/70 font-medium">Aucune agence trouvée avec ces critères</p>
                            <p className="text-sm text-immoo-navy/50 dark:text-immoo-pearl/50 mt-2">Essayez de modifier vos filtres de recherche</p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
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

      {/* Quick Visitor Login Modal */}
      <QuickVisitorLogin
        isOpen={showVisitorLogin}
        onClose={() => {
          setShowVisitorLogin(false);
          setSelectedAgency(null);
        }}
        onSuccess={() => {
          if (selectedAgency) {
            navigate(`/public-agency/${selectedAgency.id}`);
          }
        }}
      />
    </section>
  );
}

