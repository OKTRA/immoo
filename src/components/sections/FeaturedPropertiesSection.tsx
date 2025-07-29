
import { useState, useEffect, useRef } from "react";
import { AnimatedCard } from "../ui/AnimatedCard";
import { useInView } from "framer-motion";
import { Home, ArrowRight } from "lucide-react";
import PropertyCard from "../PropertyCard";
import { ButtonEffects } from "../ui/ButtonEffects";
import { Property } from "@/assets/types";
import { getFeaturedProperties } from "@/services/propertyService";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/useTranslation";

export default function FeaturedPropertiesSection() {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  const { data: propertiesResult, error, isLoading } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: () => getFeaturedProperties(6),
  });

  const properties = propertiesResult?.properties || [];
  const featuredProperties = properties.slice(0, 6);

  return (
    <section 
      id="properties" 
      className="py-24 bg-muted/30"
      ref={sectionRef}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s ease-out, transform 0.6s ease-out"
      }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3">{t('featuredPropertiesSection.subtitle')}</p>
          <h2 className="text-3xl font-bold mb-6">{t('featuredPropertiesSection.title')}</h2>
          <p className="text-muted-foreground mb-12">
            {t('featuredPropertiesSection.description')}
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <AnimatedCard key={index} className="p-6 h-80">
                <div className="animate-pulse flex flex-col h-full">
                  <div className="w-full h-40 bg-muted/50 rounded-md mb-4"></div>
                  <div className="h-6 bg-muted/50 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted/50 rounded w-1/2 mb-4"></div>
                  <div className="mt-auto pt-4">
                    <div className="h-8 bg-muted/50 rounded w-full"></div>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        ) : error ? (
          <AnimatedCard className="p-6 text-center">
            <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">{t('featuredPropertiesSection.loadingError')}</h3>
            <p className="text-muted-foreground">{t('featuredPropertiesSection.loadingErrorDesc')}</p>
          </AnimatedCard>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((property, index) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  featured={index === 0} 
                />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <ButtonEffects variant="outline">
                <div className="flex items-center">
                  {t('featuredPropertiesSection.exploreAll')}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </ButtonEffects>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
