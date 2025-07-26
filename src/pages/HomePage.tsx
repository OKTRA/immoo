import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProperties } from "@/services/propertyService";
import { Property } from "@/assets/types";
import { Home, Building2, User, LogIn, ArrowRight } from "lucide-react";
import HeroSection from '@/components/HeroSection';
import FeatureSection from '@/components/FeatureSection';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import PropertyList from '@/components/properties/PropertyList';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, useAuthStatus } from '@/hooks/useAuth';

export default function HomePage() {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasProperties, setHasProperties] = useState(false);
  const { user, profile, initialized } = useAuth();
  const { isAuthenticated, isReady } = useAuthStatus();

  useEffect(() => {
    // On s'assure que le contexte d'authentification a terminé son initialisation
    if (!initialized) {
      console.log('🏠 HomePage: Auth not initialized, waiting...');
      return;
    }

    const fetchProperties = async () => {
      setLoading(true);
      try {
        console.log('🏠 HomePage: Fetching properties for user:', user?.id || 'anonymous');
        const { properties } = await getProperties(undefined, 24);
        
        if (!properties || properties.length === 0) {
          setFeaturedProperties([]);
          setHasProperties(false);
          setLoading(false);
          return;
        }

        const agencyIds = [...new Set(properties.map(p => p.agencyId).filter(Boolean))];

        if (agencyIds.length > 0) {
          const { data: activeAgencies, error: agenciesError } = await supabase
            .from('agencies')
            .select('id')
            .in('id', agencyIds)
            .eq('status', 'active')
            .eq('is_visible', true);

          if (agenciesError) {
            console.error("Error fetching active agencies:", agenciesError);
            setFeaturedProperties([]);
            setHasProperties(false);
          } else {
            const activeAgencyIds = new Set(activeAgencies.map(a => a.id));
            const filteredProperties = properties
              .filter(p => p.agencyId && activeAgencyIds.has(p.agencyId))
              .slice(0, 6);
            setFeaturedProperties(filteredProperties);
            setHasProperties(filteredProperties.length > 0);
          }
        } else {
          setFeaturedProperties([]);
          setHasProperties(false);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
        setFeaturedProperties([]);
        setHasProperties(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [initialized, user?.id]); // Se déclenche quand l'auth est prête ET quand l'user change
  
  return (
    <ResponsiveLayout>
      <div className="immoo-hero-bg">
        <HeroSection />
        
        {/* Only show properties section if there are properties or while loading */}
        {(hasProperties || loading) && (
          <section className="py-6 sm:py-8 md:py-12 bg-gradient-to-b from-immoo-pearl/20 to-white dark:from-immoo-navy-light/20 dark:to-immoo-navy">
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
              {/* Section Header */}
              <div className="text-center mb-6 sm:mb-8 md:mb-12">
                <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-immoo-gold/10 text-immoo-gold rounded-full text-xs font-medium mb-3 sm:mb-4 border border-immoo-gold/20">
                  <Building2 className="w-3 h-3 mr-1.5 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Sélection immobilière</span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-immoo-navy dark:text-immoo-pearl px-2">
                  Propriétés en vedette
                </h2>
                <p className="text-sm md:text-base text-immoo-navy/60 dark:text-immoo-pearl/60 max-w-2xl mx-auto px-4">
                  Découvrez notre sélection de biens d'exception
                </p>
              </div>

              {/* Properties Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  {[...Array(6)].map((_, index) => (
                    <Card key={index} className="overflow-hidden animate-pulse border-immoo-gray/20 shadow-sm">
                      <div className="h-40 sm:h-44 md:h-48 bg-immoo-gray/30"></div>
                      <CardContent className="p-3 sm:p-4">
                        <div className="h-4 bg-immoo-gray/30 rounded mb-2"></div>
                        <div className="h-3 bg-immoo-gray/30 rounded mb-3 w-2/3"></div>
                        <div className="flex justify-between items-center mb-3">
                          <div className="h-4 bg-immoo-gray/30 rounded w-1/3"></div>
                          <div className="h-3 bg-immoo-gray/30 rounded w-1/4"></div>
                        </div>
                        <div className="flex space-x-2 sm:space-x-3">
                          <div className="h-3 bg-immoo-gray/30 rounded w-10 sm:w-12"></div>
                          <div className="h-3 bg-immoo-gray/30 rounded w-8 sm:w-10"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <PropertyList properties={featuredProperties} />
                  

                </div>
              )}
            </div>
          </section>
        )}
        
        <FeatureSection />
      </div>
    </ResponsiveLayout>
  );
}
