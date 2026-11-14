export type UserRole = 'consumer' | 'prosumer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  walletAddress?: string;
  smartMeterId: string;
  solarCapacityKw?: number;
  location: string;
  /** Contact number used for OTP and bill alerts */
  phone?: string;
  /** Electricity distribution company the meter is registered with, e.g. "bescom" */
  discomProvider?: string;
  /** DISCOM consumer / account number used for BBPS bill settlement */
  consumerNumber?: string;
  /** UPI ID: producers receive credit-sale payouts here, consumers get refunds */
  upiId?: string;
  // Producer-only details
  /** Inverter make and model, e.g. "Growatt MIN 5000TL-X" */
  inverterModel?: string;
  /** Date the rooftop system was commissioned (YYYY-MM-DD) */
  installationDate?: string;
  /** DISCOM net-metering sanction / application number */
  netMeteringId?: string;
  // Consumer-only details
  connectionType?: 'domestic' | 'commercial' | 'industrial';
  /** Sanctioned load on the electricity connection, in kW */
  sanctionedLoadKw?: number;
  /** Typical monthly consumption, in kWh */
  monthlyUsageKwh?: number;
  creditBalance: number;
  /** Wallet balance in rupees */
  fiatBalanceInr: number;
  onboarded: boolean;
  createdAt: string;
}

export interface EnergyGenerationPoint {
  time: string;
  generatedKwh: number;
  consumedKwh: number;
  exportedKwh: number;
}

export interface EnergyStatsSummary {
  /** Surplus kWh logged with log_energy but not yet turned into credits with claim_credits */
  unclaimedKwh?: number;
  todayGeneratedKwh: number;
  todayConsumedKwh: number;
  todayExportedKwh: number;
  availableCredits: number;
  carbonOffsetKg: number;
  efficiencyPct: number;
  gridPricePerKwh: number;
  p2pAvgPricePerKwh: number;
}

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerWallet: string;
  location: string;
  creditsAvailable: number;
  initialCredits: number;
  pricePerKwh: number;
  gridRateComparisonPct: number;
  verifiedSmartMeter: boolean;
  status: 'active' | 'filled' | 'cancelled';
  createdAt: string;
  txHash?: string;
}

export interface EnergyTransaction {
  id: string;
  type: 'MINT' | 'LIST' | 'CANCEL' | 'PURCHASE' | 'BILL_OFFSET';
  counterpartyName: string;
  counterpartyWallet: string;
  creditsKwh: number;
  pricePerKwh: number;
  totalInr: number;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  status: 'confirmed' | 'pending' | 'failed';
}

export interface ElectricityBill {
  id: string;
  billingPeriod: string;
  dueDate: string;
  totalConsumptionKwh: number;
  gridTariffPerKwh: number;
  grossAmountInr: number;
  creditsAppliedKwh: number;
  creditSavingsInr: number;
  netPayableInr: number;
  status: 'unpaid' | 'partially_offset' | 'paid';
  paidAt?: string;
}

/**
 * Proof status of a chain event (team agreement: the backend adds a chain_events row for
 * every action; Person 3's chain-sync function sends it to the contract and writes back
 * the transaction hash).
 * pending  = recorded, not yet confirmed on Sepolia (no tx hash yet)
 * verified = confirmed on Sepolia, tx hash written back
 * failed   = the chain-sync function could not send it
 */
export type ProofStatus = 'pending' | 'verified' | 'failed';

export interface ChainEventLog {
  id: string;
  eventName: 'CreditMinted' | 'ListingCreated' | 'ListingCancelled' | 'CreditsPurchased' | 'CreditRedeemed';
  contractAddress: string;
  /** null until chain-sync writes back the Sepolia transaction hash */
  txHash: string | null;
  /** null until the transaction is mined */
  blockNumber: number | null;
  /** If missing, derived from txHash (hash present = verified) */
  status?: ProofStatus;
  fromWallet: string;
  toWallet: string;
  amountKwh: number;
  timestamp: string;
  syncedToSupabase: boolean;
}
