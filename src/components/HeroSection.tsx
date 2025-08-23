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
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency } from "@/lib/utils";

export default function HeroSection() {
  const { t } = useTranslation();
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
  // Dynamic filter options derived from existing properties
  const [locationOptions, setLocationOptions] = useState<string[]>(['Kabala', 'Kati Fouga']); // Default fallbacks
  const [typeOptions, setTypeOptions] = useState<string[]>(['apartment', 'house', 'villa']); // Default fallbacks
  const [budgetOptions, setBudgetOptions] = useState<Array<{ value: string; label: string }>>([
    { value: '0-75000', label: '0 FCFA - 75 000 FCFA' },
    { value: '75000-100000', label: '75 000 FCFA - 100 000 FCFA' },
    { value: '100000-', label: '100 000 FCFA +' }
  ]); // Default fallbacks
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

  // Load available filter values from existing properties
  useEffect(() => {
    const loadFilterMetadata = async () => {
      try {
        // Use the basic properties table with guaranteed columns
        const { data, error } = await supabase
          .from('properties')
          .select('location,type,price')
          .limit(1000); // Limit to avoid overwhelming the query

        if (error) {
          console.error('Error loading filter metadata:', error);
          // Set empty arrays as fallback
          setLocationOptions([]);
          setTypeOptions([]);
          setBudgetOptions([]);
          return;
        }

        const safeData = (data || []) as Array<{ location?: string | null; type?: string | null; price?: number | null }>;

        // Locations: use distinct locations only
        const rawLocations = safeData
          .map(p => (p.location || '').toString().trim())
          .filter(Boolean);
        const distinctLocations = Array.from(new Set(rawLocations)).sort((a, b) => a.localeCompare(b));
        setLocationOptions(distinctLocations);

        // Property types
        const distinctTypes = Array.from(new Set(
          safeData.map(p => (p.type || '').toString().trim()).filter(Boolean)
        )).sort((a, b) => a.localeCompare(b));
        setTypeOptions(distinctTypes);

        // Budget buckets from min/max
        const prices = safeData.map(p => Number(p.price || 0)).filter(n => !Number.isNaN(n) && n > 0);
        if (prices.length > 0) {
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          
          // Create reasonable budget ranges
          if (max > min) {
            const range = Math.max(1, Math.ceil((max - min) / 4));
            const b1 = min + range;
            const b2 = min + range * 2;
            const b3 = min + range * 3;
            const opts: Array<{ value: string; label: string }> = [
              { value: `${min}-${b1}`, label: `${formatCurrency(min)} - ${formatCurrency(b1)}` },
              { value: `${b1}-${b2}`, label: `${formatCurrency(b1)} - ${formatCurrency(b2)}` },
              { value: `${b2}-${b3}`, label: `${formatCurrency(b2)} - ${formatCurrency(b3)}` },
              { value: `${b3}-${max}`, label: `${formatCurrency(b3)} - ${formatCurrency(max)}` },
              { value: `${max}-`, label: `${formatCurrency(max)} +` },
            ];
            setBudgetOptions(opts);
          } else {
            // Single price point
            setBudgetOptions([
              { value: `${min}-`, label: `${formatCurrency(min)} +` }
            ]);
          }
        } else {
          setBudgetOptions([]);
        }
      } catch (err) {
        console.error('Unexpected error loading filter metadata:', err);
        // Set empty arrays as fallback
        setLocationOptions([]);
        setTypeOptions([]);
        setBudgetOptions([]);
      }
    };

    loadFilterMetadata();
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
          const locLower = location.toLowerCase();
          filteredProperties = filteredProperties.filter(p => 
            p.location?.toLowerCase().includes(locLower)
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
                const { data: props } = await supabase
                  .from('properties')
                  .select('id')
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
                  properties_count: (props?.length || 0),
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
    <section className={
      "relative pt-16 overflow-hidden bg-gradient-to-br from-white via-immoo-pearl/30 to-white " +
      "dark:from-immoo-navy dark:via-immoo-navy-light/50 dark:to-immoo-navy min-h-[75vh] flex items-center"
    }>
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
              <span className="text-xs sm:text-sm">{t('hero.badge')}</span>
            </span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 leading-tight px-2">
            <span className="text-immoo-navy dark:text-immoo-pearl">
              {t('hero.title')}
            </span>
          </motion.h1>
          
          {/* Description paragraph removed */}
          
          {/* Ultra Modern Search Card */}
          <motion.div variants={itemVariants} className="max-w-5xl mx-auto mb-12">
            <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
              {/* Minimalist Toggle */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex bg-gray-100 rounded-2xl p-1">
                  <button
                    onClick={() => setSearchType("properties")}
                    className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                      searchType === "properties"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Home className="inline h-4 w-4 mr-2" />
                    {t('hero.toggleProperties')}
                  </button>
                  <button
                    onClick={() => setSearchType("agencies")}
                    className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                      searchType === "agencies"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Building className="inline h-4 w-4 mr-2" />
                    {t('hero.toggleAgencies')}
                  </button>
                </div>
              </div>

              {/* Modern Search Bar */}
              <div className="relative mb-6">
                <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors duration-200 p-4 gap-3">
                  <Search className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={searchType === "properties" ? t('hero.searchPlaceholder') : t('hero.searchPlaceholder')}
                    className="flex-1 bg-transparent border-none focus:outline-none text-gray-900 placeholder-gray-500 text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button 
                    onClick={handleSearch}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-3 sm:px-6 py-2.5 rounded-xl font-medium transition-colors duration-200 text-sm flex items-center justify-center min-w-[44px] sm:min-w-auto"
                  >
                    <Search className="h-4 w-4 sm:hidden" />
                    <span className="hidden sm:inline">{t('hero.search')}</span>
                  </button>
                </div>
              </div>

              {/* Compact Filters - Properties */}
              {searchType === "properties" && (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {/* Location */}
                    <select 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition-colors"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    >
                      <option value="">📍 {t('hero.location')}</option>
                      {locationOptions.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>

                    {/* Property Type */}
                    <select 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition-colors"
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                    >
                      <option value="">🏠 {t('hero.propertyType')}</option>
                      {typeOptions.map((typ) => (
                        <option key={typ} value={typ}>{typ}</option>
                      ))}
                    </select>

                    {/* Price Range */}
                    <select 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition-colors"
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                    >
                      <option value="">💰 {t('hero.budget')}</option>
                      {budgetOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Clear Filters removed - using global clear filters button */}
                </>
              )}

              {/* Compact Filters - Agencies */}
              {searchType === "agencies" && (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {/* Verification Status */}
                    <select 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition-colors"
                      value={agencyStatus}
                      onChange={(e) => setAgencyStatus(e.target.value)}
                    >
                      <option value="">✅ {t('hero.status')}</option>
                      <option value="verified">{t('hero.verifiedAgencies')}</option>
                      <option value="non-verified">{t('hero.nonVerifiedAgencies')}</option>
                    </select>

                    {/* Location/Country */}
                    <select 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition-colors"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    >
                      <option value="">🌍 {t('hero.country')}</option>
                      <option value="mali">Mali</option>
                      <option value="senegal">Sénégal</option>
                      <option value="burkina">Burkina Faso</option>
                      <option value="cote-ivoire">Côte d'Ivoire</option>
                      <option value="guinea">Guinée</option>
                    </select>

                    {/* Sector/Specialization */}
                    <select 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition-colors"
                      value={agencyPropertiesCount}
                      onChange={(e) => setAgencyPropertiesCount(e.target.value)}
                    >
                      <option value="">🏢 Secteur</option>
                      <option value="residential">Résidentiel</option>
                      <option value="commercial">Commercial</option>
                      <option value="industrial">Industriel</option>
                      <option value="mixed">Mixte</option>
                    </select>
                  </div>
                </>
              )}

              {/* Quick Action - Show only if filters are active based on search type */}
              {(
                searchTerm || 
                (searchType === "properties" && (location || propertyType || priceRange || surface || selectedFeatures.length > 0)) ||
                (searchType === "agencies" && (agencyStatus || agencyPropertiesCount || agencyContactType))
              ) && (
                <div className="flex justify-center">
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-immoo-navy/60 dark:text-immoo-pearl/60 hover:text-immoo-gold transition-colors"
                  >
                    {t('hero.clearFilters')}
                  </button>
                </div>
              )}
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
                    {t('hero.searchResults')}
                  </h3>
                  <p className="text-sm text-immoo-navy/60 dark:text-immoo-pearl/60">
                    {isSearching ? t('hero.searching') : 
                      searchType === "properties" 
                        ? t('hero.propertiesFound', { count: searchResults.length })
                        : t('hero.agenciesFound', { count: agencies.length })
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
                          <p className="text-gray-500">{t('hero.noPropertiesFound')}</p>
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
                                          <span className="text-xs text-green-600 font-medium">{t('hero.verified')}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Content */}
                                  <div className="p-6 pt-4">
                                    {/* Description */}
                                    <p className="text-sm text-immoo-navy/70 dark:text-immoo-pearl/70 mb-4 line-clamp-2 leading-relaxed">
                                      {agency.description || t('hero.defaultAgencyDescription')}
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
                                            {t('hero.property', { count: agency.properties_count })}
                                          </span>
                                        </div>
                                        <div className="flex items-center">
                                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                          <span className="text-sm font-semibold text-immoo-navy dark:text-immoo-pearl">
                                            {agency.calculated_rating || agency.rating || t('hero.new')}
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
                                            {t('hero.connected')}
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
                            <p className="text-immoo-navy/70 dark:text-immoo-pearl/70 font-medium">{t('hero.noAgenciesFound')}</p>
                            <p className="text-sm text-immoo-navy/50 dark:text-immoo-pearl/50 mt-2">{t('hero.tryModifyingFilters')}</p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Minimal Action Cards */}
          <motion.div variants={itemVariants} className="mobile-flex-between mobile-space-x-tight grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mt-16 max-w-4xl mx-auto">
            <div className="group text-center mobile-card p-3 md:p-0">
              <div className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 rounded-xl md:rounded-2xl bg-gray-50 mobile-flex-center text-gray-700 group-hover:bg-gray-100 transition-colors duration-200">
                <Home className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2 text-gray-900 mobile-text">{t('hero.exclusiveProperties')}</h3>
              <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-4 leading-relaxed hidden md:block">{t('hero.exclusivePropertiesDesc')}</p>
              <button 
                onClick={() => {
                  console.log('Button clicked - searching for properties section');
                  
                  const scrollToSection = () => {
                    const featuredSection = document.getElementById('properties');
                    console.log('Found section:', featuredSection);
                    
                    if (featuredSection) {
                      featuredSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                      });
                    } else {
                      // Fallback: try to find by class or other selector
                      const sectionByClass = document.querySelector('[id="properties"]');
                      if (sectionByClass) {
                        sectionByClass.scrollIntoView({ 
                          behavior: 'smooth',
                          block: 'start'
                        });
                      } else {
                        console.warn('Properties section not found');
                      }
                    }
                  };
                  
                  // Try immediately
                  scrollToSection();
                  
                  // If not found, try again after a short delay
                  setTimeout(scrollToSection, 100);
                }}
                className="text-gray-900 text-xs md:text-sm font-medium hover:text-gray-700 transition-colors mobile-flex-center mx-auto cursor-pointer"
              >
                {t('hero.explore')} <ArrowRight className="ml-1 h-3 w-3 md:h-4 md:w-4" />
              </button>
            </div>

            <div className="group text-center mobile-card p-3 md:p-0">
              <div className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 rounded-xl md:rounded-2xl bg-gray-50 mobile-flex-center text-gray-700 group-hover:bg-gray-100 transition-colors duration-200">
                <Building className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2 text-gray-900 mobile-text">{t('hero.trustedAgencies')}</h3>
              <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-4 leading-relaxed hidden md:block">{t('hero.trustedAgenciesDesc')}</p>
              <button 
                onClick={() => navigate("/browse-agencies")}
                className="text-gray-900 text-xs md:text-sm font-medium hover:text-gray-700 transition-colors mobile-flex-center mx-auto"
              >
                {t('hero.viewAgencies')} <ArrowRight className="ml-1 h-3 w-3 md:h-4 md:w-4" />
              </button>
            </div>

            <div className="group text-center mobile-card p-3 md:p-0">
              <div className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 rounded-xl md:rounded-2xl bg-gray-50 mobile-flex-center text-gray-700 group-hover:bg-gray-100 transition-colors duration-200">
                <Search className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2 text-gray-900 mobile-text">{t('hero.integratedPropertyManagement')}</h3>
              <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-4 leading-relaxed hidden md:block">{t('hero.integratedPropertyManagementDesc')}</p>
              <button 
                onClick={() => {
                  const featuresSection = document.getElementById('features');
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="text-gray-900 text-xs md:text-sm font-medium hover:text-gray-700 transition-colors mobile-flex-center mx-auto cursor-pointer"
              >
                {t('hero.discover')} <ArrowRight className="ml-1 h-3 w-3 md:h-4 md:w-4" />
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

