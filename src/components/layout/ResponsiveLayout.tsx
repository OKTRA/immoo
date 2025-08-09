import React from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import MobileLayout from './MobileLayout';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export default function ResponsiveLayout({ children, showFooter = true }: ResponsiveLayoutProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  // Layout desktop existant
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
