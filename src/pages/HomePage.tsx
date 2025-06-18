import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProperties } from "@/services/propertyService";
import { Property } from "@/assets/types";
import { Home, Building2, User, LogIn, ArrowRight } from "lucide-react";
import HeroSection from '@/components/HeroSection';
import FeatureSection from '@/components/FeatureSection';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyList from '@/components/properties/PropertyList';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasProperties, setHasProperties] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
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
  }, [user]);
  
  return (
    <div className="flex flex-col min-h-screen immoo-hero-bg">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection />
        
        {/* Only show properties section if there are properties or while loading */}
        {(hasProperties || loading) && (
          <section className="py-12 bg-gradient-to-b from-immoo-pearl/20 to-white dark:from-immoo-navy-light/20 dark:to-immoo-navy">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center px-4 py-2 bg-immoo-gold/10 text-immoo-gold rounded-full text-xs font-medium mb-4 border border-immoo-gold/20">
                  <Building2 className="w-3 h-3 mr-2" />
                  Sélection immobilière
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-immoo-navy dark:text-immoo-pearl">
                  Propriétés en vedette
                </h2>
                <p className="text-sm md:text-base text-immoo-navy/60 dark:text-immoo-pearl/60 max-w-2xl mx-auto">
                  Découvrez notre sélection de biens d'exception
                </p>
              </div>

              {/* Properties Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <Card key={index} className="overflow-hidden animate-pulse border-immoo-gray/20 shadow-sm">
                      <div className="h-48 bg-immoo-gray/30"></div>
                      <CardContent className="p-4">
                        <div className="h-4 bg-immoo-gray/30 rounded mb-2"></div>
                        <div className="h-3 bg-immoo-gray/30 rounded mb-3 w-2/3"></div>
                        <div className="flex justify-between items-center mb-3">
                          <div className="h-4 bg-immoo-gray/30 rounded w-1/3"></div>
                          <div className="h-3 bg-immoo-gray/30 rounded w-1/4"></div>
                        </div>
                        <div className="flex space-x-3">
                          <div className="h-3 bg-immoo-gray/30 rounded w-12"></div>
                          <div className="h-3 bg-immoo-gray/30 rounded w-10"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <PropertyList properties={featuredProperties} />
                  
                  {/* Compact Call to Action */}
                  <div className="text-center pt-6">
                    <div className="inline-flex flex-col sm:flex-row gap-3">
                      <Button asChild size="default" className="bg-gradient-to-r from-immoo-gold to-immoo-gold-light hover:from-immoo-gold-light hover:to-immoo-gold text-immoo-navy px-6 py-2.5 font-medium shadow-md hover:shadow-lg transition-all duration-200">
                        <Link to="/properties" className="flex items-center">
                          Voir toutes les propriétés
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="default" className="border border-immoo-gold text-immoo-gold hover:bg-immoo-gold hover:text-immoo-navy px-6 py-2.5 font-medium transition-all duration-200">
                        <Link to="/agencies" className="flex items-center">
                          <Building2 className="mr-2 h-4 w-4" />
                          Parcourir les agences
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
        
        <FeatureSection />
      </main>
      
      <Footer />
    </div>
  );
}
