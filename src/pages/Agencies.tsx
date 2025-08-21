import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useSubscriptionLimits } from '@/hooks/subscription/useSubscriptionLimits';

export default function AgenciesPage() {
  const navigate = useNavigate();
  const { limits: subscriptionLimits, isLoading: limitsLoading } = useSubscriptionLimits();
  const agencyLimitReached = !!subscriptionLimits && subscriptionLimits.agencies && !subscriptionLimits.agencies.allowed;
  const createDisabled = !subscriptionLimits ? true : agencyLimitReached;

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Agencies</h1>
        <p className="mb-4">Explore our featured agencies and find the perfect partner for your real estate needs.</p>
        
        <Button
          onClick={() => navigate('/agencies/create')}
          disabled={createDisabled}
          title={agencyLimitReached ? 'Plan limit reached for agencies' : (!subscriptionLimits ? 'Checking subscription...' : undefined)}
        >
          Create Agency
        </Button>
      </div>
      <Footer />
    </>
  );
}
