import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { PlatformStatsSection } from '@/components/landing/PlatformStatsSection';
import { ThreeStepWorkflowSection } from '@/components/landing/ThreeStepWorkflowSection';
import { DualRoleSection } from '@/components/landing/DualRoleSection';
import { BlockchainBenefitsSection } from '@/components/landing/BlockchainBenefitsSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* 1. Navigation Bar with SolarCredit Branding */}
      <LandingNavbar />

      <main className="w-full pt-16 bg-surface flex-1">
        <div className="relative w-full overflow-hidden">
          <div className="absolute -top-32 -left-20 w-96 h-96 bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-80 -right-24 w-80 h-80 bg-secondary-container/40 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* 2, 3, 4. Hero Section + Primary CTA (Get Started) + Secondary CTA (Explore Marketplace) */}
          <HeroSection />

          {/* 9. Platform Statistics Section */}
          <PlatformStatsSection />

          {/* 7 & 5. Three-Step Energy Credit Workflow + How SolarCredit Works Section */}
          <ThreeStepWorkflowSection />

          {/* 6. Prosumer and Consumer Explanation */}
          <DualRoleSection />

          {/* 8. Benefits of Blockchain Verification */}
          <BlockchainBenefitsSection />

          {/* 10. Features Section */}
          <FeaturesSection />

          {/* 11. FAQ Section */}
          <FaqSection />
        </div>
      </main>

      {/* 12. Footer with Navigation and Contact Information */}
      <LandingFooter />
    </div>
  );
};
