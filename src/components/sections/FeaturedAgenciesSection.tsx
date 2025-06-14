
import { useState, useEffect } from "react";
import { AnimatedCard } from "../ui/AnimatedCard";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Building, BadgeCheck, ArrowRight } from "lucide-react";
import AgencyCard from "../AgencyCard";
import { ButtonEffects } from "../ui/ButtonEffects";
import { Agency } from "@/assets/types";
import { getFeaturedAgencies } from "@/services/agency";
import { useQuery } from "@tanstack/react-query";
import { isSupabaseConnected } from "@/lib/supabase";

export default function FeaturedAgenciesSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if we have a valid Supabase connection
    const checkConnection = async () => {
      const connected = await isSupabaseConnected();
      setIsConnected(connected);
    };
    
    checkConnection();
  }, []);

  // getFeaturedAgencies filtre déjà les agences bloquées et masquées
  const { data: agenciesResult, error, isLoading } = useQuery({
    queryKey: ['featured-agencies'],
    queryFn: () => getFeaturedAgencies(6),
    enabled: isConnected !== false, // Only run query if connection is valid
  });

  // Use mock data if Supabase is not connected
  const mockAgencies: Agency[] = isConnected === false ? [
    {
      id: "1",
      name: "ImmoPlus Paris",
      logoUrl: "https://placehold.co/400x400?text=ImmoPlus",
      location: "Paris, France",
      properties: 48,
      rating: 4.8,
      verified: true
    },
    {
      id: "2",
      name: "Lyon Estates",
      logoUrl: "https://placehold.co/400x400?text=Lyon+Estates",
      location: "Lyon, France",
      properties: 35,
      rating: 4.6,
      verified: true
    },
    {
      id: "3",
      name: "Bordeaux Properties",
      logoUrl: "https://placehold.co/400x400?text=Bordeaux",
      location: "Bordeaux, France",
      properties: 29,
      rating: 4.5,
      verified: true
    },
    {
      id: "4",
      name: "Marseille Homes",
      logoUrl: "https://placehold.co/400x400?text=Marseille",
      location: "Marseille, France",
      properties: 42,
      rating: 4.4,
      verified: true
    },
    {
      id: "5",
      name: "Nice Riviera Realty",
      logoUrl: "https://placehold.co/400x400?text=Nice",
      location: "Nice, France",
      properties: 31,
      rating: 4.9,
      verified: true
    },
    {
      id: "6",
      name: "Strasbourg Properties",
      logoUrl: "https://placehold.co/400x400?text=Strasbourg",
      location: "Strasbourg, France",
      properties: 26,
      rating: 4.7,
      verified: true
    }
  ] : [];

  const agencies = isConnected === false 
    ? mockAgencies 
    : (agenciesResult?.agencies || []);

  return (
    <section 
      id="agencies" 
      className="py-24"
      ref={sectionRef}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s ease-out, transform 0.6s ease-out"
      }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3">Nos agences partenaires</p>
          <h2 className="text-3xl font-bold mb-6">Les meilleures agences immobilières</h2>
          <p className="text-muted-foreground mb-12">
            Découvrez notre réseau d'agences immobilières de confiance, sélectionnées pour leur professionnalisme et leur expertise
          </p>
        </div>
        
        {isLoading && isConnected !== false ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <AnimatedCard key={index} className="p-6 h-48">
                <div className="animate-pulse flex flex-col h-full">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-muted/50 rounded-full mr-4"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-muted/50 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted/50 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="mt-auto pt-4">
                    <div className="h-4 bg-muted/50 rounded w-full"></div>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        ) : error && isConnected !== false ? (
          <AnimatedCard className="p-6 text-center">
            <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Impossible de charger les agences</h3>
            <p className="text-muted-foreground">Veuillez réessayer ultérieurement</p>
          </AnimatedCard>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agencies.map((agency) => (
                <AgencyCard key={agency.id} agency={agency} />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <ButtonEffects variant="outline">
                <div className="flex items-center">
                  Voir toutes les agences
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
