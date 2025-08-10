import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ButtonEffects } from "./ui/ButtonEffects";
import { Search, MapPin, Home, Building, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Property } from "@/assets/types";
import { getProperties } from "@/services/propertyService";
import { supabase } from "@/integrations/supabase/client";
import PropertyList from "./properties/PropertyList";
import { Card, CardContent } from "./ui/card";

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
  const navigate = useNavigate();
  
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
        // Search agencies with username
        const { data: agenciesData, error } = await supabase
          .from('agencies')
          .select('id, name, username, description, email, phone, website, verified, properties_count, rating, location, status, is_visible')
          .eq('is_visible', true);
          
        if (error) {
          console.error('Error fetching agencies:', error);
          setAgencies([]);
          return;
        }
        
        if (agenciesData) {
          let filteredAgencies = agenciesData;
          
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
          
          if (priceRange) {
            // Filter by properties count (using priceRange state)
            if (priceRange === '0') {
              filteredAgencies = filteredAgencies.filter(a => a.properties_count === 0);
            } else if (priceRange === '1-5') {
              filteredAgencies = filteredAgencies.filter(a => a.properties_count >= 1 && a.properties_count <= 5);
            } else if (priceRange === '5+') {
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
          
          <motion.p variants={itemVariants} className="text-base md:text-lg text-immoo-navy/70 dark:text-immoo-pearl/70 max-w-2xl mx-auto mb-12 leading-relaxed font-normal">
            Trouvez votre propriété idéale avec nos filtres avancés.{" "}
            <span className="font-medium text-immoo-gold">
              Recherche intelligente et moderne.
            </span>
          </motion.p>
          
          {/* Simplified Smart Search */}
          <motion.div variants={itemVariants} className="max-w-4xl mx-auto mb-16">
            <div className="bg-white/95 dark:bg-immoo-navy-light/95 backdrop-blur-xl rounded-2xl border border-immoo-gold/20 shadow-2xl p-6 md:p-8">
              {/* Search Type Toggle */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex rounded-xl p-1 bg-immoo-gold/10 backdrop-blur-sm">
                  <button
                    onClick={() => setSearchType("properties")}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      searchType === "properties"
                        ? "bg-immoo-gold text-immoo-navy shadow-sm"
                        : "text-immoo-navy/70 dark:text-immoo-pearl/70 hover:text-immoo-gold"
                    }`}
                  >
                    <Home className="inline h-4 w-4 mr-2" />
                    Propriétés
                  </button>
                  <button
                    onClick={() => setSearchType("agencies")}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      searchType === "agencies"
                        ? "bg-immoo-navy text-immoo-pearl shadow-sm"
                        : "text-immoo-navy/70 dark:text-immoo-pearl/70 hover:text-immoo-gold"
                    }`}
                  >
                    <Building className="inline h-4 w-4 mr-2" />
                    Agences
                  </button>
                </div>
              </div>

              {/* Main Search Bar */}
              <div className="relative mb-6">
                <div className="flex items-center bg-white dark:bg-immoo-navy-light rounded-xl border border-immoo-gold/30 shadow-lg hover:shadow-xl transition-all duration-300 p-4">
                  <Search className="h-5 w-5 text-immoo-gold mr-3" />
                  <input
                    type="text"
                    placeholder={searchType === "properties" ? "Rechercher une propriété..." : "Rechercher une agence (@username, nom, mots-clés...)"}
                    className="flex-1 bg-transparent border-none focus:outline-none text-immoo-navy dark:text-immoo-pearl placeholder-immoo-navy/50 dark:placeholder-immoo-pearl/50 text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button 
                    onClick={handleSearch}
                    className="ml-4 bg-gradient-to-r from-immoo-gold to-immoo-gold-light hover:from-immoo-gold-light hover:to-immoo-gold text-immoo-navy px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Rechercher
                  </button>
                </div>
              </div>

              {/* Smart Filters - Properties */}
              {searchType === "properties" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Location - Based on real data */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-immoo-navy dark:text-immoo-pearl flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-immoo-gold" />
                      Localisation
                    </label>
                    <select 
                      className="w-full bg-white dark:bg-immoo-navy-light border border-immoo-gold/20 rounded-lg px-4 py-3 text-immoo-navy dark:text-immoo-pearl focus:outline-none focus:border-immoo-gold transition-colors"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    >
                      <option value="">Toutes</option>
                      <option value="Kabala">Kabala</option>
                      <option value="Kati Fouga">Kati Fouga</option>
                    </select>
                  </div>

                  {/* Property Type - Based on real data */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-immoo-navy dark:text-immoo-pearl flex items-center">
                      <Home className="h-4 w-4 mr-2 text-immoo-gold" />
                      Type
                    </label>
                    <select 
                      className="w-full bg-white dark:bg-immoo-navy-light border border-immoo-gold/20 rounded-lg px-4 py-3 text-immoo-navy dark:text-immoo-pearl focus:outline-none focus:border-immoo-gold transition-colors"
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
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
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
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
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
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                    >
                      <option value="">Toutes</option>
                      <option value="0">Nouvelles agences</option>
                      <option value="1-5">1-5 propriétés</option>
                      <option value="5+">5+ propriétés</option>
                    </select>
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
                            <Card key={agency.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                              <CardContent className="p-6">
                                <div className="flex items-center mb-4">
                                  <div className="w-12 h-12 bg-immoo-gold/20 rounded-lg flex items-center justify-center mr-4">
                                    <Building className="h-6 w-6 text-immoo-gold" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-lg text-immoo-navy dark:text-immoo-pearl">
                                      {agency.name}
                                    </h3>
                                    <p className="text-xs text-immoo-gold font-medium mb-1">
                                      @{agency.username}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {agency.verified ? '✓ Vérifiée' : 'Non vérifiée'}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                  {agency.description}
                                </p>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-immoo-gold font-medium">
                                    {agency.properties_count} propriété{agency.properties_count !== 1 ? 's' : ''}
                                  </span>
                                  <button 
                                    onClick={() => navigate(`/agencies/${agency.id}`)}
                                    className="text-immoo-navy hover:text-immoo-gold transition-colors"
                                  >
                                    Voir détails →
                                  </button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-gray-500">Aucune agence trouvée avec ces critères</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
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
    </section>
  );
}
