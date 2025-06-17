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
          <section className="py-20 bg-gradient-to-b from-immoo-pearl to-card dark:from-immoo-navy-light dark:to-immoo-navy">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center px-6 py-3 bg-immoo-gold/10 text-immoo-gold rounded-full text-sm font-semibold mb-6 border border-immoo-gold/20">
                  <Building2 className="w-4 h-4 mr-2" />
                  Sélection immobilière
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-immoo-navy to-immoo-gold dark:from-immoo-pearl dark:to-immoo-gold bg-clip-text text-transparent">
                  Propriétés en vedette
                </h2>
                <p className="text-xl text-immoo-navy/70 dark:text-immoo-pearl/70 max-w-3xl mx-auto leading-relaxed">
                  Découvrez notre sélection de biens d'exception, soigneusement choisis pour leur qualité, leur emplacement privilégié et leur potentiel d'investissement.
                </p>
              </div>

              {/* Properties Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, index) => (
                    <Card key={index} className="overflow-hidden animate-pulse border-immoo-gray/20 shadow-lg">
                      <div className="h-64 bg-immoo-gray/30"></div>
                      <CardContent className="p-6">
                        <div className="h-6 bg-immoo-gray/30 rounded mb-3"></div>
                        <div className="h-4 bg-immoo-gray/30 rounded mb-4 w-2/3"></div>
                        <div className="flex justify-between items-center mb-4">
                          <div className="h-6 bg-immoo-gray/30 rounded w-1/3"></div>
                          <div className="h-4 bg-immoo-gray/30 rounded w-1/4"></div>
                        </div>
                        <div className="flex space-x-4">
                          <div className="h-4 bg-immoo-gray/30 rounded w-16"></div>
                          <div className="h-4 bg-immoo-gray/30 rounded w-12"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-8">
                  <PropertyList properties={featuredProperties} />
                  
                  {/* Call to Action */}
                  <div className="text-center pt-8">
                    <div className="inline-flex flex-col sm:flex-row gap-4">
                      <Button asChild size="lg" className="immoo-cta-button h-14 px-8 text-lg font-medium">
                        <Link to="/properties" className="flex items-center">
                          Voir toutes les propriétés
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg font-medium border-2 border-immoo-gold hover:bg-immoo-gold hover:text-immoo-navy transition-all duration-300">
                        <Link to="/agencies" className="flex items-center">
                          <Building2 className="mr-2 h-5 w-5" />
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
        
        <section className="py-20 bg-gradient-to-r from-immoo-navy via-immoo-navy-light to-immoo-navy relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-immoo-gold rounded-full animate-immoo-float"></div>
            <div className="absolute bottom-10 right-10 w-20 h-20 bg-immoo-gold/50 rounded-full animate-immoo-float" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-immoo-pearl to-immoo-gold bg-clip-text text-transparent">
                Accédez à votre espace IMMOO
              </h2>
              <p className="text-xl text-immoo-pearl/80 mb-12 leading-relaxed">
                Connectez-vous à votre espace personnalisé pour gérer vos propriétés, suivre vos locataires et administrer vos baux en toute simplicité.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button className="immoo-cta-button h-16 px-10 text-lg font-medium animate-immoo-glow" asChild size="lg">
                  <Link to="/agencies" className="flex items-center">
                    <Building2 className="w-6 h-6 mr-3" />
                    Espace Agence
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-16 px-10 text-lg font-medium border-2 border-immoo-gold text-immoo-gold hover:bg-immoo-gold hover:text-immoo-navy transition-all duration-300" asChild size="lg">
                  <Link to="/auth" className="flex items-center">
                    <LogIn className="w-6 h-6 mr-3" />
                    Se connecter
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
