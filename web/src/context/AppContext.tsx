import React, { createContext, useCallback, useEffect, useState } from 'react';
import {
  ChainEventLog,
  ElectricityBill,
  EnergyGenerationPoint,
  EnergyStatsSummary,
  EnergyTransaction,
  MarketplaceListing,
  UserProfile,
  UserRole,
} from '@/types';
import { authService } from '@/services/auth.service';
import { energyService } from '@/services/energy.service';
import { marketService } from '@/services/market.service';
import { billService } from '@/services/bill.service';
import { blockchainService } from '@/services/blockchain.service';
import { demoAdapter } from '@/lib/demoAdapter';
import { isDemoMode } from '@/lib/supabase';

interface AppContextValue {
  profile: UserProfile;
  stats: EnergyStatsSummary;
  telemetry: EnergyGenerationPoint[];
  listings: MarketplaceListing[];
  transactions: EnergyTransaction[];
  bills: ElectricityBill[];
  chainEvents: ChainEventLog[];
  isDemoMode: boolean;
  switchRole: (role: UserRole) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  connectUserWallet: () => Promise<void>;
  /** Record surplus energy (log_energy) */
  logEnergy: (kwh: number) => Promise<void>;
  /** Turn logged surplus into credits (claim_credits) */
  claimCredits: (kwh: number) => Promise<void>;
  createOffer: (creditsKwh: number, pricePerKwh: number) => Promise<void>;
  buyListing: (listingId: string, kwhToBuy: number) => Promise<void>;
  /** Take down your own listing (cancel_listing); unsold credits come back */
  cancelListing: (listingId: string) => Promise<void>;
  applyCreditsToBill: (billId: string, creditsKwh: number) => Promise<void>;
  payRemainingBill: (billId: string) => Promise<void>;
  resetDemo: () => void;
  refreshAll: () => Promise<void>;
}

export const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = demoAdapter.getEnergyStats();
  const [profile, setProfile] = useState<UserProfile>(() => demoAdapter.getProfile());
  const [stats, setStats] = useState<EnergyStatsSummary>(initial.stats);
  const [telemetry, setTelemetry] = useState<EnergyGenerationPoint[]>(initial.telemetry);
  const [listings, setListings] = useState<MarketplaceListing[]>(() => demoAdapter.getListings());
  const [transactions, setTransactions] = useState<EnergyTransaction[]>(() =>
    demoAdapter.getTransactions()
  );
  const [bills, setBills] = useState<ElectricityBill[]>(() => demoAdapter.getBills());
  const [chainEvents, setChainEvents] = useState<ChainEventLog[]>(() =>
    demoAdapter.getChainEvents()
  );

  const refreshAll = useCallback(async () => {
    const [p, energy, mListings, txs, bList, events] = await Promise.all([
      authService.getCurrentProfile(),
      energyService.getDashboardData(),
      marketService.getListings(),
      marketService.getTransactions(),
      billService.getBills(),
      blockchainService.getChainEvents(),
    ]);
    setProfile(p);
    setStats(energy.stats);
    setTelemetry(energy.telemetry);
    setListings(mListings);
    setTransactions(txs);
    setBills(bList);
    setChainEvents(events);
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const switchRole = async (role: UserRole) => {
    await authService.switchRole(role);
    await refreshAll();
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const next = await authService.updateProfile(updates);
    setProfile(next);
  };

  const connectUserWallet = async () => {
    await blockchainService.connectWallet();
    await refreshAll();
  };

  const logEnergy = async (kwh: number) => {
    await energyService.logEnergy(kwh);
    await refreshAll();
  };

  const claimCredits = async (kwh: number) => {
    await energyService.claimCredits(kwh);
    await refreshAll();
  };

  const createOffer = async (creditsKwh: number, pricePerKwh: number) => {
    await marketService.createListing(creditsKwh, pricePerKwh);
    await refreshAll();
  };

  const cancelListing = async (listingId: string) => {
    await marketService.cancelListing(listingId);
    await refreshAll();
  };

  const buyListing = async (listingId: string, kwhToBuy: number) => {
    await marketService.purchaseCredits(listingId, kwhToBuy);
    await refreshAll();
  };

  const applyCreditsToBill = async (billId: string, creditsKwh: number) => {
    await billService.applyCreditsToBill(billId, creditsKwh);
    await refreshAll();
  };

  const payRemainingBill = async (billId: string) => {
    await billService.payRemainingBill(billId);
    await refreshAll();
  };

  const resetDemo = () => {
    demoAdapter.resetDemoState();
    refreshAll();
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        stats,
        telemetry,
        listings,
        transactions,
        bills,
        chainEvents,
        isDemoMode,
        switchRole,
        updateProfile,
        connectUserWallet,
        logEnergy,
        claimCredits,
        createOffer,
        buyListing,
        cancelListing,
        applyCreditsToBill,
        payRemainingBill,
        resetDemo,
        refreshAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
