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
import { CREDIT_VALUE_INR } from '@/lib/constants';

// v2: all money is in rupees (v1 stored US dollars)
const STORAGE_KEY = 'solar_credit_demo_state_v2';

/** How a listing's price compares with the Rs 2 bill value of a credit, in % */
const vsBillValuePct = (priceInr: number) =>
  Number((((priceInr - CREDIT_VALUE_INR) / CREDIT_VALUE_INR) * 100).toFixed(1));

interface DemoState {
  profile: UserProfile;
  stats: EnergyStatsSummary;
  telemetry: EnergyGenerationPoint[];
  listings: MarketplaceListing[];
  transactions: EnergyTransaction[];
  bills: ElectricityBill[];
  chainEvents: ChainEventLog[];
}

const initialState: DemoState = {
  profile: {
    id: 'usr-prosumer-01',
    email: 'alex.rivera@solarcredit.io',
    fullName: 'Alex Rivera',
    role: 'prosumer',
    walletAddress: '0x71C9...9A21',
    smartMeterId: 'SM-TX-884920',
    solarCapacityKw: 12.5,
    location: 'Austin, TX • Microgrid Zone 4',
    creditBalance: 184.5,
    fiatBalanceInr: 3500,
    onboarded: true,
    createdAt: '2026-09-01T08:00:00Z',
  },
  stats: {
    todayGeneratedKwh: 46.8,
    todayConsumedKwh: 22.3,
    todayExportedKwh: 24.5,
    unclaimedKwh: 24.5,
    availableCredits: 184.5,
    carbonOffsetKg: 312.4,
    efficiencyPct: 94.2,
    gridPricePerKwh: 6.5, // DISCOM tariff, Rs per kWh
    p2pAvgPricePerKwh: 1.9, // Rs per credit
  },
  telemetry: [
    { time: '06:00', generatedKwh: 0.4, consumedKwh: 1.2, exportedKwh: 0.0 },
    { time: '08:00', generatedKwh: 3.1, consumedKwh: 2.0, exportedKwh: 1.1 },
    { time: '10:00', generatedKwh: 7.4, consumedKwh: 2.3, exportedKwh: 5.1 },
    { time: '12:00', generatedKwh: 11.2, consumedKwh: 2.8, exportedKwh: 8.4 },
    { time: '14:00', generatedKwh: 10.6, consumedKwh: 3.1, exportedKwh: 7.5 },
    { time: '16:00', generatedKwh: 6.8, consumedKwh: 3.4, exportedKwh: 3.4 },
    { time: '18:00', generatedKwh: 2.1, consumedKwh: 4.2, exportedKwh: 0.0 },
    { time: '20:00', generatedKwh: 0.0, consumedKwh: 3.3, exportedKwh: 0.0 },
  ],
  listings: [
    {
      id: 'LST-901',
      sellerId: 'usr-prosumer-02',
      sellerName: 'Elena Vance (SunPeak Roof)',
      sellerWallet: '0x38F4...4B10',
      location: 'Austin, TX • 0.8 mi away',
      creditsAvailable: 65.0,
      initialCredits: 100.0,
      pricePerKwh: 1.8,
      gridRateComparisonPct: vsBillValuePct(1.8),
      verifiedSmartMeter: true,
      status: 'active',
      createdAt: '2026-11-14T09:15:00Z',
      txHash: '0x94a8b1c4...721e',
    },
    {
      id: 'LST-902',
      sellerId: 'usr-prosumer-03',
      sellerName: 'Marcus Chen (Southpark Solar)',
      sellerWallet: '0x92A1...1E08',
      location: 'Austin, TX • 1.4 mi away',
      creditsAvailable: 42.5,
      initialCredits: 50.0,
      pricePerKwh: 1.85,
      gridRateComparisonPct: vsBillValuePct(1.85),
      verifiedSmartMeter: true,
      status: 'active',
      createdAt: '2026-11-14T10:30:00Z',
      txHash: '0x31f7d9a0...490b',
    },
    {
      id: 'LST-903',
      sellerId: 'usr-prosumer-04',
      sellerName: 'Oakridge Community Array',
      sellerWallet: '0x64E2...8C55',
      location: 'Austin, TX • 2.1 mi away',
      creditsAvailable: 120.0,
      initialCredits: 150.0,
      pricePerKwh: 1.95,
      gridRateComparisonPct: vsBillValuePct(1.95),
      verifiedSmartMeter: true,
      status: 'active',
      createdAt: '2026-11-14T11:05:00Z',
      txHash: '0x88e12f0a...119c',
    },
    {
      id: 'LST-904',
      sellerId: 'usr-prosumer-01',
      sellerName: 'Alex Rivera (You)',
      sellerWallet: '0x71C9...9A21',
      location: 'Austin, TX • Microgrid Zone 4',
      creditsAvailable: 30.0,
      initialCredits: 30.0,
      pricePerKwh: 1.9,
      gridRateComparisonPct: vsBillValuePct(1.9),
      verifiedSmartMeter: true,
      status: 'active',
      createdAt: '2026-11-14T12:20:00Z',
      txHash: '0x52c49e11...883a',
    },
  ],
  transactions: [
    {
      id: 'TX-4091',
      type: 'MINT',
      counterpartyName: 'Smart Meter Oracle #SM-TX-884920',
      counterpartyWallet: '0x0000...0000',
      creditsKwh: 24.5,
      pricePerKwh: 0.0,
      totalInr: 0.0,
      txHash: '0x7c8e91a2f4b109c3...e821',
      blockNumber: 7182910,
      timestamp: '2026-11-14T12:00:00Z',
      status: 'confirmed',
    },
    {
      id: 'TX-4090',
      type: 'PURCHASE',
      counterpartyName: 'Elena Vance (SunPeak Roof)',
      counterpartyWallet: '0x38F4...4B10',
      creditsKwh: 35.0,
      pricePerKwh: 1.8,
      totalInr: 63,
      txHash: '0x4b128f90a21e77d1...c910',
      blockNumber: 7182455,
      timestamp: '2026-11-13T16:40:00Z',
      status: 'confirmed',
    },
    {
      id: 'TX-4089',
      type: 'BILL_OFFSET',
      counterpartyName: 'Austin Grid Utility Settlement',
      counterpartyWallet: '0x11A0...99FF',
      creditsKwh: 190.0,
      pricePerKwh: CREDIT_VALUE_INR,
      totalInr: 380,
      txHash: '0x19d04a88e31b66f2...a402',
      blockNumber: 7179012,
      timestamp: '2026-11-10T09:15:00Z',
      status: 'confirmed',
    },
    {
      id: 'TX-4088',
      type: 'LIST',
      counterpartyName: 'SolarCredit Escrow Contract',
      counterpartyWallet: '0x8F2E...310A',
      creditsKwh: 30.0,
      pricePerKwh: 1.9,
      totalInr: 57,
      txHash: '0x52c49e1190b21a34...883a',
      blockNumber: 7178300,
      timestamp: '2026-11-09T14:22:00Z',
      status: 'confirmed',
    },
  ],
  bills: [
    {
      id: 'BILL-2026-11',
      billingPeriod: 'November 2026',
      dueDate: '2026-11-28',
      totalConsumptionKwh: 640,
      gridTariffPerKwh: 6.5,
      grossAmountInr: 4160,
      creditsAppliedKwh: 210,
      creditSavingsInr: 420,
      netPayableInr: 3740,
      status: 'partially_offset',
    },
    {
      id: 'BILL-2026-10',
      billingPeriod: 'October 2026',
      dueDate: '2026-10-28',
      totalConsumptionKwh: 590,
      gridTariffPerKwh: 6.5,
      grossAmountInr: 3835,
      creditsAppliedKwh: 320,
      creditSavingsInr: 640,
      netPayableInr: 3195,
      status: 'paid',
      paidAt: '2026-10-25T11:30:00Z',
    },
    {
      id: 'BILL-2026-09',
      billingPeriod: 'September 2026',
      dueDate: '2026-09-28',
      totalConsumptionKwh: 710,
      gridTariffPerKwh: 6.5,
      grossAmountInr: 4615,
      creditsAppliedKwh: 280,
      creditSavingsInr: 560,
      netPayableInr: 4055,
      status: 'paid',
      paidAt: '2026-09-26T15:10:00Z',
    },
  ],
  chainEvents: [
    {
      id: 'EVT-101',
      eventName: 'CreditMinted',
      contractAddress: '0x8F2E...310A',
      txHash: '0x7c8e91a2f4b109c3...e821',
      blockNumber: 7182910,
      fromWallet: '0x0000...0000',
      toWallet: '0x71C9...9A21',
      amountKwh: 24.5,
      timestamp: '2026-11-14T12:00:00Z',
      syncedToSupabase: true,
    },
    {
      id: 'EVT-102',
      eventName: 'ListingCreated',
      contractAddress: '0x8F2E...310A',
      txHash: '0x52c49e1190b21a34...883a',
      blockNumber: 7182790,
      fromWallet: '0x71C9...9A21',
      toWallet: '0x8F2E...310A',
      amountKwh: 30.0,
      timestamp: '2026-11-14T11:20:00Z',
      syncedToSupabase: true,
    },
    {
      id: 'EVT-103',
      eventName: 'CreditsPurchased',
      contractAddress: '0x8F2E...310A',
      txHash: '0x4b128f90a21e77d1...c910',
      blockNumber: 7182455,
      fromWallet: '0x38F4...4B10',
      toWallet: '0x71C9...9A21',
      amountKwh: 35.0,
      timestamp: '2026-11-13T16:40:00Z',
      syncedToSupabase: true,
    },
    {
      id: 'EVT-104',
      eventName: 'CreditRedeemed',
      contractAddress: '0x8F2E...310A',
      txHash: '0x19d04a88e31b66f2...a402',
      blockNumber: 7179012,
      fromWallet: '0x71C9...9A21',
      toWallet: '0x11A0...99FF',
      amountKwh: 190.0,
      timestamp: '2026-11-10T09:15:00Z',
      syncedToSupabase: true,
    },
  ],
};

/** How long a new chain event stays "pending" in demo mode */
export const DEMO_SYNC_DELAY_MS = 5000;

/** A full-length (0x + 64 hex) fake transaction hash for demo mode */
function randomTxHash(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
}

function loadState(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    return JSON.parse(raw) as DemoState;
  } catch {
    return initialState;
  }
}

function saveState(state: DemoState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

export const demoAdapter = {
  getProfile(): UserProfile {
    return loadState().profile;
  },

  updateRole(role: UserRole): UserProfile {
    const state = loadState();
    state.profile = { ...state.profile, role };
    saveState(state);
    return state.profile;
  },

  updateProfile(updates: Partial<UserProfile>): UserProfile {
    const state = loadState();
    state.profile = { ...state.profile, ...updates };
    saveState(state);
    return state.profile;
  },

  getEnergyStats(): { stats: EnergyStatsSummary; telemetry: EnergyGenerationPoint[] } {
    const state = loadState();
    return { stats: state.stats, telemetry: state.telemetry };
  },

  /** Demo version of log_energy: records surplus; no credits yet */
  logEnergy(kwh: number): EnergyStatsSummary {
    if (!(kwh > 0)) throw new Error('There is no surplus to log.');
    const state = loadState();
    state.stats.todayGeneratedKwh = Number((state.stats.todayGeneratedKwh + kwh).toFixed(1));
    state.stats.todayExportedKwh = Number((state.stats.todayExportedKwh + kwh).toFixed(1));
    state.stats.unclaimedKwh = Number(((state.stats.unclaimedKwh ?? 0) + kwh).toFixed(1));
    saveState(state);
    return state.stats;
  },

  /** Demo version of claim_credits: turns logged surplus into credits (1 kWh = 1 CC) */
  claimCredits(kwh: number): { stats: EnergyStatsSummary; profile: UserProfile } {
    const state = loadState();
    const unclaimed = state.stats.unclaimedKwh ?? 0;
    if (!(kwh > 0)) throw new Error('Choose how many credits to claim.');
    if (kwh > unclaimed + 1e-9) {
      throw new Error(`Only ${unclaimed} kWh of logged surplus is left to claim. Log more energy first.`);
    }
    const txHash = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
    state.stats.unclaimedKwh = Number((unclaimed - kwh).toFixed(1));
    state.profile.creditBalance = Number((state.profile.creditBalance + kwh).toFixed(1));
    state.stats.availableCredits = state.profile.creditBalance;

    state.transactions.unshift({
      id: `TX-${Math.floor(4100 + Math.random() * 900)}`,
      type: 'MINT',
      counterpartyName: `Smart Meter Oracle #${state.profile.smartMeterId}`,
      counterpartyWallet: '0x0000...0000',
      creditsKwh: kwh,
      pricePerKwh: 0,
      totalInr: 0,
      txHash,
      blockNumber: 7183000 + state.transactions.length,
      timestamp: new Date().toISOString(),
      status: 'confirmed',
    });

    state.chainEvents.unshift({
      id: `EVT-${Math.floor(200 + Math.random() * 800)}`,
      eventName: 'CreditMinted',
      contractAddress: '0x8F2E...310A',
      txHash: null, // written back by chain-sync
      blockNumber: null,
      status: 'pending',
      fromWallet: '0x0000...0000',
      toWallet: state.profile.walletAddress || '0x71C9...9A21',
      amountKwh: kwh,
      timestamp: new Date().toISOString(),
      syncedToSupabase: true,
    });

    saveState(state);
    return { stats: state.stats, profile: state.profile };
  },

  getListings(): MarketplaceListing[] {
    return loadState().listings;
  },

  createListing(creditsKwh: number, pricePerKwh: number): MarketplaceListing {
    const state = loadState();
    if (creditsKwh > state.profile.creditBalance) {
      throw new Error('Insufficient solar credits available to create this listing.');
    }

    const txHash = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
    state.profile.creditBalance = Number((state.profile.creditBalance - creditsKwh).toFixed(1));
    state.stats.availableCredits = state.profile.creditBalance;

    const comparisonPct = vsBillValuePct(pricePerKwh);

    const newListing: MarketplaceListing = {
      id: `LST-${Math.floor(910 + Math.random() * 90)}`,
      sellerId: state.profile.id,
      sellerName: `${state.profile.fullName} (You)`,
      sellerWallet: state.profile.walletAddress || '0x71C9...9A21',
      location: state.profile.location,
      creditsAvailable: creditsKwh,
      initialCredits: creditsKwh,
      pricePerKwh,
      gridRateComparisonPct: comparisonPct,
      verifiedSmartMeter: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      txHash,
    };

    state.listings.unshift(newListing);
    state.transactions.unshift({
      id: `TX-${Math.floor(4100 + Math.random() * 900)}`,
      type: 'LIST',
      counterpartyName: 'SolarCredit Escrow Contract',
      counterpartyWallet: '0x8F2E...310A',
      creditsKwh,
      pricePerKwh,
      totalInr: Number((creditsKwh * pricePerKwh).toFixed(2)),
      txHash,
      blockNumber: 7183100 + state.transactions.length,
      timestamp: new Date().toISOString(),
      status: 'confirmed',
    });

    state.chainEvents.unshift({
      id: `EVT-${Math.floor(200 + Math.random() * 800)}`,
      eventName: 'ListingCreated',
      contractAddress: '0x8F2E...310A',
      txHash: null, // written back by chain-sync
      blockNumber: null,
      status: 'pending',
      fromWallet: state.profile.walletAddress || '0x71C9...9A21',
      toWallet: '0x8F2E...310A',
      amountKwh: creditsKwh,
      timestamp: new Date().toISOString(),
      syncedToSupabase: true,
    });

    saveState(state);
    return newListing;
  },

  /** Demo version of cancel_listing: only your own active listing; unsold credits return to you */
  cancelListing(listingId: string): MarketplaceListing {
    const state = loadState();
    const listing = state.listings.find((l) => l.id === listingId);
    if (!listing) throw new Error('Listing not found.');
    if (listing.sellerId !== state.profile.id) throw new Error('You can only cancel your own listings.');
    if (listing.status !== 'active') throw new Error('This listing is no longer active.');

    const returned = listing.creditsAvailable;
    listing.status = 'cancelled';
    listing.creditsAvailable = 0;
    state.profile.creditBalance = Number((state.profile.creditBalance + returned).toFixed(1));
    state.stats.availableCredits = state.profile.creditBalance;

    const txHash = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
    state.transactions.unshift({
      id: `TX-${Math.floor(4100 + Math.random() * 900)}`,
      type: 'CANCEL',
      counterpartyName: 'SolarCredit Escrow Contract',
      counterpartyWallet: '0x8F2E...310A',
      creditsKwh: returned,
      pricePerKwh: listing.pricePerKwh,
      totalInr: 0,
      txHash,
      blockNumber: 7183150 + state.transactions.length,
      timestamp: new Date().toISOString(),
      status: 'confirmed',
    });
    state.chainEvents.unshift({
      id: `EVT-${Math.floor(200 + Math.random() * 800)}`,
      eventName: 'ListingCancelled',
      contractAddress: '0x8F2E...310A',
      txHash: null, // written back by chain-sync
      blockNumber: null,
      status: 'pending',
      fromWallet: '0x8F2E...310A',
      toWallet: state.profile.walletAddress || '0x71C9...9A21',
      amountKwh: returned,
      timestamp: new Date().toISOString(),
      syncedToSupabase: true,
    });

    saveState(state);
    return listing;
  },

  purchaseCredits(listingId: string, kwhToBuy: number): MarketplaceListing {
    const state = loadState();
    const listing = state.listings.find((l) => l.id === listingId);
    if (!listing || listing.status !== 'active') {
      throw new Error('Listing is no longer active.');
    }
    if (kwhToBuy <= 0 || kwhToBuy > listing.creditsAvailable) {
      throw new Error('Requested kWh exceeds listing availability.');
    }

    if (listing.sellerId === state.profile.id) {
      throw new Error("You can't buy your own listing.");
    }
    const totalCost = Number((kwhToBuy * listing.pricePerKwh).toFixed(2));
    if (totalCost > state.profile.fiatBalanceInr) {
      throw new Error(
        `Not enough cash balance: this costs ₹${totalCost.toFixed(2)} and you have ₹${state.profile.fiatBalanceInr.toFixed(2)}.`
      );
    }
    const txHash = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;

    listing.creditsAvailable = Number((listing.creditsAvailable - kwhToBuy).toFixed(1));
    if (listing.creditsAvailable <= 0) {
      listing.status = 'filled';
    }

    state.profile.creditBalance = Number((state.profile.creditBalance + kwhToBuy).toFixed(1));
    state.profile.fiatBalanceInr = Number((state.profile.fiatBalanceInr - totalCost).toFixed(2));
    state.stats.availableCredits = state.profile.creditBalance;

    state.transactions.unshift({
      id: `TX-${Math.floor(4100 + Math.random() * 900)}`,
      type: 'PURCHASE',
      counterpartyName: listing.sellerName,
      counterpartyWallet: listing.sellerWallet,
      creditsKwh: kwhToBuy,
      pricePerKwh: listing.pricePerKwh,
      totalInr: totalCost,
      txHash,
      blockNumber: 7183200 + state.transactions.length,
      timestamp: new Date().toISOString(),
      status: 'confirmed',
    });

    state.chainEvents.unshift({
      id: `EVT-${Math.floor(200 + Math.random() * 800)}`,
      eventName: 'CreditsPurchased',
      contractAddress: '0x8F2E...310A',
      txHash: null, // written back by chain-sync
      blockNumber: null,
      status: 'pending',
      fromWallet: listing.sellerWallet,
      toWallet: state.profile.walletAddress || '0x71C9...9A21',
      amountKwh: kwhToBuy,
      timestamp: new Date().toISOString(),
      syncedToSupabase: true,
    });

    saveState(state);
    return listing;
  },

  getTransactions(): EnergyTransaction[] {
    return loadState().transactions;
  },

  getBills(): ElectricityBill[] {
    return loadState().bills;
  },

  applyCreditsToBill(billId: string, creditsKwh: number): ElectricityBill {
    const state = loadState();
    const bill = state.bills.find((b) => b.id === billId);
    if (!bill) throw new Error('Bill not found.');
    if (creditsKwh <= 0 || creditsKwh > state.profile.creditBalance) {
      throw new Error('Insufficient solar credits in your balance.');
    }

    const remainingKwhOnBill = Math.max(0, bill.totalConsumptionKwh - bill.creditsAppliedKwh);
    const appliedKwh = Math.min(creditsKwh, remainingKwhOnBill);
    const discountInr = Number((appliedKwh * CREDIT_VALUE_INR).toFixed(2));
    const txHash = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;

    bill.creditsAppliedKwh = Number((bill.creditsAppliedKwh + appliedKwh).toFixed(1));
    bill.creditSavingsInr = Number((bill.creditSavingsInr + discountInr).toFixed(2));
    bill.netPayableInr = Number(Math.max(0, bill.grossAmountInr - bill.creditSavingsInr).toFixed(2));
    bill.status = bill.netPayableInr === 0 ? 'paid' : 'partially_offset';
    if (bill.status === 'paid') {
      bill.paidAt = new Date().toISOString();
    }

    state.profile.creditBalance = Number((state.profile.creditBalance - appliedKwh).toFixed(1));
    state.stats.availableCredits = state.profile.creditBalance;

    state.transactions.unshift({
      id: `TX-${Math.floor(4100 + Math.random() * 900)}`,
      type: 'BILL_OFFSET',
      counterpartyName: `Utility Bill ${bill.billingPeriod}`,
      counterpartyWallet: '0x11A0...99FF',
      creditsKwh: appliedKwh,
      pricePerKwh: CREDIT_VALUE_INR,
      totalInr: discountInr,
      txHash,
      blockNumber: 7183300 + state.transactions.length,
      timestamp: new Date().toISOString(),
      status: 'confirmed',
    });

    state.chainEvents.unshift({
      id: `EVT-${Math.floor(200 + Math.random() * 800)}`,
      eventName: 'CreditRedeemed',
      contractAddress: '0x8F2E...310A',
      txHash: null, // written back by chain-sync
      blockNumber: null,
      status: 'pending',
      fromWallet: state.profile.walletAddress || '0x71C9...9A21',
      toWallet: '0x11A0...99FF',
      amountKwh: appliedKwh,
      timestamp: new Date().toISOString(),
      syncedToSupabase: true,
    });

    saveState(state);
    return bill;
  },

  payRemainingBill(billId: string): ElectricityBill {
    const state = loadState();
    const bill = state.bills.find((b) => b.id === billId);
    if (!bill) throw new Error('Bill not found.');
    bill.status = 'paid';
    bill.netPayableInr = 0;
    bill.paidAt = new Date().toISOString();
    saveState(state);
    return bill;
  },

  /**
   * Demo stand-in for Person 3's chain-sync function: a pending event is "confirmed"
   * on Sepolia DEMO_SYNC_DELAY_MS after it was created, getting a tx hash and block.
   */
  getChainEvents(): ChainEventLog[] {
    const state = loadState();
    let changed = false;
    for (const evt of state.chainEvents) {
      const pending = (evt.status ?? (evt.txHash ? 'verified' : 'pending')) === 'pending';
      if (pending && Date.now() - Date.parse(evt.timestamp) >= DEMO_SYNC_DELAY_MS) {
        evt.status = 'verified';
        evt.txHash = randomTxHash();
        evt.blockNumber = 7183000 + Math.floor(Math.random() * 900);
        changed = true;
      }
    }
    if (changed) saveState(state);
    return state.chainEvents;
  },

  resetDemoState(): DemoState {
    saveState(initialState);
    return initialState;
  },
};
