// Everything the UI needs from a backend. Two implementations exist:
//   supabase.ts  the real thing (Supabase auth + RPCs + chain-sync edge function)
//   demo.ts      the same SQL running in the browser, for offline demos and development

export type Role = "producer" | "consumer";

export interface Session {
  userId: string;
  email: string;
}

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  credits: number;
  cash: number;
  wallet_address: string | null;
  /** False only for a brand-new Google sign-in that has not picked Producer / Consumer yet. */
  role_chosen: boolean;
}

export interface EnergyLog {
  id: string;
  log_date: string;
  generated: number;
  used: number;
  exported: number;
  claimed: number;
}

export interface MyListing {
  id: string;
  credits: number;
  price_per_credit: number;
  status: "active" | "sold" | "cancelled";
  created_at: string;
}

export interface MarketListing {
  id: string;
  credits: number;
  price_per_credit: number;
  total: number;
  seller_name: string;
  is_mine: boolean;
  created_at: string;
}

export interface Trade {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  credits: number;
  total_price: number;
  created_at: string;
}

export interface BillPayment {
  id: string;
  provider: string;
  consumer_number: string;
  consumer_name: string;
  billing_month: string;
  meter_number: string;
  units_consumed: number;
  rate_per_unit: number;
  bill_amount: number;
  credits_used: number;
  credit_savings: number;
  upi_paid: number;
  created_at: string;
}

export type ChainKind = "MINT" | "LIST" | "TRADE" | "CANCEL" | "BURN";

export interface ChainEvent {
  id: number;
  kind: ChainKind;
  status: "pending" | "processing" | "confirmed" | "failed";
  user_id: string;
  counterparty_id: string | null;
  ref_id: string;
  payload: { credits?: number; price?: number; total?: number; savings?: number };
  tx_hash: string | null;
  block_number: number | null;
  attempts: number;
  last_error: string | null;
  created_at: string;
  confirmed_at: string | null;
}

export interface RpcResult {
  ok: boolean;
  message: string;
  [key: string]: unknown;
}

export interface BillInput {
  provider: string;
  consumerNumber: string;
  consumerName: string;
  billingMonth: string;
  meterNumber: string;
  units: number;
  rate: number;
  creditsToUse: number;
}

export interface DataApi {
  mode: "supabase" | "demo";
  auth: {
    session(): Promise<Session | null>;
    onChange(cb: (s: Session | null) => void): () => void;
    signUp(email: string, password: string, fullName: string, role: Role): Promise<{ error?: string; needsEmailConfirm?: boolean }>;
    signIn(email: string, password: string): Promise<{ error?: string; unverified?: boolean }>;
    /** Confirm the 6-digit code from the sign-up email. Signs the user in on success. */
    verifyOtp(email: string, code: string): Promise<{ error?: string }>;
    resendOtp(email: string): Promise<{ error?: string }>;
    google(): Promise<{ error?: string }>;
    signOut(): Promise<void>;
    resetPassword(email: string): Promise<{ error?: string }>;
  };
  profile(): Promise<Profile | null>;
  updateName(name: string): Promise<void>;
  energyLogs(): Promise<EnergyLog[]>;
  myListings(): Promise<MyListing[]>;
  market(): Promise<MarketListing[]>;
  trades(): Promise<Trade[]>;
  bills(): Promise<BillPayment[]>;
  chainEvents(): Promise<ChainEvent[]>;
  logEnergy(generated: number, used: number): Promise<RpcResult>;
  /** One-time choice of role for a user who signed in without one (Google). Locked afterwards. */
  chooseRole(role: Role): Promise<RpcResult>;
  claimCredits(): Promise<RpcResult>;
  createListing(credits: number, price: number): Promise<RpcResult>;
  cancelListing(id: string): Promise<RpcResult>;
  buyListing(id: string): Promise<RpcResult>;
  payBill(b: BillInput): Promise<RpcResult>;
  /** Push pending chain events to the blockchain. Never throws: the app works without it. */
  syncChain(): Promise<void>;
  /**
   * Live updates: calls onChange (debounced) whenever the backend changes or deletes data the app shows,
   * so the UI can reload. Returns a function that stops listening. Offline demo mode never calls it.
   */
  subscribe(onChange: () => void): () => void;
}
