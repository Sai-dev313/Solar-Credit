import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { demoAdapter } from '@/lib/demoAdapter';
import { db } from '@/lib/dbFunctions';
import { EnergyTransaction, MarketplaceListing } from '@/types';

export const marketService = {
  /** market_listings */
  async getListings(): Promise<MarketplaceListing[]> {
    return db.marketListings();
  },

  /** create_listing */
  async createListing(creditsKwh: number, priceInr: number): Promise<void> {
    await db.createListing(creditsKwh, priceInr);
  },

  /** cancel_listing */
  async cancelListing(listingId: string): Promise<void> {
    await db.cancelListing(listingId);
  },

  /** buy_listing */
  async purchaseCredits(listingId: string, kwhToBuy: number): Promise<void> {
    await db.buyListing(listingId, kwhToBuy);
  },

  /** Read-only: the user's own transaction history (row-level security limits it to them) */
  async getTransactions(): Promise<EnergyTransaction[]> {
    if (!isSupabaseConfigured) {
      return demoAdapter.getTransactions();
    }
    const { data, error } = await supabase
      .from('energy_transactions')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error || !data || data.length === 0) {
      return demoAdapter.getTransactions();
    }
    return data as EnergyTransaction[];
  },
};
