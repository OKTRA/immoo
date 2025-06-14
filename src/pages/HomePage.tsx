
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

export default function HomePage() {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const { properties } = await getProperties(undefined, 6);
        setFeaturedProperties(properties || []);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection />
        
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                <Building2 className="w-4 h-4 mr-2" />
                Sélection immobilière
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Propriétés en vedette
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Découvrez notre sélection de biens d'exception, soigneusement choisis pour leur qualité, leur emplacement privilégié et leur potentiel d'investissement.
              </p>
            </div>

            {/* Properties Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[...Array(6)].map((_, index) => (
                  <Card key={index} className="overflow-hidden animate-pulse">
                    <div className="h-64 bg-gray-200 dark:bg-gray-700"></div>
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-2/3"></div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                      </div>
                      <div className="flex space-x-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
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
                    <Button asChild size="lg" className="h-14 px-8 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                      <Link to="/properties" className="flex items-center">
                        Voir toutes les propriétés
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg font-medium border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
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
        
        <FeatureSection />
        
        <section className="py-20 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Accédez à votre espace
              </h2>
              <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                Connectez-vous à votre espace personnalisé pour gérer vos propriétés, suivre vos locataires et administrer vos baux en toute simplicité.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button className="h-16 px-10 text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90" asChild size="lg">
                  <Link to="/agencies" className="flex items-center">
                    <Building2 className="w-6 h-6 mr-3" />
                    Espace Agence
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-16 px-10 text-lg font-medium border-2 border-primary/20 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300" asChild size="lg">
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
