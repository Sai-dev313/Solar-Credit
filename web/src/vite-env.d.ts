/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "1" forces offline demo mode, even when Supabase keys are set */
  readonly VITE_DEMO?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_CHAIN_ID?: string;
  readonly VITE_RPC_URL?: string;
  readonly VITE_ENERGY_TRADING_CONTRACT_ADDRESS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
