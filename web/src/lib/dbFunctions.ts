/**
 * The 7 backend functions: the ONLY way the frontend changes data.
 *
 * Team agreement: the browser never writes tables. It only calls these database
 * functions (Person 2 owns the SQL in supabase/migrations):
 *   log_energy, claim_credits, create_listing, cancel_listing, buy_listing, pay_bill, market_listings
 *
 * Demo mode  -> the local demo store (src/lib/demoAdapter.ts)
 * Real backend -> supabase.rpc('<function>', params)
 *
 * DAY 4 CHECKLIST: the parameter names below (p_kwh, p_listing_id, ...) are the frontend's
 * proposal. Match them to Person 2's SQL signatures, and map market_listings' row columns
 * (snake_case) to MarketplaceListing if they differ.
 */
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { demoAdapter } from '@/lib/demoAdapter';
import { MarketplaceListing } from '@/types';

export const DB_FUNCTIONS = [
  'log_energy',
  'claim_credits',
  'create_listing',
  'cancel_listing',
  'buy_listing',
  'pay_bill',
  'market_listings',
] as const;

export type DbFunction = (typeof DB_FUNCTIONS)[number];

async function rpc<T = unknown>(fn: DbFunction, params: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.rpc(fn, params);
  if (error) throw new Error(error.message);
  return data as T;
}

const useDemo = () => !isSupabaseConfigured;

export const db = {
  /** log_energy: record surplus kWh from a meter reading (no credits yet) */
  async logEnergy(kwh: number): Promise<void> {
    if (useDemo()) {
      demoAdapter.logEnergy(kwh);
      return;
    }
    await rpc('log_energy', { p_kwh: kwh });
  },

  /** claim_credits: turn logged surplus into credits (1 kWh = 1 CC) */
  async claimCredits(kwh: number): Promise<void> {
    if (useDemo()) {
      demoAdapter.claimCredits(kwh);
      return;
    }
    await rpc('claim_credits', { p_kwh: kwh });
  },

  /** create_listing: put credits up for sale at a price in rupees per credit */
  async createListing(credits: number, priceInr: number): Promise<void> {
    if (useDemo()) {
      demoAdapter.createListing(credits, priceInr);
      return;
    }
    await rpc('create_listing', { p_credits: credits, p_price_inr: priceInr });
  },

  /** cancel_listing: take your own listing down; unsold credits return to you */
  async cancelListing(listingId: string): Promise<void> {
    if (useDemo()) {
      demoAdapter.cancelListing(listingId);
      return;
    }
    await rpc('cancel_listing', { p_listing_id: listingId });
  },

  /** buy_listing: buy credits from another producer's listing */
  async buyListing(listingId: string, credits: number): Promise<void> {
    if (useDemo()) {
      demoAdapter.purchaseCredits(listingId, credits);
      return;
    }
    await rpc('buy_listing', { p_listing_id: listingId, p_credits: credits });
  },

  /** pay_bill: use credits on an electricity bill (1 credit = Rs 2 off) */
  async payBill(billId: string, credits: number): Promise<void> {
    if (useDemo()) {
      demoAdapter.applyCreditsToBill(billId, credits);
      return;
    }
    await rpc('pay_bill', { p_bill_id: billId, p_credits: credits });
  },

  /** market_listings: all listings shown on the marketplace */
  async marketListings(): Promise<MarketplaceListing[]> {
    if (useDemo()) return demoAdapter.getListings();
    return (await rpc<MarketplaceListing[]>('market_listings')) ?? [];
  },
};
