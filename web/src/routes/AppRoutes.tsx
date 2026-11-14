import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useApp } from '@/hooks/useApp';
import { LandingPage } from '@/pages/landing/LandingPage';
import { AuthPage } from '@/pages/auth/AuthPage';
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage';
import { ProsumerPage } from '@/pages/prosumer/ProsumerPage';
import { ConsumerPage } from '@/pages/consumer/ConsumerPage';
import { MarketplacePage } from '@/pages/marketplace/MarketplacePage';
import { BillsPage } from '@/pages/bills/BillsPage';
import { TransactionsPage } from '@/pages/transactions/TransactionsPage';
import { BlockchainPage } from '@/pages/blockchain/BlockchainPage';
import { AdminPage } from '@/pages/admin/AdminPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';

export const AppRoutes: React.FC = () => {
  const { profile } = useApp();
  const isProducer = profile.role === 'prosumer';

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      {/* Strictly separate Producer and Consumer dashboards based on logged-in role */}
      <Route
        path="/prosumer"
        element={isProducer ? <ProsumerPage /> : <Navigate to="/consumer" replace />}
      />
      <Route
        path="/consumer"
        element={!isProducer ? <ConsumerPage /> : <Navigate to="/prosumer" replace />}
      />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/bills" element={<BillsPage />} />
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/blockchain" element={<BlockchainPage />} />
      <Route path="/admin" element={<AdminPage />} />
      {/* Shared by producers and consumers; fields shown depend on profile.role */}
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
