
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import FeatureSection from '@/components/FeatureSection';
import FeaturedPropertiesSection from '@/components/sections/FeaturedPropertiesSection';
import FeaturedAgenciesSection from '@/components/sections/FeaturedAgenciesSection';
import TestimonialSection from '@/components/sections/TestimonialSection';
import PricingSection from '@/components/sections/PricingSection';
import CTASection from '@/components/sections/CTASection';
import { Property, Agency } from '@/assets/types';
import { getFeaturedProperties } from '@/services/propertyService';
import { getFeaturedAgencies } from '@/services/agency';

export default function HomePage() {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [featuredAgencies, setFeaturedAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedData = async () => {
      try {
        setLoading(true);
        
        // Load featured properties
        const propertiesResult = await getFeaturedProperties(6);
        if (propertiesResult?.properties) {
          setFeaturedProperties(propertiesResult.properties);
        }
        
        // Load featured agencies
        const agenciesResult = await getFeaturedAgencies(6);
        if (agenciesResult?.agencies) {
          setFeaturedAgencies(agenciesResult.agencies);
        }
      } catch (error) {
        console.error('Error loading featured data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedData();
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeatureSection />
        <FeaturedPropertiesSection />
        <FeaturedAgenciesSection />
        <TestimonialSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
